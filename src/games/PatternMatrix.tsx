import { useState, useEffect, useCallback } from 'react';

interface Props {
  difficulty: number;
  onComplete: (score: number, accuracy: number, responseTimeMs: number) => void;
}

function generatePattern(size: number): { grid: number[][]; answer: number; options: number[] } {
  // Generate a pattern with a rule: each cell = some function of row + col
  const rules = [
    (r: number, c: number) => (r + c) % size,
    (r: number, c: number) => (r * 2 + c) % size,
    (r: number, c: number) => (r + c * 2) % size,
    (r: number, c: number) => Math.abs(r - c) % size,
    (r: number, c: number) => (r * c + 1) % size,
  ];
  const rule = rules[Math.floor(Math.random() * rules.length)];
  const colors = size + 1;

  const grid: number[][] = [];
  for (let r = 0; r < size; r++) {
    const row: number[] = [];
    for (let c = 0; c < size; c++) {
      row.push(rule(r, c) % colors);
    }
    grid.push(row);
  }

  // Remove one cell
  const missingR = Math.floor(Math.random() * size);
  const missingC = Math.floor(Math.random() * size);
  const answer = grid[missingR][missingC];
  grid[missingR][missingC] = -1;

  // Generate options
  const optionsSet = new Set([answer]);
  while (optionsSet.size < Math.min(4, colors + 1)) {
    optionsSet.add(Math.floor(Math.random() * colors));
  }
  const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

  return { grid, answer, options };
}

const PALETTE = ['#818cf8', '#c084fc', '#34d399', '#fbbf24', '#f87171', '#38bdf8', '#fb923c', '#a78bfa', '#f472b6', '#2dd4bf'];

export default function PatternMatrix({ difficulty, onComplete }: Props) {
  const size = Math.min(3 + Math.floor(difficulty / 3), 6);
  const totalRounds = Math.min(3 + Math.floor(difficulty / 2), 8);

  const [round, setRound] = useState(0);
  const [pattern, setPattern] = useState(() => generatePattern(size));
  const [correct, setCorrect] = useState(0);
  const [startTime] = useState(Date.now());
  const [roundStart, setRoundStart] = useState(Date.now());
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [totalResponseTime, setTotalResponseTime] = useState(0);

  const nextRound = useCallback(() => {
    if (round + 1 >= totalRounds) {
      const acc = correct / totalRounds;
      const avgTime = totalResponseTime / totalRounds;
      const timeBonus = Math.max(0, 1 - avgTime / 5000);
      const score = Math.round(acc * 80 + timeBonus * 20);
      onComplete(score, acc, Date.now() - startTime);
      return;
    }
    setRound(r => r + 1);
    setPattern(generatePattern(size));
    setRoundStart(Date.now());
    setFeedback(null);
  }, [round, totalRounds, correct, totalResponseTime, onComplete, size, startTime]);

  useEffect(() => {
    if (feedback !== null) {
      const timer = setTimeout(nextRound, 600);
      return () => clearTimeout(timer);
    }
  }, [feedback, nextRound]);

  const handleAnswer = (value: number) => {
    if (feedback !== null) return;
    const responseTime = Date.now() - roundStart;
    setTotalResponseTime(t => t + responseTime);
    if (value === pattern.answer) {
      setCorrect(c => c + 1);
      setFeedback('correct');
    } else {
      setFeedback('wrong');
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        Round {round + 1} / {totalRounds} | Grid: {size}x{size}
      </div>
      <div style={{
        display: 'inline-grid',
        gridTemplateColumns: `repeat(${size}, 1fr)`,
        gap: '6px',
        padding: '1rem',
        background: 'var(--bg-primary)',
        borderRadius: 'var(--radius)',
        marginBottom: '1.5rem',
      }}>
        {pattern.grid.flat().map((val, i) => (
          <div
            key={i}
            style={{
              width: Math.max(32, 64 - size * 6) + 'px',
              height: Math.max(32, 64 - size * 6) + 'px',
              borderRadius: '6px',
              background: val === -1
                ? 'transparent'
                : PALETTE[val % PALETTE.length],
              border: val === -1
                ? '2px dashed var(--text-muted)'
                : '2px solid transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.75rem',
              transition: 'all 0.2s',
            }}
          >
            {val === -1 ? '?' : ''}
          </div>
        ))}
      </div>
      <div style={{ fontSize: '0.95rem', marginBottom: '1rem', color: 'var(--text-secondary)' }}>
        Which color fills the missing cell?
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        {pattern.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(opt)}
            disabled={feedback !== null}
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '10px',
              background: PALETTE[opt % PALETTE.length],
              border: feedback !== null && opt === pattern.answer
                ? '3px solid var(--accent-success)'
                : feedback === 'wrong' && opt !== pattern.answer
                ? '3px solid transparent'
                : '3px solid transparent',
              cursor: feedback !== null ? 'default' : 'pointer',
              opacity: feedback !== null && opt !== pattern.answer ? 0.4 : 1,
              transition: 'all 0.2s',
              transform: feedback !== null && opt === pattern.answer ? 'scale(1.1)' : 'scale(1)',
            }}
          />
        ))}
      </div>
      {feedback && (
        <div style={{
          marginTop: '1rem',
          fontSize: '1.1rem',
          fontWeight: 600,
          color: feedback === 'correct' ? 'var(--accent-success)' : 'var(--accent-danger)',
        }}>
          {feedback === 'correct' ? 'Correct!' : 'Not quite!'}
        </div>
      )}
    </div>
  );
}
