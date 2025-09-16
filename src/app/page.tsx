'use client';

import React, { useState, useEffect } from 'react';
import { Upload, FileText, BarChart3, Settings } from 'lucide-react';
import FileUpload from '@/components/FileUpload';
import Dashboard from '@/components/Dashboard';
import DocumentProcessor from '@/components/DocumentProcessor';
import Logo from '@/components/Logo';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100">
      <div className="space-y-8 p-6">
        {/* Enhanced Navigation */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <Logo size="lg" showText={true} />
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-2xl font-bold text-gray-900">IEP Processor</h1>
                <p className="text-sm text-gray-600">AI-Powered Document Analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">System Online</span>
            </div>
          </div>
          
          <nav className="flex space-x-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as any)}
                  className={`flex items-center space-x-3 px-6 py-3 rounded-xl transition-all duration-200 ${
                    activeView === item.id
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/60 hover:shadow-md'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-semibold">{item.label}</span>
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
          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <div className="text-center mb-8">
                <div className="flex justify-center mb-6">
                  <Logo size="lg" showText={true} />
                </div>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl mb-4">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  Upload IEP Document
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  Upload a PDF IEP document to begin AI-powered processing and compliance scoring with our advanced workflow orchestrator
                </p>
              </div>
              <FileUpload
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
                isProcessing={selectedDocument?.status === DocumentStatus.PROCESSING}
              />
            </div>

            {/* Enhanced Agent Information */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  AI Processing Pipeline
                </h3>
                <p className="text-gray-600">
                  Our workflow orchestrator coordinates multiple AI agents for comprehensive IEP analysis
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="group bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">IEP Intake Agent</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Extracts and normalizes key fields from IEP PDFs into structured data
                  </p>
                  <div className="flex items-center text-xs text-blue-600 font-medium">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                    <span>~15 seconds</span>
                  </div>
                </div>

                <div className="group bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-500 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Redaction & QA Agent</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Redacts PII and validates document structure against standards
                  </p>
                  <div className="flex items-center text-xs text-purple-600 font-medium">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                    <span>~20 seconds</span>
                  </div>
                </div>

                <div className="group bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-500 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Rubric Scoring Agent</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Applies federal/state rubrics for compliance scoring (0-100 scale)
                  </p>
                  <div className="flex items-center text-xs text-green-600 font-medium">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span>~10 seconds</span>
                  </div>
                </div>

                <div className="group bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center justify-center w-12 h-12 bg-orange-500 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Feedback & Routing Agent</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Generates revision guidance and routing recommendations
                  </p>
                  <div className="flex items-center text-xs text-orange-600 font-medium">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                    <span>~12 seconds</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-500 rounded-lg">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Workflow Orchestrator</h4>
                    <p className="text-sm text-gray-600">Coordinates all agents seamlessly for end-to-end processing</p>
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
                className="flex items-center space-x-3 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 text-gray-600 hover:text-gray-900 hover:bg-white/90 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">Back to Dashboard</span>
              </button>
            </div>
            <DocumentProcessor
              document={selectedDocument}
              onUpdate={handleDocumentUpdate}
            />
          </div>
        )}
      </div>
    </div>
  );
}

