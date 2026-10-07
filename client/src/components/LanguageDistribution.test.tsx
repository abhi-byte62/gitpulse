import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LanguageDistribution } from './LanguageDistribution';

describe('LanguageDistribution component', () => {
  it('renders language list with percentages and total count', () => {
    const mockLanguages = [
      { name: 'TypeScript', bytes: 60000, percentage: 60, color: '#3178c6' },
      { name: 'JavaScript', bytes: 40000, percentage: 40, color: '#f1e05a' }
    ];

    render(<LanguageDistribution languages={mockLanguages} />);

    expect(screen.getByText('Language Distribution')).toBeInTheDocument();
    expect(screen.getByText('2 Languages')).toBeInTheDocument();
    expect(screen.getByText('TypeScript')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
  });

  it('handles empty language list gracefully', () => {
    render(<LanguageDistribution languages={[]} />);
    expect(screen.getByText(/No language statistics detected/i)).toBeInTheDocument();
  });
});
