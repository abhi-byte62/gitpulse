import { Octokit } from 'octokit';
import {
  ActivityItem,
  DeveloperInsights,
  DeveloperProfile,
  DeveloperStats,
  NormalizedDeveloperResponse,
  RateLimitInfo,
  RepositoryDetailResponse,
  RepositorySummary
} from '../types/index.js';
import { calculateDeveloperAggregateHealth, calculateRepositoryHealthScore } from '../analytics/healthScore.js';
import { aggregateLanguages, normalizeSingleRepoLanguages } from '../analytics/languageAnalytics.js';
import { getCached, setCached } from '../utils/cache.js';

export class GitHubApiError extends Error {
  public statusCode: number;
  public details?: unknown;
  public resetTime?: string;

  constructor(message: string, statusCode = 500, details?: unknown, resetTime?: string) {
    super(message);
    this.name = 'GitHubApiError';
    this.statusCode = statusCode;
    this.details = details;
    this.resetTime = resetTime;
  }
}

export class GitHubService {
  /**
   * Retrieves an Octokit instance with the latest GITHUB_TOKEN and required User-Agent.
   */
  private getOctokit(): Octokit {
    const token = process.env.GITHUB_TOKEN?.trim();
    const userAgent = 'RepoPulse-App/1.0.0 (https://github.com/abhi-byte62/gitpulse)';

    if (token) {
      return new Octokit({
        auth: token,
        userAgent
      });
    }

    return new Octokit({
      userAgent
    });
  }

  /**
   * Fetches current GitHub API Rate Limit status.
   */
  async getRateLimit(): Promise<RateLimitInfo> {
    try {
      const octokit = this.getOctokit();
      const response = await octokit.rest.rateLimit.get();
      const core = response.data.resources.core;
      return {
        limit: core.limit,
        remaining: core.remaining,
        used: core.used,
        resetAt: new Date(core.reset * 1000).toISOString()
      };
    } catch (err: any) {
      console.warn('[RepoPulse RateLimit Check Warning]:', err?.message);
      return {
        limit: 60,
        remaining: 60,
        used: 0,
        resetAt: new Date(Date.now() + 3600000).toISOString()
      };
    }
  }

