import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  eloToDifficulty,
  updateDifficulty,
  rankExercisesForSession,
  interleaveExercises,
  getOrCreateDifficultyState,
  BASE_ELO,
  K_FACTOR,
} from '../difficulty';
import { getDefaultProfile } from '../storage';
import type { DifficultyState, ExerciseResult, UserProfile } from '../types';

function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return { ...getDefaultProfile(), ...overrides };
}

function makeState(over: Partial<DifficultyState> = {}): DifficultyState {
  return {
    exerciseId: 'speed-match',
    currentDifficulty: 1,
    consecutiveCorrect: 0,
    consecutiveWrong: 0,
    elo: BASE_ELO,
    ...over,
  };
}

function makeResult(over: Partial<ExerciseResult> = {}): ExerciseResult {
  return {
    exerciseId: 'speed-match',
    skill: 'reaction-time',
    score: 80,
    accuracy: 0.8,
    responseTimeMs: 2000,
    difficulty: 1,
    timestamp: Date.now(),
    sessionId: 'session-1',
    ...over,
  };
}

const HOUR = 60 * 60 * 1000;

describe('eloToDifficulty', () => {
  it('maps the base ELO to difficulty level 1', () => {
    expect(eloToDifficulty(BASE_ELO, 1, 10)).toBe(1);
  });

  it('adds one difficulty level per 100 ELO above base', () => {
    expect(eloToDifficulty(BASE_ELO + 100, 1, 10)).toBe(2);
    expect(eloToDifficulty(BASE_ELO + 500, 1, 10)).toBe(6);
  });

  it('rounds to the nearest level', () => {
    expect(eloToDifficulty(BASE_ELO + 149, 1, 10)).toBe(2);
    expect(eloToDifficulty(BASE_ELO + 150, 1, 10)).toBe(3);
  });

  it('clamps to the maximum difficulty', () => {
    expect(eloToDifficulty(BASE_ELO + 5000, 1, 10)).toBe(10);
  });

  it('clamps to the minimum difficulty', () => {
    expect(eloToDifficulty(BASE_ELO - 5000, 1, 10)).toBe(1);
    expect(eloToDifficulty(BASE_ELO - 5000, 3, 10)).toBe(3);
  });
});

