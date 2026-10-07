import { describe, it, expect } from 'vitest';
import { calculateRepositoryHealthScore, calculateDeveloperAggregateHealth } from './healthScore.js';

describe('calculateRepositoryHealthScore', () => {
  it('computes high score for a healthy, actively maintained repository with docs and community', () => {
    const health = calculateRepositoryHealthScore({
      name: 'awesome-tool',
      description: 'A comprehensive production-ready utility for developers',
      homepage: 'https://awesome-tool.dev',
      stargazers_count: 350,
      forks_count: 45,
      open_issues_count: 5,
      watchers_count: 20,
      language: 'TypeScript',
      topics: ['typescript', 'developer-tools', 'cli'],
      fork: false,
      archived: false,
      pushed_at: new Date().toISOString(), // fresh today
      size: 1540,
      license: { name: 'MIT License' }
    });

    expect(health.score).toBeGreaterThanOrEqual(90);
    expect(health.grade).toBe('A+');
    expect(health.activityScore).toBe(30);
    expect(health.stabilityScore).toBe(25);
    expect(health.factors.positive.length).toBeGreaterThan(0);
  });

  it('computes low score for stale, archived repo without description or license', () => {
    const health = calculateRepositoryHealthScore({
      name: 'old-dormant-repo',
      description: '',
      homepage: null,
      stargazers_count: 0,
      forks_count: 0,
      open_issues_count: 0,
      watchers_count: 0,
      language: null,
      topics: [],
      fork: false,
      archived: true,
      pushed_at: '2020-01-01T00:00:00Z',
      size: 0,
      license: null
    });

    expect(health.score).toBeLessThan(40);
    expect(health.grade).toBe('D');
    expect(health.activityScore).toBe(0);
    expect(health.factors.improvements.length).toBeGreaterThan(0);
  });
});

describe('calculateDeveloperAggregateHealth', () => {
  it('returns D with 0 score for empty repository list', () => {
    const aggregate = calculateDeveloperAggregateHealth([]);
    expect(aggregate.score).toBe(0);
    expect(aggregate.grade).toBe('D');
  });
});
