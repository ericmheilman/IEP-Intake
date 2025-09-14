'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Edit3, Check, X } from 'lucide-react';
import { RubricScore, SubCriteria } from '@/types';

interface RubricScoringSectionProps {
  rubricScores: RubricScore[];
  onEditSummary?: (categoryId: string, subCriteriaId: string | null, newSummary: string) => void;
}

const RubricScoringSection: React.FC<RubricScoringSectionProps> = ({ 
  rubricScores, 
  onEditSummary 
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [editingSections, setEditingSections] = useState<Set<string>>(new Set());
  const [editTexts, setEditTexts] = useState<Record<string, string>>({});

  // Debug logging
  console.log('RubricScoringSection received rubricScores:', rubricScores);

  const toggleExpanded = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const startEditing = (sectionId: string, currentText: string) => {
    setEditingSections(prev => new Set(prev).add(sectionId));
    setEditTexts(prev => ({ ...prev, [sectionId]: currentText }));
  };

  const cancelEditing = (sectionId: string) => {
    setEditingSections(prev => {
      const newSet = new Set(prev);
      newSet.delete(sectionId);
      return newSet;
    });
    setEditTexts(prev => {
      const newTexts = { ...prev };
      delete newTexts[sectionId];
      return newTexts;
    });
  };

  const saveEdit = (sectionId: string, categoryId: string, subCriteriaId: string | null) => {
    const newText = editTexts[sectionId];
    if (newText && onEditSummary) {
      onEditSummary(categoryId, subCriteriaId, newText);
    }
    cancelEditing(sectionId);
  };

  const getComplianceColor = (isCompliant: boolean) => {
    return isCompliant 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getComplianceText = (isCompliant: boolean) => {
    return isCompliant ? 'Compliant' : 'Non-compliant';
  };

  // Calculate total score
  const totalScore = (rubricScores || []).reduce((sum, score) => sum + score.totalScore, 0);
  const totalMaxScore = (rubricScores || []).reduce((sum, score) => sum + score.maxScore, 0);
  const overallCompliant = (rubricScores || []).every(score => score.isCompliant);

  // If no rubric scores, show empty state
  if (!rubricScores || rubricScores.length === 0) {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
          <div className="text-center py-8">
            <p className="text-gray-500">No rubric scoring data available</p>
            <p className="text-sm text-gray-400">Upload a document or load sample data to see rubric scores</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
        
        {/* Summary Table */}
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rubric Section
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Earned Score / Maximum Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Compliant
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(rubricScores || []).map((score) => (
                <tr key={score.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {score.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {score.totalScore} / {score.maxScore}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getComplianceColor(score.isCompliant)}`}>
                      {getComplianceText(score.isCompliant)}
                    </span>
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50 font-semibold">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <strong>Total: [{totalScore}/{totalMaxScore}]</strong>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {totalScore} / {totalMaxScore}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getComplianceColor(overallCompliant)}`}>
                    <strong>{getComplianceText(overallCompliant)}</strong>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Sections */}
      <div className="space-y-4">
        {(rubricScores || []).map((score) => (
          <div key={score.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Section Header */}
            <div 
              className="px-6 py-4 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors"
              onClick={() => toggleExpanded(score.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h4 className="text-lg font-semibold text-gray-900">{score.category}</h4>
                  <span className="text-sm text-gray-600">
                    {score.totalScore} / {score.maxScore}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getComplianceColor(score.isCompliant)}`}>
                    {getComplianceText(score.isCompliant)}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditing(`${score.id}-summary`, score.summary);
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Edit summary"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {expandedSections.has(score.id) ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
              
              {/* Quick Summary */}
              <div className="mt-2">
                {editingSections.has(`${score.id}-summary`) ? (
                  <div className="flex items-center space-x-2">
                    <textarea
                      value={editTexts[`${score.id}-summary`] || score.summary}
                      onChange={(e) => setEditTexts(prev => ({ ...prev, [`${score.id}-summary`]: e.target.value }))}
                      className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
                      rows={2}
                    />
                    <button
                      onClick={() => saveEdit(`${score.id}-summary`, score.id, null)}
                      className="p-1 text-green-600 hover:text-green-800"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => cancelEditing(`${score.id}-summary`)}
                      className="p-1 text-red-600 hover:text-red-800"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">{score.summary}</p>
                )}
              </div>
            </div>

            {/* Expanded Content */}
            {expandedSections.has(score.id) && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="space-y-4">
                  {/* Detailed Summary */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-900 mb-2">Detailed Summary</h5>
                    {editingSections.has(`${score.id}-detailed`) ? (
                      <div className="flex items-start space-x-2">
                        <textarea
                          value={editTexts[`${score.id}-detailed`] || score.detailedSummary}
                          onChange={(e) => setEditTexts(prev => ({ ...prev, [`${score.id}-detailed`]: e.target.value }))}
                          className="flex-1 p-2 border border-gray-300 rounded-md text-sm"
                          rows={4}
                        />
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={() => saveEdit(`${score.id}-detailed`, score.id, null)}
                            className="p-1 text-green-600 hover:text-green-800"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => cancelEditing(`${score.id}-detailed`)}
                            className="p-1 text-red-600 hover:text-red-800"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start justify-between">
                        <p className="text-sm text-gray-600 flex-1">{score.detailedSummary}</p>
                        <button
                          onClick={() => startEditing(`${score.id}-detailed`, score.detailedSummary)}
                          className="p-1 text-gray-400 hover:text-gray-600 transition-colors ml-2"
                          title="Edit detailed summary"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Sub-criteria */}
                  {score.subCriteria && score.subCriteria.length > 0 && (
                    <div>
                      <h5 className="text-sm font-medium text-gray-900 mb-2">Sub-criteria</h5>
                      <div className="space-y-2">
                        {score.subCriteria.map((subCriteria) => (
                          <div key={subCriteria.id} className="bg-gray-50 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h6 className="text-sm font-medium text-gray-900">{subCriteria.name}</h6>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-gray-600">
                                  {subCriteria.score} / {subCriteria.maxScore}
                                </span>
                                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getComplianceColor(subCriteria.isCompliant)}`}>
                                  {getComplianceText(subCriteria.isCompliant)}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-start justify-between">
                              <p className="text-xs text-gray-600 flex-1">{subCriteria.summary}</p>
                              <button
                                onClick={() => startEditing(`${subCriteria.id}-summary`, subCriteria.summary)}
                                className="p-1 text-gray-400 hover:text-gray-600 transition-colors ml-2"
                                title="Edit sub-criteria summary"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                            </div>
                            {editingSections.has(`${subCriteria.id}-summary`) && (
                              <div className="mt-2 flex items-start space-x-2">
                                <textarea
                                  value={editTexts[`${subCriteria.id}-summary`] || subCriteria.summary}
                                  onChange={(e) => setEditTexts(prev => ({ ...prev, [`${subCriteria.id}-summary`]: e.target.value }))}
                                  className="flex-1 p-2 border border-gray-300 rounded-md text-xs"
                                  rows={2}
                                />
                                <div className="flex flex-col space-y-1">
                                  <button
                                    onClick={() => saveEdit(`${subCriteria.id}-summary`, score.id, subCriteria.id)}
                                    className="p-1 text-green-600 hover:text-green-800"
                                  >
                                    <Check className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => cancelEditing(`${subCriteria.id}-summary`)}
                                    className="p-1 text-red-600 hover:text-red-800"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default RubricScoringSection;
