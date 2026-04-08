import React, { useState, useEffect, useCallback } from 'react';

interface Props {
  difficulty: number;
  onComplete: (score: number, accuracy: number, responseTimeMs: number) => void;
}

function generateBaseShape(complexity: number): [number, number][] {
  // Generate an L/T/Z-like shape from blocks
  const blocks: [number, number][] = [[0, 0]];
  const numBlocks = Math.min(3 + complexity, 7);

  for (let i = 1; i < numBlocks; i++) {
    const base = blocks[Math.floor(Math.random() * blocks.length)];
    const dirs: [number, number][] = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    const dir = dirs[Math.floor(Math.random() * dirs.length)];
    const newBlock: [number, number] = [base[0] + dir[0], base[1] + dir[1]];
    if (!blocks.some(b => b[0] === newBlock[0] && b[1] === newBlock[1])) {
      blocks.push(newBlock);
    }
  }
  return blocks;
}

function rotatePoint(x: number, y: number, angle: number): [number, number] {
  const rad = (angle * Math.PI) / 180;
  return [
    x * Math.cos(rad) - y * Math.sin(rad),
    x * Math.sin(rad) + y * Math.cos(rad),
  ];
}

function renderBlocks(
  blocks: [number, number][],
  rotation: number,
  mirrored: boolean,
  color: string,
  size: number
): React.JSX.Element {
  const blockSize = size / 8;
  const center = size / 2;

  const transformed = blocks.map(([bx, by]) => {
    let x = bx;
    let y = by;
    if (mirrored) x = -x;
    const [rx, ry] = rotatePoint(x, y, rotation);
    return [rx, ry] as [number, number];
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {transformed.map(([rx, ry], i) => (
        <rect
          key={i}
          x={center + rx * blockSize - blockSize / 2}
          y={center + ry * blockSize - blockSize / 2}
          width={blockSize - 2}
          height={blockSize - 2}
          rx={3}
          fill={color}
          opacity={0.9}
        />
      ))}
    </svg>
  );
}

export default function MentalRotation({ difficulty, onComplete }: Props) {
  const totalRounds = Math.min(4 + Math.floor(difficulty / 2), 10);
  const complexity = Math.floor(difficulty / 2);

  const [round, setRound] = useState(0);
  const [baseShape, setBaseShape] = useState<[number, number][]>([]);
  const [rotation, setRotation] = useState(0);
  const [isMirrored, setIsMirrored] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [startTime] = useState(Date.now());
  const [roundStart, setRoundStart] = useState(Date.now());
  const [totalRT, setTotalRT] = useState(0);

  const newRound = useCallback(() => {
    const shape = generateBaseShape(complexity);
    setBaseShape(shape);
    // Rotations increase with difficulty
    const angles = [90, 180, 270];
    if (difficulty >= 3) angles.push(45, 135, 225, 315);
    setRotation(angles[Math.floor(Math.random() * angles.length)]);
    setIsMirrored(Math.random() < 0.5);
    setFeedback(null);
    setRoundStart(Date.now());
  }, [complexity, difficulty]);

  useEffect(() => {
    newRound();
  }, [round, newRound]);

  const handleAnswer = (userSaysSame: boolean) => {
    if (feedback !== null) return;
    const rt = Date.now() - roundStart;
    setTotalRT(t => t + rt);
    const isCorrect = userSaysSame === !isMirrored;
    if (isCorrect) setCorrect(c => c + 1);
    setFeedback(isCorrect ? 'Correct!' : 'Not quite!');

    setTimeout(() => {
      if (round + 1 >= totalRounds) {
        const acc = (correct + (isCorrect ? 1 : 0)) / totalRounds;
        const avgRT = (totalRT + rt) / totalRounds;
        const speedBonus = Math.max(0, 1 - avgRT / 8000);
        const score = Math.round(acc * 80 + speedBonus * 20);
        onComplete(score, acc, Date.now() - startTime);
      } else {
        setRound(r => r + 1);
      }
    }, 800);
  };

  const shapeSize = 120;

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        Round {round + 1} / {totalRounds}
      </div>
      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
        Are these shapes identical (just rotated) or mirrored?
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '2rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{
          background: 'var(--bg-primary)',
          borderRadius: '12px',
          padding: '0.5rem',
        }}>
          {renderBlocks(baseShape, 0, false, '#818cf8', shapeSize)}
        </div>
        <div style={{ fontSize: '1.25rem', color: 'var(--text-muted)' }}>vs</div>
        <div style={{
          background: 'var(--bg-primary)',
          borderRadius: '12px',
          padding: '0.5rem',
        }}>
          {renderBlocks(baseShape, rotation, isMirrored, '#c084fc', shapeSize)}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button
          onClick={() => handleAnswer(true)}
          disabled={feedback !== null}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: 'var(--radius)',
            background: 'var(--accent-success)',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.95rem',
            opacity: feedback !== null ? 0.5 : 1,
          }}
        >
          Same (Rotated)
        </button>
        <button
          onClick={() => handleAnswer(false)}
          disabled={feedback !== null}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: 'var(--radius)',
            background: 'var(--accent-danger)',
            color: 'white',
            fontWeight: 600,
            fontSize: '0.95rem',
            opacity: feedback !== null ? 0.5 : 1,
          }}
        >
          Mirrored
        </button>
      </div>
      {feedback && (
        <div style={{
          marginTop: '0.75rem',
          fontWeight: 600,
          color: feedback === 'Correct!' ? 'var(--accent-success)' : 'var(--accent-danger)',
        }}>
          {feedback}
        </div>
      )}
    </div>
  );
}
