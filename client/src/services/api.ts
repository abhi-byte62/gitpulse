import {
  NormalizedDeveloperResponse,
  RepositoryDetailResponse,
  RateLimitInfo
} from '../types';
import { fetchDirectDeveloperAnalytics, fetchDirectRepositoryDetails } from './githubClient';

export class ApiError extends Error {
  public statusCode: number;
  public resetTime?: string;

  constructor(message: string, statusCode: number, resetTime?: string) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.resetTime = resetTime;
  }
}


export const api = {
  /**
   * Fetches normalized developer analytics for a username
   */
  async getDeveloper(username: string): Promise<NormalizedDeveloperResponse> {
    try {
      const res = await fetch(`/api/developers/${encodeURIComponent(username)}`);
      if (res.ok) {
        return await res.json();
      }
      if (res.status === 404) {
        throw new ApiError(`GitHub user "${username}" not found.`, 404);
      }
      if (res.status === 429) {
        throw new ApiError('GitHub API rate limit exceeded.', 429);
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.statusCode === 404) {
        throw err;
      }
      // Fallback to direct Real GitHub API
      console.warn('[RepoPulse] Backend route unavailable, falling back to direct GitHub REST API');
    }

    // Direct real GitHub API query
    try {
      return await fetchDirectDeveloperAnalytics(username);
    } catch (directErr: any) {
      const isNotFound = directErr.message.includes('not found') || directErr.message.includes('404');
      const isRateLimit = directErr.message.includes('rate limit');
      throw new ApiError(directErr.message, isNotFound ? 404 : (isRateLimit ? 429 : 500));
    }
  },

  /**
   * Fetches single repository analytics
   */
  async getRepository(owner: string, repo: string): Promise<RepositoryDetailResponse> {
    try {
      const res = await fetch(`/api/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
      if (res.ok) {
        return await res.json();
      }
      if (res.status === 404) {
        throw new ApiError(`Repository "${owner}/${repo}" not found.`, 404);
      }
    } catch (err: any) {
      if (err instanceof ApiError && err.statusCode === 404) {
        throw err;
      }
      console.warn('[RepoPulse] Backend route unavailable, falling back to direct GitHub REST API');
    }

    try {
      return await fetchDirectRepositoryDetails(owner, repo);
    } catch (directErr: any) {
      const isNotFound = directErr.message.includes('not found') || directErr.message.includes('404');
      throw new ApiError(directErr.message, isNotFound ? 404 : 500);
    }
  },

  /**
   * Fetches remaining GitHub API rate limit
   */
  async getRateLimit(): Promise<RateLimitInfo> {
    try {
      const res = await fetch('/api/rate-limit');
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }

    return {
      limit: 60,
      remaining: 60,
      used: 0,
      resetAt: new Date(Date.now() + 3600000).toISOString()
    };
  }
};
