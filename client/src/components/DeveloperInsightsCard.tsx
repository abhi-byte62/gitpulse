import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Star, GitCommit, Code, ArrowUpRight } from 'lucide-react';
import { DeveloperInsights } from '../types';
import { formatNumber, formatRelativeDate } from '../lib/utils';

interface DeveloperInsightsCardProps {
  insights: DeveloperInsights;
  username: string;
}

export const DeveloperInsightsCard: React.FC<DeveloperInsightsCardProps> = ({ insights, username }) => {
  return (
    <div className="rounded-2xl border border-border bg-surface p-6 sm:p-7 shadow-sm">
      <div className="flex items-center gap-2.5 mb-5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand/10 border border-brand/20">
          <Sparkles className="h-4 w-4 text-brand" />
        </div>
        <div>
          <h2 className="text-base font-bold text-text-primary tracking-tight">Developer Insights</h2>
          <p className="text-xs text-text-secondary mt-0.5">Automated signal analysis across public repository footprint.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Most Popular Repo */}
        {insights.mostStarredRepository ? (
          <div className="rounded-xl bg-surface-subtle p-4 border border-border hover:border-brand/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-text-muted mb-2 font-mono">
                <span className="flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 text-amber-400" />
                  <span>Flagship Project</span>
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 text-text-muted" />
              </div>
              <Link
                to={`/u/${username}/repo/${insights.mostStarredRepository.name}`}
                className="font-mono text-sm font-bold text-text-primary hover:text-brand block truncate tracking-tight"
              >
                {insights.mostStarredRepository.name}
              </Link>
            </div>
            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-text-secondary font-mono">
              <span className="font-bold text-text-primary">{formatNumber(insights.mostStarredRepository.stars)} stars</span>
              <span className="text-text-muted">{insights.mostStarredRepository.language || 'Code'}</span>
            </div>
          </div>
        ) : (
          <div className="rounded-xl bg-surface-subtle p-4 border border-border flex items-center justify-center text-xs text-text-muted font-mono">
            No flagship repositories detected
          </div>
        )}

        {/* Most Recently Active */}
        {insights.mostRecentlyUpdatedRepository && (
          <div className="rounded-xl bg-surface-subtle p-4 border border-border hover:border-brand/40 transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-text-muted mb-2 font-mono">
                <span className="flex items-center gap-1.5">
                  <GitCommit className="h-3.5 w-3.5 text-sky-400" />
                  <span>Active Project</span>
                </span>
                <ArrowUpRight className="h-3.5 w-3.5 text-text-muted" />
              </div>
              <Link
                to={`/u/${username}/repo/${insights.mostRecentlyUpdatedRepository.name}`}
                className="font-mono text-sm font-bold text-text-primary hover:text-brand block truncate tracking-tight"
              >
                {insights.mostRecentlyUpdatedRepository.name}
              </Link>
            </div>
            <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-text-secondary font-mono">
              <span className="text-text-primary font-medium">Pushed {formatRelativeDate(insights.mostRecentlyUpdatedRepository.pushedAt)}</span>
              <span className="text-text-muted">{insights.mostRecentlyUpdatedRepository.language || 'Code'}</span>
            </div>
          </div>
        )}

        {/* Core Stack */}
        <div className="rounded-xl bg-surface-subtle p-4 border border-border flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-text-muted mb-2 font-mono">
              <Code className="h-3.5 w-3.5 text-purple-400" />
              <span>Core Language Stack</span>
            </div>
            <div className="font-mono text-sm font-bold text-text-primary tracking-tight">
              {insights.primaryLanguage || 'Polyglot'}
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-xs text-text-secondary font-mono">
            <span>{insights.activeLanguagesCount} languages</span>
            <span className="text-brand font-bold">{insights.maintenanceRate}% cadence</span>
          </div>
        </div>
      </div>
    </div>
  );
};
