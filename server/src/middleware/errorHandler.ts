import { Request, Response, NextFunction } from 'express';
import { GitHubApiError } from '../services/githubService.js';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Never leak raw stack traces to the client
  if (err instanceof GitHubApiError) {
    res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
      statusCode: err.statusCode,
      resetTime: err.resetTime
    });
    return;
  }

  const statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500;
  const message = statusCode === 500 ? 'An unexpected server error occurred.' : (err.message || 'Error occurred');

  res.status(statusCode).json({
    error: 'InternalServerError',
    message,
    statusCode
  });
}
