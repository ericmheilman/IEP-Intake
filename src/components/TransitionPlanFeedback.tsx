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
import { RubricScore, SubCriteria } from '@/types';

interface TransitionPlanFeedbackProps {
  overallCompliance: 'Compliant' | 'Non-compliant';
  rubricScores: RubricScore[];
  onEditSummary?: (categoryId: string, subCriteriaId: string, newSummary: string) => void;
  onCreateTransitionPlan?: () => void;
}

const TransitionPlanFeedback: React.FC<TransitionPlanFeedbackProps> = ({
  overallCompliance,
  rubricScores,
  onEditSummary,
  onCreateTransitionPlan
}) => {
  const [expandedCriteria, setExpandedCriteria] = useState<Set<string>>(new Set());
  const [editingSummary, setEditingSummary] = useState<{categoryId: string, subCriteriaId: string} | null>(null);
  const [editText, setEditText] = useState('');

  // Sort criteria: non-compliant first, then compliant
  const sortedRubricScores = [...rubricScores].sort((a, b) => {
    if (a.isCompliant === b.isCompliant) return 0;
    return a.isCompliant ? 1 : -1;
  });

  const totalScore = rubricScores.reduce((sum, score) => sum + score.totalScore, 0);
  const maxPossibleScore = rubricScores.reduce((sum, score) => sum + score.maxScore, 0);

  const toggleExpanded = (criteriaId: string) => {
    const newExpanded = new Set(expandedCriteria);
    if (newExpanded.has(criteriaId)) {
      newExpanded.delete(criteriaId);
    } else {
      newExpanded.add(criteriaId);
    }
    setExpandedCriteria(newExpanded);
  };

  const startEdit = (categoryId: string, subCriteriaId: string, currentText: string) => {
    setEditingSummary({ categoryId, subCriteriaId });
    setEditText(currentText);
  };

  const saveEdit = () => {
    if (editingSummary && onEditSummary) {
      onEditSummary(editingSummary.categoryId, editingSummary.subCriteriaId, editText);
    }
    setEditingSummary(null);
    setEditText('');
  };

  const cancelEdit = () => {
    setEditingSummary(null);
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

  return (
    <div className="space-y-6">
      {/* Overall Compliance Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-900">Transition Plan Compliance</h3>
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold ${
            overallCompliance === 'Compliant' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {overallCompliance === 'Compliant' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            <span>{overallCompliance}</span>
          </div>
        </div>
        
        {/* Total Score */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium text-gray-700">Total Score</span>
            <span className="text-2xl font-bold text-gray-900">
              {totalScore} / {maxPossibleScore}
            </span>
          </div>
        </div>
      </div>

      {/* Rubric Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="bg-blue-50 px-6 py-3 border-b border-gray-200">
          <h4 className="text-lg font-semibold text-gray-900">Summary</h4>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Rubric Section</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">
                  Earned Score / Maximum Score
                  <ChevronDown className="w-4 h-4 inline ml-1" />
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-900">Compliant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedRubricScores.map((category, index) => (
                <tr key={category.id} className={index % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {category.category}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {category.totalScore} / {category.maxScore}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center space-x-2">
                      {getComplianceBadge(category.isCompliant)}
                      <button
                        onClick={() => toggleExpanded(category.id)}
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        {expandedCriteria.has(category.id) ? (
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
              <tr className="bg-gray-100 font-semibold">
                <td className="px-6 py-4 text-sm font-bold text-gray-900">Total</td>
                <td className="px-6 py-4 text-sm font-bold text-gray-900">
                  {totalScore} / {maxPossibleScore}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    overallCompliance === 'Compliant' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {overallCompliance}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Expanded Details for Each Category */}
      {sortedRubricScores.map((category) => (
        expandedCriteria.has(category.id) && (
          <div key={`expanded-${category.id}`} className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="text-lg font-semibold text-gray-900">{category.category}</h5>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-500">Score: {category.totalScore}/{category.maxScore}</span>
                  {getComplianceBadge(category.isCompliant)}
                </div>
              </div>
              
              {/* Summary with Edit Button */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h6 className="font-medium text-gray-900 mb-2">Summary</h6>
                    <p className="text-gray-700">{category.summary}</p>
                  </div>
                  <button
                    onClick={() => startEdit(category.id, 'main', category.summary)}
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
                    <p className="text-gray-700">{category.detailedSummary}</p>
                  </div>
                  <button
                    onClick={() => startEdit(category.id, 'detailed', category.detailedSummary)}
                    className="ml-4 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit detailed summary"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Sub-criteria */}
              {category.subCriteria && category.subCriteria.length > 0 && (
                <div className="space-y-3">
                  <h6 className="font-medium text-gray-900">Sub-criteria Details</h6>
                  {category.subCriteria.map((subCriteria) => (
                    <div key={subCriteria.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h7 className="font-medium text-gray-900">{subCriteria.name}</h7>
                            <span className="text-sm text-gray-500">({subCriteria.score}/{subCriteria.maxScore})</span>
                            {getComplianceBadge(subCriteria.isCompliant)}
                          </div>
                          <p className="text-gray-700 text-sm">{subCriteria.summary}</p>
                        </div>
                        <button
                          onClick={() => startEdit(category.id, subCriteria.id, subCriteria.summary)}
                          className="ml-4 p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit sub-criteria summary"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      ))}

      {/* Edit Modal */}
      {editingSummary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Summary</h3>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              rows={4}
              placeholder="Enter summary text..."
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