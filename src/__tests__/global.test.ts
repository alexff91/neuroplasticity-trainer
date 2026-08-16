import { describe, it, expect } from 'vitest';
import {
  fetchGlobal,
  isIllustrative,
  compareToGlobal,
  ILLUSTRATIVE_SKILL_REFERENCE,
  type GlobalAggregate,
} from '../global';
import { getDefaultProfile } from '../storage';

describe('global aggregate without a backend', () => {
  it('reports no community activity rather than invented totals', async () => {
    const aggregate = await fetchGlobal();
    expect(aggregate.source).toBe('seed');
    expect(aggregate.totalUsers).toBe(0);
    expect(aggregate.totalExercises).toBe(0);
    expect(aggregate.totalSessions).toBe(0);
    expect(aggregate.top).toEqual([]);
  });

  it('uses one flat reference value for every skill, not per-skill averages', async () => {
    const aggregate = await fetchGlobal();
    const values = Object.values(aggregate.skillAverages);
    expect(values.length).toBeGreaterThan(0);
    expect(new Set(values)).toEqual(new Set([ILLUSTRATIVE_SKILL_REFERENCE]));
  });

  it('is flagged illustrative so the UI can label it', async () => {
    expect(isIllustrative(await fetchGlobal())).toBe(true);
    expect(isIllustrative(null)).toBe(true);
    expect(isIllustrative({ source: 'live' } as GlobalAggregate)).toBe(false);
    expect(isIllustrative({ source: 'cache' } as GlobalAggregate)).toBe(false);
  });

  it('still produces a comparison row per skill so the feature works', async () => {
    const rows = compareToGlobal(getDefaultProfile(), await fetchGlobal());
    expect(rows).toHaveLength(6);
    for (const row of rows) {
      expect(row.global).toBe(ILLUSTRATIVE_SKILL_REFERENCE);
      expect(row.user).toBe(0);
    }
  });
});
