import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, Github } from 'lucide-react';
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
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-secondary border border-border group-hover:border-brand/50 group-hover:bg-brand/10 transition-all">
              <span className="font-mono text-xs font-bold text-brand group-hover:scale-110 transition-transform">RP</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-text-primary">
                RepoPulse
              </span>
              <span className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-brand border border-brand/20">
                PRO
              </span>
            </div>
          </Link>

          {!isHome && (
            <form onSubmit={handleSearch} className="hidden sm:block relative w-64 md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search username or repo..."
                className="w-full rounded-lg border border-border bg-surface-subtle py-1.5 pl-9 pr-8 text-xs text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand font-mono transition-all"
              />
              <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-border bg-surface-secondary px-1 text-[10px] font-mono text-text-muted">
                /
              </kbd>
            </form>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {rateLimit && (
            <div
              title={`GitHub API Quota: ${rateLimit.remaining} of ${rateLimit.limit} remaining. Resets at ${new Date(rateLimit.resetAt).toLocaleTimeString()}`}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface-subtle px-3 py-1.5 text-xs font-mono text-text-secondary"
            >
              <span className={`h-2 w-2 rounded-full ${rateLimit.remaining > 10 ? 'bg-brand' : 'bg-amber-400'} animate-pulse`} />
              <span className="hidden sm:inline text-text-muted">API Quota:</span>
              <span className="text-text-primary font-semibold">{rateLimit.remaining}</span>
              <span className="text-text-muted">/{rateLimit.limit}</span>
            </div>
          )}

          <a
            href="https://github.com/abhi-byte62/gitpulse"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-lg border border-border bg-surface-subtle px-3.5 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:border-brand/40 hover:bg-surface-secondary transition-all"
          >
            <Github className="h-3.5 w-3.5" />
            <span className="hidden sm:inline font-mono">Source</span>
          </a>
        </div>
      </div>
    </header>
  );
};
