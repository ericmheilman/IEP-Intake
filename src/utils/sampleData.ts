import { RubricScore, IEPFeedbackData } from '@/types';

export const generateSampleRubricData = (): RubricScore[] => {
  return [
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
  ];
};

export const generateSampleFeedbackData = (): IEPFeedbackData => {
  const rubricScores = generateSampleRubricData();
  const totalScore = rubricScores.reduce((sum, score) => sum + score.totalScore, 0);
  const maxScore = rubricScores.reduce((sum, score) => sum + score.maxScore, 0);
  const isCompliant = rubricScores.every(score => score.isCompliant);

  return {
    feedbackSummary: `This IEP transition plan received a score of ${totalScore}/${maxScore} (${Math.round((totalScore/maxScore) * 100)}%). The plan shows strengths in student participation, transition assessments, and postsecondary goal development, but has significant gaps in agency participation and course planning that need to be addressed for full compliance.`,
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
    recommendation: isCompliant ? 'Approve' : 'Revise',
    overallCompliance: isCompliant ? 'Compliant' : 'Non-compliant',
    rubricScores,
    nextSteps: [
      'Address age of majority notification requirements',
      'Add independent living goal based on assessment results',
      'Invite and document agency participation',
      'Develop detailed multi-year course plan',
      'Ensure all annual goals have complete measurability criteria'
    ],
    estimatedRevisionTime: '2-3 hours',
    confidence: 0.85
  };
};
