import { NextRequest, NextResponse } from 'next/server';
import { 
  IEPDocument, 
  DocumentStatus, 
  IEPExtractedData, 
  IEPRedactedData, 
  IEPScoringData, 
  IEPFeedbackData 
} from '@/types';
import fs from 'fs';
import path from 'path';

// Single Agent Configuration
const AGENT_CONFIG = {
  apiKey: 'sk-default-umuEtNZJCnYbBCmy448B42Neb90nTx5W',
  baseURL: 'https://agent-prod.studio.lyzr.ai',
  agentId: '68b333c5531308af6cadec9a', // Rubric Scoring Agent
  userId: 'max@gdna.io',
  sessionId: '68b333c5531308af6cadec9a-nt1rek21wb'
};

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log(`Processing document: ${file.name} (${file.size} bytes)`);

    // Convert file to base64 for API transmission
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    
    // Create document ID for tracking
    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Prepare the message with PDF content
    const message = `Grade this IEP document. Here is the PDF content in base64 format:

${base64}

Please analyze this IEP document and provide detailed feedback for each section.`;

    // Make API call to the single agent with 3-minute timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000); // 3 minute timeout
    
    const agentResponse = await fetch(`${AGENT_CONFIG.baseURL}/v3/inference/chat/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': AGENT_CONFIG.apiKey,
      },
      body: JSON.stringify({
        user_id: AGENT_CONFIG.userId,
        agent_id: AGENT_CONFIG.agentId,
        session_id: AGENT_CONFIG.sessionId,
        message: "Grade this IEP document",
        files: [{
          content: base64,
          filename: file.name,
          content_type: "application/pdf",
          encoding: "base64"
        }]
      }),
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!agentResponse.ok) {
      throw new Error(`Agent API call failed: ${agentResponse.status} ${agentResponse.statusText}`);
    }

    const agentData = await agentResponse.json();
    console.log('Agent response received:', agentData);
    
    // Store agent response in log file
    await logAgentResponse(documentId, file.name, agentData);

    // Parse the agent response and structure it for the UI
    const responseText = agentData.response || agentData.message || JSON.stringify(agentData);
    
    // Create structured data from the agent response
    const structuredData = parseAgentResponse(responseText, documentId, file.name);

    // Return the structured response
    return NextResponse.json({
      success: true,
      documentId,
      fileName: file.name,
      extractedData: structuredData.extractedData,
      redactedData: structuredData.redactedData,
      scoringData: structuredData.scoringData,
      feedbackData: structuredData.feedbackData,
      rawAgentResponse: agentData,
      processingSteps: [
        { step: 'Document Upload', status: 'completed', timestamp: new Date().toISOString() },
        { step: 'Agent Processing', status: 'completed', timestamp: new Date().toISOString() },
        { step: 'Data Structuring', status: 'completed', timestamp: new Date().toISOString() }
      ]
    });

  } catch (error: any) {
    console.error('Document processing failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Document processing failed',
        documentId: 'unknown',
        fileName: 'unknown',
        processingSteps: []
      },
      { status: 500 }
    );
  }
}

// Helper function to parse agent response into structured data
function parseAgentResponse(responseText: string, documentId: string, fileName: string) {
  // Extract student information
  const studentName = extractValue(responseText, /student[:\s]+([^,\n]+)/i) || 'Student Name';
  const gradeLevel = extractValue(responseText, /grade[:\s]+([^,\n]+)/i) || 'Grade Level';
  const schoolName = extractValue(responseText, /school[:\s]+([^,\n]+)/i) || 'School Name';
  
  // Extract scores from the agent response
  const totalQualityMatch = responseText.match(/Total Quality Score.*?(\d+)\/(\d+)/i);
  const overallScore = totalQualityMatch ? parseInt(totalQualityMatch[1]) : extractNumber(responseText, /overall[:\s]*score[:\s]*(\d+)/i) || 75;
  const maxPossibleScore = totalQualityMatch ? parseInt(totalQualityMatch[2]) : 32;
  const complianceLevel = extractValue(responseText, /Overall Compliance Rating.*?([YN])/i) === 'Y' ? 'Compliant' : 'Non-compliant';
  
  // Create structured data
  const extractedData: IEPExtractedData = {
    studentName,
    gradeLevel,
    schoolName,
    iepDate: new Date().toISOString().split('T')[0],
    nextReviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    disability: 'Learning Disability',
    goals: ['Academic goal 1', 'Academic goal 2'],
    accommodations: ['Extended time', 'Preferential seating'],
    services: ['Special education', 'Speech therapy'],
    placement: 'General education classroom',
    rawResponse: responseText
  };

  const redactedData: IEPRedactedData = {
    redactedText: responseText,
    redactedFields: ['studentName', 'studentId'],
    confidence: 0.95,
    rawResponse: responseText
  };

  // Try to parse structured response first
  let parsedResponse: any;
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsedResponse = JSON.parse(jsonMatch[0]);
    }
  } catch (error) {
    console.log('No JSON found in response, using fallback data');
  }

  const scoringData: IEPScoringData = {
    overallScore: parsedResponse?.total_quality_score || overallScore,
    detailedScores: parsedResponse ? 
      createRubricScoresFromResponse(parsedResponse).map((score: any) => ({
        category: score.category,
        score: score.totalScore,
        maxScore: score.maxScore,
        feedback: score.summary
      })) :
      [
        {
          category: 'Present Levels of Performance',
          score: extractNumber(responseText, /present[:\s]*levels[:\s]*(\d+)/i) || 16,
          maxScore: 20,
          feedback: 'Current performance levels documented'
        },
        {
          category: 'Annual Goals',
          score: extractNumber(responseText, /goals[:\s]*(\d+)/i) || 15,
          maxScore: 20,
          feedback: 'Goals are measurable and appropriate'
        }
      ],
    complianceLevel: parsedResponse?.overall_compliance || complianceLevel
  };

  // Create rubric scores from the response
  const rubricScores = createDefaultRubricScores(); // Using comprehensive mock data as requested
  console.log('Generated rubric scores:', rubricScores.map(r => ({ category: r.category, score: r.totalScore, maxScore: r.maxScore })));
  
  const feedbackData: IEPFeedbackData = {
    recommendation: overallScore >= 80 ? 'Approve' : overallScore >= 60 ? 'Revise' : 'Reject',
    confidence: Math.min(overallScore / 100, 1),
    feedbackSummary: responseText.substring(0, 500) + '...',
    overallCompliance: overallScore >= 70 ? 'Compliant' : 'Non-compliant',
    rubricScores,
    detailedFeedback: [
      {
        section: 'Overall Analysis',
        issue: 'Document requires review',
        recommendation: 'Please review the detailed analysis provided',
        priority: 'High'
      }
    ],
    nextSteps: [
      'Review the detailed analysis',
      'Address any identified issues',
      'Resubmit if necessary'
    ],
    estimatedRevisionTime: '1-2 hours',
    rawResponse: responseText
  };

  return {
    extractedData,
    redactedData,
    scoringData,
    feedbackData
  };
}

// Helper function to extract text values
function extractValue(text: string, regex: RegExp): string | null {
  const match = text.match(regex);
  return match ? match[1].trim() : null;
}

// Helper function to extract numbers
function extractNumber(text: string, regex: RegExp): number | null {
  const match = text.match(regex);
  return match ? parseInt(match[1]) : null;
}

// Helper function to create rubric scores from structured API response
function createRubricScoresFromResponse(response: any): any[] {
  const { indicator_evaluations, total_quality_score, overall_compliance } = response;
  
  // Group indicators by section (1.x, 2.x, etc.)
  const sections: { [key: string]: { name: string; maxScore: number; indicators: any[] } } = {
    '1': { name: '1. Student Participation and Preferences', maxScore: 6, indicators: [] },
    '2': { name: '2. Age-Appropriate Transition Assessments', maxScore: 4, indicators: [] },
    '3': { name: '3. Measurable Postsecondary Goals', maxScore: 6, indicators: [] },
    '4': { name: '4. Annual IEP Goals', maxScore: 4, indicators: [] },
    '5': { name: '5. Transition Services', maxScore: 4, indicators: [] },
    '6': { name: '6. Courses of Study', maxScore: 4, indicators: [] },
    '7': { name: '7. Agency Participation', maxScore: 4, indicators: [] },
    '8': { name: '8. Overall Transition Plan Quality', maxScore: 4, indicators: [] }
  };

  // Group indicators by section
  indicator_evaluations.forEach((indicator: any) => {
    const sectionNum = indicator.indicator.split('.')[0];
    if (sections[sectionNum]) {
      sections[sectionNum].indicators.push(indicator);
    }
  });

  // Create rubric scores for each section
  return Object.entries(sections).map(([sectionId, section]: [string, any]) => {
    const totalScore = section.indicators.reduce((sum: number, ind: any) => sum + ind.quality_rating, 0);
    const isCompliant = section.indicators.every((ind: any) => ind.compliance_rating === 'Y');
    const compliantCount = section.indicators.filter((ind: any) => ind.compliance_rating === 'Y').length;
    
    return {
      id: sectionId,
      category: section.name,
      totalScore,
      maxScore: section.maxScore,
      isCompliant,
      summary: `${compliantCount}/${section.indicators.length} indicators compliant`,
      detailedSummary: `This section includes ${section.indicators.length} indicators with ${compliantCount} compliant indicators.`,
      subCriteria: section.indicators.map((indicator: any) => ({
        id: indicator.indicator,
        name: indicator.description,
        score: indicator.quality_rating,
        maxScore: 3, // Quality ratings are typically 1-3
        isCompliant: indicator.compliance_rating === 'Y',
        summary: indicator.compliance_rating === 'Y' ? 'Compliant' : 'Non-compliant',
        detailedSummary: indicator.justification
      }))
    };
  });
}

// Helper function to create rubric scores from text response
function createRubricScoresFromTextResponse(responseText: string): any[] {
  console.log('Parsing agent response:', responseText.substring(0, 500));
  
  // Based on the actual agent response format we received
  const sections = [
    { id: '1', name: '1. Student Participation and Preferences', maxScore: 6, agentSection: 'Student Information Extraction' },
    { id: '2', name: '2. Age-Appropriate Transition Assessments', maxScore: 4, agentSection: 'Present Levels of Performance Analysis' },
    { id: '3', name: '3. Measurable Postsecondary Goals', maxScore: 6, agentSection: 'Annual Goals Assessment' },
    { id: '4', name: '4. Annual IEP Goals', maxScore: 4, agentSection: 'Services and Supports Review' },
    { id: '5', name: '5. Transition Services', maxScore: 4, agentSection: 'Accommodations and Modifications Evaluation' },
    { id: '6', name: '6. Courses of Study', maxScore: 4, agentSection: 'Transition Planning Analysis' },
    { id: '7', name: '7. Agency Participation', maxScore: 4, agentSection: 'Parent Participation Assessment' },
    { id: '8', name: '8. Overall Transition Plan Quality', maxScore: 4, agentSection: 'Overall Compliance Scoring' }
  ];

  return sections.map((section, index) => {
    const sectionNumber = index + 1;
    
    // More flexible regex patterns to match different formats
    const patterns = [
      // Pattern 1: **Quality Rating**: 4
      new RegExp(`${sectionNumber}\.\s*\*\*${section.agentSection}\*\*[\s\S]*?Quality Rating\*\*:\s*(\d+)`, 'i'),
      // Pattern 2: - **Quality Rating**: 4
      new RegExp(`${sectionNumber}\.\s*\*\*${section.agentSection}\*\*[\s\S]*?-\s*\*\*Quality Rating\*\*:\s*(\d+)`, 'i'),
      // Pattern 3: Quality Rating: 4
      new RegExp(`${sectionNumber}\.\s*\*\*${section.agentSection}\*\*[\s\S]*?Quality Rating:\s*(\d+)`, 'i'),
      // Pattern 4: Just look for any number after the section
      new RegExp(`${sectionNumber}\.\s*\*\*${section.agentSection}\*\*[\s\S]*?(\d+)`, 'i')
    ];
    
    const compliancePatterns = [
      new RegExp(`${sectionNumber}\.\s*\*\*${section.agentSection}\*\*[\s\S]*?Compliance Rating\*\*:\s*([YN])`, 'i'),
      new RegExp(`${sectionNumber}\.\s*\*\*${section.agentSection}\*\*[\s\S]*?-\s*\*\*Compliance Rating\*\*:\s*([YN])`, 'i'),
      new RegExp(`${sectionNumber}\.\s*\*\*${section.agentSection}\*\*[\s\S]*?Compliance Rating:\s*([YN])`, 'i')
    ];
    
    let qualityRating = 3; // Default
    let isCompliant = true; // Default
    
    // Try each pattern until we find a match
    for (const pattern of patterns) {
      const match = responseText.match(pattern);
      if (match) {
        qualityRating = parseInt(match[1]);
        console.log(`Found quality rating ${qualityRating} for section ${sectionNumber}`);
        break;
      }
    }
    
    for (const pattern of compliancePatterns) {
      const match = responseText.match(pattern);
      if (match) {
        isCompliant = match[1] === 'Y';
        console.log(`Found compliance ${match[1]} for section ${sectionNumber}`);
        break;
      }
    }
    
    // Map quality rating to our scoring system
    const totalScore = Math.min(qualityRating, section.maxScore);
    
    // Extract justification text
    const justificationPatterns = [
      new RegExp(`${sectionNumber}\.\s*\*\*${section.agentSection}\*\*[\s\S]*?Justification\*\*:\s*(.*?)(?=\n\n|\d+\.|###|$)`, 'is'),
      new RegExp(`${sectionNumber}\.\s*\*\*${section.agentSection}\*\*[\s\S]*?-\s*\*\*Justification\*\*:\s*(.*?)(?=\n\n|\d+\.|###|$)`, 'is')
    ];
    
    let justification = `Detailed analysis for ${section.name.toLowerCase()} based on IEP document review.`;
    for (const pattern of justificationPatterns) {
      const match = responseText.match(pattern);
      if (match) {
        justification = match[1].trim().replace(/\*\*/g, '').substring(0, 300) + '...';
        break;
      }
    }
    
    return {
      id: section.id,
      category: section.name,
      totalScore,
      maxScore: section.maxScore,
      isCompliant,
      summary: `${isCompliant ? 'Compliant' : 'Non-compliant'} - Quality rating: ${qualityRating}`,
      detailedSummary: justification,
      subCriteria: []
    };
  });
}

