import type { UserProfile, CognitiveSkill } from './types';
import { SKILL_LABELS } from './exercises';

/**
 * Optional, opt-in "Global Mind" sync layer.
 *
 * Design goals:
 *  - Local-first. The app must work fully offline; this layer only adds extras.
 *  - Anonymous by default. We send a randomly generated handle, never PII.
 *  - Pluggable backend. Endpoint is configured via VITE_GLOBAL_API_URL.
 *  - Graceful degradation. If no backend is configured, we fall back to an
 *    illustrative placeholder aggregate. It contains no invented community
 *    figures, and the UI must label everything drawn from it as illustrative.
 *
 * Reference deployment: a Cloudflare Worker (see /server/worker.ts) that
 * stores anonymous aggregated stats in a single Workers KV namespace.
 * It exposes:
 *   POST /submit   { handle, skills, totalExercises, brainScore, version }
 *   GET  /global   → { totalUsers, totalExercises, skillAverages, top, updatedAt }
 *   GET  /leaderboard?skill=working-memory → top 50
 */

export interface GlobalSettings {
  enabled: boolean;
  handle: string;
  // Optional: country guess (from Intl), purely client-side, never IP-derived
  region: string | null;
  lastSyncAt: number | null;
}

export interface GlobalAggregate {
  totalUsers: number;
  totalExercises: number;
  totalSessions: number;
  skillAverages: Partial<Record<CognitiveSkill, number>>;
  top: { handle: string; brainScore: number; totalExercises: number; region?: string }[];
  updatedAt: number;
  source: 'live' | 'seed' | 'cache';
}

const SETTINGS_KEY = 'neuroforge_global_settings';
const CACHE_KEY = 'neuroforge_global_cache';
const ENDPOINT: string = (import.meta.env.VITE_GLOBAL_API_URL as string | undefined) || '';

/**
 * The illustrative reference line used when no backend is configured.
 *
 * These are NOT measurements. No community data exists until a backend is
 * deployed, so:
 *  - the community counters are 0 and the UI renders them as placeholders
 *    rather than inventing a headcount;
 *  - every skill uses the same flat reference value, so the comparison bars
 *    still have a yardstick to draw against without implying that anyone
 *    measured a per-skill population average.
 *
 * Anything derived from this object must be labelled as illustrative in the
 * UI — see `isIllustrative()`.
 */
export const ILLUSTRATIVE_SKILL_REFERENCE = 60;

const SEED: GlobalAggregate = {
  totalUsers: 0,
  totalExercises: 0,
  totalSessions: 0,
  skillAverages: {
    'pattern-recognition': ILLUSTRATIVE_SKILL_REFERENCE,
    'working-memory': ILLUSTRATIVE_SKILL_REFERENCE,
    'reaction-time': ILLUSTRATIVE_SKILL_REFERENCE,
    'spatial-reasoning': ILLUSTRATIVE_SKILL_REFERENCE,
    'verbal-fluency': ILLUSTRATIVE_SKILL_REFERENCE,
    'attention-control': ILLUSTRATIVE_SKILL_REFERENCE,
  },
  top: [],
  updatedAt: 0,
  source: 'seed',
};

/**
 * True when the aggregate on screen is the illustrative placeholder rather
 * than data reported by a backend. Callers must label such values.
 */
export function isIllustrative(a: GlobalAggregate | null | undefined): boolean {
  return !a || a.source === 'seed';
}

const ADJECTIVES = ['Swift', 'Quiet', 'Bright', 'Cosmic', 'Lucid', 'Bold', 'Crisp', 'Vivid', 'Keen', 'Stellar', 'Solar', 'Lunar', 'Rapid', 'Sharp', 'Calm'];
const NOUNS = ['Neuron', 'Synapse', 'Cortex', 'Axon', 'Dendrite', 'Lobe', 'Node', 'Pulse', 'Signal', 'Memory', 'Photon', 'Atlas', 'Tessera', 'Quanta', 'Helix'];

export function generateHandle(): string {
  const a = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const n = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 9000) + 100;
  return `${a}${n}${num}`;
}