  /**
   * Fetches and analyzes a full developer profile and repositories.
   */
  async getDeveloperAnalytics(username: string): Promise<NormalizedDeveloperResponse> {
    const cleanUsername = username.trim().replace(/^@/, '');
    const cacheKey = `developer:${cleanUsername.toLowerCase()}`;
    const cached = getCached<NormalizedDeveloperResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    const octokit = this.getOctokit();

    try {
      // 1. Fetch user profile
      const userResponse = await octokit.rest.users.getByUsername({
        username: cleanUsername
      }).catch((err: any) => {
        if (err.status === 404) {
          throw new GitHubApiError(`GitHub user "${cleanUsername}" not found.`, 404);
        }
        if (err.status === 403 || err.status === 429) {
          const resetHeader = err.response?.headers?.['x-ratelimit-reset'];
          const resetDate = resetHeader ? new Date(parseInt(resetHeader, 10) * 1000).toISOString() : undefined;
          throw new GitHubApiError('GitHub API rate limit exceeded. Please configure a GITHUB_TOKEN on Vercel.', 429, null, resetDate);
        }
        if (err.status === 401) {
          throw new GitHubApiError('GitHub API authentication failed. Check GITHUB_TOKEN environment variable on Vercel.', 401);
        }
        throw new GitHubApiError(err.message || 'Failed to fetch GitHub profile', err.status || 500);
      });

      const rawUser = userResponse.data;

      // 2. Fetch user repositories (up to 100 most recently updated)
      const reposResponse = await octokit.rest.repos.listForUser({
        username: cleanUsername,
        sort: 'updated',
        per_page: 100,
        type: 'all'
      }).catch((err: any) => {
        if (err.status === 403 || err.status === 429) {
          throw new GitHubApiError('GitHub API rate limit reached while fetching repositories.', 429);
        }
        throw new GitHubApiError(err.message || 'Failed to fetch repositories', err.status || 500);
      });

      const rawRepos = reposResponse.data;

      // 3. Fetch public events/activity for recent timeline
      let rawEvents: any[] = [];
      try {
        const eventsResponse = await octokit.rest.activity.listPublicEventsForUser({
          username: cleanUsername,
          per_page: 30
        });
        rawEvents = eventsResponse.data;
      } catch {
        // Events are optional/non-critical; continue if empty or restricted
        rawEvents = [];
      }

      // 4. Rate-limit conscious language aggregation:
      // Fetch detailed language stats for top 8 non-fork repositories by stars/recency
      const candidateReposForLanguages = rawRepos
        .filter(r => !r.fork)
        .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
        .slice(0, 8);

      const languageMaps: Record<string, number>[] = [];

      // Fetch detailed language bytes in parallel for top repos
      const languagePromises = candidateReposForLanguages.map(repo =>
        octokit.rest.repos.listLanguages({
          owner: repo.owner.login,
          repo: repo.name
        }).then(res => res.data as Record<string, number>).catch(() => ({}))
      );

      const languageResults = await Promise.all(languagePromises);
      languageMaps.push(...languageResults);

      // Aggregate all languages
      const languages = aggregateLanguages(
        languageMaps,
        rawRepos.map(r => ({ language: r.language ?? null, size: r.size }))
      );

      // 5. Transform repositories into normalized summaries with Health Scores
      const repositories: RepositorySummary[] = rawRepos.map(r => {
        const health = calculateRepositoryHealthScore({
          name: r.name,
          description: r.description ?? null,
          homepage: r.homepage ?? null,
          stargazers_count: r.stargazers_count ?? 0,
          forks_count: r.forks_count ?? 0,
          open_issues_count: r.open_issues_count ?? 0,
          watchers_count: r.watchers_count ?? 0,
          language: r.language ?? null,
          topics: r.topics ?? [],
          fork: r.fork ?? false,
          archived: r.archived ?? false,
          pushed_at: r.pushed_at ?? null,
          created_at: r.created_at ?? null,
          size: r.size ?? 0,
          license: r.license?.name ? { name: r.license.name } : null
        });

        return {
          id: r.id,
          name: r.name,
          fullName: r.full_name,
          owner: r.owner.login,
          description: r.description ?? null,
          url: r.html_url,
          homepage: r.homepage || null,
          stars: r.stargazers_count || 0,
          forks: r.forks_count || 0,
          openIssues: r.open_issues_count || 0,
          language: r.language || null,
          topics: r.topics || [],
          isFork: r.fork ?? false,
          isArchived: r.archived ?? false,
          isTemplate: Boolean(r.is_template),
          defaultBranch: r.default_branch || 'main',
          createdAt: r.created_at || new Date().toISOString(),
          updatedAt: r.updated_at || new Date().toISOString(),
          pushedAt: r.pushed_at || r.updated_at || new Date().toISOString(),
          size: r.size || 0,
          license: r.license?.name || null,
          health
        };
      });

      // 6. Compute top & recently updated repositories
      const topRepositories = [...repositories]
        .sort((a, b) => b.stars - a.stars || b.health.score - a.health.score)
        .slice(0, 6);

      const recentlyUpdated = [...repositories]
        .sort((a, b) => new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime())
        .slice(0, 6);

      // 7. Aggregate developer stats
      const totalStars = repositories.reduce((sum, r) => sum + r.stars, 0);
      const totalForks = repositories.reduce((sum, r) => sum + r.forks, 0);
      const openIssues = repositories.reduce((sum, r) => sum + r.openIssues, 0);
      const licenseCount = repositories.filter(r => r.license !== null).length;
      const archivedCount = repositories.filter(r => r.isArchived).length;

      const stats: DeveloperStats = {
        repositories: repositories.length,
        totalPublicRepositories: rawUser.public_repos,
        stars: totalStars,
        forks: totalForks,
        openIssues,
        licenseCount,
        archivedCount
      };

      // 8. Transform activities
      const activity: ActivityItem[] = rawEvents.slice(0, 15).map(e => {
        let action = 'Contributed to';
        let details = '';

        if (e.type === 'PushEvent') {
          const commitsCount = e.payload?.commits?.length || 1;
          action = `Pushed ${commitsCount} commit${commitsCount > 1 ? 's' : ''} to`;
          if (e.payload?.commits?.[0]?.message) {
            details = e.payload.commits[0].message.split('\n')[0];
          }
        } else if (e.type === 'CreateEvent') {
          action = `Created ${e.payload?.ref_type || 'repository'}`;
          details = e.payload?.ref || '';
        } else if (e.type === 'WatchEvent') {
          action = 'Starred repository';
        } else if (e.type === 'ForkEvent') {
          action = 'Forked repository';
        } else if (e.type === 'IssuesEvent') {
          action = `${e.payload?.action || 'Opened'} issue on`;
          details = e.payload?.issue?.title || '';
        } else if (e.type === 'PullRequestEvent') {
          action = `${e.payload?.action || 'Opened'} pull request on`;
          details = e.payload?.pull_request?.title || '';
        } else if (e.type === 'IssueCommentEvent') {
          action = 'Commented on issue in';
          details = e.payload?.issue?.title || '';
        }

        return {
          id: e.id,
          type: e.type || 'Event',
          repo: e.repo?.name || '',
          createdAt: e.created_at || new Date().toISOString(),
          action,
          details: details ? details.slice(0, 120) : undefined
        };
      });

      // 9. Developer Insights
      const aggregateHealth = calculateDeveloperAggregateHealth(repositories);

      const mostStarred = [...repositories].sort((a, b) => b.stars - a.stars)[0] || null;
      const mostForked = [...repositories].sort((a, b) => b.forks - a.forks)[0] || null;
      const mostRecentlyUpdated = [...repositories].sort((a, b) => new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime())[0] || null;

      const now = Date.now();
      const sixMonthsAgo = now - 180 * 24 * 60 * 60 * 1000;
      const recentlyActiveCount = repositories.filter(r => new Date(r.pushedAt).getTime() >= sixMonthsAgo).length;
      const maintenanceRate = repositories.length > 0 ? Math.round((recentlyActiveCount / repositories.length) * 100) : 0;

      const insights: DeveloperInsights = {
        healthScore: aggregateHealth.score,
        healthGrade: aggregateHealth.grade,
        mostStarredRepository: mostStarred && mostStarred.stars > 0 ? mostStarred : null,
        mostForkedRepository: mostForked && mostForked.forks > 0 ? mostForked : null,
        mostRecentlyUpdatedRepository: mostRecentlyUpdated,
        primaryLanguage: languages[0]?.name || null,
        activeLanguagesCount: languages.length,
        averageStarsPerRepo: repositories.length > 0 ? Number((totalStars / repositories.length).toFixed(1)) : 0,
        maintenanceRate
      };

      // 10. Rate limit status
      const rateLimitInfo = await this.getRateLimit();

      const profile: DeveloperProfile = {
        username: rawUser.login,
        name: rawUser.name || null,
        avatarUrl: rawUser.avatar_url,
        bio: rawUser.bio || null,
        company: rawUser.company || null,
        location: rawUser.location || null,
        blog: rawUser.blog || null,
        twitterUsername: rawUser.twitter_username || null,
        followers: rawUser.followers,
        following: rawUser.following,
        publicRepositories: rawUser.public_repos,
        publicGists: rawUser.public_gists,
        createdAt: rawUser.created_at,
        profileUrl: rawUser.html_url
      };

      const normalizedResponse: NormalizedDeveloperResponse = {
        profile,
        stats,
        languages,
        repositories,
        topRepositories,
        recentlyUpdated,
        activity,
        insights,
        rateLimitInfo
      };

      setCached(cacheKey, normalizedResponse);
      return normalizedResponse;
    } catch (error: any) {
      if (error instanceof GitHubApiError || error?.name === 'GitHubApiError') {
        throw error;
      }
      throw new GitHubApiError(error.message || 'Internal server error while fetching GitHub analytics', error?.status || 500);
    }
  }