describe('updateDifficulty', () => {
  it('raises ELO when the user outperforms the expectation for the level', () => {
    // At difficulty 1 with a base rating the expected score is 0.5, so a 90%
    // run should gain roughly K * (0.9 - 0.5) points.
    const next = updateDifficulty(makeState(), makeResult({ accuracy: 0.9 }), 1, 10);
    expect(next.elo).toBeGreaterThan(BASE_ELO);
    expect(next.elo).toBeCloseTo(BASE_ELO + K_FACTOR * (0.9 - 0.5), 5);
  });

  it('lowers ELO when the user underperforms the expectation', () => {
    const next = updateDifficulty(makeState(), makeResult({ accuracy: 0.2 }), 1, 10);
    expect(next.elo).toBeLessThan(BASE_ELO);
  });

  it('adds a speed bonus only for fast, high-accuracy runs', () => {
    const slow = updateDifficulty(makeState(), makeResult({ accuracy: 0.95, responseTimeMs: 2000 }), 1, 10);
    const fast = updateDifficulty(makeState(), makeResult({ accuracy: 0.95, responseTimeMs: 400 }), 1, 10);
    expect(fast.elo - slow.elo).toBeCloseTo(5, 5);

    // Fast but inaccurate earns no bonus.
    const sloppySlow = updateDifficulty(makeState(), makeResult({ accuracy: 0.75, responseTimeMs: 2000 }), 1, 10);
    const sloppyFast = updateDifficulty(makeState(), makeResult({ accuracy: 0.75, responseTimeMs: 100 }), 1, 10);
    expect(sloppyFast.elo).toBeCloseTo(sloppySlow.elo, 5);
  });

  it('clamps ELO to the allowed band in both directions', () => {
    let state = makeState({ elo: BASE_ELO + 895, currentDifficulty: 10 });
    for (let i = 0; i < 20; i++) {
      state = updateDifficulty(state, makeResult({ accuracy: 1 }), 1, 10);
    }
    expect(state.elo).toBeLessThanOrEqual(BASE_ELO + 900);

    let low = makeState({ elo: BASE_ELO - 195 });
    for (let i = 0; i < 20; i++) {
      low = updateDifficulty(low, makeResult({ accuracy: 0 }), 1, 10);
    }
    expect(low.elo).toBeGreaterThanOrEqual(BASE_ELO - 200);
  });

  it('counts a run at or above 70% accuracy as a success streak', () => {
    const success = updateDifficulty(makeState({ consecutiveCorrect: 2, consecutiveWrong: 1 }), makeResult({ accuracy: 0.7 }), 1, 10);
    expect(success.consecutiveCorrect).toBe(3);
    expect(success.consecutiveWrong).toBe(0);
  });

  it('resets the success streak and counts a failure below 70%', () => {
    const failure = updateDifficulty(makeState({ consecutiveCorrect: 4, consecutiveWrong: 0 }), makeResult({ accuracy: 0.69 }), 1, 10);
    expect(failure.consecutiveCorrect).toBe(0);
    expect(failure.consecutiveWrong).toBe(1);
  });

  it('bumps difficulty on a hot streak even when the ELO has not caught up', () => {
    // Two wins already banked; a third high-accuracy run should force a step up.
    const state = makeState({ currentDifficulty: 4, consecutiveCorrect: 2, elo: BASE_ELO });
    const next = updateDifficulty(state, makeResult({ accuracy: 0.95 }), 1, 10);
    expect(next.consecutiveCorrect).toBe(3);
    expect(next.currentDifficulty).toBe(5);
  });

  it('eases off after a very poor run', () => {
    const state = makeState({ currentDifficulty: 6, elo: BASE_ELO + 500 });
    const next = updateDifficulty(state, makeResult({ accuracy: 0.3 }), 1, 10);
    expect(next.currentDifficulty).toBe(5);
  });

  it('eases off after three consecutive failures even if each one is mild', () => {
    const state = makeState({ currentDifficulty: 6, elo: BASE_ELO + 500, consecutiveWrong: 2 });
    const next = updateDifficulty(state, makeResult({ accuracy: 0.5 }), 1, 10);
    expect(next.consecutiveWrong).toBe(3);
    expect(next.currentDifficulty).toBe(5);
  });

  it('never leaves the exercise difficulty range', () => {
    const top = updateDifficulty(makeState({ currentDifficulty: 10, elo: BASE_ELO + 900, consecutiveCorrect: 5 }), makeResult({ accuracy: 1 }), 1, 10);
    expect(top.currentDifficulty).toBeLessThanOrEqual(10);

    const bottom = updateDifficulty(makeState({ currentDifficulty: 1, elo: BASE_ELO - 200, consecutiveWrong: 5 }), makeResult({ accuracy: 0 }), 1, 10);
    expect(bottom.currentDifficulty).toBeGreaterThanOrEqual(1);

    const narrow = updateDifficulty(makeState({ currentDifficulty: 3 }), makeResult({ accuracy: 0 }), 3, 5);
    expect(narrow.currentDifficulty).toBe(3);
  });

  it('keeps the exercise id it was given', () => {
    const next = updateDifficulty(makeState({ exerciseId: 'n-back' }), makeResult(), 1, 10);
    expect(next.exerciseId).toBe('n-back');
  });

  it('does not mutate the state it is handed', () => {
    const state = makeState();
    const snapshot = { ...state };
    updateDifficulty(state, makeResult({ accuracy: 1 }), 1, 10);
    expect(state).toEqual(snapshot);
  });

  it('converges upward over a run of strong results and settles at the cap', () => {
    let state = getOrCreateDifficultyState(makeProfile(), 'n-back');
    for (let i = 0; i < 60; i++) {
      state = updateDifficulty(state, makeResult({ exerciseId: 'n-back', accuracy: 1, responseTimeMs: 500 }), 1, 10);
    }
    expect(state.currentDifficulty).toBe(10);
    expect(state.elo).toBeLessThanOrEqual(BASE_ELO + 900);
  });
});

