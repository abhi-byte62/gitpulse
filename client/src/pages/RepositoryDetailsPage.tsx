import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ExternalLink,
  Star,
  GitFork,
  AlertCircle,
  GitBranch,
  Scale,
  HardDrive,
  ArrowLeft,
  Clock
} from 'lucide-react';
import { api, ApiError } from '../services/api';
import { RepositoryDetailResponse } from '../types';
import { HealthScoreCard } from '../components/HealthScoreCard';
import { LanguageDistribution } from '../components/LanguageDistribution';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { formatNumber, formatBytes, formatRelativeDate } from '../lib/utils';

export const RepositoryDetailsPage: React.FC = () => {
  const { username, repo } = useParams<{ username: string; repo: string }>();
  const [data, setData] = useState<RepositoryDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | ApiError | null>(null);

  const fetchRepoData = async () => {
    if (!username || !repo) return;
    setLoading(true);
    setError(null);

    try {
      const res = await api.getRepository(username, repo);
      setData(res);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRepoData();
  }, [username, repo]);

  if (loading) {
    return <LoadingState username={username} />;
  }

  if (error || !data) {
    return <ErrorState error={error} onRetry={fetchRepoData} resetUsername={username} />;
  }

  const { repository, languages, owner, metrics } = data;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Breadcrumb & Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-mono text-text-muted">
          <Link to="/" className="hover:text-text-primary transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link to={`/u/${owner.login}`} className="hover:text-brand transition-colors flex items-center gap-1.5 font-semibold text-text-secondary">
            <img src={owner.avatarUrl} alt={owner.login} className="h-4 w-4 rounded-full border border-border" />
            <span>{owner.login}</span>
          </Link>
          <span>/</span>
          <span className="text-text-primary font-bold">{repository.name}</span>
        </div>

        <Link
          to={`/u/${owner.login}`}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-text-secondary hover:text-brand transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to @{owner.login} overview</span>
        </Link>
      </div>

      {/* Main Repo Header Card */}
      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight text-text-primary">
                {repository.name}
              </h1>
              {repository.isFork && (
                <span className="inline-flex items-center gap-1 rounded-md bg-surface-secondary border border-border px-2 py-0.5 text-xs font-mono text-text-muted">
                  <GitBranch className="h-3 w-3" /> Forked
                </span>
              )}
              {repository.isArchived && (
                <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 border border-rose-500/30 px-2.5 py-0.5 text-xs font-mono text-rose-400 font-bold">
                  Archived
                </span>
              )}
            </div>

            <p className="text-sm text-text-secondary mt-2.5 max-w-3xl leading-relaxed">
              {repository.description || 'No description provided for this repository.'}
            </p>

            {/* Topics */}
            {repository.topics && repository.topics.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {repository.topics.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-lg bg-surface-secondary px-2.5 py-0.5 text-xs font-mono text-brand border border-border"
                  >
                    #{topic}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* GitHub action link */}
          <a
            href={repository.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-xs font-bold text-background uppercase tracking-wider hover:bg-brand-hover active:scale-95 transition-all shrink-0 self-start md:self-auto shadow-md"
          >
            <span>GitHub</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        {/* Metadata stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-border/60 text-xs">
          <div className="rounded-xl bg-surface-subtle p-3.5 border border-border/60">
            <span className="text-text-muted text-[11px] font-mono block">Stars</span>
            <div className="flex items-center gap-1.5 text-lg font-bold font-mono text-text-primary mt-1">
              <Star className="h-4 w-4 text-amber-400" />
              <span>{formatNumber(repository.stars)}</span>
            </div>
          </div>

          <div className="rounded-xl bg-surface-subtle p-3.5 border border-border/60">
            <span className="text-text-muted text-[11px] font-mono block">Forks</span>
            <div className="flex items-center gap-1.5 text-lg font-bold font-mono text-text-primary mt-1">
              <GitFork className="h-4 w-4 text-sky-400" />
              <span>{formatNumber(repository.forks)}</span>
            </div>
          </div>

          <div className="rounded-xl bg-surface-subtle p-3.5 border border-border/60">
            <span className="text-text-muted text-[11px] font-mono block">Open Issues</span>
            <div className="flex items-center gap-1.5 text-lg font-bold font-mono text-text-primary mt-1">
              <AlertCircle className="h-4 w-4 text-emerald-400" />
              <span>{formatNumber(repository.openIssues)}</span>
            </div>
          </div>

          <div className="rounded-xl bg-surface-subtle p-3.5 border border-border/60">
            <span className="text-text-muted text-[11px] font-mono block">Codebase Size</span>
            <div className="flex items-center gap-1.5 text-lg font-bold font-mono text-text-primary mt-1">
              <HardDrive className="h-4 w-4 text-purple-400" />
              <span>{formatBytes(repository.size * 1024)}</span>
            </div>
          </div>

          <div className="rounded-xl bg-surface-subtle p-3.5 border border-border/60">
            <span className="text-text-muted text-[11px] font-mono block">License</span>
            <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-text-primary mt-1.5 truncate">
              <Scale className="h-4 w-4 text-brand shrink-0" />
              <span className="truncate">{repository.license || 'None'}</span>
            </div>
          </div>

          <div className="rounded-xl bg-surface-subtle p-3.5 border border-border/60">
            <span className="text-text-muted text-[11px] font-mono block">Last Active</span>
            <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-text-primary mt-1.5">
              <Clock className="h-4 w-4 text-text-muted" />
              <span>{formatRelativeDate(repository.pushedAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Repo Health & Language Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HealthScoreCard
          health={repository.health}
          title="Repository Health Diagnostic"
          subtitle="Specific project maintainability, push freshness, and hygiene scorecard."
        />

        <LanguageDistribution
          languages={languages}
          title="Repository Code Breakdown"
          subtitle="Direct byte-level language footprint analyzed for this codebase."
        />
      </div>

      {/* Technical Diagnostics */}
      <div className="rounded-2xl border border-border bg-surface p-6 sm:p-7 shadow-sm">
        <h2 className="text-base font-bold text-text-primary tracking-tight mb-4">Technical Diagnostics & Metadata</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-mono">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-subtle border border-border">
            <span className="text-text-secondary">Default Branch</span>
            <span className="text-text-primary font-bold">{repository.defaultBranch}</span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-subtle border border-border">
            <span className="text-text-secondary">Created Date</span>
            <span className="text-text-primary font-bold">
              {new Date(repository.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-subtle border border-border">
            <span className="text-text-secondary">Days Since Last Push</span>
            <span className="text-text-primary font-bold">{metrics.daysSinceLastPush} days</span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-subtle border border-border">
            <span className="text-text-secondary">Homepage / Docs</span>
            {repository.homepage ? (
              <a
                href={repository.homepage.startsWith('http') ? repository.homepage : `https://${repository.homepage}`}
                target="_blank"
                rel="noreferrer"
                className="text-brand hover:underline flex items-center gap-1 truncate max-w-[140px]"
              >
                <span>{repository.homepage.replace(/^https?:\/\//, '')}</span>
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            ) : (
              <span className="text-text-muted">None declared</span>
            )}
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-subtle border border-border">
            <span className="text-text-secondary">Fork Ratio</span>
            <span className="text-text-primary font-bold">{metrics.forkRatio}</span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-subtle border border-border">
            <span className="text-text-secondary">Maintenance Status</span>
            <span className={metrics.isFresh ? 'text-brand font-bold' : 'text-amber-400 font-bold'}>
              {metrics.isFresh ? 'Actively Maintained' : 'Low Recent Cadence'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
