import { describe, it, expect } from 'vitest';
import { aggregateLanguages, normalizeSingleRepoLanguages } from './languageAnalytics.js';

describe('aggregateLanguages', () => {
  it('correctly calculates percentage breakdown from detailed byte maps', () => {
    const detailedMaps: Record<string, number>[] = [
      { TypeScript: 50000, JavaScript: 25000 },
      { TypeScript: 25000, Python: 25000 }
    ];

    const result = aggregateLanguages(detailedMaps);

    expect(result).toHaveLength(3);
    expect(result[0].name).toBe('TypeScript');
    expect(result[0].bytes).toBe(75000);
    expect(result[0].percentage).toBe(60); // 75000 / 125000 = 60%

    expect(result[1].name).toBe('JavaScript');
    expect(result[1].percentage).toBe(20);

    expect(result[2].name).toBe('Python');
    expect(result[2].percentage).toBe(20);
  });

  it('returns empty array when no languages exist', () => {
    const result = aggregateLanguages([]);
    expect(result).toEqual([]);
  });
});

describe('normalizeSingleRepoLanguages', () => {
  it('normalizes single repo language map into percentages', () => {
    const map = { Rust: 8000, WebAssembly: 2000 };
    const result = normalizeSingleRepoLanguages(map);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe('Rust');
    expect(result[0].percentage).toBe(80);
    expect(result[1].name).toBe('WebAssembly');
    expect(result[1].percentage).toBe(20);
  });
});
