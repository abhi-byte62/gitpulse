import { HealthScoreBreakdown, RepositorySummary } from '../types/index.js';

interface RawRepoInput {
  name: string;
  description: string | null;
  homepage: string | null;
  stargazers_count?: number;
  forks_count?: number;
  open_issues_count?: number;
  watchers_count?: number;
  language: string | null;
  topics?: string[];
  fork: boolean;
  archived: boolean;
  pushed_at?: string | null;
  created_at?: string | null;
  size?: number;
  license?: { name: string } | string | null;
}

/**
 * Calculates the RepoPulse Health Score (0-100) for a given repository.
 *
 * Methodology Breakdown:
 * 1. Activity & Freshness (Max 30 pts):
 *    Measures how recently code changes were committed or pushed.
 * 2. Documentation & Discoverability (Max 25 pts):
 *    Evaluates project context, description clarity, licensing, and topic tagging.
 * 3. Stability & Project Hygiene (Max 25 pts):
 *    Checks non-empty codebase, primary language detection, non-archived status.
 * 4. Community & Engagement (Max 20 pts):
 *    Measures real community adoption via stars, forks, and watchers without dominating the score.
 */
export function calculateRepositoryHealthScore(repo: RawRepoInput): HealthScoreBreakdown {
  let activityScore = 0;
  let documentationScore = 0;
  let stabilityScore = 0;
  let communityScore = 0;

  const positive: string[] = [];
  const improvements: string[] = [];

  const now = Date.now();
  const pushedAt = repo.pushed_at ? new Date(repo.pushed_at).getTime() : 0;
  const daysSincePush = pushedAt ? Math.max(0, Math.floor((now - pushedAt) / (1000 * 60 * 60 * 24))) : 999;

  // 1. Activity & Freshness (Max 30 pts)
  if (daysSincePush <= 14) {
    activityScore = 30;
    positive.push("High freshness: Pushed within the last 14 days");
  } else if (daysSincePush <= 30) {
    activityScore = 25;
    positive.push("Active: Pushed within the last 30 days");
  } else if (daysSincePush <= 90) {
    activityScore = 18;
    positive.push("Maintained: Pushed within the last quarter");
  } else if (daysSincePush <= 180) {
    activityScore = 10;
    improvements.push("Moderate recency: No push in over 3 months");
  } else if (daysSincePush <= 365) {
    activityScore = 5;
    improvements.push("Low activity: No push in over 6 months");
  } else {
    activityScore = 0;
    improvements.push("Stale repository: Inactive for over a year");
  }

  // 2. Documentation & Discoverability (Max 25 pts)
  if (repo.description && repo.description.trim().length >= 15) {
    documentationScore += 10;
    positive.push("Comprehensive repository description");
  } else if (repo.description && repo.description.trim().length > 0) {
    documentationScore += 5;
    improvements.push("Short description: consider expanding details");
  } else {
    improvements.push("Missing repository description");
  }

  const hasLicense = Boolean(repo.license);
  if (hasLicense) {
    documentationScore += 8;
    positive.push("Open source license declared");
  } else {
    improvements.push("No license found (consider adding MIT, Apache-2.0, etc.)");
  }

  const topicsCount = (repo.topics && Array.isArray(repo.topics)) ? repo.topics.length : 0;
  if (topicsCount >= 2) {
    documentationScore += 4;
    positive.push(`Discoverability: Tagged with ${topicsCount} topics`);
  } else if (topicsCount === 1) {
    documentationScore += 2;
  } else {
    improvements.push("No GitHub topics/tags configured");
  }

  if (repo.homepage && repo.homepage.trim().length > 0) {
    documentationScore += 3;
    positive.push("Project website or documentation URL provided");
  }

  // 3. Stability & Hygiene (Max 25 pts)
  if (repo.language) {
    stabilityScore += 8;
    positive.push(`Primary language detected (${repo.language})`);
  } else {
    improvements.push("No primary programming language detected");
  }

  if ((repo.size ?? 0) > 0) {
    stabilityScore += 7;
  } else {
    improvements.push("Repository appears empty (0 KB)");
  }

  if (!repo.archived) {
    stabilityScore += 10;
  } else {
    improvements.push("Repository is archived (read-only)");
  }

  // 4. Community & Engagement (Max 20 pts)
  const stars = repo.stargazers_count ?? 0;
  const forks = repo.forks_count ?? 0;
  const watchers = repo.watchers_count ?? 0;

  if (stars >= 100) {
    communityScore += 10;
    positive.push(`Strong community interest (${stars} stars)`);
  } else if (stars >= 20) {
    communityScore += 7;
    positive.push(`Growing community (${stars} stars)`);
  } else if (stars >= 5) {
    communityScore += 4;
  } else if (stars >= 1) {
    communityScore += 2;
  }

  if (forks >= 10) {
    communityScore += 6;
    positive.push(`Active downstream ecosystem (${forks} forks)`);
  } else if (forks >= 1) {
    communityScore += 3;
  }

  if (watchers > 0 || (repo.open_issues_count ?? 0) > 0) {
    communityScore += 4;
  }

  // Calculate total bounded 0-100
  const rawScore = activityScore + documentationScore + stabilityScore + communityScore;
  const finalScore = Math.max(0, Math.min(100, Math.round(rawScore)));

  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' = 'D';
  if (finalScore >= 90) grade = 'A+';
  else if (finalScore >= 80) grade = 'A';
  else if (finalScore >= 65) grade = 'B';
  else if (finalScore >= 50) grade = 'C';
  else grade = 'D';

  return {
    score: finalScore,
    grade,
    activityScore,
    documentationScore,
    stabilityScore,
    communityScore,
    factors: {
      positive,
      improvements
    }
  };
}

/**
 * Computes the aggregate developer health score based on analyzed repositories.
 */
export function calculateDeveloperAggregateHealth(repositories: RepositorySummary[]): { score: number; grade: 'A+' | 'A' | 'B' | 'C' | 'D' } {
  if (repositories.length === 0) {
    return { score: 0, grade: 'D' };
  }

  const nonForkRepos = repositories.filter(r => !r.isFork);
  const targetRepos = nonForkRepos.length > 0 ? nonForkRepos : repositories;

  const total = targetRepos.reduce((acc, repo) => acc + repo.health.score, 0);
  const score = Math.round(total / targetRepos.length);

  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' = 'D';
  if (score >= 90) grade = 'A+';
  else if (score >= 80) grade = 'A';
  else if (score >= 65) grade = 'B';
  else if (score >= 50) grade = 'C';
  else grade = 'D';

  return { score, grade };
}
