import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Activity, Github } from 'lucide-react';
import { api } from '../services/api';
import { RateLimitInfo } from '../types';

export const Navbar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [rateLimit, setRateLimit] = useState<RateLimitInfo | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isHome = location.pathname === '/';

  useEffect(() => {
    let isMounted = true;
    api.getRateLimit()
      .then(info => {
        if (isMounted) setRateLimit(info);
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim().replace(/^@/, '');
    if (trimmed) {
      navigate(`/u/${trimmed}`);
      setQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface border border-border group-hover:border-accent/50 transition-colors">
              <Activity className="h-4 w-4 text-accent" />
            </div>
            <span className="font-semibold text-lg tracking-tight text-text-primary">
              Repo<span className="text-accent">Pulse</span>
            </span>
          </Link>

          {!isHome && (
            <form onSubmit={handleSearch} className="hidden sm:block relative w-64 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search another username..."
                className="w-full rounded-md border border-border bg-surface py-1.5 pl-9 pr-3 text-sm text-text-primary placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-all font-mono"
              />
            </form>
          )}
        </div>

        {/* Right Actions & Rate Limit Status */}
        <div className="flex items-center gap-3">
          {rateLimit && (
            <div
              title={`GitHub API Rate Limit: ${rateLimit.remaining}/${rateLimit.limit} remaining. Resets at ${new Date(rateLimit.resetAt).toLocaleTimeString()}`}
              className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-mono text-text-secondary"
            >
              <span className={`h-1.5 w-1.5 rounded-full ${rateLimit.remaining > 10 ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className="hidden sm:inline">API:</span>
              <span className="text-text-primary font-medium">{rateLimit.remaining}</span>
              <span className="text-text-muted">/</span>
              <span className="text-text-muted">{rateLimit.limit}</span>
            </div>
          )}

          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:border-border-active transition-colors"
          >
            <Github className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
};
