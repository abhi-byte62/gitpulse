import React from 'react';
import { GitCommit, GitPullRequest, Star, GitFork, AlertCircle, Clock, PlusCircle } from 'lucide-react';
import { ActivityItem } from '../types';
import { formatRelativeDate } from '../lib/utils';

interface ActivityTimelineProps {
  activity: ActivityItem[];
}

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ activity }) => {
  if (!activity || activity.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-center">
        <Clock className="h-6 w-6 text-text-muted mx-auto mb-2" />
        <h3 className="text-sm font-medium text-text-primary">No Recent Public Events</h3>
        <p className="text-xs text-text-muted mt-1">This user has not performed public activity recently.</p>
      </div>
    );
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'PushEvent':
        return <GitCommit className="h-3.5 w-3.5 text-accent" />;
      case 'PullRequestEvent':
        return <GitPullRequest className="h-3.5 w-3.5 text-purple-400" />;
      case 'WatchEvent':
        return <Star className="h-3.5 w-3.5 text-amber-400" />;
      case 'ForkEvent':
        return <GitFork className="h-3.5 w-3.5 text-blue-400" />;
      case 'IssuesEvent':
      case 'IssueCommentEvent':
        return <AlertCircle className="h-3.5 w-3.5 text-emerald-400" />;
      case 'CreateEvent':
        return <PlusCircle className="h-3.5 w-3.5 text-cyan-400" />;
      default:
        return <Clock className="h-3.5 w-3.5 text-text-muted" />;
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-text-primary">Recent Public Activity</h2>
          <p className="text-xs text-text-secondary mt-0.5">Chronological feed of public actions on GitHub.</p>
        </div>
        <span className="font-mono text-xs text-text-muted">{activity.length} Events</span>
      </div>

      <div className="relative pl-6 space-y-5 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[1px] before:bg-border">
        {activity.map((item) => (
          <div key={item.id} className="relative group">
            {/* Timeline dot/icon */}
            <div className="absolute -left-6 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-surface border border-border group-hover:border-accent transition-colors">
              {getEventIcon(item.type)}
            </div>

            <div className="text-xs">
              <div className="flex items-baseline justify-between gap-2 flex-wrap">
                <span className="text-text-secondary">
                  {item.action}{' '}
                  <a
                    href={`https://github.com/${item.repo}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono font-medium text-text-primary hover:text-accent transition-colors"
                  >
                    {item.repo}
                  </a>
                </span>
                <span className="font-mono text-[11px] text-text-muted">
                  {formatRelativeDate(item.createdAt)}
                </span>
              </div>

              {item.details && (
                <div className="mt-1.5 rounded-md bg-surface-secondary px-2.5 py-1.5 font-mono text-[11px] text-text-secondary border border-border/50">
                  {item.details}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
