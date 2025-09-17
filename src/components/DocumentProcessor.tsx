'use client';

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  FileText,
  Eye,
  Download,
  RefreshCw
} from 'lucide-react';
import { lyzrAPI } from '@/services/api';
import { 
  IEPDocument, 
  DocumentStatus, 
  IEPExtractedData, 
  IEPRedactedData, 
  IEPScoringData, 
  IEPFeedbackData,
  ProcessingStatus,
  RubricScore,
  TransitionPlanHeader,
  TransitionPlanSummary,
  TransitionPlanDetailedFeedback
} from '@/types';
import TransitionPlanFeedback from './TransitionPlanFeedback';
import RubricScoringSection from './RubricScoringSection';

interface DocumentProcessorProps {
  document: IEPDocument;
  onUpdate: (document: IEPDocument) => void;
}

const DocumentProcessor: React.FC<DocumentProcessorProps> = ({ document, onUpdate }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'extracted' | 'scoring' | 'feedback'>('overview');

  // Convert API feedback data to new format
  const convertToTransitionPlanFormat = (feedbackData?: IEPFeedbackData): {
    header: TransitionPlanHeader;
    summary: TransitionPlanSummary;
    detailedFeedback: TransitionPlanDetailedFeedback;
  } | null => {
    if (!feedbackData?.rubricScores) return null;
    
    const header: TransitionPlanHeader = {
      filename: document.fileName,
      studentName: document.extractedData?.studentName || 'Student Name Not Available',
      submissionDate: document.uploadDate.toLocaleDateString()
    };

    const totalScore = feedbackData.rubricScores.reduce((sum, score) => sum + score.totalScore, 0);
    const maxScore = feedbackData.rubricScores.reduce((sum, score) => sum + score.maxScore, 0);

    const summary: TransitionPlanSummary = {
      overallScore: totalScore,
      maxScore: maxScore,
      overallCompliance: (feedbackData.overallCompliance === 'Compliant' ? 'Compliant' : 'Non-Compliant'),
      sections: feedbackData.rubricScores.map(rubric => ({
        id: rubric.id,
        name: rubric.category,
        score: rubric.totalScore,
        maxScore: rubric.maxScore,
        isCompliant: rubric.isCompliant,
        summary: rubric.summary || `${rubric.isCompliant ? 'Compliant' : 'Non-compliant'} - Score: ${rubric.totalScore}/${rubric.maxScore}`,
        detailedSummary: rubric.detailedSummary || 'This section includes detailed evaluation criteria and analysis of compliance with transition planning requirements.',
        subCriteria: rubric.subCriteria?.map(sub => ({
          id: sub.id,
          name: sub.name,
          score: sub.score,
          maxScore: sub.maxScore,
          isCompliant: sub.isCompliant,
          comments: sub.summary || sub.detailedSummary || 'No comments available'
        })) || []
      }))
    };

    const detailedFeedback: TransitionPlanDetailedFeedback = {
      overview: feedbackData.feedbackSummary || 'No overview available',
        strengths: [
          'Clear identification of student needs and preferences',
          'Appropriate use of transition assessments',
          'Well-documented accommodations and modifications',
          'Evidence of collaborative IEP team process'
        ],
        weaknesses: feedbackData.detailedFeedback?.filter(f => f.priority === 'High').map(f => f.issue) || [
          'Missing or incomplete age of majority notification',
          'Limited variety in transition assessment methods', 
          'Insufficient detail in agency participation documentation',
          'Gaps in multi-year course planning alignment'
        ],
        connectionToLearningObjectives: [
          'Demonstrates compliance with IDEA requirements for transition planning',
          'Shows understanding of federal and state transition planning principles', 
          'Reflects individualized approach to student needs and preferences',
          'Aligns with evidence-based practices in special education'
        ],
        areasForImprovement: feedbackData.nextSteps || [
          'Enhance documentation of student preferences and interests',
          'Strengthen connections between assessments and goals',
          'Improve specificity in transition services descriptions',
          'Develop more detailed multi-year course planning'
        ],
      finalScore: {
        total: totalScore,
        max: maxScore
      }
    };

    return { header, summary, detailedFeedback };
  };

  const processDocument = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    setProcessingStatus({
      documentId: document.id,
      status: DocumentStatus.PROCESSING,
      progress: 0,
      currentStep: 'Starting workflow orchestration...',
    });

    try {
      console.log('Calling workflow orchestrator for document processing...');
      
      // Call the new workflow orchestrator endpoint
      const response = await fetch('/api/workflow-orchestrator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: document.id,
          fileName: document.fileName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Workflow orchestrator failed: ${response.statusText}`);
      }

      const workflowResult = await response.json();

      if (!workflowResult.success) {
        throw new Error(workflowResult.error || 'Workflow orchestration failed');
      }

      // Update processing status based on workflow steps
      const steps = workflowResult.processingSteps || [];
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const progress = ((i + 1) / steps.length) * 100;
        
        setProcessingStatus(prev => prev ? { 
          ...prev, 
          currentStep: step.step,
          progress: Math.round(progress)
        } : null);
        
        // Add a small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Final step: Complete processing
      setProcessingStatus(prev => prev ? { 
        ...prev, 
        currentStep: 'Finalizing results...', 
        progress: 100 
      } : null);
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedDocument: IEPDocument = {
        ...document,
        status: DocumentStatus.COMPLETED,
        extractedData: workflowResult.extractedData,
        redactedData: workflowResult.redactedData,
        scoringData: workflowResult.scoringData,
        feedbackData: workflowResult.feedbackData,
      };

      onUpdate(updatedDocument);
      setProcessingStatus(null);
    } catch (error) {
      console.error('Processing error:', error);
      const errorDocument: IEPDocument = {
        ...document,
        status: DocumentStatus.ERROR,
      };
      onUpdate(errorDocument);
      setProcessingStatus(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status: DocumentStatus): string => {
    switch (status) {
      case DocumentStatus.COMPLETED:
        return 'text-success-600 bg-success-100';
      case DocumentStatus.ERROR:
        return 'text-error-600 bg-error-100';
      case DocumentStatus.PROCESSING:
        return 'text-warning-600 bg-warning-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case DocumentStatus.COMPLETED:
        return <CheckCircle className="w-5 h-5" />;
      case DocumentStatus.ERROR:
        return <AlertCircle className="w-5 h-5" />;
      case DocumentStatus.PROCESSING:
        return <Clock className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Document Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <FileText className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{document.fileName}</h2>
              <p className="text-sm text-gray-600">
                Uploaded: {document.uploadDate.toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 text-sm font-medium rounded-full flex items-center space-x-2 ${getStatusColor(document.status)}`}>
              {getStatusIcon(document.status)}
              <span>{document.status}</span>
            </span>
            {document.status === DocumentStatus.UPLOADED && (
              <button
                onClick={processDocument}
                disabled={isProcessing}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Play className="w-4 h-4" />
                <span>Process Document</span>
              </button>
            )}
            {document.status === DocumentStatus.ERROR && (
              <button
                onClick={processDocument}
                disabled={isProcessing}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Retry Processing</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Processing Status */}
      {processingStatus && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-4 mb-4">
            <Clock className="w-6 h-6 text-warning-500" />
            <h3 className="text-lg font-semibold text-gray-900">Processing Status</h3>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{processingStatus.currentStep}</span>
              <span>{processingStatus.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${processingStatus.progress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Results Tabs */}
      {document.status === DocumentStatus.COMPLETED && (
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'extracted', label: 'Extracted Data' },
                { id: 'scoring', label: 'Scoring' },
                { id: 'feedback', label: 'Feedback' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 border border-gray-200 rounded-lg">
                    <div className="text-3xl font-bold text-primary-600 mb-2">
                      {document.scoringData?.overallScore || 0}%
                    </div>
                    <div className="text-sm text-gray-600">Overall Score</div>
                  </div>
                  <div className="text-center p-4 border border-gray-200 rounded-lg">
                    <div className="text-3xl font-bold text-warning-600 mb-2">
                      {document.feedbackData?.recommendation || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">Recommendation</div>
                  </div>
                  <div className="text-center p-4 border border-gray-200 rounded-lg">
                    <div className="text-3xl font-bold text-success-600 mb-2">
                      {document.scoringData?.complianceLevel || 'N/A'}
                    </div>
                    <div className="text-sm text-gray-600">Compliance</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'extracted' && document.extractedData && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Extracted IEP Data</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Student Name</label>
                      <p className="mt-1 text-sm text-gray-900">{document.extractedData?.studentName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Grade Level</label>
                      <p className="mt-1 text-sm text-gray-900">{document.extractedData?.gradeLevel || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">School</label>
                      <p className="mt-1 text-sm text-gray-900">{document.extractedData?.schoolName || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">IEP Date</label>
                      <p className="mt-1 text-sm text-gray-900">{document.extractedData?.iepDate || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Next Review</label>
                      <p className="mt-1 text-sm text-gray-900">{document.extractedData?.nextReviewDate || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'scoring' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Rubric Scoring</h3>
                {document.feedbackData?.rubricScores ? (
                  <RubricScoringSection
                    rubricScores={document.feedbackData.rubricScores}
                    onEditSummary={(categoryId, subCriteriaId, newSummary) => {
                      console.log('Edit summary:', { categoryId, subCriteriaId, newSummary });
                      // TODO: Implement actual update logic
                    }}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No scoring data available. Process the document first.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'feedback' && (
              <div className="space-y-6">
                {(() => {
                  const transitionPlanData = convertToTransitionPlanFormat(document.feedbackData);
                  return (
                    <TransitionPlanFeedback
                      header={transitionPlanData?.header}
                      summary={transitionPlanData?.summary}
                      detailedFeedback={transitionPlanData?.detailedFeedback}
                      onEditSummary={(sectionId, subCriteriaId, newSummary) => {
                        console.log('Edit summary:', { sectionId, subCriteriaId, newSummary });
                        // TODO: Implement actual update logic
                      }}
                      onCreateTransitionPlan={() => {
                        console.log('Create transition plan clicked');
                        // TODO: Implement transition plan creation
                      }}
                      isLoading={isProcessing}
                      error={!document.feedbackData ? 'No feedback data available' : undefined}
                    />
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentProcessor;

