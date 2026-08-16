import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { WORDS_BY_LEN, wordLengthForDifficulty } from './anagramWords';

interface Props {
  difficulty: number;
  onComplete: (score: number, accuracy: number, responseTimeMs: number) => void;
}

function scramble(word: string): string {
  const letters = word.split('');
  let attempt = '';
  for (let i = 0; i < 10; i++) {
    for (let j = letters.length - 1; j > 0; j--) {
      const k = Math.floor(Math.random() * (j + 1));
      [letters[j], letters[k]] = [letters[k], letters[j]];
    }
    attempt = letters.join('');
    if (attempt !== word) return attempt;
  }
  return attempt;
}

export default function Anagram({ difficulty, onComplete }: Props) {
  const wordLen = wordLengthForDifficulty(difficulty);
  const totalTrials = Math.min(5 + Math.floor(difficulty / 2), 8);
  const trialTime = Math.max(15000, 30000 - difficulty * 1500);

  const wordPool = useMemo(() => WORDS_BY_LEN[wordLen] || WORDS_BY_LEN[5], [wordLen]);
  const [trial, setTrial] = useState(0);
  const [target, setTarget] = useState('');
  const [scrambled, setScrambled] = useState('');
  const [picked, setPicked] = useState<number[]>([]);
  const [solved, setSolved] = useState(0);
  const [feedback, setFeedback] = useState<null | 'right' | 'wrong' | 'timeout'>(null);
  const [timeLeft, setTimeLeft] = useState(trialTime);
  const [startTime] = useState(Date.now());
  const trialStartRef = useRef(Date.now());

  const newTrial = useCallback(() => {
    const w = wordPool[Math.floor(Math.random() * wordPool.length)];
    setTarget(w);
    setScrambled(scramble(w));
    setPicked([]);
    setFeedback(null);
    setTimeLeft(trialTime);
    trialStartRef.current = Date.now();
  }, [wordPool, trialTime]);

  useEffect(() => {
    newTrial();
  }, [trial, newTrial]);

  useEffect(() => {
    if (feedback !== null) return;
    const tick = setInterval(() => {
      const left = trialTime - (Date.now() - trialStartRef.current);
      if (left <= 0) {
        clearInterval(tick);
        setFeedback('timeout');
        setTimeout(() => advance(false), 1200);
      } else {
        setTimeLeft(left);
      }
    }, 100);
    return () => clearInterval(tick);
  }, [trial, feedback, trialTime]);

  const advance = useCallback((wasCorrect: boolean) => {
    if (wasCorrect) setSolved(s => s + 1);
    if (trial + 1 >= totalTrials) {
      const finalSolved = solved + (wasCorrect ? 1 : 0);
      const acc = finalSolved / totalTrials;
      const totalTime = Date.now() - startTime;
      const avgPerTrial = totalTime / totalTrials;
      const speedBonus = Math.max(0, 1 - avgPerTrial / trialTime);
      const score = Math.round(acc * 75 + speedBonus * 25);
      onComplete(score, acc, totalTime);
    } else {
      setTrial(t => t + 1);
    }
  }, [trial, totalTrials, solved, startTime, trialTime, onComplete]);

  const tryWord = (letters: string) => {
    if (letters === target) {
      setFeedback('right');
      setTimeout(() => advance(true), 700);
    }
  };

  const togglePick = (idx: number) => {
    if (feedback !== null) return;
    setPicked(p => {
      let next: number[];
      if (p.includes(idx)) next = p.filter(i => i !== idx);
      else next = [...p, idx];
      const word = next.map(i => scrambled[i]).join('');
      if (word.length === target.length) tryWord(word);
      return next;
    });
  };

  const skip = () => {
    if (feedback !== null) return;
    setFeedback('wrong');
    setTimeout(() => advance(false), 800);
  };

  const built = picked.map(i => scrambled[i]).join('');
  const pct = Math.max(0, (timeLeft / trialTime) * 100);

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        Trial {trial + 1} / {totalTrials} · Unscramble the word
      </div>
      <div style={{ width: '100%', height: '4px', background: 'var(--bg-primary)', borderRadius: '2px', marginBottom: '1.5rem', overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: pct > 30 ? 'var(--gradient-success)' : 'var(--gradient-warm)',
          transition: 'width 0.1s linear',
        }} />
      </div>

      {/* Built word display */}
      <div style={{
        fontSize: '1.6rem',
        fontWeight: 700,
        letterSpacing: '8px',
        marginBottom: '1.25rem',
        minHeight: '3rem',
        padding: '0.5rem',
        color: feedback === 'right' ? 'var(--accent-success)' : feedback === 'wrong' || feedback === 'timeout' ? 'var(--accent-danger)' : 'var(--text-primary)',
      }}>
        {built || <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', letterSpacing: 'normal' }}>Tap letters to build a word</span>}
      </div>

      {/* Scrambled letters */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        justifyContent: 'center',
        flexWrap: 'wrap',
        marginBottom: '1.5rem',
      }}>
        {scrambled.split('').map((letter, idx) => {
          const isPicked = picked.includes(idx);
          return (
            <button
              key={idx}
              onClick={() => togglePick(idx)}
              disabled={feedback !== null}
              style={{
                width: '52px',
                height: '52px',
                fontSize: '1.4rem',
                fontWeight: 800,
                background: isPicked ? 'var(--accent-primary)' : 'var(--bg-primary)',
                color: isPicked ? '#fff' : 'var(--text-primary)',
                border: '2px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                opacity: isPicked ? 0.4 : 1,
                cursor: feedback ? 'default' : 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {letter}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
        <button
          onClick={() => setPicked([])}
          disabled={feedback !== null || picked.length === 0}
          style={{
            padding: '0.5rem 1.25rem',
            background: 'var(--bg-card)',
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
          }}
        >
          Clear
        </button>
        <button
          onClick={skip}
          disabled={feedback !== null}
          style={{
            padding: '0.5rem 1.25rem',
            background: 'var(--bg-card)',
            color: 'var(--accent-warning)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
          }}
        >
          Skip
        </button>
      </div>

      {feedback === 'wrong' || feedback === 'timeout' ? (
        <div style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          The word was: <strong style={{ color: 'var(--accent-warning)' }}>{target}</strong>
        </div>
      ) : null}
    </div>
  );
}
