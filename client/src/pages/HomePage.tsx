import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, ShieldCheck, Activity, Code2, Zap } from 'lucide-react';
import { api } from '../services/api';

export const HomePage: React.FC = () => {
  const [username, setUsername] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.getRateLimit().catch(() => {});

    // Keyboard shortcut: pressing '/' focuses the search input
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim().replace(/^@/, '');
    if (cleanUser) {
      navigate(`/u/${cleanUser}`);
    }
  };

  const sampleUsers = ['abhi-byte62', 'torvalds', 'shadcn', 'antfu'];

  return (
    <div className="relative isolate min-h-[calc(100vh-14rem)] flex flex-col justify-between">
      {/* Background subtle grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none -z-10" />

      <main className="mx-auto max-w-5xl px-4 pt-16 pb-12 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-mono text-text-secondary mb-8 shadow-sm">
          <Activity className="h-3.5 w-3.5 text-accent" />
          <span>Real-time GitHub REST API Intelligence</span>
          <span className="text-text-muted">•</span>
          <span className="text-emerald-400">Public data</span>
        </div>

        {/* Title & Tagline */}
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-text-primary max-w-3xl mx-auto">
          GitHub repository intelligence for developers.
        </h1>
        <p className="mt-4 text-base sm:text-lg text-text-secondary max-w-2xl mx-auto">
          Analyze public GitHub profiles, repository health scores, language distributions, and commit recency using real-time GitHub REST API data.
        </p>

        {/* Search Field */}
        <form onSubmit={handleSubmit} className="mt-10 max-w-xl mx-auto">
          <div className="relative flex items-center shadow-lg">
            <div className="absolute left-4 text-text-muted">
              <Search className="h-5 w-5" />
            </div>
            <input
              ref={inputRef}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter a GitHub username (e.g. abhi-byte62)"
              className="w-full rounded-xl border border-border bg-surface py-4 pl-12 pr-32 text-base text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all font-mono"
              autoFocus
            />
            <div className="absolute right-2 flex items-center gap-1.5">
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-background hover:bg-accent-hover transition-colors"
              >
                <span>Analyze</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </form>

        {/* Quick Sample Links */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-text-muted font-mono">
          <span>Try:</span>
          {sampleUsers.map((user) => (
            <button
              key={user}
              onClick={() => navigate(`/u/${user}`)}
              className="rounded-md border border-border bg-surface px-2.5 py-1 text-text-secondary hover:text-accent hover:border-border-active transition-colors"
            >
              @{user}
            </button>
          ))}
        </div>

        {/* Value Pillars Grid */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          <div className="rounded-xl border border-border bg-surface p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-secondary border border-border mb-4">
              <ShieldCheck className="h-5 w-5 text-accent" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary">RepoPulse Health Score</h3>
            <p className="text-xs text-text-secondary mt-2 leading-relaxed">
              Deterministic 0-100 heuristic evaluating push freshness, documentation depth, open source licensing, and community adoption.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-secondary border border-border mb-4">
              <Code2 className="h-5 w-5 text-purple-400" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary">Byte-Level Language Analytics</h3>
            <p className="text-xs text-text-secondary mt-2 leading-relaxed">
              Aggregates raw code byte distributions directly across public repositories to produce precise language percentage breakdowns.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-secondary border border-border mb-4">
              <Zap className="h-5 w-5 text-emerald-400" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary">Zero Secrets & Rate Conscious</h3>
            <p className="text-xs text-text-secondary mt-2 leading-relaxed">
              Backend architecture safeguards all API credentials and uses intelligent caching with LRU cache to respect GitHub rate limits.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};
