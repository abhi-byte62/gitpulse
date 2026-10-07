export interface DeveloperProfile {
  username: string;
  name: string | null;
  avatarUrl: string;
  bio: string | null;
  company: string | null;
  location: string | null;
  blog: string | null;
  twitterUsername: string | null;
  followers: number;
  following: number;
  publicRepositories: number;
  publicGists: number;
  createdAt: string;
  profileUrl: string;
}

export interface DeveloperStats {
  repositories: number;
  totalPublicRepositories: number;
  stars: number;
  forks: number;
  openIssues: number;
  licenseCount: number;
  archivedCount: number;
}

export interface LanguageStats {
  name: string;
  bytes: number;
  percentage: number;
  color: string;
}

export interface HealthScoreBreakdown {
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  activityScore: number;
  documentationScore: number;
  stabilityScore: number;
  communityScore: number;
  factors: {
    positive: string[];
    improvements: string[];
  };
}

export interface RepositorySummary {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  description: string | null;
  url: string;
  homepage: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  language: string | null;
  topics: string[];
  isFork: boolean;
  isArchived: boolean;
  isTemplate: boolean;
  defaultBranch: string;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  size: number;
  license: string | null;
  health: HealthScoreBreakdown;
}

export interface ActivityItem {
  id: string;
  type: string;
  repo: string;
  createdAt: string;
  action: string;
  details?: string;
}

export interface DeveloperInsights {
  healthScore: number;
  healthGrade: 'A+' | 'A' | 'B' | 'C' | 'D';
  mostStarredRepository: RepositorySummary | null;
  mostForkedRepository: RepositorySummary | null;
  mostRecentlyUpdatedRepository: RepositorySummary | null;
  primaryLanguage: string | null;
  activeLanguagesCount: number;
  averageStarsPerRepo: number;
  maintenanceRate: number;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetAt: string;
  used: number;
}

export interface NormalizedDeveloperResponse {
  profile: DeveloperProfile;
  stats: DeveloperStats;
  languages: LanguageStats[];
  repositories: RepositorySummary[];
  topRepositories: RepositorySummary[];
  recentlyUpdated: RepositorySummary[];
  activity: ActivityItem[];
  insights: DeveloperInsights;
  rateLimitInfo: RateLimitInfo;
}

export interface RepositoryDetailResponse {
  repository: RepositorySummary;
  languages: LanguageStats[];
  owner: {
    login: string;
    avatarUrl: string;
    htmlUrl: string;
  };
  metrics: {
    hasReadme: boolean;
    hasLicense: boolean;
    hasTopics: boolean;
    hasHomepage: boolean;
    isFresh: boolean;
    forkRatio: number;
    daysSinceLastPush: number;
  };
  rateLimitInfo: RateLimitInfo;
}

export interface ApiErrorResponse {
  error: string;
  message: string;
  statusCode: number;
  resetTime?: string;
}
