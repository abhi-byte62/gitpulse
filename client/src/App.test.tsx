import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';

vi.mock('./services/api', () => ({
  api: {
    getRateLimit: vi.fn().mockResolvedValue({
      limit: 60,
      remaining: 58,
      used: 2,
      resetAt: new Date(Date.now() + 3600000).toISOString()
    }),
    getDeveloper: vi.fn(),
    getRepository: vi.fn()
  }
}));

describe('App component', () => {
  it('renders landing page with headline and search bar', () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );

    expect(screen.getByRole('heading', { level: 1, name: /GitHub repository intelligence for developers/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter a GitHub username/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Analyze/i })).toBeInTheDocument();
    expect(screen.getByText('RepoPulse Health Score')).toBeInTheDocument();
  });
});