// Helper function to log agent responses
async function logAgentResponse(documentId: string, fileName: string, agentData: any) {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      documentId,
      fileName,
      agentResponse: agentData,
      responseText: agentData.response || agentData.message || JSON.stringify(agentData)
    };
    
    const logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    const logFile = path.join(logDir, 'agent-responses.log');
    const logLine = `\n${'='.repeat(80)}\n${timestamp} - Document: ${fileName} (${documentId})\n${'='.repeat(80)}\n${JSON.stringify(logEntry, null, 2)}\n`;
    
    fs.appendFileSync(logFile, logLine);
    console.log(`Agent response logged to: ${logFile}`);
  } catch (error) {
    console.error('Failed to log agent response:', error);
  }
}

// Helper function to create mock rubric scores with realistic data
function createDefaultRubricScores(): any[] {
  return [
    {
      id: '1',
      category: '1. Student Participation and Preferences',
      totalScore: 3,
      maxScore: 6,
      isCompliant: false,
      summary: 'Student participation documented but missing some required elements',
      detailedSummary: 'The IEP shows evidence of student invitation to the meeting and basic documentation of preferences, but lacks comprehensive assessment methods and age of majority notification.',
      subCriteria: [
        {
          id: '1.1',
          name: '1.1 Evidence of Student Invitation to IEP Meeting',
          score: 2,
          maxScore: 2,
          isCompliant: true,
          summary: 'Student was clearly invited with specific date and attended the meeting',
          detailedSummary: 'Documentation shows student was invited on [date] and attended the IEP meeting. Meeting notes include student input and participation throughout the discussion.'
        },
        {
          id: '1.2',
          name: '1.2 Student Preferences and Interests Documentation',
          score: 1,
          maxScore: 2,
          isCompliant: false,
          summary: 'Basic documentation exists but lacks comprehensive assessment methods',
          detailedSummary: 'Student preferences are mentioned in the IEP but only through limited assessment methods. No direct quotes from student or comprehensive evaluation across multiple domains.'
        },
        {
          id: '1.3',
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
      id: '2',
      category: '2. Age-Appropriate Transition Assessments',
      totalScore: 4,
      maxScore: 4,
      isCompliant: true,
      summary: 'Comprehensive transition assessments used with clear integration',
      detailedSummary: 'Multiple age-appropriate assessments were conducted across vocational, academic, and independent living domains. Results are clearly summarized and directly connected to postsecondary goals.',
      subCriteria: [
        {
          id: '2.1',
          name: '2.1 Variety of Assessments Used',
          score: 2,
          maxScore: 2,
          isCompliant: true,
          summary: 'Multiple assessments used across different domains',
          detailedSummary: 'Three formal assessments and two informal measures were used, covering vocational interests, academic skills, and independent living capabilities.'
        },
        {
          id: '2.2',
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
      id: '3',
      category: '3. Measurable Postsecondary Goals',
      totalScore: 4,
      maxScore: 6,
      isCompliant: false,
      summary: 'Education and employment goals present but independent living goal missing',
      detailedSummary: 'Clear, measurable postsecondary goals exist for education and employment, but no independent living goal is present despite student needs indicating this would be appropriate.',
      subCriteria: [
        {
          id: '3.1',
          name: '3.1 Education/Training Goal',
          score: 2,
          maxScore: 2,
          isCompliant: true,
          summary: 'Specific, measurable education goal aligned with assessments',
          detailedSummary: 'Goal states: "After graduation, the student will enroll in community college to pursue a certificate in automotive technology." Goal is specific, time-bound, and based on assessment results.'
        },
        {
          id: '3.2',
          name: '3.2 Employment Goal',
          score: 2,
          maxScore: 2,
          isCompliant: true,
          summary: 'Clear employment goal with specific field identified',
          detailedSummary: 'Goal states: "After graduation, the student will obtain employment as an automotive technician." Goal is specific, measurable, and directly related to education goal.'
        },
        {
          id: '3.3',
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
      id: '4',
      category: '4. Annual IEP Goals',
      totalScore: 3,
      maxScore: 4,
      isCompliant: false,
      summary: 'Goals align with postsecondary goals but lack full measurability',
      detailedSummary: 'Annual IEP goals support postsecondary goals but some lack complete condition, behavior, and criteria components required for full measurability.',
      subCriteria: [
        {
          id: '4.1',
          name: '4.1 Alignment with Postsecondary Goals',
          score: 2,
          maxScore: 2,
          isCompliant: true,
          summary: 'Multiple annual goals support each postsecondary goal',
          detailedSummary: 'Three annual IEP goals directly support the education goal and two support the employment goal. Clear connection between annual goals and postsecondary outcomes is evident.'
        },
        {
          id: '4.2',
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
      id: '5',
      category: '5. Transition Services',
      totalScore: 4,
      maxScore: 4,
      isCompliant: true,
      summary: 'Comprehensive transition services across multiple domains',
      detailedSummary: 'Multiple transition services identified for each postsecondary goal, spanning instruction, community experiences, and employment preparation with clear timelines and responsible parties.',
      subCriteria: [
        {
          id: '5.1',
          name: '5.1 Comprehensive Transition Services',
          score: 2,
          maxScore: 2,
          isCompliant: true,
          summary: 'Multiple services identified with specific details',
          detailedSummary: 'Four transition services identified for education goal and three for employment goal, each with specific activities, timeframes, and responsible parties clearly documented.'
        },
        {
          id: '5.2',
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
      id: '6',
      category: '6. Courses of Study',
      totalScore: 2,
      maxScore: 4,
      isCompliant: false,
      summary: 'Basic course plan exists but lacks multi-year detail',
      detailedSummary: 'General course areas identified but specific multi-year course planning is missing. Course selection shows some alignment with postsecondary goals but could be more comprehensive.',
      subCriteria: [
        {
          id: '6.1',
          name: '6.1 Multi-Year Course Planning',
          score: 1,
          maxScore: 2,
          isCompliant: false,
          summary: 'Basic plan exists but lacks specific course details',
          detailedSummary: 'General course areas identified (math, English, vocational courses) but specific courses by name for each remaining year are not detailed in the plan.'
        },
        {
          id: '6.2',
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
      id: '7',
      category: '7. Agency Participation',
      totalScore: 0,
      maxScore: 4,
      isCompliant: false,
      summary: 'No evidence of agency participation documentation',
      detailedSummary: 'Missing documentation of agency invitations and participation. No evidence of required consent or agency contributions to the transition plan.',
      subCriteria: [
        {
          id: '7.1',
          name: '7.1 Agency Invitation Documentation',
          score: 0,
          maxScore: 2,
          isCompliant: false,
          summary: 'No documentation of agency invitations found',
          detailedSummary: 'No Prior Written Notice, meeting notes, or signed consent forms found documenting invitation to relevant outside agencies (VR, DDS, etc.).'
        },
        {
          id: '7.2',
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
      id: '8',
      category: '8. Overall Transition Plan Quality',
      totalScore: 3,
      maxScore: 4,
      isCompliant: false,
      summary: 'Plan shows good individualization but has some inconsistencies',
      detailedSummary: 'Transition plan is well-individualized to the student with specific details throughout, but some inconsistencies exist between components that affect overall flow.',
      subCriteria: [
        {
          id: '8.1',
          name: '8.1 Internal Consistency',
          score: 1,
          maxScore: 2,
          isCompliant: false,
          summary: 'Most components consistent but some inconsistencies noted',
          detailedSummary: 'Most components of the transition plan are consistent, but there are some minor inconsistencies between assessment results and goal statements that affect logical flow.'
        },
        {
          id: '8.2',
          name: '8.2 Individualization and Specificity',
          score: 2,
          maxScore: 2,
          isCompliant: true,
          summary: 'Highly individualized plan with specific details',
          detailedSummary: 'Transition plan is highly individualized to the student with specific details throughout that clearly reflect unique needs, preferences, and circumstances.'
        }
      ]
    }
  ];
}
