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
  ProcessingStatus 
} from '@/types';

interface DocumentProcessorProps {
  document: IEPDocument;
  onUpdate: (document: IEPDocument) => void;
}

const DocumentProcessor: React.FC<DocumentProcessorProps> = ({ document, onUpdate }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'extracted' | 'scoring' | 'feedback'>('overview');

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

            {activeTab === 'scoring' && document.scoringData && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Compliance Scoring</h3>
                <div className="space-y-4">
                  {document.scoringData.detailedScores && document.scoringData.detailedScores.length > 0 ? (
                    document.scoringData.detailedScores.map((score, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium text-gray-900">{score.category}</h4>
                        <span className="text-sm font-medium text-gray-600">
                          {score.score}/{score.maxScore}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full"
                          style={{ width: `${(score.score / score.maxScore) * 100}%` }}
                        />
                      </div>
                      <p className="text-sm text-gray-600">{score.feedback}</p>
                    </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No scoring data available</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'feedback' && document.feedbackData && (
              <div className="space-y-8">
                {/* Header with Recommendation Badge */}
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-900">Feedback & Recommendations</h3>
                  <div className="flex items-center space-x-4">
                    <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      document.feedbackData?.recommendation === 'Approve' ? 'bg-green-100 text-green-800' :
                      document.feedbackData?.recommendation === 'Revise' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {document.feedbackData?.recommendation || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-500">
                      Confidence: {Math.round((document.feedbackData?.confidence || 0) * 100)}%
                    </div>
                  </div>
                </div>

                {/* Executive Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">Executive Summary</h4>
                      <p className="text-gray-700 leading-relaxed">{document.feedbackData?.feedbackSummary || 'No feedback available'}</p>
                    </div>
                  </div>
                </div>

                {/* Next Steps */}
                {document.feedbackData?.nextSteps && document.feedbackData.nextSteps.length > 0 && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">Next Steps</h4>
                        <ul className="space-y-2">
                          {document.feedbackData.nextSteps.map((step, index) => (
                            <li key={index} className="flex items-start space-x-3">
                              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-green-600 text-sm font-semibold">{index + 1}</span>
                              </div>
                              <span className="text-gray-700">{step}</span>
                            </li>
                          ))}
                        </ul>
                        {document.feedbackData?.estimatedRevisionTime && (
                          <div className="mt-4 p-3 bg-green-100 rounded-lg">
                            <span className="text-sm font-medium text-green-800">
                              Estimated time: {document.feedbackData.estimatedRevisionTime}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Detailed Feedback */}
                <div className="space-y-6">
                  <h4 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Detailed Analysis</span>
                  </h4>
                  
                  {document.feedbackData?.detailedFeedback && document.feedbackData.detailedFeedback.length > 0 ? (
                    <div className="grid gap-6">
                      {document.feedbackData.detailedFeedback.map((feedback, index) => (
                        <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-4">
                            <h5 className="text-lg font-semibold text-gray-900">{feedback.section}</h5>
                            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                              feedback.priority === 'High' ? 'bg-red-100 text-red-800 border border-red-200' :
                              feedback.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                              'bg-gray-100 text-gray-800 border border-gray-200'
                            }`}>
                              {feedback.priority} Priority
                            </span>
                          </div>
                          
                          <div className="space-y-4">
                            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                              <h6 className="font-medium text-red-800 mb-2 flex items-center space-x-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                                <span>Issue Identified</span>
                              </h6>
                              <p className="text-red-700">{feedback.issue}</p>
                            </div>
                            
                            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                              <h6 className="font-medium text-blue-800 mb-2 flex items-center space-x-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                <span>Recommendation</span>
                              </h6>
                              <p className="text-blue-700">{feedback.recommendation}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-xl">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-500 text-lg">No detailed feedback available</p>
                    </div>
                  )}
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

