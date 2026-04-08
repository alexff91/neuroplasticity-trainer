import { useState, useEffect, useCallback } from 'react';

interface Props {
  difficulty: number;
  onComplete: (score: number, accuracy: number, responseTimeMs: number) => void;
}

const COLORS = ['#818cf8', '#c084fc', '#34d399', '#fbbf24', '#f87171', '#38bdf8', '#fb923c', '#a78bfa', '#f472b6'];

export default function SequenceRecall({ difficulty, onComplete }: Props) {
  const seqLength = Math.min(3 + difficulty, 12);
  const totalRounds = Math.min(3 + Math.floor(difficulty / 3), 6);
  const gridSize = Math.min(3 + Math.floor(difficulty / 3), 5);
  const showTimeMs = Math.max(500, 1200 - difficulty * 80);

  const [phase, setPhase] = useState<'showing' | 'input' | 'feedback'>('showing');
  const [sequence, setSequence] = useState<number[]>([]);
  const [showIndex, setShowIndex] = useState(0);
  const [userInput, setUserInput] = useState<number[]>([]);
  const [round, setRound] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [startTime] = useState(Date.now());
  const [highlightCell, setHighlightCell] = useState<number | null>(null);

  const generateSequence = useCallback(() => {
    const cells = gridSize * gridSize;
    const seq: number[] = [];
    for (let i = 0; i < seqLength; i++) {
      seq.push(Math.floor(Math.random() * cells));
    }
    return seq;
  }, [gridSize, seqLength]);

  useEffect(() => {
    setSequence(generateSequence());
    setShowIndex(0);
    setPhase('showing');
    setUserInput([]);
  }, [round, generateSequence]);

  useEffect(() => {
    if (phase !== 'showing') return;
    if (showIndex >= sequence.length) {
      const timer = setTimeout(() => setPhase('input'), 300);
      return () => clearTimeout(timer);
    }
    setHighlightCell(sequence[showIndex]);
    const timer = setTimeout(() => {
      setHighlightCell(null);
      setTimeout(() => setShowIndex(i => i + 1), 150);
    }, showTimeMs);
    return () => clearTimeout(timer);
  }, [phase, showIndex, sequence, showTimeMs]);

  const handleCellClick = (cellIndex: number) => {
    if (phase !== 'input') return;
    const newInput = [...userInput, cellIndex];
    setUserInput(newInput);
    setHighlightCell(cellIndex);
    setTimeout(() => setHighlightCell(null), 200);

    if (newInput.length === sequence.length) {
      // Check
      const correctCount = newInput.filter((v, i) => v === sequence[i]).length;
      const isCorrect = correctCount === sequence.length;
      if (isCorrect) setCorrect(c => c + 1);
      setPhase('feedback');

      setTimeout(() => {
        if (round + 1 >= totalRounds) {
          const acc = (correct + (isCorrect ? 1 : 0)) / totalRounds;
          const score = Math.round(acc * 100);
          onComplete(score, acc, Date.now() - startTime);
        } else {
          setRound(r => r + 1);
        }
      }, 1200);
    }
  };

  const cells = Array.from({ length: gridSize * gridSize }, (_, i) => i);
  const isInSequence = phase === 'feedback' ? new Set(sequence) : new Set<number>();

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        Round {round + 1} / {totalRounds} | Sequence length: {seqLength}
      </div>
      <div style={{
        marginBottom: '1rem',
        fontSize: '1rem',
        color: phase === 'showing' ? 'var(--accent-warning)' : phase === 'input' ? 'var(--accent-primary)' : 'var(--text-secondary)',
        fontWeight: 600,
      }}>
        {phase === 'showing' && 'Watch the sequence...'}
        {phase === 'input' && `Tap the cells in order (${userInput.length}/${sequence.length})`}
        {phase === 'feedback' && (
          userInput.filter((v, i) => v === sequence[i]).length === sequence.length
            ? 'Perfect recall!'
            : `Got ${userInput.filter((v, i) => v === sequence[i]).length} of ${sequence.length} correct`
        )}
      </div>
      <div style={{
        display: 'inline-grid',
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gap: '8px',
        padding: '1rem',
      }}>
        {cells.map(i => (
          <button
            key={i}
            onClick={() => handleCellClick(i)}
            disabled={phase !== 'input'}
            style={{
              width: Math.max(40, 68 - gridSize * 6) + 'px',
              height: Math.max(40, 68 - gridSize * 6) + 'px',
              borderRadius: '10px',
              border: 'none',
              background: highlightCell === i
                ? COLORS[sequence.indexOf(i) % COLORS.length] || 'var(--accent-primary)'
                : phase === 'feedback' && isInSequence.has(i)
                ? COLORS[sequence.indexOf(i) % COLORS.length] + '60'
                : 'var(--bg-card-hover)',
              cursor: phase === 'input' ? 'pointer' : 'default',
              transition: 'all 0.15s',
              transform: highlightCell === i ? 'scale(1.1)' : 'scale(1)',
              boxShadow: highlightCell === i ? '0 0 20px rgba(129,140,248,0.4)' : 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
}
