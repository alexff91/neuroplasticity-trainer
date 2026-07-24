/**
 * Reference backend for the NeuroForge "Global Mind" sync.
 *
 * Deploy on Cloudflare Workers (free tier is plenty):
 *
 *   npm i -g wrangler
 *   wrangler kv:namespace create NF_GLOBAL
 *   wrangler deploy
 *
 * wrangler.toml:
 *
 *   name = "neuroforge-global"
 *   main = "server/worker.ts"
 *   compatibility_date = "2025-01-01"
 *
 *   [[kv_namespaces]]
 *   binding = "NF_GLOBAL"
 *   id = "<paste id from create command>"
 *
 * Then build the frontend with:
 *
 *   VITE_GLOBAL_API_URL=https://neuroforge-global.<account>.workers.dev npm run build
 *
 * --- Wire format ---
 * POST /submit  { handle, region, brainScore, totalExercises, totalSessions,
 *                 longestStreak, skills: { [skill]: number }, version }
 * GET  /global  → { totalUsers, totalExercises, totalSessions,
 *                   skillAverages: {...}, top: [...], updatedAt }
 *
 * Privacy & abuse mitigation:
 *  - No IPs are persisted; we rate-limit per-handle via KV TTL.
 *  - Only the handle, region, and aggregate scores are stored.
 *  - Submissions older than 60d are pruned during aggregation rebuild.
 *  - All numeric inputs are clamped to plausible ranges.
 */

interface Env {
  NF_GLOBAL: KVNamespace;
}

interface Submission {
  handle: string;
  region: string | null;
  brainScore: number;
  totalExercises: number;
  totalSessions: number;
  longestStreak: number;
  skills: Record<string, number>;
  version: number;
  updatedAt?: number;
}

interface Aggregate {
  totalUsers: number;
  totalExercises: number;
  totalSessions: number;
  skillAverages: Record<string, number>;
  top: { handle: string; brainScore: number; totalExercises: number; region?: string }[];
  updatedAt: number;
}

const VALID_SKILLS = ['pattern-recognition', 'working-memory', 'reaction-time', 'spatial-reasoning', 'verbal-fluency', 'attention-control'];
const MAX_HANDLE_LEN = 32;
const RATE_LIMIT_SECONDS = 30; // one submission per handle per 30s
const AGGREGATE_TTL = 60; // recompute aggregate at most once per minute

const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, OPTIONS',
  'access-control-allow-headers': 'content-type',
};

function clamp(n: unknown, min: number, max: number): number {
  const x = typeof n === 'number' && Number.isFinite(n) ? n : 0;
  return Math.max(min, Math.min(max, Math.round(x)));
}

function sanitize(raw: unknown): Submission | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const handle = typeof r.handle === 'string' ? r.handle.replace(/[^A-Za-z0-9_-]/g, '').slice(0, MAX_HANDLE_LEN) : '';
  if (handle.length < 3) return null;
  const region = typeof r.region === 'string' ? r.region.slice(0, 32) : null;
  const skillsIn = (r.skills && typeof r.skills === 'object') ? r.skills as Record<string, unknown> : {};
  const skills: Record<string, number> = {};
  for (const s of VALID_SKILLS) {
    if (s in skillsIn) skills[s] = clamp(skillsIn[s], 0, 100);
  }
  return {
    handle,
    region,
    brainScore: clamp(r.brainScore, 0, 100),
    totalExercises: clamp(r.totalExercises, 0, 1_000_000),
    totalSessions: clamp(r.totalSessions, 0, 100_000),
    longestStreak: clamp(r.longestStreak, 0, 10_000),
    skills,
    version: clamp(r.version, 0, 999),
    updatedAt: Date.now(),
  };
}

async function recomputeAggregate(env: Env): Promise<Aggregate> {
  const list = await env.NF_GLOBAL.list({ prefix: 'u:' });
  const submissions: Submission[] = [];
  for (const k of list.keys) {
    const raw = await env.NF_GLOBAL.get(k.name);
    if (!raw) continue;
    try { submissions.push(JSON.parse(raw) as Submission); } catch { /* skip */ }
  }

  // Skill averages
  const skillSums: Record<string, number> = {};
  const skillCounts: Record<string, number> = {};
  let totalExercises = 0;
  let totalSessions = 0;
  for (const s of submissions) {
    totalExercises += s.totalExercises;
    totalSessions += s.totalSessions;
    for (const [skill, val] of Object.entries(s.skills)) {
      skillSums[skill] = (skillSums[skill] || 0) + val;
      skillCounts[skill] = (skillCounts[skill] || 0) + 1;
    }
  }
  const skillAverages: Record<string, number> = {};
  for (const skill of VALID_SKILLS) {
    if (skillCounts[skill] > 0) {
      skillAverages[skill] = Math.round(skillSums[skill] / skillCounts[skill]);
    }
  }

  // Top 50 by brain score (with min activity threshold)
  const top = submissions
    .filter(s => s.totalExercises >= 10)
    .sort((a, b) => b.brainScore - a.brainScore)
    .slice(0, 50)
    .map(s => ({
      handle: s.handle,
      brainScore: s.brainScore,
      totalExercises: s.totalExercises,
      ...(s.region ? { region: s.region } : {}),
    }));

  const aggregate: Aggregate = {
    totalUsers: submissions.length,
    totalExercises,
    totalSessions,
    skillAverages,
    top,
    updatedAt: Date.now(),
  };

  await env.NF_GLOBAL.put('agg:current', JSON.stringify(aggregate), { expirationTtl: 60 * 60 * 24 * 7 });
  return aggregate;
}

async function getAggregate(env: Env): Promise<Aggregate> {
  const cached = await env.NF_GLOBAL.get('agg:current');
  if (cached) {
    try {
      const parsed = JSON.parse(cached) as Aggregate;
      if (Date.now() - parsed.updatedAt < AGGREGATE_TTL * 1000) return parsed;
    } catch { /* fall through */ }
  }
  return recomputeAggregate(env);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);

    if (url.pathname === '/submit' && request.method === 'POST') {
      let body: unknown;
      try { body = await request.json(); } catch {
        return new Response('bad json', { status: 400, headers: corsHeaders });
      }
      const sub = sanitize(body);
      if (!sub) return new Response('invalid', { status: 400, headers: corsHeaders });

      // Rate-limit per handle
      const limitKey = `rl:${sub.handle}`;
      const recent = await env.NF_GLOBAL.get(limitKey);
      if (recent) return new Response('rate limited', { status: 429, headers: corsHeaders });

      await env.NF_GLOBAL.put(`u:${sub.handle}`, JSON.stringify(sub), {
        expirationTtl: 60 * 60 * 24 * 60, // 60 days
      });
      await env.NF_GLOBAL.put(limitKey, '1', { expirationTtl: RATE_LIMIT_SECONDS });

      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'content-type': 'application/json', ...corsHeaders },
      });
    }

    if (url.pathname === '/global' && request.method === 'GET') {
      const agg = await getAggregate(env);
      return new Response(JSON.stringify(agg), {
        headers: { 'content-type': 'application/json', 'cache-control': 'public, max-age=30', ...corsHeaders },
      });
    }

    return new Response('NeuroForge Global Mind. POST /submit, GET /global.', {
      status: 200,
      headers: corsHeaders,
    });
  },
};
