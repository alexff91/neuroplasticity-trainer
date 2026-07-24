import { useState, useEffect, useCallback, useRef } from 'react';

interface Props {
  difficulty: number;
  onComplete: (score: number, accuracy: number, responseTimeMs: number) => void;
}

type Phase = 'waiting' | 'ready' | 'go' | 'tooSoon' | 'response' | 'distractor';

export default function ReactionTap({ difficulty, onComplete }: Props) {
  const totalTrials = Math.min(8 + Math.floor(difficulty / 2), 14);
  // Higher difficulty: more distractors, faster cutoffs
  const distractorRate = Math.min(0.05 + difficulty * 0.06, 0.5);
  const minDelay = 800;
  const maxDelay = Math.max(1200, 3000 - difficulty * 150);

  const [phase, setPhase] = useState<Phase>('waiting');
  const [trial, setTrial] = useState(0);
  const [rts, setRts] = useState<number[]>([]);
  const [errors, setErrors] = useState(0);
  const [startTime] = useState(Date.now());
  const stimulusAtRef = useRef(0);
  const timerRef = useRef<number | null>(null);

  const scheduleNext = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setPhase('ready');
    const delay = minDelay + Math.random() * (maxDelay - minDelay);
    const isDistractor = Math.random() < distractorRate;
    timerRef.current = window.setTimeout(() => {
      stimulusAtRef.current = Date.now();
      setPhase(isDistractor ? 'distractor' : 'go');
    }, delay);
  }, [distractorRate, maxDelay]);

  useEffect(() => {
    if (phase === 'waiting') {
      const t = window.setTimeout(scheduleNext, 600);
      return () => clearTimeout(t);
    }
  }, [phase, scheduleNext]);

  const finishTrial = useCallback((rt: number | null, errored: boolean) => {
    const newRts = rt !== null ? [...rts, rt] : rts;
    const newErrors = errored ? errors + 1 : errors;
    setRts(newRts);
    setErrors(newErrors);

    if (trial + 1 >= totalTrials) {
      const validRTs = newRts;
      const avgRT = validRTs.length > 0
        ? validRTs.reduce((s, r) => s + r, 0) / validRTs.length
        : 1500;
      const acc = Math.max(0, (totalTrials - newErrors) / totalTrials);
      // Score: 100 at 250ms, 50 at 600ms, 0 at 1200ms+
      const speedScore = Math.max(0, Math.min(100, 100 - (avgRT - 250) * (100 / 950)));
      const score = Math.round(speedScore * 0.7 + acc * 30);
      onComplete(score, acc, Date.now() - startTime);
      return;
    }

    setTrial(t => t + 1);
    setTimeout(() => {
      setPhase('waiting');
    }, 700);
  }, [rts, errors, trial, totalTrials, onComplete, startTime]);

  const handleTap = () => {
    if (phase === 'ready') {
      // Tapped too early
      if (timerRef.current) clearTimeout(timerRef.current);
      setPhase('tooSoon');
      finishTrial(null, true);
    } else if (phase === 'go') {
      const rt = Date.now() - stimulusAtRef.current;
      setPhase('response');
      finishTrial(rt, false);
    } else if (phase === 'distractor') {
      // Should NOT have tapped
      setPhase('tooSoon');
      finishTrial(null, true);
    }
  };

  // Distractor auto-advances if not tapped
  useEffect(() => {
    if (phase === 'distractor') {
      const t = window.setTimeout(() => {
        // Correctly inhibited
        finishTrial(null, false);
      }, 700);
      return () => clearTimeout(t);
    }
  }, [phase, finishTrial]);

  const bg = phase === 'go' ? '#22c55e'
    : phase === 'distractor' ? '#ef4444'
    : phase === 'tooSoon' ? '#f97316'
    : phase === 'ready' ? '#1e293b'
    : '#0f172a';

  const message = phase === 'waiting' ? 'Get ready...'
    : phase === 'ready' ? 'Wait for green'
    : phase === 'go' ? 'TAP NOW!'
    : phase === 'distractor' ? 'DON\'T TAP'
    : phase === 'tooSoon' ? 'Too soon!'
    : phase === 'response' ? 'Nice!'
    : '';

  const lastRT = rts.length > 0 ? rts[rts.length - 1] : null;

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        Trial {Math.min(trial + 1, totalTrials)} / {totalTrials} {distractorRate > 0.1 ? '· Tap green, NOT red' : '· Tap when green'}
      </div>
      <div style={{ width: '100%', height: '4px', background: 'var(--bg-primary)', borderRadius: '2px', marginBottom: '1rem', overflow: 'hidden' }}>
        <div style={{ width: `${(trial / totalTrials) * 100}%`, height: '100%', background: 'var(--gradient-success)', transition: 'width 0.3s' }} />
      </div>
      <button
        onClick={handleTap}
        disabled={phase === 'waiting' || phase === 'response'}
        style={{
          width: '100%',
          height: '260px',
          borderRadius: 'var(--radius-lg)',
          background: bg,
          color: 'white',
          fontSize: '1.6rem',
          fontWeight: 800,
          letterSpacing: '1px',
          transition: 'background 0.05s linear',
          border: '2px solid var(--border-color)',
          cursor: 'pointer',
          userSelect: 'none',
        }}
      >
        {message}
      </button>
      <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-around', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
        <div>Last: <strong style={{ color: 'var(--accent-info)' }}>{lastRT !== null ? `${lastRT}ms` : '—'}</strong></div>
        <div>Errors: <strong style={{ color: errors > 0 ? 'var(--accent-danger)' : 'var(--accent-success)' }}>{errors}</strong></div>
        <div>Best: <strong style={{ color: 'var(--accent-success)' }}>{rts.length > 0 ? `${Math.min(...rts)}ms` : '—'}</strong></div>
      </div>
    </div>
  );
}
