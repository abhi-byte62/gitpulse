import React from 'react';
import { Terminal, Shield, ExternalLink, Activity } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-border/80 bg-surface-subtle/60 py-12 mt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1 */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-brand/10 border border-brand/20">
                <span className="font-mono text-[10px] font-bold text-brand">RP</span>
              </div>
              <span className="font-bold tracking-tight text-text-primary">RepoPulse</span>
              <span className="rounded bg-surface-secondary px-1.5 py-0.5 text-[10px] font-mono text-text-muted border border-border">
                v1.0.0
              </span>
            </div>
            <p className="text-xs text-text-secondary max-w-md leading-relaxed">
              GitHub repository intelligence for developers. Real-time telemetry, byte-level language analytics, and algorithmic maintainability scores built for modern engineering teams.
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-2.5 text-xs">
            <span className="font-mono uppercase tracking-wider text-[10px] text-text-muted block">Architecture</span>
            <div className="space-y-1.5 text-text-secondary font-mono">
              <div className="flex items-center gap-1.5">
                <Shield className="h-3 w-3 text-brand" />
                <span>Zero Client Tokens</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Terminal className="h-3 w-3 text-sky-400" />
                <span>LRU Cached Backend</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Activity className="h-3 w-3 text-emerald-400" />
                <span>Octokit REST Engine</span>
              </div>
            </div>
          </div>

          {/* Col 3 */}
          <div className="space-y-2.5 text-xs">
            <span className="font-mono uppercase tracking-wider text-[10px] text-text-muted block">Resources</span>
            <div className="space-y-1.5">
              <a
                href="https://docs.github.com/en/rest"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-text-secondary hover:text-text-primary transition-colors font-mono"
              >
                <span>GitHub REST API</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href="https://github.com/abhi-byte62/gitpulse"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 text-text-secondary hover:text-text-primary transition-colors font-mono"
              >
                <span>Repository Source</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom divider bar */}
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-text-muted font-mono">
          <p>
            RepoPulse is an independent developer product. Not affiliated with or endorsed by GitHub, Inc.
          </p>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-brand" />
            <span>Systems Normal</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
