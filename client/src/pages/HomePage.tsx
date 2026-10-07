import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, ShieldCheck, Code2, Zap, Terminal, ArrowUpRight } from 'lucide-react';
import { api } from '../services/api';

export const HomePage: React.FC = () => {
  const [username, setUsername] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.getRateLimit().catch(() => {});

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

  const sampleUsers = [
    { username: 'abhi-byte62', role: 'Full-Stack Engineer', tag: 'Featured' },
    { username: 'torvalds', role: 'Linux Creator', tag: 'Kernel' },
    { username: 'shadcn', role: 'UI Architect', tag: 'Components' },
    { username: 'antfu', role: 'Core Contributor', tag: 'Ecosystem' }
  ];

  return (
    <div className="relative min-h-[calc(100vh-14rem)] flex flex-col justify-between overflow-hidden">
      {/* Background Subtle Gradient & Grid */}
      <div className="absolute inset-0 bg-grid-ramp opacity-40 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-radial-fade pointer-events-none" />

      <main className="relative mx-auto max-w-6xl px-4 pt-16 pb-20 sm:px-6 lg:px-8">
        {/* Top pill badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-subtle px-3.5 py-1 text-xs font-mono text-text-secondary shadow-sm hover:border-brand/40 transition-colors">
            <span className="flex h-1.5 w-1.5 rounded-full bg-brand animate-ping" />
            <span className="text-text-primary font-medium">RepoPulse v1.0</span>
            <span className="text-text-muted">/</span>
            <span className="text-text-secondary">Official GitHub REST API Engine</span>
          </div>
        </div>

        {/* Hero Typography */}
        <div className="mt-8 text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-7xl font-extrabold tracking-tighter text-text-primary leading-[1.08]">
            GitHub repository intelligence for developers.
          </h1>
          <p className="mt-6 text-base sm:text-xl text-text-secondary max-w-2xl mx-auto font-normal leading-relaxed">
            Real-time public telemetry, byte-accurate language distribution, and deterministic health scoring for modern software engineers.
          </p>
        </div>

        {/* Interactive Command Search Bar */}
        <div className="mt-10 max-w-2xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="group relative flex items-center rounded-2xl border-2 border-border bg-surface-subtle/90 p-2 shadow-2xl focus-within:border-brand/70 focus-within:shadow-brand/5 transition-all"
          >
            <div className="pl-3 text-text-muted group-focus-within:text-brand transition-colors">
              <Search className="h-5 w-5" />
            </div>

            <input
              ref={inputRef}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter GitHub username (e.g. abhi-byte62)"
              className="w-full bg-transparent px-3 py-3 text-base text-text-primary placeholder:text-text-muted focus:outline-none font-mono tracking-tight"
              autoFocus
            />

            <div className="flex items-center gap-2 pr-1">
              <kbd className="hidden sm:inline-block rounded border border-border bg-surface-secondary px-2 py-1 text-xs font-mono text-text-muted">
                /
              </kbd>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-xs font-bold text-background uppercase tracking-wider hover:bg-brand-hover active:scale-95 transition-all shadow-md"
              >
                <span>Analyze</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>

          {/* Quick Suggestions Cards */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-mono text-text-muted mr-1">Sample accounts:</span>
            {sampleUsers.map((item) => (
              <button
                key={item.username}
                onClick={() => navigate(`/u/${item.username}`)}
                className="group inline-flex items-center gap-2 rounded-lg border border-border bg-surface-subtle px-3 py-1.5 text-xs text-text-secondary hover:border-brand/40 hover:bg-surface-secondary hover:text-text-primary transition-all font-mono"
              >
                <span className="font-semibold text-text-primary group-hover:text-brand transition-colors">@{item.username}</span>
                <span className="rounded bg-surface-secondary px-1.5 py-0.2 text-[10px] text-text-muted border border-border/60">
                  {item.tag}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Ramp-Style Feature Matrix Grid */}
        <div className="mt-24">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-4 border-b border-border">
            <div>
              <span className="font-mono uppercase text-xs tracking-wider text-brand font-semibold">Engine Features</span>
              <h2 className="text-2xl font-bold tracking-tight text-text-primary mt-1">
                Built for technical credibility.
              </h2>
            </div>
            <span className="font-mono text-xs text-text-muted mt-2 sm:mt-0">
              Zero fake data • Byte-level verification
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden border border-border">
            {/* Cell 1 */}
            <div className="bg-surface p-8 flex flex-col justify-between hover:bg-surface-subtle transition-colors">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 border border-brand/20 text-brand mb-6">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-text-primary">RepoPulse Health Heuristic</h3>
                <p className="text-xs text-text-secondary mt-2.5 leading-relaxed">
                  Deterministic 0–100 maintainability scorecard evaluating commit recency, documentation completeness, open source licensing, and community triage.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs font-mono text-text-muted">
                <span>4 Diagnostic Vectors</span>
                <span className="text-brand font-semibold">0–100 Pts</span>
              </div>
            </div>

            {/* Cell 2 */}
            <div className="bg-surface p-8 flex flex-col justify-between hover:bg-surface-subtle transition-colors">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 mb-6">
                  <Code2 className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-text-primary">Byte-Accurate Language Maps</h3>
                <p className="text-xs text-text-secondary mt-2.5 leading-relaxed">
                  Queries actual GitHub language bytes across non-fork repositories to compute exact percentage distributions with official GitHub hex colors.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs font-mono text-text-muted">
                <span>Raw Byte Precision</span>
                <span className="text-sky-400 font-semibold">100% Verified</span>
              </div>
            </div>

            {/* Cell 3 */}
            <div className="bg-surface p-8 flex flex-col justify-between hover:bg-surface-subtle transition-colors">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mb-6">
                  <Zap className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-text-primary">Rate-Conscious Architecture</h3>
                <p className="text-xs text-text-secondary mt-2.5 leading-relaxed">
                  In-memory LRU caching and strict request throttling safeguard API limits while keeping response times under 300ms for repeated requests.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between text-xs font-mono text-text-muted">
                <span>LRU Cached (5m TTL)</span>
                <span className="text-emerald-400 font-semibold">&lt;300ms SLA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Interactive Developer Preview Ribbon */}
        <div className="mt-16 rounded-2xl border border-border bg-surface-subtle p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-brand" />
                <span className="font-mono text-xs font-semibold text-text-primary uppercase tracking-wider">
                  Live Example Snapshot
                </span>
                <span className="rounded bg-brand/10 border border-brand/20 px-2 py-0.5 text-[10px] font-mono text-brand">
                  Live Query
                </span>
              </div>
              <h3 className="text-lg font-bold text-text-primary mt-1.5">
                Ready to inspect any public GitHub repository?
              </h3>
              <p className="text-xs text-text-secondary mt-1 max-w-xl">
                Enter any public username to immediately generate their developer report, code breakdown, and repository health diagnostics.
              </p>
            </div>

            <button
              onClick={() => navigate('/u/abhi-byte62')}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-5 py-3 text-xs font-mono font-bold text-text-primary hover:border-brand hover:text-brand transition-all shrink-0 self-start md:self-auto shadow-sm"
            >
              <span>View @abhi-byte62 Profile</span>
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
