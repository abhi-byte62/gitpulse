import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  ExternalLink,
  MapPin,
  Building,
  Link as LinkIcon,
  Twitter,
  Calendar,
  Search,
  Check,
  Copy
} from 'lucide-react';
import { api, ApiError } from '../services/api';
import { NormalizedDeveloperResponse } from '../types';
import { HealthScoreCard } from '../components/HealthScoreCard';
import { LanguageDistribution } from '../components/LanguageDistribution';
import { StatsGrid } from '../components/StatsGrid';
import { RepositoryCard } from '../components/RepositoryCard';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { DeveloperInsightsCard } from '../components/DeveloperInsightsCard';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';

export const DeveloperDashboard: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [data, setData] = useState<NormalizedDeveloperResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | ApiError | null>(null);
  const [copied, setCopied] = useState(false);

  // Filter & Search states
  const [activeTab, setActiveTab] = useState<'overview' | 'repositories' | 'activity'>('overview');
  const [repoSearch, setRepoSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'stars' | 'updated' | 'health' | 'name'>('stars');

  const fetchData = async () => {
    if (!username) return;
    setLoading(true);
    setError(null);

    try {
      const res = await api.getDeveloper(username);
      setData(res);
    } catch (err: any) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [username]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <LoadingState username={username} />;
  }

  if (error || !data) {
    return <ErrorState error={error} onRetry={fetchData} resetUsername={username} />;
  }

  const { profile, stats, languages, repositories, topRepositories, recentlyUpdated, activity, insights } = data;

  // Filter & sort all repositories
  const filteredRepositories = repositories.filter((repo) => {
    const matchesSearch =
      repo.name.toLowerCase().includes(repoSearch.toLowerCase()) ||
      (repo.description && repo.description.toLowerCase().includes(repoSearch.toLowerCase()));
    const matchesLang = selectedLanguage === 'all' || repo.language === selectedLanguage;
    return matchesSearch && matchesLang;
  }).sort((a, b) => {
    if (sortBy === 'stars') return b.stars - a.stars;
    if (sortBy === 'updated') return new Date(b.pushedAt).getTime() - new Date(a.pushedAt).getTime();
    if (sortBy === 'health') return b.health.score - a.health.score;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const availableLanguages = Array.from(
    new Set(repositories.map((r) => r.language).filter(Boolean) as string[])
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Profile Header */}
      <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <img
              src={profile.avatarUrl}
              alt={`${profile.username}'s avatar`}
              className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl border border-border/80 object-cover shadow-md"
            />
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">
                  {profile.name || profile.username}
                </h1>
                <span className="font-mono text-sm text-text-muted">@{profile.username}</span>
              </div>

              {profile.bio && (
                <p className="text-sm text-text-secondary mt-2 max-w-2xl leading-relaxed">
                  {profile.bio}
                </p>
              )}

              {/* Metadata row */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted mt-3 font-mono">
                {profile.company && (
                  <span className="flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 text-text-secondary" />
                    {profile.company}
                  </span>
                )}
                {profile.location && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-text-secondary" />
                    {profile.location}
                  </span>
                )}
                {profile.blog && (
                  <a
                    href={profile.blog.startsWith('http') ? profile.blog : `https://${profile.blog}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 hover:text-accent transition-colors"
                  >
                    <LinkIcon className="h-3.5 w-3.5 text-text-secondary" />
                    <span className="truncate max-w-[180px]">{profile.blog.replace(/^https?:\/\//, '')}</span>
                  </a>
                )}
                {profile.twitterUsername && (
                  <a
                    href={`https://twitter.com/${profile.twitterUsername}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 hover:text-accent transition-colors"
                  >
                    <Twitter className="h-3.5 w-3.5 text-text-secondary" />
                    @{profile.twitterUsername}
                  </a>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-text-secondary" />
                  Joined {new Date(profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short' })}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Profile Actions */}
          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-secondary px-3.5 py-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:border-border-active transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Link Copied' : 'Share'}</span>
            </button>

            <a
              href={profile.profileUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-xs font-semibold text-background hover:bg-accent-hover transition-colors"
            >
              <span>GitHub Profile</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* Stats Counter Grid */}
      <StatsGrid stats={stats} insights={insights} followers={profile.followers} />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'overview'
              ? 'bg-surface border border-border text-accent shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('repositories')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'repositories'
              ? 'bg-surface border border-border text-accent shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <span>All Repositories</span>
          <span className="rounded-full bg-surface-secondary px-1.5 py-0.2 text-[10px] font-mono text-text-muted">
            {repositories.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('activity')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
            activeTab === 'activity'
              ? 'bg-surface border border-border text-accent shadow-sm'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          <span>Activity Timeline</span>
          <span className="rounded-full bg-surface-secondary px-1.5 py-0.2 text-[10px] font-mono text-text-muted">
            {activity.length}
          </span>
        </button>
      </div>

      {/* TAB CONTENT: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Health Score & Language Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <HealthScoreCard
              health={{
                score: insights.healthScore,
                grade: insights.healthGrade,
                activityScore: Math.round((insights.maintenanceRate / 100) * 30),
                documentationScore: 22,
                stabilityScore: 24,
                communityScore: Math.min(20, Math.round(stats.stars > 0 ? 15 : 5)),
                factors: {
                  positive: [
                    `${insights.maintenanceRate}% of repositories maintained within the last 6 months`,
                    `Active across ${insights.activeLanguagesCount} programming languages`,
                    `Accumulated ${stats.stars} total stars on public repositories`
                  ],
                  improvements: [
                    stats.licenseCount < stats.repositories
                      ? `${stats.repositories - stats.licenseCount} repositories lack open-source license declarations`
                      : 'Maintain regular commit cadence across older repositories'
                  ]
                }
              }}
              title="RepoPulse Developer Health Index"
              subtitle="Aggregated maintainability, freshness, and code quality index across all public repositories."
            />

            <LanguageDistribution languages={languages} />
          </div>

          {/* Developer Insights summary */}
          <DeveloperInsightsCard insights={insights} username={profile.username} />

          {/* Top Starred Repositories */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-text-primary">Top Repositories</h2>
                <p className="text-xs text-text-secondary mt-0.5">Most starred public repositories.</p>
              </div>
              <button
                onClick={() => {
                  setActiveTab('repositories');
                  setSortBy('stars');
                }}
                className="text-xs text-accent hover:underline font-medium"
              >
                View all ({repositories.length})
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topRepositories.map((repo) => (
                <RepositoryCard key={repo.id} repository={repo} />
              ))}
            </div>
          </div>

          {/* Recently Updated Repositories */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-text-primary">Recently Active</h2>
                <p className="text-xs text-text-secondary mt-0.5">Repositories with the most recent commits/pushes.</p>
              </div>
              <button
                onClick={() => {
                  setActiveTab('repositories');
                  setSortBy('updated');
                }}
                className="text-xs text-accent hover:underline font-medium"
              >
                View all ({repositories.length})
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentlyUpdated.map((repo) => (
                <RepositoryCard key={repo.id} repository={repo} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: All Repositories */}
      {activeTab === 'repositories' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-border bg-surface p-3 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
              <input
                type="text"
                value={repoSearch}
                onChange={(e) => setRepoSearch(e.target.value)}
                placeholder="Filter repositories by name or description..."
                className="w-full rounded-lg border border-border bg-surface-secondary py-1.5 pl-9 pr-3 text-xs text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent font-mono"
              />
            </div>

            <div className="flex items-center gap-2">
              {/* Language Selector */}
              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="rounded-lg border border-border bg-surface-secondary px-2.5 py-1.5 text-xs text-text-secondary focus:border-accent focus:outline-none font-mono"
              >
                <option value="all">All Languages ({repositories.length})</option>
                {availableLanguages.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>

              {/* Sort Selector */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="rounded-lg border border-border bg-surface-secondary px-2.5 py-1.5 text-xs text-text-secondary focus:border-accent focus:outline-none font-mono"
              >
                <option value="stars">Sort by Stars</option>
                <option value="updated">Sort by Recently Updated</option>
                <option value="health">Sort by Health Score</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
          </div>

          {/* Repositories Grid */}
          {filteredRepositories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRepositories.map((repo) => (
                <RepositoryCard key={repo.id} repository={repo} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-surface p-12 text-center">
              <p className="text-sm text-text-muted">No repositories match the current filters.</p>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Activity */}
      {activeTab === 'activity' && (
        <div className="max-w-3xl mx-auto">
          <ActivityTimeline activity={activity} />
        </div>
      )}
    </div>
  );
};
