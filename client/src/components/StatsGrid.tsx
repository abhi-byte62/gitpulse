import React from 'react';
import { Star, GitFork, Users, BookOpen, Activity, Percent } from 'lucide-react';
import { DeveloperStats, DeveloperInsights } from '../types';
import { formatNumber } from '../lib/utils';

interface StatsGridProps {
  stats: DeveloperStats;
  insights: DeveloperInsights;
  followers: number;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats, insights, followers }) => {
  const cards = [
    {
      label: 'Total Stars',
      value: formatNumber(stats.stars),
      subtext: `Across ${stats.repositories} repositories`,
      icon: Star,
      color: 'text-amber-400'
    },
    {
      label: 'Total Forks',
      value: formatNumber(stats.forks),
      subtext: 'Downstream adoption',
      icon: GitFork,
      color: 'text-blue-400'
    },
    {
      label: 'Public Repos',
      value: formatNumber(stats.totalPublicRepositories),
      subtext: `${stats.repositories} analyzed`,
      icon: BookOpen,
      color: 'text-purple-400'
    },
    {
      label: 'Followers',
      value: formatNumber(followers),
      subtext: 'GitHub community',
      icon: Users,
      color: 'text-emerald-400'
    },
    {
      label: 'Avg Stars / Repo',
      value: insights.averageStarsPerRepo.toString(),
      subtext: 'Popularity density',
      icon: Activity,
      color: 'text-rose-400'
    },
    {
      label: 'Maintenance Rate',
      value: `${insights.maintenanceRate}%`,
      subtext: 'Updated in last 6 mos',
      icon: Percent,
      color: insights.maintenanceRate >= 60 ? 'text-emerald-400' : 'text-amber-400'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="rounded-xl border border-border bg-surface p-4 flex flex-col justify-between hover:border-border-active transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-text-secondary">{card.label}</span>
              <Icon className={`h-4 w-4 ${card.color}`} />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-text-primary tracking-tight">
                {card.value}
              </div>
              <div className="text-[11px] text-text-muted mt-0.5 truncate">
                {card.subtext}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
