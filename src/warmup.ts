import type { ExerciseResult, UserProfile } from './types';
import { EXERCISES } from './exercises';
import { getOrCreateDifficultyState, eloToDifficulty } from './difficulty';

/**
 * Daily Brain Warm-Up.
 *
 * A short, fixed-length circuit that picks exactly one round from each of
 * the available exercises, scaled to the user's current ELO. It is meant
 * to be a low-friction daily habit that keeps every cognitive domain warm.
 */

export const WARMUP_DURATION_MINUTES = 3;
export const WARMUP_SESSION_PREFIX = 'warmup';

export interface WarmupStep {
  exerciseId: string;
  difficulty: number;
}

/**
 * Build a randomized warm-up circuit: one round from every exercise, in a
 * shuffled order, each scaled to the user's ELO for that exercise.
 *
 * `rng` is injectable so the shuffle can be tested deterministically.
 */
export function buildWarmupCircuit(
  profile: UserProfile,
  rng: () => number = Math.random
): WarmupStep[] {
  const steps: WarmupStep[] = EXERCISES.map(ex => {
    const state = getOrCreateDifficultyState(profile, ex.id);
    return {
      exerciseId: ex.id,
      difficulty: eloToDifficulty(state.elo, ex.minDifficulty, ex.maxDifficulty),
    };
  });

  // Fisher-Yates shuffle so the circuit order varies day to day.
  for (let i = steps.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [steps[i], steps[j]] = [steps[j], steps[i]];
  }
  return steps;
}

export function isWarmupResult(result: ExerciseResult): boolean {
  return result.sessionId.startsWith(WARMUP_SESSION_PREFIX);
}

export interface ReactionStat {
  todayAvgMs: number | null;
  baselineAvgMs: number | null; // average over the 7 days before today
  deltaMs: number | null;       // todayAvg - baseline (negative = faster)
  improved: boolean;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function dayKey(ts: number): string {
  return new Date(ts).toISOString().split('T')[0];
}

/**
 * Reaction-time motivational stat: compare today's average warm-up response
 * time against the average across the previous 7 days.
 */
export function computeReactionStat(
  profile: UserProfile,
  now: number = Date.now()
): ReactionStat {
  const today = dayKey(now);
  const sevenDaysAgo = now - 7 * DAY_MS;

  const warmupResults = profile.results.filter(isWarmupResult);

  const todayResults = warmupResults.filter(r => dayKey(r.timestamp) === today);
  const baselineResults = warmupResults.filter(
    r => dayKey(r.timestamp) !== today && r.timestamp >= sevenDaysAgo
  );

  const avg = (rs: ExerciseResult[]): number | null =>
    rs.length === 0 ? null : Math.round(rs.reduce((s, r) => s + r.responseTimeMs, 0) / rs.length);

  const todayAvgMs = avg(todayResults);
  const baselineAvgMs = avg(baselineResults);
  const deltaMs =
    todayAvgMs !== null && baselineAvgMs !== null ? todayAvgMs - baselineAvgMs : null;

  return {
    todayAvgMs,
    baselineAvgMs,
    deltaMs,
    improved: deltaMs !== null && deltaMs < 0,
  };
}

export interface WarmupStreakFields {
  warmupStreak: number;
  longestWarmupStreak: number;
  lastWarmupDate: string;
}

/**
 * Advance the daily warm-up streak. A streak continues if the last warm-up
 * was yesterday, resets to 1 otherwise, and is left untouched if a warm-up
 * was already completed today.
 */
export function advanceWarmupStreak(
  profile: UserProfile,
  today: string,
  yesterday: string
): WarmupStreakFields {
  if (profile.lastWarmupDate === today) {
    return {
      warmupStreak: profile.warmupStreak,
      longestWarmupStreak: profile.longestWarmupStreak,
      lastWarmupDate: today,
    };
  }

  const warmupStreak = profile.lastWarmupDate === yesterday ? profile.warmupStreak + 1 : 1;
  return {
    warmupStreak,
    longestWarmupStreak: Math.max(profile.longestWarmupStreak, warmupStreak),
    lastWarmupDate: today,
  };
}
