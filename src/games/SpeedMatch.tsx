import { useState, useEffect, useRef, useCallback } from 'react';

interface Props {
  difficulty: number;
  onComplete: (score: number, accuracy: number, responseTimeMs: number) => void;
}

const SHAPES = ['circle', 'square', 'triangle', 'diamond', 'star', 'hexagon', 'pentagon', 'cross'];
const COLORS = ['#818cf8', '#c084fc', '#34d399', '#fbbf24', '#f87171', '#38bdf8'];

interface Item {
  shape: string;
  color: string;
}

function renderShape(shape: string, color: string, size: number) {
  const s = size;
  const half = s / 2;
  switch (shape) {
    case 'circle':
      return <circle cx={half} cy={half} r={half - 4} fill={color} />;
    case 'square':
      return <rect x={4} y={4} width={s - 8} height={s - 8} fill={color} rx={4} />;
    case 'triangle':
      return <polygon points={`${half},4 ${s - 4},${s - 4} 4,${s - 4}`} fill={color} />;
    case 'diamond':
      return <polygon points={`${half},4 ${s - 4},${half} ${half},${s - 4} 4,${half}`} fill={color} />;
    case 'star': {
      const pts: string[] = [];
      for (let i = 0; i < 5; i++) {
        const angle = (i * 72 - 90) * Math.PI / 180;
        pts.push(`${half + (half - 4) * Math.cos(angle)},${half + (half - 4) * Math.sin(angle)}`);
        const inner = (i * 72 - 90 + 36) * Math.PI / 180;
        pts.push(`${half + (half - 20) * Math.cos(inner)},${half + (half - 20) * Math.sin(inner)}`);
      }
      return <polygon points={pts.join(' ')} fill={color} />;
    }
    case 'hexagon': {
      const hpts: string[] = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i * 60 - 30) * Math.PI / 180;
        hpts.push(`${half + (half - 4) * Math.cos(angle)},${half + (half - 4) * Math.sin(angle)}`);
      }
      return <polygon points={hpts.join(' ')} fill={color} />;
    }
    case 'pentagon': {
      const ppts: string[] = [];
      for (let i = 0; i < 5; i++) {
        const angle = (i * 72 - 90) * Math.PI / 180;
        ppts.push(`${half + (half - 4) * Math.cos(angle)},${half + (half - 4) * Math.sin(angle)}`);
      }
      return <polygon points={ppts.join(' ')} fill={color} />;
    }
    case 'cross':
      return <path d={`M${half - 8},4 h16 v${half - 12} h${half - 12} v16 h-${half - 12} v${half - 12} h-16 v-${half - 12} h-${half - 12} v-16 h${half - 12}z`} fill={color} />;
    default:
      return <circle cx={half} cy={half} r={half - 4} fill={color} />;
  }
}

