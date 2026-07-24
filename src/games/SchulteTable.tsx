import { useState, useEffect, useMemo } from 'react';

interface Props {
  difficulty: number;
  onComplete: (score: number, accuracy: number, responseTimeMs: number) => void;
}

export default function SchulteTable({ difficulty, onComplete }: Props) {
  // Grid size: 3x3 at low diff, up to 6x6 at high
  const size = Math.min(3 + Math.floor(difficulty / 2), 6);
  const total = size * size;

  const numbers = useMemo(() => {
    const arr = Array.from({ length: total }, (_, i) => i + 1);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [total]);

  const [next, setNext] = useState(1);
  const [errors, setErrors] = useState(0);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setElapsed(Date.now() - startTime), 100);
    return () => clearInterval(t);
  }, [startTime, done]);

  useEffect(() => {
    if (next > total && !done) {
      setDone(true);
      const time = Date.now() - startTime;
      // Target time: ~1.2s per cell at expert level, 3s at beginner
      const targetTime = total * (3000 - difficulty * 180);
      const speedScore = Math.max(0, Math.min(100, (targetTime / time) * 80));
      const errorPenalty = Math.min(50, errors * 8);
      const score = Math.max(0, Math.round(speedScore - errorPenalty));
      const acc = Math.max(0, (total - errors) / total);
      setTimeout(() => onComplete(score, acc, time), 800);
    }
  }, [next, total, done, startTime, difficulty, errors, onComplete]);

  const handleClick = (n: number) => {
    if (done) return;
    if (n === next) {
      setNext(v => v + 1);
    } else {
      setErrors(e => e + 1);
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        Tap numbers in order: 1 → {total}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '1rem', fontSize: '0.9rem' }}>
        <span>Next: <strong style={{ color: 'var(--accent-primary)' }}>{Math.min(next, total)}</strong></span>
        <span>Time: <strong style={{ color: 'var(--accent-info)' }}>{(elapsed / 1000).toFixed(1)}s</strong></span>
        <span>Errors: <strong style={{ color: errors > 0 ? 'var(--accent-danger)' : 'var(--accent-success)' }}>{errors}</strong></span>
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${size}, 1fr)`,
        gap: '6px',
        maxWidth: `${size * 70}px`,
        margin: '0 auto',
      }}>
        {numbers.map((n, i) => {
          const isDone = n < next;
          return (
            <button
              key={i}
              onClick={() => handleClick(n)}
              disabled={done}
              style={{
                aspectRatio: '1',
                fontSize: size > 5 ? '1rem' : '1.4rem',
                fontWeight: 700,
                background: isDone ? 'var(--accent-success)' : 'var(--bg-primary)',
                color: isDone ? '#fff' : 'var(--text-primary)',
                border: '2px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                opacity: isDone ? 0.5 : 1,
                transition: 'all 0.15s',
                cursor: isDone ? 'default' : 'pointer',
              }}
            >
              {n}
            </button>
          );
        })}
      </div>
      {done && (
        <div style={{ marginTop: '1rem', fontWeight: 700, color: 'var(--accent-success)' }}>
          Complete in {(elapsed / 1000).toFixed(1)}s!
        </div>
      )}
    </div>
  );
}
