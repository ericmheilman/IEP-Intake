export interface IEPDocument {
  id: string;
  fileName: string;
  fileSize: number;
  uploadDate: Date;
  status: DocumentStatus;
  extractedData?: any;
  complianceScore?: number;
  feedback?: string;
  feedbackData?: IEPFeedbackData;
  scoringData?: IEPScoringData;
  redactedData?: IEPRedactedData;
  processingSteps?: ProcessingStep[];
}

export enum DocumentStatus {
  UPLOADED = 'uploaded',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  ERROR = 'error'
}

export interface FileUploadResult {
  success: boolean;
  fileId?: string;
  error?: string;
}

export interface ProcessingStep {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  startTime?: Date;
  endTime?: Date;
  result?: any;
  error?: string;
}

export interface IEPData {
  studentName?: string;
  studentId?: string;
  grade?: string;
  disability?: string;
  goals?: string[];
  accommodations?: string[];
  services?: string[];
  placement?: string;
  parentConsent?: boolean;
  reviewDate?: Date;
  nextReviewDate?: Date;
}

export interface ComplianceScore {
  overall: number;
  categories: {
    goals: number;
    accommodations: number;
    services: number;
    placement: number;
    timeline: number;
  };
  feedback: string[];
  recommendations: string[];
}

// Dashboard types
export interface DashboardStats {
  totalDocuments: number;
  processedDocuments: number;
  averageScore: number;
  complianceRate: number;
}

export interface RecentActivity {
  id: string;
  documentName: string;
  action: string;
  timestamp: Date;
  status: DocumentStatus;
}

// Document processing types
export interface IEPExtractedData {
  studentName: string;
  gradeLevel: string;
  schoolName: string;
  iepDate: string;
  nextReviewDate: string;
  disability: string;
  goals: string[];
  accommodations: string[];
  services: string[];
  placement: string;
  rawResponse?: string;
}

export interface IEPRedactedData {
  redactedText: string;
  redactedFields: string[];
  confidence: number;
  rawResponse?: string;
}

export interface IEPScoringData {
  overallScore: number;
  complianceLevel: string;
  detailedScores: DetailedScore[];
}

export interface DetailedScore {
  category: string;
  score: number;
  maxScore: number;
  feedback: string;
}

export interface IEPFeedbackData {
  feedbackSummary: string;
  detailedFeedback: DetailedFeedback[];
  recommendation: string;
  // New rubric-based feedback structure
  overallCompliance: 'Compliant' | 'Non-compliant';
  rubricScores: RubricScore[];
  nextSteps?: string[];
  estimatedRevisionTime?: string;
  confidence?: number;
  rawResponse?: string;
}

export interface DetailedFeedback {
  section: string;
  issue: string;
  recommendation: string;
  priority: 'High' | 'Medium' | 'Low';
}

// New types for Transition Plan Compliance Rubric
export interface RubricScore {
  id: string;
  category: string;
  subCriteria: SubCriteria[];
  totalScore: number;
  maxScore: number;
  isCompliant: boolean;
  summary: string;
  detailedSummary: string;
}

export interface SubCriteria {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  isCompliant: boolean;
  summary: string;
  detailedSummary: string;
}

export interface ProcessingStatus {
  documentId: string;
  status: DocumentStatus;
  progress: number;
  currentStep: string;
}

// API types
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AgentConfig {
  name: string;
  endpoint: string;
  description: string;
  processingTime: number;
}

// New types for the actual API response format
export interface IndicatorEvaluation {
  indicator: string;
  description: string;
  compliance_rating: 'Y' | 'N';
  quality_rating: number;
  justification: string;
}

export interface StudentInfo {
  name: string;
  age: number;
  school_district: string;
  review_date: string;
}

export interface IEPAnalysisResponse {
  student_info: StudentInfo;
  indicator_evaluations: IndicatorEvaluation[];
  total_quality_score: number;
  overall_compliance: 'Compliant' | 'Non-Compliant';
  notes: string;
}

// New interfaces for 36-point Transition Plan Feedback system
export interface TransitionPlanHeader {
  filename: string;
  studentName: string;
  submissionDate: string;
}

export interface TransitionPlanSummary {
  overallScore: number;
  maxScore: number;
  overallCompliance: 'Compliant' | 'Non-Compliant';
  sections: TransitionPlanSection[];
}

export interface TransitionPlanSection {
  id: string;
  name: string;
  score: number | string; // Allow 'x' for missing data
  maxScore: number;
  isCompliant: boolean;
  summary?: string;
  detailedSummary?: string;
  subCriteria: TransitionPlanSubCriteria[];
}

export interface TransitionPlanSubCriteria {
  id: string;
  name: string;
  score: number | string; // Allow 'x' for missing data
  maxScore: number;
  isCompliant: boolean;
  comments: string;
}

export interface TransitionPlanDetailedFeedback {
  overview: string;
  strengths: string[];
  weaknesses: string[];
  connectionToLearningObjectives: string[];
  areasForImprovement: string[];
  finalScore: {
    total: number | string;
    max: number;
  };
}