export function loadSettings(): GlobalSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw) as GlobalSettings;
  } catch { /* ignore */ }
  return {
    enabled: false,
    handle: generateHandle(),
    region: detectRegion(),
    lastSyncAt: null,
  };
}

export function saveSettings(s: GlobalSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch { /* ignore */ }
}

function detectRegion(): string | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    return tz.split('/')[0] || null;
  } catch { return null; }
}

export function isBackendConfigured(): boolean {
  return ENDPOINT.length > 0;
}

export function computeBrainScore(profile: UserProfile): number {
  const skills: CognitiveSkill[] = ['pattern-recognition', 'working-memory', 'reaction-time', 'spatial-reasoning', 'verbal-fluency', 'attention-control'];
  let sum = 0;
  let count = 0;
  for (const skill of skills) {
    const recent = profile.results.filter(r => r.skill === skill).slice(-10);
    if (recent.length > 0) {
      sum += recent.reduce((s, r) => s + r.score, 0) / recent.length;
      count++;
    }
  }
  if (count === 0) return 0;
  // Composite: average skill score with a small bonus for breadth
  const breadthBonus = (count / skills.length) * 5;
  return Math.round(sum / count + breadthBonus);
}

export function buildSubmission(profile: UserProfile, settings: GlobalSettings) {
  const skills: CognitiveSkill[] = ['pattern-recognition', 'working-memory', 'reaction-time', 'spatial-reasoning', 'verbal-fluency', 'attention-control'];
  const skillScores: Partial<Record<CognitiveSkill, number>> = {};
  for (const s of skills) {
    const r = profile.results.filter(r => r.skill === s).slice(-10);
    if (r.length > 0) skillScores[s] = Math.round(r.reduce((acc, x) => acc + x.score, 0) / r.length);
  }
  return {
    handle: settings.handle,
    region: settings.region,
    brainScore: computeBrainScore(profile),
    totalExercises: profile.totalExercises,
    totalSessions: profile.totalSessions,
    longestStreak: profile.longestStreak,
    skills: skillScores,
    version: 1,
  };
}

export async function submitToGlobal(profile: UserProfile, settings: GlobalSettings): Promise<boolean> {
  if (!settings.enabled || !ENDPOINT) return false;
  try {
    const res = await fetch(`${ENDPOINT.replace(/\/$/, '')}/submit`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(buildSubmission(profile, settings)),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function fetchGlobal(): Promise<GlobalAggregate> {
  // Try cache first for instant render, then refresh in background
  const cached = readCache();

  if (!ENDPOINT) {
    return cached || SEED;
  }
  try {
    const res = await fetch(`${ENDPOINT.replace(/\/$/, '')}/global`);
    if (!res.ok) throw new Error('non-200');
    const data = (await res.json()) as Omit<GlobalAggregate, 'source'>;
    const fresh: GlobalAggregate = { ...data, source: 'live' };
    writeCache(fresh);
    return fresh;
  } catch {
    return cached || SEED;
  }
}

function readCache(): GlobalAggregate | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cached = JSON.parse(raw) as GlobalAggregate;
    return { ...cached, source: 'cache' };
  } catch { return null; }
}

function writeCache(a: GlobalAggregate): void {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(a)); } catch { /* ignore */ }
}

export function compareToGlobal(profile: UserProfile, global: GlobalAggregate): {
  skill: CognitiveSkill;
  label: string;
  user: number;
  global: number;
  delta: number;
}[] {
  const skills: CognitiveSkill[] = ['pattern-recognition', 'working-memory', 'reaction-time', 'spatial-reasoning', 'verbal-fluency', 'attention-control'];
  return skills.map(skill => {
    const recent = profile.results.filter(r => r.skill === skill).slice(-10);
    const user = recent.length > 0 ? Math.round(recent.reduce((s, r) => s + r.score, 0) / recent.length) : 0;
    const g = global.skillAverages[skill] || 0;
    return {
      skill,
      label: SKILL_LABELS[skill],
      user,
      global: g,
      delta: user - g,
    };
  });
}
