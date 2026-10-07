import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Clock, ArrowLeft, RefreshCw } from 'lucide-react';
import { ApiError } from '../services/api';

interface ErrorStateProps {
  error: Error | ApiError | null;
  onRetry?: () => void;
  resetUsername?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry, resetUsername }) => {
  const isApiError = error instanceof ApiError;
  const statusCode = isApiError ? error.statusCode : 500;
  const is404 = statusCode === 404;
  const is429 = statusCode === 429;
  const resetTime = isApiError ? error.resetTime : undefined;

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-surface border border-rose-500/30 text-rose-400 mb-6 shadow-lg">
        {is429 ? <Clock className="h-7 w-7 text-amber-400" /> : <AlertCircle className="h-7 w-7 text-rose-400" />}
      </div>

      <h2 className="text-2xl font-bold tracking-tight text-text-primary">
        {is404
          ? 'GitHub User Not Found'
          : is429
          ? 'GitHub API Rate Limit Reached'
          : 'Unable to Load Intelligence'}
      </h2>

      <p className="text-sm text-text-secondary mt-2 max-w-md mx-auto">
        {is404
          ? `We couldn't find a public GitHub user with the username "${resetUsername || 'provided'}". Please check spelling and try again.`
          : is429
          ? 'GitHub public REST API hourly rate limit has been reached. Please try again shortly or configure a GITHUB_TOKEN on the server.'
          : error?.message || 'An unexpected error occurred while communicating with the GitHub API.'}
      </p>

      {resetTime && (
        <div className="mt-4 inline-block rounded-md bg-surface-secondary border border-border px-3 py-1.5 text-xs font-mono text-text-muted">
          Rate limit resets at: {new Date(resetTime).toLocaleTimeString()}
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 rounded-lg bg-surface border border-border px-4 py-2 text-sm font-medium text-text-primary hover:bg-surface-secondary hover:border-border-active transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
        )}

        <Link
          to="/"
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-background hover:bg-accent-hover transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Search</span>
        </Link>
      </div>
    </div>
  );
};
