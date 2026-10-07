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
  subtitle = "Algorithmic repository health evaluation based on freshness, documentation, hygiene, and community signals."
}) => {
  const [showMethodology, setShowMethodology] = useState(false);
  const badge = getGradeBadgeStyles(health.grade);

  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-accent" />
            <h2 className="text-base font-semibold text-text-primary">{title}</h2>
            <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-mono font-bold ${badge.bg} ${badge.text} ${badge.border}`}>
              Grade {health.grade} • {badge.label}
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">{subtitle}</p>
        </div>

        {/* Big Score Gauge */}
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold font-mono tracking-tight text-text-primary">
            {health.score}
          </span>
          <span className="text-sm font-mono text-text-muted">/100</span>
        </div>
      </div>

      {/* Metric Breakdown Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border/60">
        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-text-secondary">Activity & Freshness</span>
            <span className="font-mono text-text-primary font-medium">{health.activityScore}/30</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-surface-secondary overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${(health.activityScore / 30) * 100}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-text-secondary">Documentation</span>
            <span className="font-mono text-text-primary font-medium">{health.documentationScore}/25</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-surface-secondary overflow-hidden">
            <div
              className="h-full bg-blue-400 rounded-full transition-all duration-500"
              style={{ width: `${(health.documentationScore / 25) * 100}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-text-secondary">Stability & Setup</span>
            <span className="font-mono text-text-primary font-medium">{health.stabilityScore}/25</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-surface-secondary overflow-hidden">
            <div
              className="h-full bg-purple-400 rounded-full transition-all duration-500"
              style={{ width: `${(health.stabilityScore / 25) * 100}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-text-secondary">Community Signals</span>
            <span className="font-mono text-text-primary font-medium">{health.communityScore}/20</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-surface-secondary overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${(health.communityScore / 20) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Factors / Diagnostics tags if available */}
      {(health.factors?.positive?.length > 0 || health.factors?.improvements?.length > 0) && (
        <div className="mt-5 pt-4 border-t border-border/40 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {health.factors.positive?.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium text-emerald-400 uppercase tracking-wider">Strengths</span>
              {health.factors.positive.map((pos, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-text-secondary">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>{pos}</span>
                </div>
              ))}
            </div>
          )}
          {health.factors.improvements?.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-medium text-amber-400 uppercase tracking-wider">Recommendations</span>
              {health.factors.improvements.map((imp, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-text-secondary">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400 mt-0.5 shrink-0" />
                  <span>{imp}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Methodology Accordion */}
      <div className="mt-4 pt-3 border-t border-border/40">
        <button
          onClick={() => setShowMethodology(!showMethodology)}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-primary transition-colors focus:outline-none"
        >
          <Info className="h-3.5 w-3.5 text-accent" />
          <span>How is the RepoPulse Health Score calculated?</span>
          {showMethodology ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>

        {showMethodology && (
          <div className="mt-3 rounded-lg bg-surface-secondary p-4 text-xs text-text-secondary space-y-2 border border-border">
            <p>
              <strong className="text-text-primary">RepoPulse Health Score</strong> is a transparent, deterministic heuristic designed to evaluate repository maintainability and project health:
            </p>
            <ul className="list-disc list-inside space-y-1 text-text-muted pl-1">
              <li><strong className="text-text-secondary">Activity & Freshness (30%):</strong> Pushed within 14 days (+30), 30 days (+25), 90 days (+18), 180 days (+10).</li>
              <li><strong className="text-text-secondary">Documentation (25%):</strong> Description clarity (+10), Open source license (+8), Topics (+4), Homepage (+3).</li>
              <li><strong className="text-text-secondary">Stability & Hygiene (25%):</strong> Primary language detected (+8), non-empty repo (+7), non-archived status (+10).</li>
              <li><strong className="text-text-secondary">Community Signals (20%):</strong> Organic stars (+10), active forks (+6), open issues & watchers (+4).</li>
            </ul>
            <p className="text-[11px] text-text-muted italic pt-1 border-t border-border/50">
              * Note: RepoPulse Health Score is an independent diagnostic heuristic and is not an official GitHub rating.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
