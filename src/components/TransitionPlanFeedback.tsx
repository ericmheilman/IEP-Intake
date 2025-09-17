'use client';

import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Edit3, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileText,
  Plus
} from 'lucide-react';
import { 
  TransitionPlanHeader, 
  TransitionPlanSummary, 
  TransitionPlanSection, 
  TransitionPlanSubCriteria,
  TransitionPlanDetailedFeedback 
} from '@/types';

interface TransitionPlanFeedbackProps {
  header?: TransitionPlanHeader;
  summary?: TransitionPlanSummary;
  detailedFeedback?: TransitionPlanDetailedFeedback;
  onEditSummary?: (sectionId: string, subCriteriaId: string, newSummary: string) => void;
  onCreateTransitionPlan?: () => void;
  isLoading?: boolean;
  error?: string;
}

const TransitionPlanFeedback: React.FC<TransitionPlanFeedbackProps> = ({
  header,
  summary,
  detailedFeedback,
  onEditSummary,
  onCreateTransitionPlan,
  isLoading = false,
  error
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [editingComment, setEditingComment] = useState<{sectionId: string, subCriteriaId: string} | null>(null);
  const [editText, setEditText] = useState('');

  // Default values when no data or error occurs
  const defaultSections = [
    { id: '1', name: '1. Student Participation and Preferences', maxScore: 6, summary: 'No data available', detailedSummary: 'Processing required' },
    { id: '2', name: '2. Age-Appropriate Transition Assessments', maxScore: 4, summary: 'No data available', detailedSummary: 'Processing required' },
    { id: '3', name: '3. Measurable Postsecondary Goals', maxScore: 6, summary: 'No data available', detailedSummary: 'Processing required' },
    { id: '4', name: '4. Annual IEP Goals', maxScore: 4, summary: 'No data available', detailedSummary: 'Processing required' },
    { id: '5', name: '5. Transition Services', maxScore: 4, summary: 'No data available', detailedSummary: 'Processing required' },
    { id: '6', name: '6. Courses of Study', maxScore: 4, summary: 'No data available', detailedSummary: 'Processing required' },
    { id: '7', name: '7. Agency Participation', maxScore: 4, summary: 'No data available', detailedSummary: 'Processing required' },
    { id: '8', name: '8. Overall Transition Plan Quality', maxScore: 4, summary: 'No data available', detailedSummary: 'Processing required' }
  ];

  const displayHeader = header || {
    filename: 'No file uploaded',
    studentName: 'Student Name Not Available',
    submissionDate: new Date().toLocaleDateString()
  };

  const displaySummary = summary || {
    overallScore: 'x',
    maxScore: 36,
    overallCompliance: 'Non-Compliant' as const,
    sections: defaultSections.map(section => ({
      id: section.id,
      name: section.name,
        score: 'x',
        maxScore: section.maxScore,
        isCompliant: false,
        summary: section.summary,
        detailedSummary: section.detailedSummary,
        subCriteria: []
    }))
  };

  const toggleExpanded = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const startEdit = (sectionId: string, subCriteriaId: string, currentText: string) => {
    setEditingComment({ sectionId, subCriteriaId });
    setEditText(currentText);
  };

  const saveEdit = () => {
    if (editingComment && onEditSummary) {
      onEditSummary(editingComment.sectionId, editingComment.subCriteriaId, editText);
    }
    setEditingComment(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingComment(null);
    setEditText('');
  };

  const getComplianceBadge = (isCompliant: boolean) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isCompliant 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isCompliant ? 'Yes' : 'No'}
      </span>
    );
  };

  const formatScore = (score: number | string) => {
    return typeof score === 'number' ? score.toString() : score;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Processing document...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Compliance Status Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Transition Plan Feedback</h2>
          <div className={`flex items-center space-x-3 px-6 py-3 rounded-lg text-lg font-bold ${
            displaySummary.overallCompliance === 'Compliant' 
              ? 'bg-green-100 text-green-800 border-2 border-green-300' 
              : 'bg-red-100 text-red-800 border-2 border-red-300'
          }`}>
            {displaySummary.overallCompliance === 'Compliant' ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              <XCircle className="w-6 h-6" />
            )}
            <span>{displaySummary.overallCompliance}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Filename:</span>
            <p className="text-gray-900">{displayHeader.filename}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Student Name:</span>
            <p className="text-gray-900">{displayHeader.studentName}</p>
          </div>
          <div>
            <span className="font-medium text-gray-700">Submission Date:</span>
            <p className="text-gray-900">{displayHeader.submissionDate}</p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-800 font-medium">Error processing document:</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      )}

      {/* Summary Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-blue-50 px-6 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Summary</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Rubric Section</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Earned Score / Maximum Score</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Compliant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displaySummary.sections.map((section, index) => (
                <tr key={section.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {section.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatScore(section.score)}/{section.maxScore}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center space-x-2">
                      {getComplianceBadge(section.isCompliant)}
                      <button
                        onClick={() => toggleExpanded(section.id)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {expandedSections.has(section.id) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {/* Total Row */}
              <tr className="bg-blue-100 font-semibold border-t-2 border-blue-200">
                <td className="px-6 py-4 text-sm font-bold text-gray-900">**Total:**</td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900">
                  {formatScore(displaySummary.overallScore)}/{displaySummary.maxScore}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                    displaySummary.overallCompliance === 'Compliant' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {displaySummary.overallCompliance}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Feedback Sections */}
      {displaySummary.sections.map((section) => (
        expandedSections.has(section.id) && (
          <div key={`expanded-${section.id}`} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-gray-900">{section.name} ({formatScore(section.score)}/{section.maxScore})</h4>
                <div className="flex items-center space-x-2">
                  {getComplianceBadge(section.isCompliant)}
                </div>
              </div>
              
              {/* Summary with Edit Button */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h6 className="font-medium text-gray-900 mb-2">Summary</h6>
                    <p className="text-gray-700 text-sm">{section.summary || 'No summary available'}</p>
                  </div>
                  <button
                    onClick={() => startEdit(section.id, 'summary', section.summary || '')}
                    className="ml-4 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit summary"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Detailed Summary */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h6 className="font-medium text-gray-900 mb-2">Detailed Summary</h6>
                    <p className="text-gray-700 text-sm">{section.detailedSummary || 'The IEP shows evidence of student invitation to the meeting and basic documentation of preferences, but lacks comprehensive assessment methods and age of majority notification.'}</p>
                  </div>
                  <button
                    onClick={() => startEdit(section.id, 'detailed', section.detailedSummary || '')}
                    className="ml-4 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit detailed summary"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Sub-criteria */}
              {section.subCriteria && section.subCriteria.length > 0 ? (
                <div className="space-y-3">
                  <h6 className="font-medium text-gray-900">Sub-criteria Details</h6>
                  {section.subCriteria.map((subCriteria) => (
                    <div key={subCriteria.id} className="border-l-4 border-blue-200 pl-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h5 className="font-medium text-gray-900">{subCriteria.name}</h5>
                            <span className="text-sm text-gray-500">
                              Score: {formatScore(subCriteria.score)}/{subCriteria.maxScore}
                            </span>
                            {getComplianceBadge(subCriteria.isCompliant)}
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Comments:</span> {subCriteria.comments}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => startEdit(section.id, subCriteria.id, subCriteria.comments)}
                          className="ml-4 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit comments"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <h6 className="font-medium text-gray-900">Sub-criteria Details</h6>
                  <div className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-lg">
                    Sub-criteria details will be available when the agent provides structured data with indicator evaluations.
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      ))}


      {/* Edit Modal */}
      {editingComment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Edit {editingComment.subCriteriaId === 'summary' ? 'Summary' : 
                   editingComment.subCriteriaId === 'detailed' ? 'Detailed Summary' : 'Comments'}
            </h3>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              rows={6}
              placeholder={editingComment.subCriteriaId === 'summary' ? 'Enter brief summary...' : 
                          editingComment.subCriteriaId === 'detailed' ? 'Enter detailed summary...' : 'Enter comments...'}
            />
            <div className="flex space-x-3">
              <button
                onClick={saveEdit}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
              <button
                onClick={cancelEdit}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Transition Plan Button */}
      <div className="flex justify-center pt-6">
        <button
          onClick={onCreateTransitionPlan}
          className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Create Transition Plan</span>
        </button>
      </div>
    </div>
  );
};

export default TransitionPlanFeedback;