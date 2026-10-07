import { Request, Response, NextFunction } from 'express';
import { GitHubApiError } from '../services/githubService.js';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log error to server console (visible in Vercel runtime logs)
  console.error('[RepoPulse Server Error]:', {
    name: err?.name,
    message: err?.message,
    status: err?.status || err?.statusCode,
    stack: process.env.NODE_ENV !== 'production' ? err?.stack : undefined
  });

  // Handle GitHubApiError or custom structured errors
  if (err instanceof GitHubApiError || err?.name === 'GitHubApiError') {
    res.status(err.statusCode || 500).json({
      error: err.name || 'GitHubApiError',
      message: err.message,
      statusCode: err.statusCode || 500,
      resetTime: err.resetTime
    });
    return;
  }

  // Handle standard Octokit / HTTP error statuses
  const status = typeof err.status === 'number' ? err.status : (typeof err.statusCode === 'number' ? err.statusCode : 500);

  if (status === 404) {
    res.status(404).json({
      error: 'NotFound',
      message: err.message || 'Resource not found on GitHub.',
      statusCode: 404
    });
    return;
  }

  if (status === 403 || status === 429) {
    const resetHeader = err.response?.headers?.['x-ratelimit-reset'];
    const resetTime = resetHeader ? new Date(parseInt(resetHeader, 10) * 1000).toISOString() : undefined;
    res.status(429).json({
      error: 'RateLimitExceeded',
      message: 'GitHub API rate limit reached. Please configure a GITHUB_TOKEN on Vercel or wait for the rate limit to reset.',
      statusCode: 429,
      resetTime
    });
    return;
  }

  if (status === 401) {
    res.status(401).json({
      error: 'Unauthorized',
      message: 'GitHub API authentication failed. Please check the GITHUB_TOKEN environment variable configured on Vercel.',
      statusCode: 401
    });
    return;
  }

  const message = status === 500
    ? (err.message && !err.message.includes('node_modules') ? err.message : 'An unexpected server error occurred.')
    : (err.message || 'Error occurred');

  res.status(status).json({
    error: err.name || 'InternalServerError',
    message,
    statusCode: status
  });
}