export default function SpeedMatch({ difficulty, onComplete }: Props) {
  const totalTrials = Math.min(15 + difficulty * 2, 30);
  const numShapes = Math.min(3 + Math.floor(difficulty / 2), SHAPES.length);
  const numColors = difficulty >= 5 ? Math.min(3 + Math.floor(difficulty / 3), COLORS.length) : 1; // Color adds complexity at higher difficulties
  const matchRate = 0.4;

  const [current, setCurrent] = useState<Item>({ shape: SHAPES[0], color: COLORS[0] });
  const [previous, setPrevious] = useState<Item | null>(null);
  const [trial, setTrial] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [responded, setResponded] = useState(false);
  const [startTime] = useState(Date.now());
  const trialStartRef = useRef(Date.now());

  const genItem = useCallback((): Item => ({
    shape: SHAPES[Math.floor(Math.random() * numShapes)],
    color: numColors > 1 ? COLORS[Math.floor(Math.random() * numColors)] : COLORS[0],
  }), [numShapes, numColors]);

  useEffect(() => {
    setCurrent(genItem());
  }, [genItem]);

  const isMatch = previous !== null &&
    current.shape === previous.shape &&
    (numColors <= 1 || current.color === previous.color);

  const advance = useCallback(() => {
    if (trial + 1 >= totalTrials) {
      const acc = correct / totalTrials;
      const avgTime = totalTrials > 0 ? totalTime / totalTrials : 0;
      const timeBonus = Math.max(0, 1 - avgTime / 2000);
      const score = Math.round(acc * 70 + timeBonus * 30);
      onComplete(score, acc, Date.now() - startTime);
      return;
    }
    setPrevious(current);
    const newItem = Math.random() < matchRate
      ? { ...current }
      : genItem();
    setCurrent(newItem);
    setTrial(t => t + 1);
    setFeedback(null);
    setResponded(false);
    trialStartRef.current = Date.now();
  }, [trial, totalTrials, correct, totalTime, current, onComplete, startTime, genItem, matchRate]);

  useEffect(() => {
    if (feedback !== null) {
      const timer = setTimeout(advance, 500);
      return () => clearTimeout(timer);
    }
  }, [feedback, advance]);

  const handleResponse = (userSaysMatch: boolean) => {
    if (responded || previous === null) {
      if (previous === null) {
        // First trial, just advance
        setPrevious(current);
        setCurrent(genItem());
        setTrial(t => t + 1);
        trialStartRef.current = Date.now();
      }
      return;
    }
    setResponded(true);
    const rt = Date.now() - trialStartRef.current;
    setTotalTime(t => t + rt);

    const isCorrect = userSaysMatch === isMatch;
    if (isCorrect) setCorrect(c => c + 1);
    setFeedback(isCorrect ? 'Correct!' : 'Wrong!');
  };

  const shapeSize = 80;

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        Trial {trial + 1} / {totalTrials} {numColors > 1 ? '| Match shape AND color' : '| Match shape'}
      </div>
      <div style={{
        width: '100%',
        height: '4px',
        background: 'var(--bg-primary)',
        borderRadius: '2px',
        marginBottom: '1.5rem',
        overflow: 'hidden',
      }}>
        <div style={{
          width: `${((trial + 1) / totalTrials) * 100}%`,
          height: '100%',
          background: 'var(--gradient-warm)',
          transition: 'width 0.3s',
        }} />
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '2rem',
        marginBottom: '1.5rem',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Previous</div>
          <div style={{
            width: shapeSize + 'px',
            height: shapeSize + 'px',
            background: 'var(--bg-primary)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: previous ? 1 : 0.3,
          }}>
            {previous && (
              <svg width={shapeSize - 16} height={shapeSize - 16} viewBox={`0 0 ${shapeSize - 16} ${shapeSize - 16}`}>
                {renderShape(previous.shape, previous.color, shapeSize - 16)}
              </svg>
            )}
          </div>
        </div>
        <div style={{ fontSize: '1.5rem', color: 'var(--text-muted)' }}>vs</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Current</div>
          <div style={{
            width: shapeSize + 'px',
            height: shapeSize + 'px',
            background: 'var(--bg-accent)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(129,140,248,0.2)',
          }}>
            <svg width={shapeSize - 16} height={shapeSize - 16} viewBox={`0 0 ${shapeSize - 16} ${shapeSize - 16}`}>
              {renderShape(current.shape, current.color, shapeSize - 16)}
            </svg>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button
          onClick={() => handleResponse(true)}
          disabled={responded}
          style={{
            padding: '0.75rem 2rem',
            borderRadius: 'var(--radius)',
            background: 'var(--accent-success)',
            color: 'white',
            fontWeight: 600,
            fontSize: '1rem',
            opacity: responded ? 0.5 : 1,
          }}
        >
          Same
        </button>
        <button
          onClick={() => handleResponse(false)}
          disabled={responded}
          style={{
            padding: '0.75rem 2rem',
            borderRadius: 'var(--radius)',
            background: 'var(--accent-danger)',
            color: 'white',
            fontWeight: 600,
            fontSize: '1rem',
            opacity: responded ? 0.5 : 1,
          }}
        >
          Different
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
