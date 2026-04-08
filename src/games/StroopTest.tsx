import { useState, useEffect, useCallback, useRef } from 'react';

interface Props {
  difficulty: number;
  onComplete: (score: number, accuracy: number, responseTimeMs: number) => void;
}

const COLOR_MAP: Record<string, string> = {
  RED: '#ef4444',
  BLUE: '#3b82f6',
  GREEN: '#22c55e',
  YELLOW: '#eab308',
  PURPLE: '#a855f7',
  ORANGE: '#f97316',
  PINK: '#ec4899',
  TEAL: '#14b8a6',
};

export default function StroopTest({ difficulty, onComplete }: Props) {
  const totalTrials = Math.min(15 + difficulty * 2, 30);
  const colorNames = Object.keys(COLOR_MAP).slice(0, Math.min(4 + Math.floor(difficulty / 2), 8));
  const congruentRate = Math.max(0.1, 0.5 - difficulty * 0.04);

  const [wordText, setWordText] = useState('');
  const [inkColor, setInkColor] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [trial, setTrial] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [totalRT, setTotalRT] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [startTime] = useState(Date.now());
  const trialStartRef = useRef(Date.now());

  const genTrial = useCallback(() => {
    const isCongruent = Math.random() < congruentRate;
    const word = colorNames[Math.floor(Math.random() * colorNames.length)];
    let ink: string;
    if (isCongruent) {
      ink = word;
    } else {
      const others = colorNames.filter(c => c !== word);
      ink = others[Math.floor(Math.random() * others.length)];
    }

    // Options: the correct ink color + 2-3 distractors
    const optSet = new Set([ink]);
    while (optSet.size < Math.min(4, colorNames.length)) {
      optSet.add(colorNames[Math.floor(Math.random() * colorNames.length)]);
    }
    const opts = Array.from(optSet).sort(() => Math.random() - 0.5);

    setWordText(word);
    setInkColor(ink);
    setOptions(opts);
    setFeedback(null);
    trialStartRef.current = Date.now();
  }, [colorNames, congruentRate]);

  useEffect(() => {
    genTrial();
  }, [trial, genTrial]);

  const handleAnswer = (selectedColor: string) => {
    if (feedback !== null) return;
    const rt = Date.now() - trialStartRef.current;
    setTotalRT(t => t + rt);
    const isCorrect = selectedColor === inkColor;
    if (isCorrect) setCorrect(c => c + 1);
    setFeedback(isCorrect ? 'Correct!' : `Wrong! It was ${inkColor}`);

    setTimeout(() => {
      if (trial + 1 >= totalTrials) {
        const acc = (correct + (isCorrect ? 1 : 0)) / totalTrials;
        const avgRT = (totalRT + rt) / totalTrials;
        const speedBonus = Math.max(0, 1 - avgRT / 3000);
        const score = Math.round(acc * 75 + speedBonus * 25);
        onComplete(score, acc, Date.now() - startTime);
      } else {
        setTrial(t => t + 1);
      }
    }, 600);
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        Trial {trial + 1} / {totalTrials}
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
          background: 'var(--gradient-primary)',
          transition: 'width 0.3s',
        }} />
      </div>
      <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
        What <strong>color</strong> is this word printed in? (Ignore the word itself)
      </div>
      <div style={{
        fontSize: '3.5rem',
        fontWeight: 800,
        color: COLOR_MAP[inkColor] || '#fff',
        marginBottom: '2rem',
        padding: '1rem',
        background: 'var(--bg-primary)',
        borderRadius: 'var(--radius-lg)',
        letterSpacing: '2px',
        userSelect: 'none',
      }}>
        {wordText}
      </div>
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        justifyContent: 'center',
        flexWrap: 'wrap',
      }}>
        {options.map(colorName => (
          <button
            key={colorName}
            onClick={() => handleAnswer(colorName)}
            disabled={feedback !== null}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: 'var(--radius)',
              background: COLOR_MAP[colorName] || 'var(--bg-card)',
              color: 'white',
              fontWeight: 700,
              fontSize: '0.95rem',
              opacity: feedback !== null ? 0.6 : 1,
              transition: 'all 0.2s',
              textShadow: '0 1px 2px rgba(0,0,0,0.3)',
              minWidth: '80px',
            }}
          >
            {colorName}
          </button>
        ))}
      </div>
      {feedback && (
        <div style={{
          marginTop: '1rem',
          fontWeight: 600,
          color: feedback === 'Correct!' ? 'var(--accent-success)' : 'var(--accent-danger)',
        }}>
          {feedback}
        </div>
      )}
    </div>
  );
}
