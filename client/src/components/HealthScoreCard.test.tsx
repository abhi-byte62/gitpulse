import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HealthScoreCard } from './HealthScoreCard';

describe('HealthScoreCard component', () => {
  it('renders health score, letter grade, and factor categories correctly', () => {
    const mockHealth = {
      score: 88,
      grade: 'A' as const,
      activityScore: 25,
      documentationScore: 22,
      stabilityScore: 23,
      communityScore: 18,
      factors: {
        positive: ['High freshness', 'Open source license'],
        improvements: ['Expand repository description']
      }
    };

    render(<HealthScoreCard health={mockHealth} />);

    expect(screen.getByText('88')).toBeInTheDocument();
    expect(screen.getByText(/Grade A/i)).toBeInTheDocument();
    expect(screen.getByText('Activity')).toBeInTheDocument();
    expect(screen.getByText('Documentation')).toBeInTheDocument();
    expect(screen.getByText('High freshness')).toBeInTheDocument();
    expect(screen.getByText('Expand repository description')).toBeInTheDocument();
  });
});
