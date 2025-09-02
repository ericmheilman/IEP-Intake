// Lyzr Agent Configuration
export const LYZR_AGENTS = {
  // Feedback & Routing Agent (provided)
  FEEDBACK_ROUTING: {
    id: '68b333fc531308af6cadec9b',
    name: 'Feedback & Routing Agent',
    description: 'Generates revision guidance and suggests actions (Approve, Revise, Reject) to drive iteration with teachers via email or form feedback.',
    endpoint: '/v3/inference/chat/'
  },
  
  // Placeholder for other agents (you'll need to provide these IDs)
  IEP_INTAKE: {
    id: '68b3330a25170ae5463dc24d',
    name: 'IEP Intake Agent',
    description: 'Extracts and normalizes key fields (e.g., student goals, dates, services) from uploaded IEP PDFs, converting messy, multi-format inputs into structured content for downstream analysis.',
    endpoint: '/v3/inference/chat/'
  },
  
  REDACTION_QA: {
    id: '68b3338b25170ae5463dc251',
    name: 'Redaction & QA Agent',
    description: 'Redacts Personally Identifiable Information (PII) such as names and addresses from IEP PDFs and ensures compliance with formatting and structure standards.',
    endpoint: '/v3/inference/chat/'
  },
  
  RUBRIC_SCORING: {
    id: '68b333c5531308af6cadec9a',
    name: 'Rubric Scoring Agent',
    description: 'Applies federal and state-aligned rubrics to score IEP compliance and identifies missing components.',
    endpoint: '/v3/inference/chat/'
  }
};

// Agent prompts for consistent messaging
export const AGENT_PROMPTS = {
  IEP_INTAKE: (documentId: string) => 
    `Please extract and normalize key fields from the IEP document with ID: ${documentId}. Extract student information, goals, accommodations, services, and placement details.`,
  
  REDACTION_QA: (documentId: string) => 
    `Please redact PII and validate document structure for the IEP document with ID: ${documentId}. Remove personally identifiable information and ensure the document meets standards.`,
  
  RUBRIC_SCORING: (documentId: string) => 
    `Please apply federal/state rubrics for compliance scoring on the IEP document with ID: ${documentId}. Provide a 0-100 scale score and detailed feedback.`,
  
  FEEDBACK_ROUTING: (documentId: string) => 
    `Please review the IEP document with ID: ${documentId}. Generate detailed revision guidance and suggest appropriate action (Approve, Revise, Reject) based on the scoring reports.`
};
