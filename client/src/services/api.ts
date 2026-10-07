import {
  NormalizedDeveloperResponse,
  RepositoryDetailResponse,
  RateLimitInfo,
  ApiErrorResponse
} from '../types';

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

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: ApiErrorResponse | null = null;
    try {
      errorData = await response.json();
    } catch {
      // Failed to parse json error
    }

    const message = errorData?.message || `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, errorData?.resetTime);
  }

  return response.json() as Promise<T>;
}

export const api = {
  /**
   * Fetches normalized developer analytics for a username
   */
  async getDeveloper(username: string): Promise<NormalizedDeveloperResponse> {
    const res = await fetch(`/api/developers/${encodeURIComponent(username)}`);
    return handleResponse<NormalizedDeveloperResponse>(res);
  },

  /**
   * Fetches single repository analytics
   */
  async getRepository(owner: string, repo: string): Promise<RepositoryDetailResponse> {
    const res = await fetch(`/api/repositories/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`);
    return handleResponse<RepositoryDetailResponse>(res);
  },

  /**
   * Fetches remaining GitHub API rate limit
   */
  async getRateLimit(): Promise<RateLimitInfo> {
    const res = await fetch('/api/rate-limit');
    return handleResponse<RateLimitInfo>(res);
  }
};
