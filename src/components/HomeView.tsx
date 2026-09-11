import { Brain, Clock, Trophy, TrendingUp, ChevronRight, Sparkles, Zap } from 'lucide-react';
import type { UserProfile, CognitiveSkill } from '../types';
import { EXERCISES, SKILL_LABELS, SKILL_COLORS, ACHIEVEMENTS } from '../exercises';
import { getTodayString } from '../storage';
import { computeBrainScore } from '../global';
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

  const brainScore = computeBrainScore(profile);

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
          N-back, Schulte tables, Stroop and nine more, in your browser.
          The difficulty follows how you did last time.
        </p>
      </div>

      {/* Brain Score Hero */}
      {brainScore > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(129,140,248,0.12), rgba(192,132,252,0.12))',
          border: '1px solid rgba(129,140,248,0.25)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.15rem' }}>
              Brain Score
            </div>
            <div style={{
              fontSize: '2.75rem',
              fontWeight: 800,
              lineHeight: 1,
              background: 'var(--gradient-primary)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              {brainScore}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              Composite of your last 10 results across all skills
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', maxWidth: '280px', justifyContent: 'flex-end' }}>
            {skills.map(skill => {
              const v = skillAverages[skill];
              if (v === undefined) return null;
              return (
                <div key={skill} title={`${SKILL_LABELS[skill]}: ${v}`} style={{
                  width: '28px',
                  height: '40px',
                  borderRadius: '4px',
                  background: 'var(--bg-primary)',
                  position: 'relative',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: `${v}%`,
                    background: SKILL_COLORS[skill],
                    transition: 'height 0.6s',
                  }} />
                </div>
              );
            })}
          </div>
        </div>
      )}

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
      <div style={{
        background: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(129,140,248,0.12))',
        border: '1px solid rgba(251,191,36,0.3)',
        borderRadius: 'var(--radius)',
        padding: '1.25rem',
        marginBottom: '2rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Zap size={18} color="var(--accent-warning)" />
              <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Daily Brain Warm-Up</h2>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {WARMUP_DURATION_MINUTES} min &middot; one round of all {EXERCISES.length} exercises, scaled to you
              {profile.warmupStreak > 0 && (
                <span style={{ color: 'var(--accent-warning)', fontWeight: 700, marginLeft: '0.5rem' }}>
                  &#x1F525; {profile.warmupStreak}d warm-up streak
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onStartWarmup}
            style={{
              padding: '0.75rem 1.75rem',
              minHeight: '44px',
              borderRadius: 'var(--radius)',
              background: warmupDoneToday ? 'var(--bg-card)' : 'var(--accent-warning)',
              color: warmupDoneToday ? 'var(--text-secondary)' : '#1a1a1a',
              fontWeight: 700,
              fontSize: '0.95rem',
              border: warmupDoneToday ? '1px solid var(--border-color)' : 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {warmupDoneToday ? 'Warm up again' : 'Start warm-up'}
          </button>
        </div>
        <div style={{ marginTop: '0.75rem' }}>
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
                    fontSize: '0.75rem',
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
