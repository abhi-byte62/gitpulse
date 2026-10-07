import { LanguageStats } from '../types/index.js';
import { getLanguageColor } from '../utils/languageColors.js';

export interface RawRepoLanguageSummary {
  language: string | null;
  size?: number; // size in KB
}

/**
 * Aggregates language usage by percentage.
 * Accepts either:
 * 1. An array of language-byte maps (from GitHub's /repos/{owner}/{repo}/languages)
 * 2. Or falls back to aggregating repository primary languages by repo size
 */
export function aggregateLanguages(
  detailedLanguageMaps: Record<string, number>[],
  fallbackRepos: RawRepoLanguageSummary[] = []
): LanguageStats[] {
  const languageTotals: Record<string, number> = {};

  if (detailedLanguageMaps.length > 0) {
    for (const langMap of detailedLanguageMaps) {
      for (const [language, bytes] of Object.entries(langMap)) {
        if (typeof bytes === 'number' && bytes > 0) {
          languageTotals[language] = (languageTotals[language] || 0) + bytes;
        }
      }
    }
  } else if (fallbackRepos.length > 0) {
    for (const repo of fallbackRepos) {
      if (repo.language) {
        // Fallback: estimate bytes from repo size in KB (size * 1024)
        const bytes = Math.max(1024, (repo.size || 1) * 1024);
        languageTotals[repo.language] = (languageTotals[repo.language] || 0) + bytes;
      }
    }
  }

  const totalBytes = Object.values(languageTotals).reduce((sum, b) => sum + b, 0);

  if (totalBytes === 0) {
    return [];
  }

  const sortedLanguages = Object.entries(languageTotals)
    .map(([name, bytes]) => ({
      name,
      bytes,
      percentage: Number(((bytes / totalBytes) * 100).toFixed(1)),
      color: getLanguageColor(name)
    }))
    .sort((a, b) => b.bytes - a.bytes);

  return sortedLanguages;
}

/**
 * Normalizes a single repository's language map into an ordered percentage breakdown.
 */
export function normalizeSingleRepoLanguages(languagesMap: Record<string, number>): LanguageStats[] {
  const totalBytes = Object.values(languagesMap).reduce((sum, b) => sum + b, 0);

  if (totalBytes === 0) {
    return [];
  }

  return Object.entries(languagesMap)
    .map(([name, bytes]) => ({
      name,
      bytes,
      percentage: Number(((bytes / totalBytes) * 100).toFixed(1)),
      color: getLanguageColor(name)
    }))
    .sort((a, b) => b.bytes - a.bytes);
}
