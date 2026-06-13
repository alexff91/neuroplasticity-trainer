import type { UserProfile, ExerciseResult, DailyLog, DifficultyState, CognitiveSkill } from './types';

const STORAGE_KEY = 'neuroforge_profile';

/**
 * Schema version of the persisted profile. Bump this whenever the shape of
 * UserProfile changes in a way that needs a migration step. Stored data is
 * wrapped in an envelope ({ schemaVersion, profile }) so we can detect the
 * version on load and migrate forward.
 */
export const CURRENT_SCHEMA_VERSION = 1;

const MAX_RESULTS = 500;
const MAX_DAILY_LOGS = 365;

interface StoredEnvelope {
  schemaVersion: number;
  profile: UserProfile;
}

export function getDefaultProfile(): UserProfile {
  return {
    createdAt: Date.now(),
    totalSessions: 0,
    totalExercises: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastSessionDate: null,
    warmupStreak: 0,
    longestWarmupStreak: 0,
    lastWarmupDate: null,
    achievements: [],
    difficultyStates: {},
    dailyLogs: [],
    results: [],
  };
}

// ---------------------------------------------------------------------------
// Validation helpers — keep persistence resilient to partial corruption.
// Rather than throwing away the whole profile when one record is malformed,
// we drop only the bad records and fall back to defaults for bad scalars.
// ---------------------------------------------------------------------------

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function num(v: unknown, fallback: number): number {
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback;
}

function nonNegInt(v: unknown, fallback = 0): number {
  const n = num(v, fallback);
  return n < 0 ? fallback : Math.floor(n);
}

function str(v: unknown, fallback = ''): string {
  return typeof v === 'string' ? v : fallback;
}

function nullableDate(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null;
}

function sanitizeResult(v: unknown): ExerciseResult | null {
  if (!isObject(v)) return null;
  if (typeof v.exerciseId !== 'string' || typeof v.skill !== 'string') return null;
  if (typeof v.timestamp !== 'number' || !Number.isFinite(v.timestamp)) return null;
  return {
    exerciseId: v.exerciseId,
    skill: v.skill as CognitiveSkill,
    score: num(v.score, 0),
    accuracy: num(v.accuracy, 0),
    responseTimeMs: num(v.responseTimeMs, 0),
    difficulty: num(v.difficulty, 1),
    timestamp: v.timestamp,
    sessionId: str(v.sessionId, 'unknown'),
  };
}

function sanitizeDailyLog(v: unknown): DailyLog | null {
  if (!isObject(v) || typeof v.date !== 'string') return null;
  return {
    date: v.date,
    sessionsCompleted: nonNegInt(v.sessionsCompleted),
    totalExercises: nonNegInt(v.totalExercises),
    averageScore: num(v.averageScore, 0),
    skillScores: isObject(v.skillScores) ? (v.skillScores as DailyLog['skillScores']) : {},
    timeSpentMs: num(v.timeSpentMs, 0),
  };
}

function sanitizeDifficultyStates(v: unknown): Record<string, DifficultyState> {
  if (!isObject(v)) return {};
  const out: Record<string, DifficultyState> = {};
  for (const [id, raw] of Object.entries(v)) {
    if (!isObject(raw)) continue;
    out[id] = {
      exerciseId: str(raw.exerciseId, id),
      currentDifficulty: num(raw.currentDifficulty, 1),
      consecutiveCorrect: nonNegInt(raw.consecutiveCorrect),
      consecutiveWrong: nonNegInt(raw.consecutiveWrong),
      elo: num(raw.elo, 1000),
    };
  }
  return out;
}

/**
 * Build a valid UserProfile from arbitrary parsed JSON, filling defaults for
 * missing/invalid fields and discarding malformed records.
 */
function sanitizeProfile(raw: unknown): UserProfile {
  const defaults = getDefaultProfile();
  if (!isObject(raw)) return defaults;

  const results = Array.isArray(raw.results)
    ? raw.results.map(sanitizeResult).filter((r): r is ExerciseResult => r !== null)
    : [];
  const dailyLogs = Array.isArray(raw.dailyLogs)
    ? raw.dailyLogs.map(sanitizeDailyLog).filter((d): d is DailyLog => d !== null)
    : [];
  const achievements = Array.isArray(raw.achievements)
    ? raw.achievements.filter((a): a is string => typeof a === 'string')
    : [];

  return {
    createdAt: num(raw.createdAt, defaults.createdAt),
    totalSessions: nonNegInt(raw.totalSessions),
    totalExercises: nonNegInt(raw.totalExercises),
    currentStreak: nonNegInt(raw.currentStreak),
    longestStreak: nonNegInt(raw.longestStreak),
    lastSessionDate: nullableDate(raw.lastSessionDate),
    warmupStreak: nonNegInt(raw.warmupStreak),
    longestWarmupStreak: nonNegInt(raw.longestWarmupStreak),
    lastWarmupDate: nullableDate(raw.lastWarmupDate),
    achievements,
    difficultyStates: sanitizeDifficultyStates(raw.difficultyStates),
    dailyLogs: dailyLogs.slice(-MAX_DAILY_LOGS),
    results: results.slice(-MAX_RESULTS),
  };
}

/**
 * Take whatever was read from storage (an envelope, a legacy bare profile, or
 * garbage) and produce a valid, current-schema UserProfile.
 */
export function migrateProfile(stored: unknown): UserProfile {
  // Unwrap the versioned envelope if present; otherwise treat the value as a
  // legacy (pre-versioning) bare profile.
  let rawProfile: unknown = stored;
  if (isObject(stored) && typeof stored.schemaVersion === 'number' && 'profile' in stored) {
    rawProfile = stored.profile;
  }

  // Future version-specific migrations would run here, keyed off the detected
  // schemaVersion, before the final sanitize. Sanitizing already handles the
  // v0 -> v1 case (backfilling warm-up fields) structurally.
  return sanitizeProfile(rawProfile);
}

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return migrateProfile(JSON.parse(raw));
    }
  } catch {
    // corrupted/unparseable storage — start fresh rather than crash
  }
  return getDefaultProfile();
}

function write(profile: UserProfile): void {
  const envelope: StoredEnvelope = { schemaVersion: CURRENT_SCHEMA_VERSION, profile };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(envelope));
}

export function saveProfile(profile: UserProfile): void {
  try {
    write(profile);
  } catch {
    // Likely a quota error — progressively trim history and retry.
    const trimmed: UserProfile = {
      ...profile,
      results: profile.results.slice(-200),
      dailyLogs: profile.dailyLogs.slice(-90),
    };
    try {
      write(trimmed);
    } catch {
      try {
        write({ ...trimmed, results: trimmed.results.slice(-50) });
      } catch {
        // give up silently — in-memory state still works for this session
      }
    }
  }
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}
