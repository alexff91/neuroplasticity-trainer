import { useEffect, useState } from 'react';
import { Globe, Users, Activity, Trophy, Wifi, WifiOff, Sparkles, AlertCircle } from 'lucide-react';
import type { UserProfile } from '../types';
import { SKILL_COLORS } from '../exercises';
import {
  fetchGlobal,
  loadSettings,
  saveSettings,
  submitToGlobal,
  generateHandle,
  computeBrainScore,
  compareToGlobal,
  isBackendConfigured,
  isIllustrative,
  ILLUSTRATIVE_SKILL_REFERENCE,
  type GlobalAggregate,
  type GlobalSettings,
} from '../global';

interface Props {
  profile: UserProfile;
}

export default function GlobalView({ profile }: Props) {
  const [settings, setSettings] = useState<GlobalSettings>(() => loadSettings());
  const [aggregate, setAggregate] = useState<GlobalAggregate | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncedJustNow, setSyncedJustNow] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchGlobal().then(a => {
      if (!cancelled) {
        setAggregate(a);
        setLoading(false);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const updateSettings = (updates: Partial<GlobalSettings>) => {
    const next = { ...settings, ...updates };
    setSettings(next);
    saveSettings(next);
  };

  const handleToggle = async () => {
    const next = !settings.enabled;
    updateSettings({ enabled: next });
    if (next && profile.totalExercises > 0) {
      await syncNow({ ...settings, enabled: true });
    }
  };

  const syncNow = async (s: GlobalSettings) => {
    if (!s.enabled) return;
    setSyncing(true);
    const ok = await submitToGlobal(profile, s);
    setSyncing(false);
    if (ok) {
      updateSettings({ lastSyncAt: Date.now() });
      setSyncedJustNow(true);
      setTimeout(() => setSyncedJustNow(false), 2500);
      // Refresh aggregate
      const fresh = await fetchGlobal();
      setAggregate(fresh);
    }
  };

  const myScore = computeBrainScore(profile);
  const comparisons = aggregate ? compareToGlobal(profile, aggregate) : [];
  const backend = isBackendConfigured();
  // When true, nothing on this page comes from real users: community counters
  // are placeholders and the comparison bars use a fixed reference line.
  const illustrative = isIllustrative(aggregate);

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      <h1 style={{
        fontSize: '1.5rem',
        fontWeight: 800,
        marginBottom: '0.5rem',
        background: 'linear-gradient(135deg, #38bdf8, #818cf8, #c084fc)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <Globe size={26} color="#38bdf8" /> Global Mind
      </h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '1.25rem' }}>
        Anonymous, opt-in collective intelligence. See how the worldwide community is training.
      </p>

      {/* Connection card */}
      <div style={{
        background: settings.enabled ? 'linear-gradient(135deg, rgba(56,189,248,0.08), rgba(129,140,248,0.08))' : 'var(--bg-card)',
        border: `1px solid ${settings.enabled ? 'rgba(56,189,248,0.3)' : 'var(--border-color)'}`,
        borderRadius: 'var(--radius)',
        padding: '1rem 1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            {settings.enabled
              ? <Wifi size={18} color="var(--accent-info)" />
              : <WifiOff size={18} color="var(--text-muted)" />}
            <strong>{settings.enabled ? 'Connected' : 'Offline mode'}</strong>
            {settings.enabled && (
              <span style={{
                fontSize: '0.75rem',
                padding: '0.15rem 0.5rem',
                borderRadius: '10px',
                background: 'var(--accent-info)20',
                color: 'var(--accent-info)',
                fontWeight: 600,
              }}>
                {settings.handle}
              </span>
            )}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {settings.enabled
              ? settings.lastSyncAt
                ? `Last sync ${new Date(settings.lastSyncAt).toLocaleString()}`
                : 'Ready to sync'
              : 'Your data stays on this device. Connect to share anonymous stats.'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {settings.enabled && (
            <>
              <button
                onClick={() => syncNow(settings)}
                disabled={syncing || profile.totalExercises === 0}
                style={{
                  padding: '0.5rem 1rem',
                  minHeight: '44px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                }}
              >
                {syncing ? 'Syncing…' : syncedJustNow ? '✓ Synced' : 'Sync now'}
              </button>
              <button
                onClick={() => updateSettings({ handle: generateHandle() })}
                style={{
                  padding: '0.5rem 1rem',
                  minHeight: '44px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--bg-card)',
                  color: 'var(--text-secondary)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.85rem',
                }}
              >
                New handle
              </button>
            </>
          )}
          <button
            onClick={handleToggle}
            style={{
              padding: '0.5rem 1.1rem',
              minHeight: '44px',
              borderRadius: 'var(--radius-sm)',
              background: settings.enabled ? 'var(--accent-danger)' : 'var(--accent-info)',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.85rem',
            }}
          >
            {settings.enabled ? 'Disconnect' : 'Connect'}
          </button>
        </div>
      </div>

      {/* Backend setup notice */}
      {!backend && (
        <div style={{
          background: 'rgba(251,191,36,0.08)',
          border: '1px solid rgba(251,191,36,0.25)',
          borderRadius: 'var(--radius)',
          padding: '0.85rem 1rem',
          marginBottom: '1.5rem',
          display: 'flex',
          gap: '0.6rem',
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
        }}>
          <AlertCircle size={18} color="var(--accent-warning)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ color: 'var(--accent-warning)' }}>No backend configured — no real community data.</strong> There are no other trainees to compare against, so the counters below are empty and the comparison bars use a fixed 60% reference line, not a measured average. Self-host the global mind in 5 minutes by deploying <code>server/worker.ts</code> to Cloudflare Workers and setting <code>VITE_GLOBAL_API_URL</code> at build time. See README.
          </div>
        </div>
      )}

      {/* Live stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '0.75rem',
        marginBottom: '1.5rem',
      }}>
        {[
          // Community counters are only real when a backend reported them.
          // Without one there is nothing to count, so show a placeholder
          // instead of a number a reader could mistake for a headcount.
          { label: 'Trainees', value: illustrative ? '—' : aggregate!.totalUsers.toLocaleString(), placeholder: illustrative, icon: <Users size={18} />, color: 'var(--accent-info)' },
          { label: 'Exercises', value: illustrative ? '—' : aggregate!.totalExercises.toLocaleString(), placeholder: illustrative, icon: <Activity size={18} />, color: 'var(--accent-primary)' },
          { label: 'Sessions', value: illustrative ? '—' : aggregate!.totalSessions.toLocaleString(), placeholder: illustrative, icon: <Sparkles size={18} />, color: 'var(--accent-secondary)' },
          // This one is genuinely the user's own, locally computed score.
          { label: 'Your Brain Score', value: myScore || '—', placeholder: false, icon: <Trophy size={18} />, color: 'var(--accent-warning)' },
        ].map((s, i) => (
          <div key={i} style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius)',
            padding: '1rem',
            textAlign: 'center',
            border: s.placeholder ? '1px dashed var(--border-color)' : '1px solid var(--border-color)',
          }}>
            <div style={{ marginBottom: '0.25rem', color: s.color }}>{s.icon}</div>
            <div style={{
              fontSize: '1.4rem',
              fontWeight: 700,
              color: s.placeholder ? 'var(--text-muted)' : undefined,
            }}>
              {loading ? '…' : s.value}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.label}</div>
            {s.placeholder && !loading && (
              <div style={{ fontSize: '0.75rem', color: 'var(--accent-warning)', marginTop: '0.2rem', fontWeight: 600 }}>
                no data yet
              </div>
            )}
          </div>
        ))}
      </div>

      {/* You vs World */}
      {comparisons.some(c => c.user > 0) && (
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius)',
          padding: '1.25rem',
          border: '1px solid var(--border-color)',
          marginBottom: '1.5rem',
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: illustrative ? '0.35rem' : '0.75rem' }}>
            {illustrative ? 'You vs Illustrative Reference' : 'You vs Global Average'}
          </h3>
          {illustrative && (
            <p style={{ fontSize: '0.75rem', color: 'var(--accent-warning)', marginBottom: '0.75rem', lineHeight: 1.5 }}>
              Example only: the grey marker is a fixed {ILLUSTRATIVE_SKILL_REFERENCE}% line, not the average of real
              trainees. Connect a backend to compare against actual people.
            </p>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {comparisons.map(c => {
              if (c.user === 0) return null;
              const max = Math.max(c.user, c.global, 1);
              const userPct = (c.user / 100) * 100;
              const globalPct = (c.global / 100) * 100;
              const color = SKILL_COLORS[c.skill] || 'var(--accent-primary)';
              return (
                <div key={c.skill}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{c.label}</span>
                    <span style={{
                      color: c.delta >= 0 ? 'var(--accent-success)' : 'var(--accent-danger)',
                      fontWeight: 700,
                    }}>
                      {c.delta >= 0 ? '+' : ''}{c.delta} vs {illustrative ? 'reference' : 'global'}
                    </span>
                  </div>
                  <div style={{ position: 'relative', height: '14px', background: 'var(--bg-primary)', borderRadius: '7px', overflow: 'hidden' }}>
                    {/* Global average marker */}
                    <div style={{
                      position: 'absolute',
                      left: `${globalPct}%`,
                      top: 0,
                      bottom: 0,
                      width: '2px',
                      background: 'var(--text-muted)',
                      zIndex: 2,
                    }} />
                    <div style={{
                      width: `${userPct}%`,
                      height: '100%',
                      background: color,
                      borderRadius: '7px',
                      transition: 'width 0.5s',
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    <span>You: <strong style={{ color }}>{c.user}</strong></span>
                    <span>{illustrative ? 'Reference' : 'Global'}: <strong>{Math.round(c.global * (max / 100)) / (max / 100)}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      {aggregate && aggregate.top && aggregate.top.length > 0 && (
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius)',
          padding: '1.25rem',
          border: '1px solid var(--border-color)',
          marginBottom: '1.5rem',
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Top Brains</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {aggregate.top.slice(0, 10).map((entry, i) => {
              const isMe = entry.handle === settings.handle;
              return (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.5rem 0.75rem',
                  background: isMe ? 'rgba(129,140,248,0.15)' : 'var(--bg-primary)',
                  border: isMe ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{
                      width: '24px',
                      textAlign: 'center',
                      fontWeight: 800,
                      color: i < 3 ? 'var(--accent-warning)' : 'var(--text-muted)',
                      fontSize: '0.85rem',
                    }}>#{i + 1}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                      {entry.handle}{isMe ? ' (you)' : ''}
                    </span>
                    {entry.region && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>· {entry.region}</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{entry.totalExercises} ex</span>
                    <strong style={{ color: 'var(--accent-primary)' }}>{entry.brainScore}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Privacy note */}
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6, padding: '0.75rem 1rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
        <strong style={{ color: 'var(--text-secondary)' }}>Privacy:</strong> When connected, only your random handle, region (timezone-based), and aggregate skill scores are sent. No personal data, no IP logging on the reference backend, no tracking. Source: <a href="https://github.com/alexff91/neuroplasticity-trainer" target="_blank" rel="noopener">GitHub</a>.
      </div>
    </div>
  );
}
