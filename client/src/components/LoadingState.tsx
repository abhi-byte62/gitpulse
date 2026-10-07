import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
  username?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ username }) => {
  const [step, setStep] = useState(0);

  const steps = [
    username ? `Fetching GitHub profile for @${username}...` : 'Connecting to GitHub API...',
    'Loading repositories and commit metadata...',
    'Analyzing language byte distributions...',
    'Calculating RepoPulse Health score and diagnostics...'
  ];

  useEffect(() => {
    const timer1 = setTimeout(() => setStep(1), 400);
    const timer2 = setTimeout(() => setStep(2), 900);
    const timer3 = setTimeout(() => setStep(3), 1400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      {/* Spinner */}
      <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-surface border border-border shadow-lg mb-6">
        <Loader2 className="h-6 w-6 text-accent animate-spin" />
      </div>

      <h2 className="text-xl font-bold tracking-tight text-text-primary">
        Analyzing GitHub Intelligence
      </h2>
      <p className="text-sm text-text-secondary mt-1 max-w-md mx-auto">
        Querying real-time GitHub REST APIs and calculating repository metrics.
      </p>

      {/* Progressive Step Indicators */}
      <div className="mt-8 rounded-xl border border-border bg-surface p-6 text-left space-y-3.5 shadow-sm">
        {steps.map((text, idx) => {
          const isDone = idx < step;
          const isCurrent = idx === step;

          return (
            <div key={idx} className="flex items-center gap-3 text-xs">
              {isDone ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              ) : isCurrent ? (
                <Loader2 className="h-4 w-4 text-accent animate-spin shrink-0" />
              ) : (
                <div className="h-4 w-4 rounded-full border border-border shrink-0" />
              )}
              <span
                className={
                  isDone
                    ? 'text-text-muted line-through font-mono'
                    : isCurrent
                    ? 'text-text-primary font-medium font-mono'
                    : 'text-text-muted font-mono'
                }
              >
                {text}
              </span>
            </div>
          );
        })}
      </div>

      {/* Skeleton cards preview */}
      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 animate-pulse opacity-40">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-surface border border-border" />
        ))}
      </div>
    </div>
  );
};