  /**
   * Fetches detailed analytics for a single repository.
   */
  async getRepositoryDetails(owner: string, repo: string): Promise<RepositoryDetailResponse> {
    const cleanOwner = owner.trim();
    const cleanRepo = repo.trim();
    const cacheKey = `repo:${cleanOwner.toLowerCase()}/${cleanRepo.toLowerCase()}`;
    const cached = getCached<RepositoryDetailResponse>(cacheKey);
    if (cached) {
      return cached;
    }

    const octokit = this.getOctokit();

    try {
      const [repoResponse, languagesResponse] = await Promise.all([
        octokit.rest.repos.get({ owner: cleanOwner, repo: cleanRepo }).catch((err: any) => {
          if (err.status === 404) {
            throw new GitHubApiError(`Repository "${cleanOwner}/${cleanRepo}" was not found.`, 404);
          }
          if (err.status === 403 || err.status === 429) {
            throw new GitHubApiError('GitHub API rate limit exceeded.', 429);
          }
          if (err.status === 401) {
            throw new GitHubApiError('GitHub API authentication failed. Check GITHUB_TOKEN.', 401);
          }
          throw new GitHubApiError(err.message || 'Failed to fetch repository', err.status || 500);
        }),
        octokit.rest.repos.listLanguages({ owner: cleanOwner, repo: cleanRepo }).catch(() => ({ data: {} }))
      ]);

      const r = repoResponse.data;
      const languagesMap = languagesResponse.data as Record<string, number>;
      const languages = normalizeSingleRepoLanguages(languagesMap);

      const health = calculateRepositoryHealthScore({
        name: r.name,
        description: r.description ?? null,
        homepage: r.homepage ?? null,
        stargazers_count: r.stargazers_count ?? 0,
        forks_count: r.forks_count ?? 0,
        open_issues_count: r.open_issues_count ?? 0,
        watchers_count: r.watchers_count ?? 0,
        language: r.language ?? null,
        topics: r.topics ?? [],
        fork: r.fork ?? false,
        archived: r.archived ?? false,
        pushed_at: r.pushed_at ?? null,
        created_at: r.created_at ?? null,
        size: r.size ?? 0,
        license: r.license?.name ? { name: r.license.name } : null
      });

      const repository: RepositorySummary = {
        id: r.id,
        name: r.name,
        fullName: r.full_name,
        owner: r.owner.login,
        description: r.description ?? null,
        url: r.html_url,
        homepage: r.homepage || null,
        stars: r.stargazers_count || 0,
        forks: r.forks_count || 0,
        openIssues: r.open_issues_count || 0,
        language: r.language || null,
        topics: r.topics || [],
        isFork: r.fork ?? false,
        isArchived: r.archived ?? false,
        isTemplate: Boolean(r.is_template),
        defaultBranch: r.default_branch || 'main',
        createdAt: r.created_at || new Date().toISOString(),
        updatedAt: r.updated_at || new Date().toISOString(),
        pushedAt: r.pushed_at || r.updated_at || new Date().toISOString(),
        size: r.size || 0,
        license: r.license?.name || null,
        health
      };

      const now = Date.now();
      const lastPushed = r.pushed_at ? new Date(r.pushed_at).getTime() : 0;
      const daysSinceLastPush = lastPushed ? Math.floor((now - lastPushed) / (1000 * 60 * 60 * 24)) : 999;

      const rateLimitInfo = await this.getRateLimit();

      const detailResponse: RepositoryDetailResponse = {
        repository,
        languages,
        owner: {
          login: r.owner.login,
          avatarUrl: r.owner.avatar_url,
          htmlUrl: r.owner.html_url
        },
        metrics: {
          hasReadme: true,
          hasLicense: Boolean(r.license),
          hasTopics: Boolean(r.topics && r.topics.length > 0),
          hasHomepage: Boolean(r.homepage),
          isFresh: daysSinceLastPush <= 90,
          forkRatio: r.stargazers_count && r.stargazers_count > 0 ? Number(((r.forks_count || 0) / r.stargazers_count).toFixed(2)) : 0,
          daysSinceLastPush
        },
        rateLimitInfo
      };

      setCached(cacheKey, detailResponse);
      return detailResponse;
    } catch (error: any) {
      if (error instanceof GitHubApiError || error?.name === 'GitHubApiError') {
        throw error;
      }
      throw new GitHubApiError(error.message || 'Internal server error while fetching repository details', error?.status || 500);
    }
  }
}

export const githubService = new GitHubService();
