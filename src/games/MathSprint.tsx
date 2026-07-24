import { useState, useEffect, useCallback, useRef } from 'react';

interface Props {
  difficulty: number;
  onComplete: (score: number, accuracy: number, responseTimeMs: number) => void;
}

type Op = '+' | '-' | '×' | '÷';

interface Problem {
  text: string;
  answer: number;
  options: number[];
}

function genProblem(difficulty: number): Problem {
  const opPool: Op[] = difficulty < 3
    ? ['+', '-']
    : difficulty < 6
    ? ['+', '-', '×']
    : ['+', '-', '×', '÷'];
  const op = opPool[Math.floor(Math.random() * opPool.length)];

  const range = Math.min(10 + difficulty * 4, 60);
  let a = Math.floor(Math.random() * range) + 1;
  let b = Math.floor(Math.random() * range) + 1;
  let answer: number;
  let text: string;

  switch (op) {
    case '+':
      answer = a + b;
      text = `${a} + ${b}`;
      break;
    case '-':
      if (b > a) [a, b] = [b, a];
      answer = a - b;
      text = `${a} - ${b}`;
      break;
    case '×': {
      const ma = Math.floor(Math.random() * Math.min(8 + difficulty, 15)) + 2;
      const mb = Math.floor(Math.random() * Math.min(6 + difficulty, 12)) + 2;
      answer = ma * mb;
      text = `${ma} × ${mb}`;
      break;
    }
    case '÷': {
      const db = Math.floor(Math.random() * 9) + 2;
      const q = Math.floor(Math.random() * Math.min(8 + difficulty, 15)) + 2;
      answer = q;
      text = `${db * q} ÷ ${db}`;
      break;
    }
  }

  // Build 4 plausible options
  const opts = new Set<number>([answer]);
  while (opts.size < 4) {
    const delta = Math.max(1, Math.round(answer * (Math.random() * 0.3 + 0.05)));
    const sign = Math.random() < 0.5 ? -1 : 1;
    const cand = answer + sign * (delta + Math.floor(Math.random() * 3));
    if (cand !== answer && cand >= 0) opts.add(cand);
  }
  const options = Array.from(opts).sort(() => Math.random() - 0.5);
  return { text, answer, options };
}

export default function MathSprint({ difficulty, onComplete }: Props) {
  const totalTrials = Math.min(10 + difficulty, 18);
  const timePerTrial = Math.max(2500, 6000 - difficulty * 350);

  const [problem, setProblem] = useState<Problem>(() => genProblem(difficulty));
  const [trial, setTrial] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [totalRT, setTotalRT] = useState(0);
  const [feedback, setFeedback] = useState<null | 'right' | 'wrong' | 'timeout'>(null);
  const [timeLeft, setTimeLeft] = useState(timePerTrial);
  const [startTime] = useState(Date.now());
  const trialStartRef = useRef(Date.now());

  const advance = useCallback((wasCorrect: boolean, rt: number) => {
    setTotalRT(t => t + rt);
    if (wasCorrect) setCorrect(c => c + 1);
    setTimeout(() => {
      if (trial + 1 >= totalTrials) {
        const finalCorrect = correct + (wasCorrect ? 1 : 0);
        const acc = finalCorrect / totalTrials;
        const avgRT = (totalRT + rt) / totalTrials;
        const speedBonus = Math.max(0, 1 - avgRT / timePerTrial);
        const score = Math.round(acc * 70 + speedBonus * 30);
        onComplete(score, acc, Date.now() - startTime);
      } else {
        setTrial(t => t + 1);
        setProblem(genProblem(difficulty));
        setFeedback(null);
        setTimeLeft(timePerTrial);
        trialStartRef.current = Date.now();
      }
    }, 500);
  }, [trial, totalTrials, correct, totalRT, timePerTrial, difficulty, onComplete, startTime]);

  // Per-trial countdown
  useEffect(() => {
    if (feedback !== null) return;
    const tick = setInterval(() => {
      const elapsed = Date.now() - trialStartRef.current;
      const left = timePerTrial - elapsed;
      if (left <= 0) {
        clearInterval(tick);
        setFeedback('timeout');
        advance(false, timePerTrial);
      } else {
        setTimeLeft(left);
      }
    }, 50);
    return () => clearInterval(tick);
  }, [trial, feedback, timePerTrial, advance]);

  const handleAnswer = (val: number) => {
    if (feedback !== null) return;
    const rt = Date.now() - trialStartRef.current;
    const right = val === problem.answer;
    setFeedback(right ? 'right' : 'wrong');
    advance(right, rt);
  };

  const pct = Math.max(0, (timeLeft / timePerTrial) * 100);

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        Trial {trial + 1} / {totalTrials}
      </div>
      <div style={{ width: '100%', height: '4px', background: 'var(--bg-primary)', borderRadius: '2px', marginBottom: '1rem', overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: pct > 40 ? 'var(--gradient-primary)' : 'var(--gradient-warm)',
          transition: 'width 0.1s linear',
        }} />
      </div>
      <div style={{
        fontSize: '3rem',
        fontWeight: 800,
        margin: '1rem 0 1.5rem',
        padding: '1.25rem',
        background: 'var(--bg-primary)',
        borderRadius: 'var(--radius-lg)',
        letterSpacing: '2px',
        userSelect: 'none',
        color: 'var(--text-primary)',
      }}>
        {problem.text} = ?
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', maxWidth: '320px', margin: '0 auto' }}>
        {problem.options.map(opt => (
          <button
            key={opt}
            onClick={() => handleAnswer(opt)}
            disabled={feedback !== null}
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius)',
              background: feedback && opt === problem.answer
                ? 'var(--accent-success)'
                : feedback === 'wrong' && opt !== problem.answer
                ? 'var(--bg-card)'
                : 'var(--bg-card)',
              color: 'var(--text-primary)',
              fontWeight: 700,
              fontSize: '1.4rem',
              border: '2px solid var(--border-color)',
              transition: 'all 0.2s',
            }}
          >
            {opt}
          </button>
        ))}
      </div>
      {feedback && (
        <div style={{
          marginTop: '1rem',
          fontWeight: 600,
          color: feedback === 'right' ? 'var(--accent-success)' : 'var(--accent-danger)',
        }}>
          {feedback === 'right' ? 'Correct!' : feedback === 'timeout' ? `Time! Answer was ${problem.answer}` : `Wrong! Answer was ${problem.answer}`}
        </div>
      )}
    </div>
  );
}
