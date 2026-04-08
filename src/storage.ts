import type { UserProfile } from './types';

const STORAGE_KEY = 'neuroforge_profile';

export function getDefaultProfile(): UserProfile {
  return {
    createdAt: Date.now(),
    totalSessions: 0,
    totalExercises: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastSessionDate: null,
    achievements: [],
    difficultyStates: {},
    dailyLogs: [],
    results: [],
  };
}

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as UserProfile;
      // Keep only last 500 results to avoid storage bloat
      if (parsed.results && parsed.results.length > 500) {
        parsed.results = parsed.results.slice(-500);
      }
      return parsed;
    }
  } catch {
    // corrupted storage, start fresh
  }
  return getDefaultProfile();
}

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // storage full, trim old data
    profile.results = profile.results.slice(-200);
    profile.dailyLogs = profile.dailyLogs.slice(-90);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // give up silently
    }
  }
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}
