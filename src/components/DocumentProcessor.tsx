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
  RubricScore
} from '@/types';
import TransitionPlanFeedback from './TransitionPlanFeedback';
import RubricScoringSection from './RubricScoringSection';
import { generateSampleFeedbackData } from '@/utils/sampleData';

interface DocumentProcessorProps {
  document: IEPDocument;
  onUpdate: (document: IEPDocument) => void;
}

const DocumentProcessor: React.FC<DocumentProcessorProps> = ({ document, onUpdate }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'extracted' | 'scoring' | 'feedback'>('overview');

  const loadSampleData = () => {
    // Only load sample data if no real data is available
    if (document.feedbackData?.rubricScores?.length > 0) {
      return; // Already has real data
    }
    
    const sampleFeedbackData = generateSampleFeedbackData();
    const updatedDocument: IEPDocument = {
      ...document,
      status: DocumentStatus.COMPLETED,
      extractedData: {
        studentName: 'J.S.',
        gradeLevel: '11th Grade',
        schoolName: 'Sample High School',
        iepDate: '2024-01-15',
        nextReviewDate: '2025-01-15',
        disability: 'Specific Learning Disability',
        goals: ['Improve reading comprehension', 'Develop vocational skills'],
        accommodations: ['Extended time', 'Preferential seating'],
        services: ['Resource room support', 'Speech therapy'],
        placement: 'General education with support'
      },
      scoringData: {
        overallScore: 23,
        complianceLevel: 'Non-compliant',
        detailedScores: [
          { category: 'Student Participation', score: 3, maxScore: 6, feedback: 'Good student involvement but missing age of majority notification' },
          { category: 'Transition Assessments', score: 4, maxScore: 4, feedback: 'Comprehensive assessments with clear integration' },
          { category: 'Postsecondary Goals', score: 4, maxScore: 6, feedback: 'Education and employment goals present but independent living goal missing' }
        ]
      },
      feedbackData: sampleFeedbackData
    };
    console.log('Loading sample data with rubric scores:', sampleFeedbackData.rubricScores);
    onUpdate(updatedDocument);
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
            {document.status === DocumentStatus.UPLOADED && (
              <button
                onClick={loadSampleData}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <FileText className="w-4 h-4" />
                <span>Load Sample Data</span>
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
                <RubricScoringSection
                  rubricScores={document.feedbackData?.rubricScores || generateSampleFeedbackData().rubricScores}
                  onEditSummary={(categoryId, subCriteriaId, newSummary) => {
                    // Handle edit summary functionality
                    console.log('Edit summary:', { categoryId, subCriteriaId, newSummary });
                    // TODO: Implement actual update logic
                  }}
                />
              </div>
            )}

            {activeTab === 'feedback' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Transition Plan Compliance</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      (document.feedbackData?.overallCompliance || 'Non-compliant') === 'Compliant'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {document.feedbackData?.overallCompliance || 'Non-compliant'}
                    </span>
                  </div>
                </div>
                <RubricScoringSection
                  rubricScores={document.feedbackData?.rubricScores || generateSampleFeedbackData().rubricScores}
                  onEditSummary={(categoryId, subCriteriaId, newSummary) => {
                    // Handle edit summary functionality
                    console.log('Edit summary:', { categoryId, subCriteriaId, newSummary });
                  }}
                />
                <div className="flex justify-center pt-6">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg shadow-lg transition-colors duration-200 flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Create Transition Plan</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentProcessor;

