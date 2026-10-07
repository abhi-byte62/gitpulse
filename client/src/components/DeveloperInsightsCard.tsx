import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Star, GitCommit, Code } from 'lucide-react';
import { DeveloperInsights } from '../types';
import { formatNumber, formatRelativeDate } from '../lib/utils';

interface DeveloperInsightsCardProps {
  insights: DeveloperInsights;
  username: string;
}

export const DeveloperInsightsCard: React.FC<DeveloperInsightsCardProps> = ({ insights, username }) => {
  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-accent" />
        <h2 className="text-base font-semibold text-text-primary">Developer Insights</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Most Popular Repo */}
        {insights.mostStarredRepository ? (
          <div className="rounded-lg bg-surface-secondary p-4 border border-border/60">
            <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1">
              <Star className="h-3.5 w-3.5 text-amber-400" />
              <span>Flagship Repository</span>
            </div>
            <Link
              to={`/u/${username}/repo/${insights.mostStarredRepository.name}`}
              className="font-mono text-sm font-semibold text-text-primary hover:text-accent block truncate"
            >
              {insights.mostStarredRepository.name}
            </Link>
            <div className="mt-2 flex items-center justify-between text-xs text-text-secondary font-mono">
              <span>{formatNumber(insights.mostStarredRepository.stars)} stars</span>
              <span>{insights.mostStarredRepository.language || 'Code'}</span>
            </div>
          </div>
        ) : (
          <div className="rounded-lg bg-surface-secondary p-4 border border-border/60">
            <span className="text-xs text-text-muted">No starred repositories yet</span>
          </div>
        )}

        {/* Most Recently Updated */}
        {insights.mostRecentlyUpdatedRepository && (
          <div className="rounded-lg bg-surface-secondary p-4 border border-border/60">
            <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1">
              <GitCommit className="h-3.5 w-3.5 text-accent" />
              <span>Latest Active Project</span>
            </div>
            <Link
              to={`/u/${username}/repo/${insights.mostRecentlyUpdatedRepository.name}`}
              className="font-mono text-sm font-semibold text-text-primary hover:text-accent block truncate"
            >
              {insights.mostRecentlyUpdatedRepository.name}
            </Link>
            <div className="mt-2 flex items-center justify-between text-xs text-text-secondary font-mono">
              <span>Pushed {formatRelativeDate(insights.mostRecentlyUpdatedRepository.pushedAt)}</span>
              <span>{insights.mostRecentlyUpdatedRepository.language || 'Code'}</span>
            </div>
          </div>
        )}

        {/* Tech Stack Focus */}
        <div className="rounded-lg bg-surface-secondary p-4 border border-border/60">
          <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1">
            <Code className="h-3.5 w-3.5 text-purple-400" />
            <span>Primary Focus</span>
          </div>
          <div className="font-mono text-sm font-semibold text-text-primary">
            {insights.primaryLanguage || 'Polyglot'}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-text-secondary font-mono">
            <span>{insights.activeLanguagesCount} total languages</span>
            <span>{insights.maintenanceRate}% active rate</span>
          </div>
        </div>
      </div>
    </div>
  );
};
