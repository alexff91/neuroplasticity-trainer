import { describe, it, expect } from 'vitest';
import { migrateProfile, getDefaultProfile, CURRENT_SCHEMA_VERSION } from '../storage';

describe('migrateProfile', () => {
  it('returns a full default profile from garbage input', () => {
    for (const garbage of [null, undefined, 42, 'nope', [], {}]) {
      const p = migrateProfile(garbage);
      expect(p).toMatchObject({
        totalSessions: 0,
        results: [],
        dailyLogs: [],
        achievements: [],
        difficultyStates: {},
      });
    }
  });

  it('migrates a legacy bare profile (no envelope, no warm-up fields)', () => {
    const legacy = {
      createdAt: 123,
      totalSessions: 3,
      totalExercises: 12,
      currentStreak: 2,
      longestStreak: 5,
      lastSessionDate: '2026-06-01',
      achievements: ['first-session'],
      difficultyStates: {},
      dailyLogs: [],
      results: [],
    };
    const p = migrateProfile(legacy);
    expect(p.totalSessions).toBe(3);
    expect(p.currentStreak).toBe(2);
    // Backfilled fields added after this profile was first saved:
    expect(p.warmupStreak).toBe(0);
    expect(p.longestWarmupStreak).toBe(0);
    expect(p.lastWarmupDate).toBeNull();
  });

  it('unwraps a versioned envelope', () => {
    const profile = { ...getDefaultProfile(), totalExercises: 99 };
    const p = migrateProfile({ schemaVersion: CURRENT_SCHEMA_VERSION, profile });
    expect(p.totalExercises).toBe(99);
  });

  it('drops malformed result records but keeps valid ones', () => {
    const p = migrateProfile({
      ...getDefaultProfile(),
      results: [
        { exerciseId: 'n-back', skill: 'working-memory', score: 80, accuracy: 0.8, responseTimeMs: 500, difficulty: 3, timestamp: 1000, sessionId: 's1' },
        { exerciseId: 'n-back' }, // missing required fields -> dropped
        null,
        'not an object',
        { exerciseId: 'speed-match', skill: 'reaction-time', timestamp: 2000 }, // minimal valid
      ],
    });
    expect(p.results).toHaveLength(2);
    expect(p.results[0].exerciseId).toBe('n-back');
    // defaults are filled for the minimal-but-valid record
    expect(p.results[1].score).toBe(0);
    expect(p.results[1].sessionId).toBe('unknown');
  });

  it('coerces invalid scalars to safe defaults', () => {
    const p = migrateProfile({
      ...getDefaultProfile(),
      totalSessions: -5,
      currentStreak: 'lots',
      createdAt: NaN,
      lastSessionDate: 123,
    });
    expect(p.totalSessions).toBe(0);
    expect(p.currentStreak).toBe(0);
    expect(Number.isFinite(p.createdAt)).toBe(true);
    expect(p.lastSessionDate).toBeNull();
  });

  it('sanitizes difficulty states and ignores non-object entries', () => {
    const p = migrateProfile({
      ...getDefaultProfile(),
      difficultyStates: {
        'n-back': { currentDifficulty: 4, elo: 1300 },
        bogus: 'nope',
      },
    });
    expect(p.difficultyStates['n-back']).toEqual({
      exerciseId: 'n-back',
      currentDifficulty: 4,
      consecutiveCorrect: 0,
      consecutiveWrong: 0,
      elo: 1300,
    });
    expect(p.difficultyStates.bogus).toBeUndefined();
  });

  it('trims results to the retention cap', () => {
    const many = Array.from({ length: 600 }, (_, i) => ({
      exerciseId: 'n-back', skill: 'working-memory', score: 50, accuracy: 0.5,
      responseTimeMs: 100, difficulty: 1, timestamp: i, sessionId: 's',
    }));
    const p = migrateProfile({ ...getDefaultProfile(), results: many });
    expect(p.results).toHaveLength(500);
    // keeps the most recent ones
    expect(p.results[p.results.length - 1].timestamp).toBe(599);
  });
});
