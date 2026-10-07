import React, { useState } from 'react';
import { ShieldCheck, Info, ChevronDown, ChevronUp, CheckCircle2, AlertTriangle } from 'lucide-react';
import { HealthScoreBreakdown } from '../types';
import { getGradeBadgeStyles } from '../lib/utils';

interface HealthScoreCardProps {
  health: HealthScoreBreakdown;
  title?: string;
  subtitle?: string;
}

export const HealthScoreCard: React.FC<HealthScoreCardProps> = ({
  health,
  title = "RepoPulse Health Score",
  subtitle = "Deterministic 0–100 maintainability scorecard evaluating code recency, documentation, licensing, and community signals."
}) => {
  const [showMethodology, setShowMethodology] = useState(false);
  const badge = getGradeBadgeStyles(health.grade);

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 sm:p-7 shadow-sm flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand/10 border border-brand/20">
                <ShieldCheck className="h-4 w-4 text-brand" />
              </div>
              <h2 className="text-base font-bold text-text-primary tracking-tight">{title}</h2>
              <span className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 text-xs font-mono font-bold ${badge.bg} ${badge.text} ${badge.border}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                Grade {health.grade} • {badge.label}
              </span>
            </div>
            <p className="text-xs text-text-secondary mt-1.5 max-w-xl">{subtitle}</p>
          </div>

          {/* Big Score Gauge */}
          <div className="flex items-baseline gap-1 bg-surface-secondary px-4 py-2 rounded-xl border border-border shrink-0 self-start sm:self-auto">
            <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-text-primary">
              {health.score}
            </span>
            <span className="text-xs font-mono text-text-muted">/100</span>
          </div>
        </div>

        {/* 4-Vector Breakdown Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/60">
          <div className="rounded-xl bg-surface-subtle p-3.5 border border-border/60">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-text-secondary font-medium">Activity</span>
              <span className="font-mono text-text-primary font-bold">{health.activityScore}/30</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-surface-secondary overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${(health.activityScore / 30) * 100}%` }}
              />
            </div>
          </div>

          <div className="rounded-xl bg-surface-subtle p-3.5 border border-border/60">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-text-secondary font-medium">Documentation</span>
              <span className="font-mono text-text-primary font-bold">{health.documentationScore}/25</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-surface-secondary overflow-hidden">
              <div
                className="h-full bg-sky-400 rounded-full transition-all duration-500"
                style={{ width: `${(health.documentationScore / 25) * 100}%` }}
              />
            </div>
          </div>

          <div className="rounded-xl bg-surface-subtle p-3.5 border border-border/60">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-text-secondary font-medium">Stability</span>
              <span className="font-mono text-text-primary font-bold">{health.stabilityScore}/25</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-surface-secondary overflow-hidden">
              <div
                className="h-full bg-purple-400 rounded-full transition-all duration-500"
                style={{ width: `${(health.stabilityScore / 25) * 100}%` }}
              />
            </div>
          </div>

          <div className="rounded-xl bg-surface-subtle p-3.5 border border-border/60">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-text-secondary font-medium">Community</span>
              <span className="font-mono text-text-primary font-bold">{health.communityScore}/20</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-surface-secondary overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${(health.communityScore / 20) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Factors & Diagnostic List */}
        {(health.factors?.positive?.length > 0 || health.factors?.improvements?.length > 0) && (
          <div className="mt-6 pt-5 border-t border-border/60 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {health.factors.positive?.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                  Positive Factors
                </span>
                <div className="space-y-1.5">
                  {health.factors.positive.map((pos, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-text-secondary bg-surface-subtle p-2 rounded-lg border border-border/40">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>{pos}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {health.factors.improvements?.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                  Recommendations
                </span>
                <div className="space-y-1.5">
                  {health.factors.improvements.map((imp, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-text-secondary bg-surface-subtle p-2 rounded-lg border border-border/40">
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
                      <span>{imp}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Methodology Accordion */}
      <div className="mt-6 pt-4 border-t border-border/60">
        <button
          onClick={() => setShowMethodology(!showMethodology)}
          className="flex items-center gap-2 text-xs font-mono text-text-muted hover:text-brand transition-colors focus:outline-none"
        >
          <Info className="h-3.5 w-3.5" />
          <span>How is the RepoPulse Health Score calculated?</span>
          {showMethodology ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {showMethodology && (
          <div className="mt-3 rounded-xl bg-surface-subtle p-4 text-xs text-text-secondary space-y-2.5 border border-border font-mono">
            <p className="text-text-primary font-bold">
              RepoPulse Health Score Diagnostic Methodology:
            </p>
            <ul className="space-y-1 text-text-muted text-[11px] pl-2 list-disc list-inside">
              <li><strong className="text-text-secondary">Activity & Freshness (30%):</strong> Pushed within 14d (+30), 30d (+25), 90d (+18), 180d (+10).</li>
              <li><strong className="text-text-secondary">Documentation (25%):</strong> Description clarity (+10), Open source license (+8), Topics (+4), Homepage (+3).</li>
              <li><strong className="text-text-secondary">Stability & Hygiene (25%):</strong> Primary language detected (+8), non-empty repo (+7), non-archived (+10).</li>
              <li><strong className="text-text-secondary">Community Signals (20%):</strong> Organic stars (+10), active forks (+6), open issues triage (+4).</li>
            </ul>
            <p className="text-[10px] text-text-muted italic pt-2 border-t border-border/40">
              * Independent diagnostic heuristic; not an official GitHub metric.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
