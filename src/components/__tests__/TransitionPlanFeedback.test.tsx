import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TransitionPlanFeedback from '../TransitionPlanFeedback';
import { generateSampleRubricData } from '@/utils/sampleData';

describe('TransitionPlanFeedback', () => {
  const mockRubricScores = generateSampleRubricData();
  const mockOnEditSummary = jest.fn();
  const mockOnCreateTransitionPlan = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders overall compliance status', () => {
    render(
      <TransitionPlanFeedback
        overallCompliance="Non-compliant"
        rubricScores={mockRubricScores}
        onEditSummary={mockOnEditSummary}
        onCreateTransitionPlan={mockOnCreateTransitionPlan}
      />
    );

    expect(screen.getByText('Transition Plan Compliance')).toBeInTheDocument();
    expect(screen.getByText('Overall Status:')).toBeInTheDocument();
    expect(screen.getByText('Non-compliant', { selector: 'span.font-semibold' })).toBeInTheDocument();
  });

  it('displays scoring criteria', () => {
    render(
      <TransitionPlanFeedback
        overallCompliance="Non-compliant"
        rubricScores={mockRubricScores}
        onEditSummary={mockOnEditSummary}
        onCreateTransitionPlan={mockOnCreateTransitionPlan}
      />
    );

    expect(screen.getByText('Scoring Criteria')).toBeInTheDocument();
    expect(screen.getByText('1. Student Participation and Preferences')).toBeInTheDocument();
    expect(screen.getByText('2. Age-Appropriate Transition Assessments')).toBeInTheDocument();
  });

  it('sorts non-compliant criteria first', () => {
    render(
      <TransitionPlanFeedback
        overallCompliance="Non-compliant"
        rubricScores={mockRubricScores}
        onEditSummary={mockOnEditSummary}
        onCreateTransitionPlan={mockOnCreateTransitionPlan}
      />
    );

    const criteriaElements = screen.getAllByText(/^\d+\./);
    // First criteria should be non-compliant (Student Participation)
    expect(criteriaElements[0]).toHaveTextContent('1. Student Participation and Preferences');
  });

  it('expands criteria when clicked', () => {
    render(
      <TransitionPlanFeedback
        overallCompliance="Non-compliant"
        rubricScores={mockRubricScores}
        onEditSummary={mockOnEditSummary}
        onCreateTransitionPlan={mockOnCreateTransitionPlan}
      />
    );

    const firstCriteria = screen.getByText('1. Student Participation and Preferences');
    fireEvent.click(firstCriteria);

    expect(screen.getByText('Detailed Summary')).toBeInTheDocument();
    expect(screen.getByText('Sub-criteria Details')).toBeInTheDocument();
  });

  it('calls onCreateTransitionPlan when button is clicked', () => {
    render(
      <TransitionPlanFeedback
        overallCompliance="Non-compliant"
        rubricScores={mockRubricScores}
        onEditSummary={mockOnEditSummary}
        onCreateTransitionPlan={mockOnCreateTransitionPlan}
      />
    );

    const createButton = screen.getByText('Create Transition Plan');
    fireEvent.click(createButton);

    expect(mockOnCreateTransitionPlan).toHaveBeenCalledTimes(1);
  });

  it('shows edit functionality for sub-criteria', () => {
    render(
      <TransitionPlanFeedback
        overallCompliance="Non-compliant"
        rubricScores={mockRubricScores}
        onEditSummary={mockOnEditSummary}
        onCreateTransitionPlan={mockOnCreateTransitionPlan}
      />
    );

    // Expand first criteria
    const firstCriteria = screen.getByText('1. Student Participation and Preferences');
    fireEvent.click(firstCriteria);

    // Find edit button (should be present for sub-criteria)
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    expect(editButtons.length).toBeGreaterThan(0);
  });
});
