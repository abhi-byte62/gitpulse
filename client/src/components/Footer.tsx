import React from 'react';
import { Activity, ShieldCheck, Terminal, BookOpen } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-border bg-surface/50 py-10 mt-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-accent" />
              <span className="font-semibold tracking-tight text-text-primary">RepoPulse</span>
              <span className="rounded bg-surface-elevated px-1.5 py-0.5 text-[10px] font-mono text-text-muted border border-border">v1.0.0</span>
            </div>
            <p className="text-xs text-text-secondary mt-1.5 max-w-md">
              GitHub repository intelligence for developers. Analyzes public profiles, code freshness, and repository health metrics via real-time GitHub REST API integration.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-text-muted">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Public API Data Only</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-accent" />
              <span>Zero Browser Secrets</span>
            </div>
            <a
              href="https://docs.github.com/en/rest"
              target="_blank"
              rel="noreferrer"
              className="hover:text-text-primary transition-colors inline-flex items-center gap-1"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>GitHub API Docs</span>
            </a>
          </div>
        </div>

        <div className="border-t border-border/50 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>
            RepoPulse is an independent developer analytics tool. GitHub and the GitHub logo are trademarks of GitHub, Inc.
          </p>
          <p className="font-mono">
            RepoPulse Health Score is a deterministic diagnostic heuristic.
          </p>
        </div>
      </div>
    </footer>
  );
};
