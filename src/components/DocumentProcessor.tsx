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
      currentStep: 'Starting processing...',
    });

    try {
      // Simulate processing steps
      const steps = [
        { step: 'Uploading document...', progress: 10 },
        { step: 'Extracting IEP data...', progress: 25 },
        { step: 'Redacting PII...', progress: 50 },
        { step: 'Running QA checks...', progress: 65 },
        { step: 'Scoring compliance...', progress: 80 },
        { step: 'Generating feedback...', progress: 95 },
        { step: 'Finalizing results...', progress: 100 },
      ];

      for (const { step, progress } of steps) {
        setProcessingStatus(prev => prev ? { ...prev, currentStep: step, progress } : null);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Call the actual Lyzr agents
      console.log('Calling Lyzr agents for document processing...');
      
      // Step 1: IEP Intake Agent
      setProcessingStatus(prev => prev ? { ...prev, currentStep: 'Extracting IEP data...', progress: 25 } : null);
      const intakeResult = await lyzrAPI.processIEPIntake(document.id);
      
      // Step 2: Redaction & QA Agent
      setProcessingStatus(prev => prev ? { ...prev, currentStep: 'Redacting PII and QA...', progress: 50 } : null);
      const redactionResult = await lyzrAPI.processRedactionQA(document.id);
      
      // Step 3: Rubric Scoring Agent
      setProcessingStatus(prev => prev ? { ...prev, currentStep: 'Scoring compliance...', progress: 75 } : null);
      const scoringResult = await lyzrAPI.processRubricScoring(document.id);
      
      // Step 4: Feedback & Routing Agent
      setProcessingStatus(prev => prev ? { ...prev, currentStep: 'Generating feedback...', progress: 90 } : null);
      const feedbackResult = await lyzrAPI.processFeedbackRouting(document.id);

      // Only use real data - no mock fallbacks
      if (!intakeResult.success || !scoringResult.success || !feedbackResult.success) {
        throw new Error('One or more agents failed to process the document');
      }
      
      const extractedData = intakeResult.data;
      const scoringData = scoringResult.data;
      const feedbackData = feedbackResult.data;

      const updatedDocument: IEPDocument = {
        ...document,
        status: DocumentStatus.COMPLETED,
        extractedData: extractedData,
        scoringData: scoringData,
        feedbackData: feedbackData,
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
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900">Feedback & Recommendations</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Summary</h4>
                  <p className="text-gray-700">{document.feedbackData?.feedbackSummary || 'No feedback available'}</p>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Detailed Feedback</h4>
                  {document.feedbackData?.detailedFeedback && document.feedbackData.detailedFeedback.length > 0 ? (
                    document.feedbackData.detailedFeedback.map((feedback, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h5 className="font-medium text-gray-900">{feedback.section}</h5>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          feedback.priority === 'High' ? 'bg-error-100 text-error-800' :
                          feedback.priority === 'Medium' ? 'bg-warning-100 text-warning-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {feedback.priority} Priority
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{feedback.issue}</p>
                      <p className="text-sm text-gray-700">{feedback.recommendation}</p>
                    </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No detailed feedback available</p>
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

