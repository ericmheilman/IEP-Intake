'use client';

import React, { useState, useEffect } from 'react';
import { Upload, FileText, BarChart3, Settings } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import Dashboard from '@/components/Dashboard';
import DocumentProcessor from '@/components/DocumentProcessor';
import { IEPDocument, DocumentStatus, FileUploadResult } from '@/types';

export default function HomePage() {
  const [documents, setDocuments] = useState<IEPDocument[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<IEPDocument | null>(null);
  const [activeView, setActiveView] = useState<'dashboard' | 'upload' | 'document'>('dashboard');

  // Load documents from localStorage on mount
  useEffect(() => {
    const savedDocuments = localStorage.getItem('iep-documents');
    if (savedDocuments) {
      try {
        const parsed = JSON.parse(savedDocuments);
        const documentsWithDates = parsed.map((doc: any) => ({
          ...doc,
          uploadDate: new Date(doc.uploadDate),
        }));
        setDocuments(documentsWithDates);
      } catch (error) {
        console.error('Error loading documents:', error);
      }
    }
  }, []);

  // Save documents to localStorage whenever documents change
  useEffect(() => {
    localStorage.setItem('iep-documents', JSON.stringify(documents));
  }, [documents]);

  const handleUploadSuccess = (result: FileUploadResult) => {
    if (result.success && result.fileId) {
      const newDocument: IEPDocument = {
        id: result.fileId,
        fileName: `IEP_Document_${Date.now()}.pdf`,
        fileSize: 0, // Would be set from actual file
        uploadDate: new Date(),
        status: DocumentStatus.UPLOADED,
      };

      setDocuments(prev => [newDocument, ...prev]);
      setSelectedDocument(newDocument);
      setActiveView('document');
    }
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
    // In a real app, you might want to show a toast notification
    alert(`Upload failed: ${error}`);
  };

  const handleDocumentUpdate = (updatedDocument: IEPDocument) => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === updatedDocument.id ? updatedDocument : doc
      )
    );
    setSelectedDocument(updatedDocument);
  };

  const handleDocumentSelect = (documentId: string) => {
    const document = documents.find(doc => doc.id === documentId);
    if (document) {
      setSelectedDocument(document);
      setActiveView('document');
    }
  };

  const navigation = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'upload', label: 'Upload', icon: Upload },
  ];

  return (
    <div className="space-y-6">
      {/* Navigation */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <nav className="flex space-x-8">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  activeView === item.id
                    ? 'bg-primary-100 text-primary-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      {activeView === 'dashboard' && (
        <Dashboard
          documents={documents}
          onDocumentSelect={handleDocumentSelect}
        />
      )}

      {activeView === 'upload' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Upload IEP Document
              </h2>
              <p className="text-gray-600">
                Upload a PDF IEP document to begin AI-powered processing and compliance scoring
              </p>
            </div>
            <FileUpload
              onUploadSuccess={handleUploadSuccess}
              onUploadError={handleUploadError}
              isProcessing={selectedDocument?.status === DocumentStatus.PROCESSING}
            />
          </div>

          {/* Agent Information */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              AI Processing Agents
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">IEP Intake Agent</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Extracts and normalizes key fields from IEP PDFs into structured data
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <FileText className="w-4 h-4 mr-1" />
                  <span>~15 seconds processing time</span>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Redaction & QA Agent</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Redacts PII and validates document structure against standards
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <Settings className="w-4 h-4 mr-1" />
                  <span>~20 seconds processing time</span>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Rubric Scoring Agent</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Applies federal/state rubrics for compliance scoring (0-100 scale)
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <BarChart3 className="w-4 h-4 mr-1" />
                  <span>~10 seconds processing time</span>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Feedback & Routing Agent</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Generates revision guidance and routing recommendations
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <FileText className="w-4 h-4 mr-1" />
                  <span>~12 seconds processing time</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'document' && selectedDocument && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setActiveView('dashboard')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span>← Back to Dashboard</span>
            </button>
          </div>
          <DocumentProcessor
            document={selectedDocument}
            onUpdate={handleDocumentUpdate}
          />
        </div>
      )}
    </div>
  );
}

