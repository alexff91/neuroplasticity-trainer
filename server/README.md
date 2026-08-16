# Global Mind Backend

The frontend is fully usable without this — it only enables the optional
**Global** tab where users can compare their training progress against an
anonymous global pool.

## Why a backend at all?

GitHub Pages is static. To share data across browsers we need *something*
that persists writes. This Worker is the smallest reasonable thing: ~150
lines, runs on Cloudflare's free tier (100k requests/day), and stores
data in a single KV namespace.

## Deploy in 3 minutes

```bash
npm i -g wrangler
wrangler login

# Create the KV namespace and paste its id into wrangler.toml
cp server/wrangler.toml.example server/wrangler.toml
wrangler kv:namespace create NF_GLOBAL --config server/wrangler.toml
# → copy the printed id into server/wrangler.toml

cd server && wrangler deploy
```

Then build the frontend pointing at your Worker URL:

```bash
VITE_GLOBAL_API_URL=https://neuroforge-global.<your-subdomain>.workers.dev \
  npm run build
```

That's it. The Global tab will switch from the illustrative placeholder to live data.

## Wire format

```
POST /submit
  body: {
    handle: string (3-32 chars, A-Za-z0-9_-),
    region: string | null,            // timezone region, e.g. "Europe"
    brainScore: 0-100,
    totalExercises: number,
    totalSessions: number,
    longestStreak: number,
    skills: { [skill]: 0-100 },
    version: number
  }
  → { ok: true }

GET /global
  → {
      totalUsers, totalExercises, totalSessions,
      skillAverages: {...},
      top: [{ handle, brainScore, totalExercises, region? }, ...],
      updatedAt
    }
```

## What is *not* collected

- No IP addresses (Cloudflare Workers don't log them by default; we don't store them either).
- No session cookies, fingerprints, or device identifiers.
- No exact timestamps of submissions — only "updatedAt" rounded to the minute via the cache.

## Abuse mitigation

- All numerics are clamped server-side.
- Per-handle rate limit: one submission every 30s.
- Submissions auto-expire after 60 days; aggregates are recomputed lazily.
- Handles are user-changeable, so impersonation is meaningful only as friendly competition.

If you want a stricter setup, swap in Turnstile or change the storage to D1 with row-level limits.