describe('rankExercisesForSession', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns every exercise it was given, exactly once', () => {
    const ids = ['a', 'b', 'c', 'd'];
    const ranked = rankExercisesForSession(makeProfile(), ids);
    expect(ranked).toHaveLength(ids.length);
    expect([...ranked].sort()).toEqual([...ids].sort());
  });

  it('puts never-tried exercises ahead of practised ones', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0); // remove the jitter
    const profile = makeProfile({
      results: [
        makeResult({ exerciseId: 'practised', accuracy: 0.7, timestamp: Date.now() - 48 * HOUR }),
        makeResult({ exerciseId: 'practised', accuracy: 0.7, timestamp: Date.now() - 47 * HOUR }),
        makeResult({ exerciseId: 'practised', accuracy: 0.7, timestamp: Date.now() - 46 * HOUR }),
      ],
    });
    const ranked = rankExercisesForSession(profile, ['practised', 'fresh']);
    expect(ranked[0]).toBe('fresh');
  });

  it('prefers the exercise last practised longer ago', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const profile = makeProfile({
      results: [
        makeResult({ exerciseId: 'stale', timestamp: Date.now() - 72 * HOUR }),
        makeResult({ exerciseId: 'justdone', timestamp: Date.now() - 1 * HOUR }),
      ],
    });
    const ranked = rankExercisesForSession(profile, ['justdone', 'stale']);
    expect(ranked[0]).toBe('stale');
  });

  it('prefers exercises sitting in the 70% desirable-difficulty zone', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const ts = Date.now() - 48 * HOUR;
    const three = (id: string, accuracy: number) => [
      makeResult({ exerciseId: id, accuracy, timestamp: ts }),
      makeResult({ exerciseId: id, accuracy, timestamp: ts }),
      makeResult({ exerciseId: id, accuracy, timestamp: ts }),
    ];
    const profile = makeProfile({
      results: [...three('sweet', 0.7), ...three('tooEasy', 1), ...three('tooHard', 0.2)],
    });
    const ranked = rankExercisesForSession(profile, ['tooEasy', 'tooHard', 'sweet']);
    expect(ranked[0]).toBe('sweet');
  });

  it('handles an empty candidate list', () => {
    expect(rankExercisesForSession(makeProfile(), [])).toEqual([]);
  });
});

describe('interleaveExercises', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the requested number of exercises', () => {
    const out = interleaveExercises(['a', 'b', 'c', 'd', 'e', 'f'], 3);
    expect(out).toHaveLength(3);
  });

  it('never repeats an exercise', () => {
    const out = interleaveExercises(['a', 'b', 'c', 'd', 'e', 'f'], 5);
    expect(new Set(out).size).toBe(out.length);
  });

  it('only draws from the top candidates of the ranked list', () => {
    // The window is count + 2, so 'g' and beyond must never appear.
    const ranked = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
    for (let i = 0; i < 50; i++) {
      const out = interleaveExercises(ranked, 4);
      expect(out.every(id => ranked.slice(0, 6).includes(id))).toBe(true);
    }
  });

  it('returns what it can when asked for more than it has', () => {
    const out = interleaveExercises(['a', 'b'], 5);
    expect([...out].sort()).toEqual(['a', 'b']);
  });

  it('shuffles rather than preserving rank order', () => {
    // With Math.random pinned to 0, Fisher-Yates reverses-ish the window;
    // the point is that the output is not simply the first `count` in order.
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const out = interleaveExercises(['a', 'b', 'c', 'd', 'e'], 3);
    expect(out).not.toEqual(['a', 'b', 'c']);
  });

  it('handles an empty ranked list', () => {
    expect(interleaveExercises([], 3)).toEqual([]);
  });
});
