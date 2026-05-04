import { useState, useCallback } from 'react';
import { ArrowLeft, Check, X } from 'lucide-react';
import type { ExerciseResult, UserProfile } from '../types';
import { EXERCISES, SKILL_LABELS, SKILL_COLORS } from '../exercises';
import { getOrCreateDifficultyState } from '../difficulty';
import { PatternMatrix, SequenceRecall, NBack, SpeedMatch, GoNoGo, MentalRotation, WordChain, StroopTest, MathSprint, ReactionTap, SchulteTable, Anagram } from '../games';

interface Props {
  exerciseIds: string[];
  profile: UserProfile;
  sessionId: string;
  onExerciseComplete: (result: ExerciseResult) => void;
  onSessionEnd: () => void;
}

export default function SessionRunner({ exerciseIds, profile, sessionId, onExerciseComplete, onSessionEnd }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<'intro' | 'playing' | 'result'>('intro');
  const [lastResult, setLastResult] = useState<{ score: number; accuracy: number } | null>(null);
  const [completedResults, setCompletedResults] = useState<{ exerciseId: string; score: number }[]>([]);

  const currentExerciseId = exerciseIds[currentIndex];
  const exercise = EXERCISES.find(e => e.id === currentExerciseId);

  const handleComplete = useCallback((score: number, accuracy: number, responseTimeMs: number) => {
    if (!exercise) return;
    const diffState = getOrCreateDifficultyState(profile, exercise.id);
    const result: ExerciseResult = {
      exerciseId: exercise.id,
      skill: exercise.skill,
      score,
      accuracy,
      responseTimeMs,
      difficulty: diffState.currentDifficulty,
      timestamp: Date.now(),
      sessionId,
    };
    onExerciseComplete(result);
    setLastResult({ score, accuracy });
    setCompletedResults(prev => [...prev, { exerciseId: exercise.id, score }]);
    setPhase('result');
  }, [exercise, profile, sessionId, onExerciseComplete]);

  const handleNext = () => {
    if (currentIndex + 1 >= exerciseIds.length) {
      onSessionEnd();
      return;
    }
    setCurrentIndex(i => i + 1);
    setPhase('intro');
    setLastResult(null);
  };

  if (!exercise) {
    return <div>Exercise not found</div>;
  }

  const diffState = getOrCreateDifficultyState(profile, exercise.id);
  const color = SKILL_COLORS[exercise.skill] || 'var(--accent-primary)';

  const renderGame = () => {
    const diff = diffState.currentDifficulty;
    const p = { difficulty: diff, onComplete: handleComplete };
    switch (exercise.id) {
      case 'pattern-matrix': return <PatternMatrix {...p} />;
      case 'sequence-recall': return <SequenceRecall {...p} />;
      case 'n-back': return <NBack {...p} />;
      case 'speed-match': return <SpeedMatch {...p} />;
      case 'go-no-go': return <GoNoGo {...p} />;
      case 'mental-rotation': return <MentalRotation {...p} />;
      case 'word-chain': return <WordChain {...p} />;
      case 'stroop-test': return <StroopTest {...p} />;
      case 'math-sprint': return <MathSprint {...p} />;
      case 'reaction-tap': return <ReactionTap {...p} />;
      case 'schulte-table': return <SchulteTable {...p} />;
      case 'anagram': return <Anagram {...p} />;
      default: return <div>Unknown exercise</div>;
    }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
      {/* Progress bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        marginBottom: '1rem',
      }}>
        <button
          onClick={onSessionEnd}
          style={{
            background: 'none',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            gap: '3px',
          }}>
            {exerciseIds.map((_, i) => (
              <div key={i} style={{
                flex: 1,
                height: '4px',
                borderRadius: '2px',
                background: i < currentIndex
                  ? 'var(--accent-success)'
                  : i === currentIndex
                  ? color
                  : 'var(--bg-card-hover)',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          {currentIndex + 1} / {exerciseIds.length}
        </span>
      </div>

      {/* Intro Phase */}
      {phase === 'intro' && (
        <div className="animate-fade-in" style={{ textAlign: 'center', padding: '2rem 0' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: color + '20',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            fontSize: '1.5rem',
          }}>
            <span style={{ color }}>&#x1F9E0;</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>{exercise.name}</h2>
          <div style={{
            fontSize: '0.8rem',
            color,
            fontWeight: 600,
            marginBottom: '1rem',
          }}>
            {SKILL_LABELS[exercise.skill]} &middot; Level {diffState.currentDifficulty}
          </div>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '0.9rem',
            maxWidth: '400px',
            margin: '0 auto 1.5rem',
            lineHeight: 1.5,
          }}>
            {exercise.description}
          </p>
          <div style={{
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius)',
            padding: '0.75rem 1rem',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            marginBottom: '1.5rem',
            border: '1px solid var(--border-color)',
            textAlign: 'left',
            lineHeight: 1.5,
          }}>
            <strong style={{ color: 'var(--accent-info)' }}>Why this works:</strong> {exercise.scienceNote.split('.').slice(0, 2).join('.')}.
          </div>
          <button
            onClick={() => setPhase('playing')}
            style={{
              padding: '0.85rem 2.5rem',
              borderRadius: 'var(--radius)',
              background: color,
              color: 'white',
              fontWeight: 700,
              fontSize: '1.05rem',
              boxShadow: `0 4px 15px ${color}40`,
              transition: 'all 0.2s',
            }}
          >
            Start Exercise
          </button>
        </div>
      )}

      {/* Playing Phase */}
      {phase === 'playing' && (
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          border: '1px solid var(--border-color)',
          minHeight: '300px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          {renderGame()}
        </div>
      )}

      {/* Result Phase */}
      {phase === 'result' && lastResult && (
        <div className="animate-fade-in" style={{ textAlign: 'center', padding: '2rem 0' }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: lastResult.score >= 70
              ? 'rgba(52,211,153,0.15)'
              : lastResult.score >= 40
              ? 'rgba(251,191,36,0.15)'
              : 'rgba(248,113,113,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
          }}>
            {lastResult.score >= 70
              ? <Check size={36} color="var(--accent-success)" />
              : <X size={36} color={lastResult.score >= 40 ? 'var(--accent-warning)' : 'var(--accent-danger)'} />
            }
          </div>
          <div style={{
            fontSize: '3rem',
            fontWeight: 800,
            background: lastResult.score >= 70 ? 'var(--gradient-success)' : 'var(--gradient-warm)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.25rem',
          }}>
            {lastResult.score}
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            Accuracy: {Math.round(lastResult.accuracy * 100)}%
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
            {lastResult.score >= 90 ? 'Outstanding! Difficulty will increase.' :
             lastResult.score >= 70 ? 'Great work! Keep building those neural pathways.' :
             lastResult.score >= 40 ? 'Good effort. Practice strengthens connections.' :
             'Keep going. Struggle is where neuroplasticity happens.'}
          </div>

          {/* Mini session summary */}
          {completedResults.length > 0 && (
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              justifyContent: 'center',
              marginBottom: '1.5rem',
              flexWrap: 'wrap',
            }}>
              {completedResults.map((r, i) => {
                const ex = EXERCISES.find(e => e.id === r.exerciseId);
                const c = ex ? SKILL_COLORS[ex.skill] : 'var(--accent-primary)';
                return (
                  <div key={i} style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: c + '20',
                    border: `2px solid ${c}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: c,
                  }}>
                    {r.score}
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={handleNext}
            style={{
              padding: '0.85rem 2.5rem',
              borderRadius: 'var(--radius)',
              background: 'var(--accent-primary)',
              color: 'white',
              fontWeight: 700,
              fontSize: '1.05rem',
              boxShadow: '0 4px 15px rgba(129,140,248,0.3)',
            }}
          >
            {currentIndex + 1 >= exerciseIds.length ? 'Finish Session' : 'Next Exercise'}
          </button>
        </div>
      )}
    </div>
  );
}
