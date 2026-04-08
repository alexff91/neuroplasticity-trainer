import { useState, useEffect, useRef, useCallback } from 'react';

interface Props {
  difficulty: number;
  onComplete: (score: number, accuracy: number, responseTimeMs: number) => void;
}

const GO_COLORS = ['#34d399', '#38bdf8', '#818cf8'];
const NOGO_COLORS = ['#f87171', '#fb923c'];

export default function GoNoGo({ difficulty, onComplete }: Props) {
  const totalTrials = Math.min(20 + difficulty * 2, 40);
  const noGoRate = Math.min(0.2 + difficulty * 0.03, 0.45);
  const timeoutMs = Math.max(800, 2000 - difficulty * 100);

  const [trials] = useState<boolean[]>(() => {
    return Array.from({ length: totalTrials }, () => Math.random() > noGoRate);
  });
  const [trialIndex, setTrialIndex] = useState(0);
  const [showing, setShowing] = useState(false);
  const [responded, setResponded] = useState(false);
  const [hits, setHits] = useState(0);
  const [correctInhibits, setCorrectInhibits] = useState(0);
  const [falseAlarms, setFalseAlarms] = useState(0);
  const [misses, setMisses] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [totalRT, setTotalRT] = useState(0);
  const [startTime] = useState(Date.now());
  const trialStartRef = useRef(Date.now());
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const isGo = trials[trialIndex];
  const color = isGo
    ? GO_COLORS[trialIndex % GO_COLORS.length]
    : NOGO_COLORS[trialIndex % NOGO_COLORS.length];

  const advance = useCallback(() => {
    if (trialIndex + 1 >= totalTrials) {
      const total = hits + correctInhibits + falseAlarms + misses;
      const acc = total > 0 ? (hits + correctInhibits) / total : 0;
      const avgRT = hits > 0 ? totalRT / hits : 1000;
      const speedBonus = Math.max(0, 1 - avgRT / 1500);
      const score = Math.round(acc * 75 + speedBonus * 25);
      onComplete(score, acc, Date.now() - startTime);
      return;
    }
    setTrialIndex(i => i + 1);
    setShowing(false);
    setResponded(false);
    setFeedback(null);
  }, [trialIndex, totalTrials, hits, correctInhibits, falseAlarms, misses, totalRT, onComplete, startTime]);

  // Show stimulus after brief gap
  useEffect(() => {
    const gap = 300 + Math.random() * 500; // Random ISI for unpredictability
    const timer = setTimeout(() => {
      setShowing(true);
      trialStartRef.current = Date.now();
    }, gap);
    return () => clearTimeout(timer);
  }, [trialIndex]);

  // Auto-advance on timeout
  useEffect(() => {
    if (!showing) return;
    timerRef.current = setTimeout(() => {
      if (!responded) {
        if (isGo) {
          setMisses(m => m + 1);
          setFeedback('Too slow!');
        } else {
          setCorrectInhibits(ci => ci + 1);
          setFeedback('Good inhibit!');
        }
      }
      setTimeout(advance, 500);
    }, timeoutMs);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [showing, responded, isGo, timeoutMs, advance]);

  const handleTap = () => {
    if (!showing || responded) return;
    setResponded(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    const rt = Date.now() - trialStartRef.current;

    if (isGo) {
      setHits(h => h + 1);
      setTotalRT(t => t + rt);
      setFeedback(`${rt}ms`);
    } else {
      setFalseAlarms(fa => fa + 1);
      setFeedback('Should NOT tap!');
    }
    setTimeout(advance, 500);
  };

  const progressPct = ((trialIndex + 1) / totalTrials) * 100;

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        Trial {trialIndex + 1} / {totalTrials} | Tap on <span style={{ color: '#34d399' }}>green/blue</span>, hold on <span style={{ color: '#f87171' }}>red/orange</span>
      </div>
      <div style={{
        width: '100%',
        height: '4px',
        background: 'var(--bg-primary)',
        borderRadius: '2px',
        marginBottom: '2rem',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${progressPct}%`,
          height: '100%',
          background: 'var(--gradient-success)',
          transition: 'width 0.3s',
        }} />
      </div>
      <button
        onClick={handleTap}
        style={{
          width: '160px',
          height: '160px',
          borderRadius: '50%',
          border: 'none',
          background: showing ? color : 'var(--bg-card-hover)',
          cursor: 'pointer',
          transition: 'all 0.15s',
          boxShadow: showing ? `0 0 40px ${color}40` : 'none',
          transform: showing ? 'scale(1)' : 'scale(0.8)',
          margin: '0 auto 1.5rem',
          display: 'block',
        }}
      />
      {feedback && (
        <div style={{
          fontSize: '1.1rem',
          fontWeight: 600,
          color: feedback.includes('NOT') || feedback === 'Too slow!'
            ? 'var(--accent-danger)'
            : 'var(--accent-success)',
        }}>
          {feedback}
        </div>
      )}
      {!feedback && !showing && (
        <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Wait for the stimulus...
        </div>
      )}
    </div>
  );
}
