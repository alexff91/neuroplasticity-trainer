import { Brain, Clock, Trophy, TrendingUp, ChevronRight, Sparkles, Zap, Check } from 'lucide-react';
import type { UserProfile, CognitiveSkill } from '../types';
import { EXERCISES, SKILL_LABELS, SKILL_COLORS, ACHIEVEMENTS } from '../exercises';
import { getTodayString } from '../storage';
import { computeReactionStat, WARMUP_DURATION_MINUTES } from '../warmup';
import WarmupStatCard from './WarmupStatCard';

interface Props {
  profile: UserProfile;
  onStartSession: (duration: number) => void;
  onStartExercise: (exerciseId: string) => void;
  onStartWarmup: () => void;
}

export default function HomeView({ profile, onStartSession, onStartExercise, onStartWarmup }: Props) {
  const today = getTodayString();
  const warmupDoneToday = profile.lastWarmupDate === today;
  const reactionStat = computeReactionStat(profile);
  const todayLog = profile.dailyLogs.find(d => d.date === today);
  const todayExercises = todayLog?.totalExercises || 0;

  // Compute skill averages from last 10 results per skill
  const skillAverages: Partial<Record<CognitiveSkill, number>> = {};
  const skills: CognitiveSkill[] = ['pattern-recognition', 'working-memory', 'reaction-time', 'spatial-reasoning', 'verbal-fluency', 'attention-control'];
  for (const skill of skills) {
    const results = profile.results.filter(r => r.skill === skill).slice(-10);
    if (results.length > 0) {
      skillAverages[skill] = Math.round(results.reduce((s, r) => s + r.score, 0) / results.length);
    }
  }

  // New achievements
  const newAchievements = ACHIEVEMENTS.filter(
    a => a.condition(profile) && !profile.achievements.includes(a.id)
  );

  // Weakest skill for recommendation
  const skillEntries = Object.entries(skillAverages) as [CognitiveSkill, number][];
  const weakest = skillEntries.length > 0
    ? skillEntries.sort((a, b) => a[1] - b[1])[0]
    : null;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      {/* Welcome Section */}
      <div style={{
        textAlign: 'center',
        marginBottom: '2rem',
      }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 800,
          marginBottom: '0.5rem',
          background: 'var(--gradient-primary)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Train Your Brain
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto' }}>
          Science-backed cognitive exercises that adapt to your performance.
          Build neural pathways through deliberate practice.
        </p>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '0.75rem',
        marginBottom: '2rem',
      }}>
        {[
          { label: 'Today', value: todayExercises, icon: <Clock size={18} />, color: 'var(--accent-info)' },
          { label: 'Streak', value: `${profile.currentStreak}d`, icon: <span style={{ fontSize: '1.1rem' }}>&#x1F525;</span>, color: 'var(--accent-warning)' },
          { label: 'Total', value: profile.totalExercises, icon: <Brain size={18} />, color: 'var(--accent-primary)' },
          { label: 'Best Streak', value: `${profile.longestStreak}d`, icon: <Trophy size={18} />, color: 'var(--accent-success)' },
        ].map((stat, i) => (
          <div key={i} style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius)',
            padding: '1rem',
            textAlign: 'center',
            border: '1px solid var(--border-color)',
          }}>
            <div style={{ marginBottom: '0.25rem', color: stat.color }}>{stat.icon}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{stat.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Daily Warm-Up */}
      <div className="warmup-hero" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ minWidth: '240px', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
              <Zap size={14} color="var(--accent-warning)" fill="var(--accent-warning)" />
              <span className="warmup-eyebrow">Daily Ritual &middot; {WARMUP_DURATION_MINUTES} min</span>
              {warmupDoneToday && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  color: 'var(--accent-success)',
                  background: 'rgba(52,211,153,0.14)',
                  border: '1px solid rgba(52,211,153,0.35)',
                  borderRadius: '999px',
                  padding: '0.1rem 0.5rem',
                }}>
                  <Check size={11} strokeWidth={3} /> Done
                </span>
              )}
            </div>

            <h2 className="warmup-title">Brain Warm-Up</h2>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.4rem', maxWidth: '31ch' }}>
              One round of all {EXERCISES.length} exercises, each tuned to your current level.
            </p>

            {/* Circuit preview: one dot per exercise, colored by skill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '0.9rem' }}>
              {EXERCISES.map((ex, i) => {
                const c = SKILL_COLORS[ex.skill] || 'var(--accent-primary)';
                return (
                  <span
                    key={ex.id}
                    className="warmup-dot"
                    title={`${ex.name} — ${SKILL_LABELS[ex.skill]}`}
                    style={{
                      background: c,
                      boxShadow: `0 0 10px ${c}90`,
                      animationDelay: `${i * 60}ms`,
                    }}
                  />
                );
              })}
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '0.35rem', fontWeight: 600 }}>
                {EXERCISES.length} rounds
              </span>
            </div>
          </div>

          {/* Streak + CTA */}
          <div className="warmup-actions">
            {profile.warmupStreak > 0 && (
              <div style={{ textAlign: 'center', lineHeight: 1.1 }}>
                <div style={{ fontSize: '1.9rem' }}>
                  <span className="warmup-flame">&#x1F525;</span>
                </div>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  background: 'var(--gradient-warm)',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  {profile.warmupStreak}
                </div>
                <div style={{
                  fontSize: '0.62rem',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  fontWeight: 700,
                }}>
                  day streak
                </div>
              </div>
            )}
            <button
              onClick={onStartWarmup}
              className={`warmup-cta${warmupDoneToday ? ' warmup-cta--done' : ''}`}
            >
              {warmupDoneToday ? 'Go again' : 'Start warm-up'}
            </button>
          </div>
        </div>

        <div style={{ marginTop: '1.1rem' }}>
          <WarmupStatCard stat={reactionStat} compact />
        </div>
      </div>

      {/* Session Buttons */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
          <Sparkles size={18} style={{ verticalAlign: 'middle', marginRight: '0.35rem', color: 'var(--accent-secondary)' }} />
          Start a Session
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
          {[
            { duration: 5, label: 'Quick Focus', desc: '3-4 exercises', color: '#34d399' },
            { duration: 10, label: 'Daily Training', desc: '6-8 exercises', color: '#818cf8' },
            { duration: 15, label: 'Deep Session', desc: '10-12 exercises', color: '#c084fc' },
          ].map(session => (
            <button
              key={session.duration}
              onClick={() => onStartSession(session.duration)}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius)',
                padding: '1.25rem',
                textAlign: 'left',
                transition: 'all 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = session.color;
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-color)';
                (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>{session.label}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{session.duration} min &middot; {session.desc}</div>
                </div>
                <ChevronRight size={18} color={session.color} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Skill Overview */}
      {skillEntries.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            <TrendingUp size={18} style={{ verticalAlign: 'middle', marginRight: '0.35rem', color: 'var(--accent-success)' }} />
            Skill Levels
          </h2>
          <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius)', padding: '1rem', border: '1px solid var(--border-color)' }}>
            {skills.map(skill => {
              const avg = skillAverages[skill];
              if (avg === undefined) return null;
              const color = SKILL_COLORS[skill] || 'var(--accent-primary)';
              return (
                <div key={skill} style={{ marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{SKILL_LABELS[skill]}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color }}>{avg}</span>
                  </div>
                  <div style={{ height: '6px', background: 'var(--bg-primary)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${avg}%`,
                      height: '100%',
                      background: color,
                      borderRadius: '3px',
                      transition: 'width 0.5s ease-out',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
          {weakest && (
            <div style={{
              marginTop: '0.75rem',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.75rem',
              border: '1px solid var(--border-color)',
            }}>
              <strong style={{ color: SKILL_COLORS[weakest[0]] }}>Tip:</strong> Your {SKILL_LABELS[weakest[0]]} could use some work.
              Try exercises targeting this area.
            </div>
          )}
        </div>
      )}

      {/* Exercise Catalog */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
          Individual Exercises
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.75rem' }}>
          {EXERCISES.map(ex => {
            const diff = profile.difficultyStates[ex.id]?.currentDifficulty || 1;
            const color = SKILL_COLORS[ex.skill] || 'var(--accent-primary)';
            return (
              <button
                key={ex.id}
                onClick={() => onStartExercise(ex.id)}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius)',
                  padding: '1rem',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = color;
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-color)';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{ex.name}</div>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '0.15rem 0.4rem',
                    borderRadius: '10px',
                    background: color + '20',
                    color,
                    fontWeight: 600,
                  }}>
                    Lv {diff}
                  </span>
                </div>
                <div style={{ fontSize: '0.75rem', color, marginTop: '0.25rem', fontWeight: 500 }}>
                  {SKILL_LABELS[ex.skill]}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem', lineHeight: 1.4 }}>
                  {ex.description.split('.')[0]}.
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* New Achievements */}
      {newAchievements.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(251,191,36,0.1), rgba(129,140,248,0.1))',
          borderRadius: 'var(--radius)',
          padding: '1rem',
          border: '1px solid rgba(251,191,36,0.3)',
          marginBottom: '2rem',
        }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem', color: 'var(--accent-warning)' }}>
            <Trophy size={16} style={{ verticalAlign: 'middle', marginRight: '0.35rem' }} />
            New Achievement{newAchievements.length > 1 ? 's' : ''} Unlocked!
          </h3>
          {newAchievements.map(a => (
            <div key={a.id} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
              <strong>{a.name}</strong> — {a.description}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
