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

  // Create a default document with dummy data for UI testing
  const defaultDocument: IEPDocument = {
    id: 'default-doc',
    fileName: 'Sample IEP Document.pdf',
    fileSize: 1024,
    uploadDate: new Date(),
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
    feedbackData: {
      feedbackSummary: 'This IEP transition plan received a score of 23/28 (82%). The plan shows strengths in student participation, transition assessments, and postsecondary goal development, but has significant gaps in agency participation and course planning that need to be addressed for full compliance.',
      detailedFeedback: [
        {
          section: 'Student Participation',
          issue: 'Missing age of majority notification documentation',
          recommendation: 'Ensure both student and parent are informed of transfer of rights before the student\'s 17th birthday, with proper documentation including dates and signatures.',
          priority: 'High'
        },
        {
          section: 'Postsecondary Goals',
          issue: 'Independent living goal missing despite student needs',
          recommendation: 'Add a specific, measurable independent living goal based on assessment results showing need for daily living skills support.',
          priority: 'High'
        },
        {
          section: 'Agency Participation',
          issue: 'No evidence of agency invitation or participation',
          recommendation: 'Invite relevant outside agencies (VR, DDS, etc.) to the IEP meeting and document their participation and contributions to the transition plan.',
          priority: 'High'
        }
      ],
      recommendation: 'Revise',
      overallCompliance: 'Non-compliant',
      rubricScores: [
        {
          id: 'student-participation',
          category: '1. Student Participation and Preferences',
          totalScore: 3,
          maxScore: 6,
          isCompliant: false,
          summary: 'Student participation documented but missing some required elements',
          detailedSummary: 'The IEP shows evidence of student invitation to the meeting and basic documentation of preferences, but lacks comprehensive assessment methods and age of majority notification.',
          subCriteria: [
            {
              id: 'student-invitation',
              name: '1.1 Evidence of Student Invitation to IEP Meeting',
              score: 2,
              maxScore: 2,
              isCompliant: true,
              summary: 'Student was clearly invited with specific date and attended the meeting',
              detailedSummary: 'Documentation shows student was invited on [date] and attended the IEP meeting. Meeting notes include student input and participation throughout the discussion.'
            },
            {
              id: 'student-preferences',
              name: '1.2 Student Preferences and Interests Documentation',
              score: 1,
              maxScore: 2,
              isCompliant: false,
              summary: 'Basic documentation exists but lacks comprehensive assessment methods',
              detailedSummary: 'Student preferences are mentioned in the IEP but only through limited assessment methods. No direct quotes from student or comprehensive evaluation across multiple domains.'
            },
            {
              id: 'age-majority',
              name: '1.3 Age of Majority',
              score: 0,
              maxScore: 2,
              isCompliant: false,
              summary: 'No evidence of age of majority notification',
              detailedSummary: 'Missing documentation that student and parent were informed of transfer of rights. Required notification before 17th birthday not found in IEP documentation.'
            }
          ]
        },
        {
          id: 'transition-assessments',
          category: '2. Age-Appropriate Transition Assessments',
          totalScore: 4,
          maxScore: 4,
          isCompliant: true,
          summary: 'Comprehensive transition assessments used with clear integration',
          detailedSummary: 'Multiple age-appropriate assessments were conducted across vocational, academic, and independent living domains. Results are clearly summarized and directly connected to postsecondary goals.',
          subCriteria: [
            {
              id: 'assessment-variety',
              name: '2.1 Variety of Assessments Used',
              score: 2,
              maxScore: 2,
              isCompliant: true,
              summary: 'Multiple assessments used across different domains',
              detailedSummary: 'Three formal assessments and two informal measures were used, covering vocational interests, academic skills, and independent living capabilities.'
            },
            {
              id: 'assessment-integration',
              name: '2.2 Assessment Results Integration',
              score: 2,
              maxScore: 2,
              isCompliant: true,
              summary: 'Assessment results clearly summarized and connected to goals',
              detailedSummary: 'Assessment results include specific data points and show direct alignment with identified postsecondary goals in education, employment, and independent living.'
            }
          ]
        },
        {
          id: 'postsecondary-goals',
          category: '3. Measurable Postsecondary Goals',
          totalScore: 4,
          maxScore: 6,
          isCompliant: false,
          summary: 'Education and employment goals present but independent living goal missing',
          detailedSummary: 'Clear, measurable postsecondary goals exist for education and employment, but no independent living goal is present despite student needs indicating this would be appropriate.',
          subCriteria: [
            {
              id: 'education-goal',
              name: '3.1 Education/Training Goal',
              score: 2,
              maxScore: 2,
              isCompliant: true,
              summary: 'Specific, measurable education goal aligned with assessments',
              detailedSummary: 'Goal states: "After graduation, the student will enroll in community college to pursue a certificate in automotive technology." Goal is specific, time-bound, and based on assessment results.'
            },
            {
              id: 'employment-goal',
              name: '3.2 Employment Goal',
              score: 2,
              maxScore: 2,
              isCompliant: true,
              summary: 'Clear employment goal with specific field identified',
              detailedSummary: 'Goal states: "After graduation, the student will obtain employment as an automotive technician." Goal is specific, measurable, and directly related to education goal.'
            },
            {
              id: 'independent-living-goal',
              name: '3.3 Independent Living Goal (when appropriate)',
              score: 0,
              maxScore: 2,
              isCompliant: false,
              summary: 'Independent living goal missing despite clear need',
              detailedSummary: 'Student has significant support needs in daily living skills but no independent living goal is included in the transition plan. This appears to be an oversight given the student\'s assessment results.'
            }
          ]
        },
        {
          id: 'annual-iep-goals',
          category: '4. Annual IEP Transition Goals',
          totalScore: 3,
          maxScore: 4,
          isCompliant: false,
          summary: 'Goals align with postsecondary goals but lack full measurability',
          detailedSummary: 'Annual IEP goals support postsecondary goals but some lack complete condition, behavior, and criteria components required for full measurability.',
          subCriteria: [
            {
              id: 'goal-alignment',
              name: '4.1 Alignment with Postsecondary Goals',
              score: 2,
              maxScore: 2,
              isCompliant: true,
              summary: 'Multiple annual goals support each postsecondary goal',
              detailedSummary: 'Three annual IEP goals directly support the education goal and two support the employment goal. Clear connection between annual goals and postsecondary outcomes is evident.'
            },
            {
              id: 'goal-measurability',
              name: '4.2 Measurability of Annual Goals',
              score: 1,
              maxScore: 2,
              isCompliant: false,
              summary: 'Most goals measurable but some lack complete criteria',
              detailedSummary: 'Two of three annual goals include complete condition, behavior, and criteria. One goal lacks specific criteria for measurement, making it difficult to determine progress.'
            }
          ]
        },
        {
          id: 'transition-services',
          category: '5. Transition Services',
          totalScore: 4,
          maxScore: 4,
          isCompliant: true,
          summary: 'Comprehensive transition services across multiple domains',
          detailedSummary: 'Multiple transition services identified for each postsecondary goal, spanning instruction, community experiences, and employment preparation with clear timelines and responsible parties.',
          subCriteria: [
            {
              id: 'service-comprehensiveness',
              name: '5.1 Comprehensive Transition Services',
              score: 2,
              maxScore: 2,
              isCompliant: true,
              summary: 'Multiple services identified with specific details',
              detailedSummary: 'Four transition services identified for education goal and three for employment goal, each with specific activities, timeframes, and responsible parties clearly documented.'
            },
            {
              id: 'service-variety',
              name: '5.2 Service Variety and Relevance',
              score: 2,
              maxScore: 2,
              isCompliant: true,
              summary: 'Services span multiple domains and are highly relevant',
              detailedSummary: 'Services cover instruction (academic support), community experiences (job shadowing), employment (work-based learning), and daily living skills (independent living training).'
            }
          ]
        },
        {
          id: 'courses-study',
          category: '6. Courses of Study',
          totalScore: 2,
          maxScore: 4,
          isCompliant: false,
          summary: 'Basic course plan exists but lacks multi-year detail',
          detailedSummary: 'General course areas identified but specific multi-year course planning is missing. Course selection shows some alignment with postsecondary goals but could be more comprehensive.',
          subCriteria: [
            {
              id: 'multi-year-planning',
              name: '6.1 Multi-Year Course Planning',
              score: 1,
              maxScore: 2,
              isCompliant: false,
              summary: 'Basic plan exists but lacks specific course details',
              detailedSummary: 'General course areas identified (math, English, vocational courses) but specific courses by name for each remaining year are not detailed in the plan.'
            },
            {
              id: 'graduation-alignment',
              name: '6.2 Graduation Pathway Alignment',
              score: 1,
              maxScore: 2,
              isCompliant: false,
              summary: 'Some alignment but connection to goals could be stronger',
              detailedSummary: 'Course of study generally aligns with graduation requirements but explicit connection to postsecondary goals could be more clearly documented.'
            }
          ]
        },
        {
          id: 'agency-participation',
          category: '7. Agency Participation',
          totalScore: 0,
          maxScore: 4,
          isCompliant: false,
          summary: 'No evidence of agency participation documentation',
          detailedSummary: 'Missing documentation of agency invitations and participation. No evidence of required consent or agency contributions to the transition plan.',
          subCriteria: [
            {
              id: 'agency-invitation',
              name: '7.1 Agency Invitation Documentation',
              score: 0,
              maxScore: 2,
              isCompliant: false,
              summary: 'No documentation of agency invitations found',
              detailedSummary: 'No Prior Written Notice, meeting notes, or signed consent forms found documenting invitation to relevant outside agencies (VR, DDS, etc.).'
            },
            {
              id: 'agency-contributions',
              name: '7.2 Agency Participation and Contributions',
              score: 0,
              maxScore: 2,
              isCompliant: false,
              summary: 'No evidence of agency participation or contributions',
              detailedSummary: 'No documentation of agency participation in the IEP meeting or specific contributions to the transition plan development.'
            }
          ]
        },
        {
          id: 'overall-quality',
          category: '8. Overall Transition Plan Quality',
          totalScore: 3,
          maxScore: 4,
          isCompliant: false,
          summary: 'Plan shows good individualization but has some inconsistencies',
          detailedSummary: 'Transition plan is well-individualized to the student with specific details throughout, but some inconsistencies exist between components that affect overall flow.',
          subCriteria: [
            {
              id: 'internal-consistency',
              name: '8.1 Internal Consistency',
              score: 1,
              maxScore: 2,
              isCompliant: false,
              summary: 'Most components consistent but some inconsistencies noted',
              detailedSummary: 'Most components of the transition plan are consistent, but there are some minor inconsistencies between assessment results and goal statements that affect logical flow.'
            },
            {
              id: 'individualization',
              name: '8.2 Individualization and Specificity',
              score: 2,
              maxScore: 2,
              isCompliant: true,
              summary: 'Highly individualized plan with specific details',
              detailedSummary: 'Transition plan is highly individualized to the student with specific details throughout that clearly reflect unique needs, preferences, and circumstances.'
            }
          ]
        }
      ],
      nextSteps: [
        'Address age of majority notification requirements',
        'Add independent living goal based on assessment results',
        'Invite and document agency participation',
        'Develop detailed multi-year course plan',
        'Ensure all annual goals have complete measurability criteria'
      ],
      estimatedRevisionTime: '2-3 hours',
      confidence: 0.85
    }
  };

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
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
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
              document={selectedDocument || defaultDocument}
              onUpdate={handleDocumentUpdate}
            />
          </div>
        )}
      </div>
    </div>
  );
}

