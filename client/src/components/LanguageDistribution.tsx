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
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="flex items-center gap-2 mb-2">
          <Code2 className="h-5 w-5 text-accent" />
          <h2 className="text-base font-semibold text-text-primary">{title}</h2>
        </div>
        <p className="text-xs text-text-secondary">No language statistics detected in public repositories.</p>
      </div>
    );
  }

  // Top languages for detailed chart
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
      color: '#656D76'
    });
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-accent" />
            <h2 className="text-base font-semibold text-text-primary">{title}</h2>
          </div>
          <p className="text-xs text-text-secondary mt-1">{subtitle}</p>
        </div>
        <span className="font-mono text-xs text-text-muted">
          {languages.length} {languages.length === 1 ? 'Language' : 'Languages'}
        </span>
      </div>

      {/* Multi-segment progress bar */}
      <div className="h-2.5 w-full rounded-full flex overflow-hidden bg-surface-secondary mb-6 border border-border/40">
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

      {/* Grid of chart + list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Recharts Donut */}
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
                stroke="#111820"
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
                      <div className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-xs shadow-xl">
                        <div className="flex items-center gap-2 font-medium text-text-primary">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: data.color }}
                          />
                          <span>{data.name}</span>
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-4 text-text-secondary font-mono">
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

        {/* Breakdown List */}
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {languages.map((lang) => (
            <div
              key={lang.name}
              className="flex items-center justify-between text-xs py-1 border-b border-border/30 last:border-0 hover:bg-surface-secondary/40 px-2 rounded transition-colors"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: lang.color }}
                />
                <span className="text-text-primary font-medium truncate">{lang.name}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0 font-mono">
                <span className="text-text-muted text-[11px]">{formatBytes(lang.bytes)}</span>
                <span className="text-text-primary font-medium w-12 text-right">{lang.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
