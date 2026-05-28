import { describe, it, expect } from 'vitest';
import {
  buildWarmupCircuit,
  computeReactionStat,
  advanceWarmupStreak,
} from '../warmup';
import { eloToDifficulty, BASE_ELO } from '../difficulty';
import { EXERCISES } from '../exercises';
import { getDefaultProfile } from '../storage';
import type { ExerciseResult, UserProfile } from '../types';

function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return { ...getDefaultProfile(), ...overrides };
}

function makeResult(over: Partial<ExerciseResult> = {}): ExerciseResult {
  return {
    exerciseId: 'speed-match',
    skill: 'reaction-time',
    score: 80,
    accuracy: 0.8,
    responseTimeMs: 600,
    difficulty: 3,
    timestamp: Date.now(),
    sessionId: 'warmup-1',
    ...over,
  };
}

const DAY = 24 * 60 * 60 * 1000;

describe('buildWarmupCircuit', () => {
  it('includes exactly one round of every exercise', () => {
    const circuit = buildWarmupCircuit(makeProfile());
    expect(circuit).toHaveLength(EXERCISES.length);
    const ids = circuit.map(s => s.exerciseId).sort();
    const expected = EXERCISES.map(e => e.id).sort();
    expect(ids).toEqual(expected);
  });

  it('scales each step difficulty to the exercise ELO', () => {
    const profile = makeProfile({
      difficultyStates: {
        'speed-match': {
          exerciseId: 'speed-match',
          currentDifficulty: 1,
          consecutiveCorrect: 0,
          consecutiveWrong: 0,
          elo: BASE_ELO + 400,
        },
      },
    });
    const circuit = buildWarmupCircuit(profile);
    const speed = circuit.find(s => s.exerciseId === 'speed-match')!;
    expect(speed.difficulty).toBe(eloToDifficulty(BASE_ELO + 400, 1, 10));
    expect(speed.difficulty).toBe(5);
  });

  it('defaults unrated exercises to the base (level 1) difficulty', () => {
    const circuit = buildWarmupCircuit(makeProfile());
    expect(circuit.every(s => s.difficulty === 1)).toBe(true);
  });

  it('produces the same order for the same rng sequence, but still a full permutation', () => {
    const seeded = () => {
      // A fixed, repeatable pseudo-random sequence.
      let i = 0;
      const seq = [0.1, 0.9, 0.4, 0.7, 0.2, 0.5, 0.8];
      return () => seq[i++ % seq.length];
    };
    const a = buildWarmupCircuit(makeProfile(), seeded());
    const b = buildWarmupCircuit(makeProfile(), seeded());
    expect(a.map(s => s.exerciseId)).toEqual(b.map(s => s.exerciseId));
    expect(a.map(s => s.exerciseId).sort()).toEqual(EXERCISES.map(e => e.id).sort());
  });
});

describe('computeReactionStat', () => {
  const now = Date.parse('2026-05-28T12:00:00Z');

  it('returns nulls when there are no warm-up results', () => {
    const stat = computeReactionStat(makeProfile(), now);
    expect(stat.todayAvgMs).toBeNull();
    expect(stat.baselineAvgMs).toBeNull();
    expect(stat.deltaMs).toBeNull();
    expect(stat.improved).toBe(false);
  });

  it('ignores non-warm-up results', () => {
    const profile = makeProfile({
      results: [makeResult({ sessionId: 'session-1', timestamp: now })],
    });
    expect(computeReactionStat(profile, now).todayAvgMs).toBeNull();
  });

  it('flags improvement when today is faster than the 7-day baseline', () => {
    const profile = makeProfile({
      results: [
        makeResult({ responseTimeMs: 400, timestamp: now }),
        makeResult({ responseTimeMs: 800, timestamp: now - 2 * DAY }),
        makeResult({ responseTimeMs: 600, timestamp: now - 3 * DAY }),
      ],
    });
    const stat = computeReactionStat(profile, now);
    expect(stat.todayAvgMs).toBe(400);
    expect(stat.baselineAvgMs).toBe(700);
    expect(stat.deltaMs).toBe(-300);
    expect(stat.improved).toBe(true);
  });

  it('excludes results older than 7 days from the baseline', () => {
    const profile = makeProfile({
      results: [
        makeResult({ responseTimeMs: 500, timestamp: now }),
        makeResult({ responseTimeMs: 900, timestamp: now - 10 * DAY }),
      ],
    });
    const stat = computeReactionStat(profile, now);
    expect(stat.baselineAvgMs).toBeNull();
  });
});

describe('advanceWarmupStreak', () => {
  it('starts a streak at 1 with no prior warm-up', () => {
    const result = advanceWarmupStreak(makeProfile(), '2026-05-28', '2026-05-27');
    expect(result.warmupStreak).toBe(1);
    expect(result.longestWarmupStreak).toBe(1);
    expect(result.lastWarmupDate).toBe('2026-05-28');
  });

  it('increments when the last warm-up was yesterday', () => {
    const profile = makeProfile({ warmupStreak: 4, longestWarmupStreak: 4, lastWarmupDate: '2026-05-27' });
    const result = advanceWarmupStreak(profile, '2026-05-28', '2026-05-27');
    expect(result.warmupStreak).toBe(5);
    expect(result.longestWarmupStreak).toBe(5);
  });

  it('resets to 1 after a missed day', () => {
    const profile = makeProfile({ warmupStreak: 9, longestWarmupStreak: 9, lastWarmupDate: '2026-05-25' });
    const result = advanceWarmupStreak(profile, '2026-05-28', '2026-05-27');
    expect(result.warmupStreak).toBe(1);
    expect(result.longestWarmupStreak).toBe(9);
  });

  it('is idempotent when already warmed up today', () => {
    const profile = makeProfile({ warmupStreak: 3, longestWarmupStreak: 7, lastWarmupDate: '2026-05-28' });
    const result = advanceWarmupStreak(profile, '2026-05-28', '2026-05-27');
    expect(result.warmupStreak).toBe(3);
    expect(result.longestWarmupStreak).toBe(7);
  });
});
