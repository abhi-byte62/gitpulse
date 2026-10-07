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
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-surface border border-rose-500/30 text-rose-400 mb-6 shadow-xl">
        {is429 ? <Clock className="h-8 w-8 text-amber-400" /> : <AlertCircle className="h-8 w-8 text-rose-400" />}
      </div>

      <h2 className="text-2xl font-extrabold tracking-tight text-text-primary">
        {is404
          ? 'GitHub User Not Found'
          : is429
          ? 'API Rate Limit Reached'
          : 'Unable to Load Intelligence'}
      </h2>

      <p className="text-sm text-text-secondary mt-2.5 max-w-md mx-auto leading-relaxed font-normal">
        {is404
          ? `We couldn't find a public GitHub user with the username "${resetUsername || 'provided'}". Please check spelling and try again.`
          : is429
          ? 'GitHub public REST API hourly rate limit has been reached. Please try again shortly or configure a GITHUB_TOKEN on the server.'
          : error?.message || 'An unexpected error occurred while communicating with the GitHub API.'}
      </p>

      {resetTime && (
        <div className="mt-4 inline-block rounded-xl bg-surface-subtle border border-border px-3.5 py-1.5 text-xs font-mono text-text-muted">
          Rate limit resets at: {new Date(resetTime).toLocaleTimeString()}
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 rounded-xl bg-surface border border-border px-4 py-2.5 text-xs font-mono font-medium text-text-primary hover:bg-surface-secondary hover:border-brand/40 transition-all shadow-sm"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Try Again</span>
          </button>
        )}

        <Link
          to="/"
          className="flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-xs font-bold text-background uppercase tracking-wider hover:bg-brand-hover active:scale-95 transition-all shadow-md"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Search</span>
        </Link>
      </div>
    </div>
  );
};
