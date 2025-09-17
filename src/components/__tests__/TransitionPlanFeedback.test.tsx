import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TransitionPlanFeedback from '../TransitionPlanFeedback';
import { 
  TransitionPlanHeader, 
  TransitionPlanSummary, 
  TransitionPlanDetailedFeedback 
} from '@/types';

describe('TransitionPlanFeedback', () => {
  const mockHeader: TransitionPlanHeader = {
    filename: 'test-document.pdf',
    studentName: 'J.S.',
    submissionDate: '2024-01-15'
  };

  const mockSummary: TransitionPlanSummary = {
    overallScore: 23,
    maxScore: 36,
    overallCompliance: 'Non-Compliant',
    sections: [
      {
        id: '1',
        name: '1. Student Participation and Preferences',
        score: 3,
        maxScore: 6,
        isCompliant: false,
        subCriteria: [
          {
            id: '1.1',
            name: '1.1 Evidence of Student Invitation to IEP Meeting',
            score: 2,
            maxScore: 2,
            isCompliant: true,
            comments: 'Student was clearly invited and attended the meeting'
          }
        ]
      },
      {
        id: '2',
        name: '2. Age-Appropriate Transition Assessments',
        score: 4,
        maxScore: 4,
        isCompliant: true,
        subCriteria: []
      }
    ]
  };

  const mockDetailedFeedback: TransitionPlanDetailedFeedback = {
    overview: 'This transition plan shows strengths in some areas but needs improvement in others.',
    strengths: ['Good student participation', 'Comprehensive assessments'],
    weaknesses: ['Missing agency participation', 'Incomplete course planning'],
    connectionToLearningObjectives: ['Demonstrates IDEA compliance', 'Shows transition planning understanding'],
    areasForImprovement: ['Add agency participation', 'Develop detailed course plan'],
    finalScore: {
      total: 23,
      max: 36
    }
  };

  const mockOnEditSummary = jest.fn();
  const mockOnCreateTransitionPlan = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders header information', () => {
    render(
      <TransitionPlanFeedback
        header={mockHeader}
        summary={mockSummary}
        detailedFeedback={mockDetailedFeedback}
        onEditSummary={mockOnEditSummary}
        onCreateTransitionPlan={mockOnCreateTransitionPlan}
      />
    );

    expect(screen.getByText('Transition Plan Feedback')).toBeInTheDocument();
    expect(screen.getByText('test-document.pdf')).toBeInTheDocument();
    expect(screen.getByText('J.S.')).toBeInTheDocument();
    expect(screen.getByText('2024-01-15')).toBeInTheDocument();
  });

  it('displays summary table with scores', () => {
    render(
      <TransitionPlanFeedback
        header={mockHeader}
        summary={mockSummary}
        detailedFeedback={mockDetailedFeedback}
        onEditSummary={mockOnEditSummary}
        onCreateTransitionPlan={mockOnCreateTransitionPlan}
      />
    );

    expect(screen.getByText('Summary')).toBeInTheDocument();
    expect(screen.getByText('1. Student Participation and Preferences')).toBeInTheDocument();
    expect(screen.getByText('2. Age-Appropriate Transition Assessments')).toBeInTheDocument();
    expect(screen.getByText('3/6')).toBeInTheDocument();
    expect(screen.getByText('4/4')).toBeInTheDocument();
    expect(screen.getByText('23/36')).toBeInTheDocument();
  });

  it('shows compliance badges correctly', () => {
    render(
      <TransitionPlanFeedback
        header={mockHeader}
        summary={mockSummary}
        detailedFeedback={mockDetailedFeedback}
        onEditSummary={mockOnEditSummary}
        onCreateTransitionPlan={mockOnCreateTransitionPlan}
      />
    );

    const complianceBadges = screen.getAllByText(/Yes|No/);
    expect(complianceBadges.length).toBeGreaterThan(0);
  });

  it('expands sections when chevron is clicked', () => {
    render(
      <TransitionPlanFeedback
        header={mockHeader}
        summary={mockSummary}
        detailedFeedback={mockDetailedFeedback}
        onEditSummary={mockOnEditSummary}
        onCreateTransitionPlan={mockOnCreateTransitionPlan}
      />
    );

    // Find and click the expand button for the first section
    const expandButtons = screen.getAllByRole('button');
    const chevronButton = expandButtons.find(button => 
      button.querySelector('svg') && 
      button.className.includes('text-blue-600')
    );
    
    if (chevronButton) {
      fireEvent.click(chevronButton);
      expect(screen.getByText('1.1 Evidence of Student Invitation to IEP Meeting')).toBeInTheDocument();
    }
  });

  it('calls onCreateTransitionPlan when button is clicked', () => {
    render(
      <TransitionPlanFeedback
        header={mockHeader}
        summary={mockSummary}
        detailedFeedback={mockDetailedFeedback}
        onEditSummary={mockOnEditSummary}
        onCreateTransitionPlan={mockOnCreateTransitionPlan}
      />
    );

    const createButton = screen.getByText('Create Transition Plan');
    fireEvent.click(createButton);

    expect(mockOnCreateTransitionPlan).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(
      <TransitionPlanFeedback
        isLoading={true}
        onEditSummary={mockOnEditSummary}
        onCreateTransitionPlan={mockOnCreateTransitionPlan}
      />
    );

    expect(screen.getByText('Processing document...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    render(
      <TransitionPlanFeedback
        error="Failed to process document"
        onEditSummary={mockOnEditSummary}
        onCreateTransitionPlan={mockOnCreateTransitionPlan}
      />
    );

    expect(screen.getByText('Error processing document:')).toBeInTheDocument();
    expect(screen.getByText('Failed to process document')).toBeInTheDocument();
  });

  it('shows default values when no data provided', () => {
    render(
      <TransitionPlanFeedback
        onEditSummary={mockOnEditSummary}
        onCreateTransitionPlan={mockOnCreateTransitionPlan}
      />
    );

    expect(screen.getByText('No file uploaded')).toBeInTheDocument();
    expect(screen.getByText('Student Name Not Available')).toBeInTheDocument();
    expect(screen.getByText('x/36')).toBeInTheDocument();
    expect(screen.getAllByText('x/6')).toHaveLength(2); // Two sections have max score 6
    expect(screen.getAllByText('x/4')).toHaveLength(6); // Six sections have max score 4
  });

  it('displays detailed feedback sections', () => {
    render(
      <TransitionPlanFeedback
        header={mockHeader}
        summary={mockSummary}
        detailedFeedback={mockDetailedFeedback}
        onEditSummary={mockOnEditSummary}
        onCreateTransitionPlan={mockOnCreateTransitionPlan}
      />
    );

    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('This transition plan shows strengths in some areas but needs improvement in others.')).toBeInTheDocument();
    expect(screen.getByText('Strengths')).toBeInTheDocument();
    expect(screen.getByText('Good student participation')).toBeInTheDocument();
    expect(screen.getByText('Weaknesses')).toBeInTheDocument();
    expect(screen.getByText('Missing agency participation')).toBeInTheDocument();
  });
});