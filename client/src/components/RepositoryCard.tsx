import React from 'react';
import { Link } from 'react-router-dom';
import { Star, GitFork, ExternalLink, GitBranch, ShieldCheck } from 'lucide-react';
import { RepositorySummary } from '../types';
import { formatNumber, formatRelativeDate, getGradeBadgeStyles } from '../lib/utils';

interface RepositoryCardProps {
  repository: RepositorySummary;
}

export const RepositoryCard: React.FC<RepositoryCardProps> = ({ repository }) => {
  const badge = getGradeBadgeStyles(repository.health.grade);

  return (
    <div className="group rounded-2xl border border-border bg-surface p-5 hover:border-brand/40 hover:bg-surface-subtle transition-all flex flex-col justify-between shadow-sm">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <Link
              to={`/u/${repository.owner}/repo/${repository.name}`}
              className="font-mono text-sm font-bold text-text-primary group-hover:text-brand truncate block transition-colors tracking-tight"
            >
              {repository.name}
            </Link>
            {repository.isFork && (
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-text-muted mt-0.5">
                <GitBranch className="h-3 w-3" /> Forked repository
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Score Pill */}
            <span
              title={`RepoPulse Health Score: ${repository.health.score}/100`}
              className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-xs font-mono font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{repository.health.score}</span>
            </span>

            <a
              href={repository.url}
              target="_blank"
              rel="noreferrer"
              title="Open GitHub"
              className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-text-secondary line-clamp-2 mt-2.5 min-h-[32px] leading-relaxed">
          {repository.description || 'No description provided.'}
        </p>

        {/* Topics */}
        {repository.topics && repository.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3.5">
            {repository.topics.slice(0, 3).map((topic) => (
              <span
                key={topic}
                className="rounded-md bg-surface-secondary px-2 py-0.5 text-[10px] font-mono text-text-secondary border border-border"
              >
                #{topic}
              </span>
            ))}
            {repository.topics.length > 3 && (
              <span className="text-[10px] font-mono text-text-muted self-center">
                +{repository.topics.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Footer info: language, stats & freshness */}
      <div className="flex items-center justify-between pt-4 mt-4 border-t border-border/60 text-xs font-mono text-text-secondary">
        <div className="flex items-center gap-3">
          {repository.language && (
            <span className="flex items-center gap-1.5 text-text-primary font-medium text-[11px]">
              <span className="h-2 w-2 rounded-full bg-brand" />
              {repository.language}
            </span>
          )}
          <span className="flex items-center gap-1 text-[11px]" title="Stars">
            <Star className="h-3.5 w-3.5 text-amber-400" />
            {formatNumber(repository.stars)}
          </span>
          <span className="flex items-center gap-1 text-[11px]" title="Forks">
            <GitFork className="h-3.5 w-3.5 text-text-muted" />
            {formatNumber(repository.forks)}
          </span>
        </div>

        <span className="text-[11px] text-text-muted">
          {formatRelativeDate(repository.pushedAt)}
        </span>
      </div>
    </div>
  );
};
