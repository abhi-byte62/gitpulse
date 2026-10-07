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
      label: 'Public Repositories',
      value: formatNumber(stats.totalPublicRepositories),
      subtext: `${stats.repositories} analyzed`,
      icon: BookOpen,
      iconColor: 'text-purple-400'
    },
    {
      label: 'Total Stars',
      value: formatNumber(stats.stars),
      subtext: `Across ${stats.repositories} repos`,
      icon: Star,
      iconColor: 'text-amber-400'
    },
    {
      label: 'Downstream Forks',
      value: formatNumber(stats.forks),
      subtext: 'Ecosystem forks',
      icon: GitFork,
      iconColor: 'text-sky-400'
    },
    {
      label: 'Followers',
      value: formatNumber(followers),
      subtext: 'GitHub community',
      icon: Users,
      iconColor: 'text-emerald-400'
    },
    {
      label: 'Avg Stars / Repo',
      value: insights.averageStarsPerRepo.toString(),
      subtext: 'Popularity density',
      icon: Activity,
      iconColor: 'text-rose-400'
    },
    {
      label: 'Freshness Rate',
      value: `${insights.maintenanceRate}%`,
      subtext: 'Pushed in 6 mos',
      icon: Percent,
      iconColor: insights.maintenanceRate >= 60 ? 'text-brand' : 'text-amber-400'
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="rounded-2xl border border-border bg-surface p-4 flex flex-col justify-between hover:border-brand/40 hover:bg-surface-subtle transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-medium text-text-muted">{card.label}</span>
              <Icon className={`h-4 w-4 ${card.iconColor}`} />
            </div>
            <div>
              <div className="text-2xl font-extrabold font-mono text-text-primary tracking-tight">
                {card.value}
              </div>
              <div className="text-[11px] font-mono text-text-muted mt-1 truncate">
                {card.subtext}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
