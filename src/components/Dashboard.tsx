import { useMemo, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, BarChart, Bar } from 'recharts';
import { Calendar, TrendingUp, Award, Brain, Clock, Download, Upload } from 'lucide-react';
import type { UserProfile, CognitiveSkill } from '../types';
import { SKILL_LABELS, SKILL_COLORS, ACHIEVEMENTS } from '../exercises';

interface Props {
  profile: UserProfile;
}

export default function Dashboard({ profile }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neuroforge-profile-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (typeof parsed !== 'object' || !parsed.results || !Array.isArray(parsed.results)) {
        alert('Invalid profile file');
        return;
      }
      if (!confirm('Replace your current profile with imported data? This cannot be undone.')) return;
      localStorage.setItem('neuroforge_profile', text);
      window.location.reload();
    } catch {
      alert('Failed to import: could not parse file');
    }
  };

  // Daily score trend (last 30 days)
  const dailyTrend = useMemo(() => {
    return profile.dailyLogs.slice(-30).map(log => ({
      date: log.date.slice(5), // MM-DD
      score: Math.round(log.averageScore),
      exercises: log.totalExercises,
    }));
  }, [profile.dailyLogs]);

  // Skill radar data
  const radarData = useMemo(() => {
    const skills: CognitiveSkill[] = ['pattern-recognition', 'working-memory', 'reaction-time', 'spatial-reasoning', 'verbal-fluency', 'attention-control'];
    return skills.map(skill => {
      const results = profile.results.filter(r => r.skill === skill).slice(-15);
      const avg = results.length > 0 ? results.reduce((s, r) => s + r.score, 0) / results.length : 0;
      return {
        skill: SKILL_LABELS[skill].split(' ')[0], // Short label
        fullName: SKILL_LABELS[skill],
        score: Math.round(avg),
        fill: SKILL_COLORS[skill],
      };
    });
  }, [profile.results]);

  // Per-skill trend (last 20 results per skill)
  const skillTrends = useMemo(() => {
    const skills: CognitiveSkill[] = ['pattern-recognition', 'working-memory', 'reaction-time', 'spatial-reasoning', 'verbal-fluency', 'attention-control'];
    const trends: Record<string, { results: { index: number; score: number }[]; color: string; label: string }> = {};
    for (const skill of skills) {
      const results = profile.results.filter(r => r.skill === skill).slice(-20);
      if (results.length >= 2) {
        trends[skill] = {
          results: results.map((r, i) => ({ index: i + 1, score: r.score })),
          color: SKILL_COLORS[skill],
          label: SKILL_LABELS[skill],
        };
      }
    }
    return trends;
  }, [profile.results]);

  // Difficulty progression
  const difficultyData = useMemo(() => {
    return Object.entries(profile.difficultyStates).map(([id, state]) => ({
      name: id.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ').slice(0, 12),
      difficulty: state.currentDifficulty,
      elo: state.elo,
    }));
  }, [profile.difficultyStates]);

  // Earned achievements
  const earned = ACHIEVEMENTS.filter(a => profile.achievements.includes(a.id) || a.condition(profile));
  const unearned = ACHIEVEMENTS.filter(a => !profile.achievements.includes(a.id) && !a.condition(profile));

  // Total time
  const totalTimeMin = Math.round(profile.results.reduce((s, r) => s + r.responseTimeMs, 0) / 60000);

  // Overall stats
  const avgScore = profile.results.length > 0
    ? Math.round(profile.results.reduce((s, r) => s + r.score, 0) / profile.results.length)
    : 0;

  if (profile.results.length === 0) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '3rem 1rem', textAlign: 'center' }}>
        <Brain size={48} color="var(--accent-primary)" style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>No Data Yet</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          Complete your first training session to see your cognitive performance dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '900px', margin: '0 auto', padding: '1.5rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '0.5rem', flexWrap: 'wrap' }}>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 800,
          background: 'var(--gradient-primary)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: 0,
        }}>
          Brain Health Dashboard
        </h1>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button onClick={handleExport} title="Export profile as JSON" style={{
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-card)', color: 'var(--text-secondary)',
            border: '1px solid var(--border-color)', fontSize: '0.8rem', fontWeight: 600,
          }}>
            <Download size={14} /> Export
          </button>
          <button onClick={handleImportClick} title="Import profile JSON" style={{
            display: 'flex', alignItems: 'center', gap: '0.35rem',
            padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-card)', color: 'var(--text-secondary)',
            border: '1px solid var(--border-color)', fontSize: '0.8rem', fontWeight: 600,
          }}>
            <Upload size={14} /> Import
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" onChange={handleImportFile} style={{ display: 'none' }} />
        </div>
      </div>

      {/* Summary Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '0.75rem',
        marginBottom: '2rem',
      }}>
        {[
          { label: 'Avg Score', value: avgScore, icon: <TrendingUp size={16} />, color: 'var(--accent-success)' },
          { label: 'Sessions', value: profile.totalSessions, icon: <Calendar size={16} />, color: 'var(--accent-primary)' },
          { label: 'Exercises', value: profile.totalExercises, icon: <Brain size={16} />, color: 'var(--accent-secondary)' },
          { label: 'Time', value: `${totalTimeMin}m`, icon: <Clock size={16} />, color: 'var(--accent-info)' },
          { label: 'Achievements', value: earned.length, icon: <Award size={16} />, color: 'var(--accent-warning)' },
        ].map((stat, i) => (
          <div key={i} style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius)',
            padding: '1rem',
            textAlign: 'center',
            border: '1px solid var(--border-color)',
          }}>
            <div style={{ color: stat.color, marginBottom: '0.25rem' }}>{stat.icon}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>{stat.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Cognitive Profile Radar */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius)',
        padding: '1.25rem',
        border: '1px solid var(--border-color)',
        marginBottom: '1.5rem',
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Cognitive Profile</h3>
        <ResponsiveContainer width="100%" height={280}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="var(--border-color)" />
            <PolarAngleAxis dataKey="skill" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
            <Radar
              dataKey="score"
              stroke="#818cf8"
              fill="#818cf8"
              fillOpacity={0.25}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginTop: '0.5rem' }}>
          {radarData.map(d => (
            <span key={d.fullName} style={{
              fontSize: '0.75rem',
              padding: '0.2rem 0.5rem',
              borderRadius: '10px',
              background: d.fill + '20',
              color: d.fill,
              fontWeight: 600,
            }}>
              {d.fullName}: {d.score}
            </span>
          ))}
        </div>
      </div>

      {/* Score Trend */}
      {dailyTrend.length >= 2 && (
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius)',
          padding: '1.25rem',
          border: '1px solid var(--border-color)',
          marginBottom: '1.5rem',
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Daily Score Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                }}
              />
              <Line type="monotone" dataKey="score" stroke="#818cf8" strokeWidth={2} dot={{ r: 3, fill: '#818cf8' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Skill Trends */}
      {Object.keys(skillTrends).length > 0 && (
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius)',
          padding: '1.25rem',
          border: '1px solid var(--border-color)',
          marginBottom: '1.5rem',
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Skill Progress</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="index" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
              <YAxis domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                }}
              />
              {Object.entries(skillTrends).map(([skill, data]) => (
                <Line
                  key={skill}
                  data={data.results}
                  type="monotone"
                  dataKey="score"
                  name={data.label}
                  stroke={data.color}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginTop: '0.5rem' }}>
            {Object.entries(skillTrends).map(([, data]) => (
              <span key={data.label} style={{
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                color: 'var(--text-secondary)',
              }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: data.color, display: 'inline-block' }} />
                {data.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Difficulty Progression */}
      {difficultyData.length > 0 && (
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius)',
          padding: '1.25rem',
          border: '1px solid var(--border-color)',
          marginBottom: '1.5rem',
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>Adaptive Difficulty Levels</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={difficultyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 9 }} />
              <YAxis domain={[0, 10]} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '8px',
                  color: 'var(--text-primary)',
                }}
              />
              <Bar dataKey="difficulty" fill="#818cf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Achievements */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius)',
        padding: '1.25rem',
        border: '1px solid var(--border-color)',
        marginBottom: '1.5rem',
      }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>
          Achievements ({earned.length}/{ACHIEVEMENTS.length})
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.5rem' }}>
          {earned.map(a => (
            <div key={a.id} style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(251,191,36,0.08)',
              border: '1px solid rgba(251,191,36,0.2)',
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--accent-warning)', marginBottom: '0.15rem' }}>
                {a.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.description}</div>
            </div>
          ))}
          {unearned.map(a => (
            <div key={a.id} style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              opacity: 0.5,
            }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.15rem' }}>
                ???
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{a.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
