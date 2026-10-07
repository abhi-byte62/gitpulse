import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Code2 } from 'lucide-react';
import { LanguageStats } from '../types';
import { formatBytes } from '../lib/utils';

interface LanguageDistributionProps {
  languages: LanguageStats[];
  title?: string;
  subtitle?: string;
}

export const LanguageDistribution: React.FC<LanguageDistributionProps> = ({
  languages,
  title = "Language Distribution",
  subtitle = "Aggregated byte-level language breakdown across repositories."
}) => {
  if (!languages || languages.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-6">
        <div className="flex items-center gap-2 mb-2">
          <Code2 className="h-5 w-5 text-brand" />
          <h2 className="text-base font-bold text-text-primary">{title}</h2>
        </div>
        <p className="text-xs text-text-secondary">No language statistics detected in public repositories.</p>
      </div>
    );
  }

  const chartData = languages.slice(0, 6).map(lang => ({
    name: lang.name,
    value: lang.bytes,
    percentage: lang.percentage,
    color: lang.color
  }));

  const otherBytes = languages.slice(6).reduce((acc, l) => acc + l.bytes, 0);
  if (otherBytes > 0) {
    const totalBytes = languages.reduce((acc, l) => acc + l.bytes, 0);
    chartData.push({
      name: 'Other',
      value: otherBytes,
      percentage: Number(((otherBytes / totalBytes) * 100).toFixed(1)),
      color: '#64748B'
    });
  }

  return (
    <div className="rounded-2xl border border-border bg-surface p-6 sm:p-7 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/20">
                <Code2 className="h-4 w-4 text-sky-400" />
              </div>
              <h2 className="text-base font-bold text-text-primary tracking-tight">{title}</h2>
            </div>
            <p className="text-xs text-text-secondary mt-1">{subtitle}</p>
          </div>
          <span className="font-mono text-xs font-semibold text-text-muted bg-surface-secondary px-2.5 py-1 rounded-lg border border-border">
            {languages.length} {languages.length === 1 ? 'Language' : 'Languages'}
          </span>
        </div>

        {/* Multi-segment progress bar */}
        <div className="h-2 w-full rounded-full flex overflow-hidden bg-surface-secondary mb-6 border border-border/40">
          {languages.map((lang) => (
            <div
              key={lang.name}
              title={`${lang.name}: ${lang.percentage}% (${formatBytes(lang.bytes)})`}
              style={{
                width: `${lang.percentage}%`,
                backgroundColor: lang.color
              }}
              className="h-full transition-all duration-300 hover:opacity-80"
            />
          ))}
        </div>

        {/* Chart + Table */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="#0E1117"
                  strokeWidth={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-border bg-surface-elevated px-3 py-2 text-xs shadow-xl font-mono">
                          <div className="flex items-center gap-2 font-bold text-text-primary">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: data.color }}
                            />
                            <span>{data.name}</span>
                          </div>
                          <div className="mt-1 flex items-center justify-between gap-4 text-text-secondary text-[11px]">
                            <span>{data.percentage}%</span>
                            <span>{formatBytes(data.value)}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {languages.map((lang) => (
              <div
                key={lang.name}
                className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-surface-subtle border border-border/40 hover:border-border transition-colors font-mono"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: lang.color }}
                  />
                  <span className="text-text-primary font-medium truncate">{lang.name}</span>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="text-text-muted text-[10px]">{formatBytes(lang.bytes)}</span>
                  <span className="text-text-primary font-bold">{lang.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
