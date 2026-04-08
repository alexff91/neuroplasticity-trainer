import { useState, useEffect, useCallback, useRef } from 'react';

interface Props {
  difficulty: number;
  onComplete: (score: number, accuracy: number, responseTimeMs: number) => void;
}

const LETTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZ';

export default function NBack({ difficulty, onComplete }: Props) {
  const n = Math.min(1 + Math.floor(difficulty / 3), 4); // 1-back through 4-back
  const totalTrials = Math.min(15 + difficulty * 2, 30);
  const matchRate = 0.33; // ~33% of trials are matches
  const displayMs = Math.max(1200, 2500 - difficulty * 100);

  const [trials, setTrials] = useState<string[]>([]);
  const [trialIndex, setTrialIndex] = useState(0);
  const [showingLetter, setShowingLetter] = useState(true);
  const [responded, setResponded] = useState(false);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [falseAlarms, setFalseAlarms] = useState(0);
  const [correctRejects, setCorrectRejects] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [startTime] = useState(Date.now());
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Generate all trials upfront
  useEffect(() => {
    const generated: string[] = [];
    for (let i = 0; i < totalTrials; i++) {
      if (i >= n && Math.random() < matchRate) {
        generated.push(generated[i - n]); // match
      } else {
        let letter = LETTERS[Math.floor(Math.random() * LETTERS.length)];
        // Avoid accidental matches
        if (i >= n && letter === generated[i - n]) {
          letter = LETTERS[(LETTERS.indexOf(letter) + 1) % LETTERS.length];
        }
        generated.push(letter);
      }
    }
    setTrials(generated);
  }, [n, totalTrials]);

  const isMatch = trialIndex >= n && trials.length > 0 && trials[trialIndex] === trials[trialIndex - n];

  const advanceTrial = useCallback(() => {
    if (trialIndex + 1 >= totalTrials) {
      // Score
      const totalPossibleMatches = hits + misses;
      const totalPossibleNonMatches = falseAlarms + correctRejects;
      const total = totalPossibleMatches + totalPossibleNonMatches;
      const acc = total > 0 ? (hits + correctRejects) / total : 0;
      const score = Math.round(acc * 100);
      onComplete(score, acc, Date.now() - startTime);
      return;
    }
    setTrialIndex(i => i + 1);
    setShowingLetter(true);
    setResponded(false);
    setFeedback(null);
  }, [trialIndex, totalTrials, hits, misses, falseAlarms, correctRejects, onComplete, startTime]);

  // Auto-advance: show letter, then blank, then advance
  useEffect(() => {
    if (trials.length === 0) return;
    if (showingLetter) {
      timerRef.current = setTimeout(() => {
        setShowingLetter(false);
        // Record miss or correct reject if no response
        if (!responded) {
          if (isMatch) {
            setMisses(m => m + 1);
            setFeedback('Missed match!');
          } else {
            setCorrectRejects(cr => cr + 1);
          }
        }
      }, displayMs);
    } else {
      timerRef.current = setTimeout(advanceTrial, 600);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [showingLetter, trials.length, displayMs, responded, isMatch, advanceTrial]);

  const handleResponse = (userSaysMatch: boolean) => {
    if (responded || !showingLetter) return;
    setResponded(true);

    if (userSaysMatch && isMatch) {
      setHits(h => h + 1);
      setFeedback('Hit!');
    } else if (userSaysMatch && !isMatch) {
      setFalseAlarms(fa => fa + 1);
      setFeedback('False alarm');
    } else if (!userSaysMatch && isMatch) {
      setMisses(m => m + 1);
      setFeedback('Missed match');
    } else {
      setCorrectRejects(cr => cr + 1);
      setFeedback('Correct');
    }
  };

  if (trials.length === 0) return <div>Loading...</div>;

  const progressPct = ((trialIndex + 1) / totalTrials) * 100;

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
        {n}-Back | Trial {trialIndex + 1} / {totalTrials}
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
          width: `${progressPct}%`,
          height: '100%',
          background: 'var(--gradient-primary)',
          transition: 'width 0.3s',
        }} />
      </div>
      <div style={{
        width: '120px',
        height: '120px',
        margin: '0 auto 1.5rem',
        borderRadius: '16px',
        background: showingLetter ? 'var(--bg-accent)' : 'var(--bg-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '3rem',
        fontWeight: 700,
        color: 'var(--accent-primary)',
        transition: 'all 0.2s',
        boxShadow: showingLetter ? '0 0 30px rgba(129,140,248,0.2)' : 'none',
      }}>
        {showingLetter ? trials[trialIndex] : ''}
      </div>
      <div style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>
        Does this letter match the one from <strong>{n} step{n > 1 ? 's' : ''}</strong> ago?
      </div>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button
          onClick={() => handleResponse(true)}
          disabled={responded || !showingLetter}
          style={{
            padding: '0.75rem 2rem',
            borderRadius: 'var(--radius)',
            background: 'var(--accent-success)',
            color: 'white',
            fontWeight: 600,
            fontSize: '1rem',
            opacity: responded || !showingLetter ? 0.5 : 1,
            transition: 'all 0.2s',
          }}
        >
          Match
        </button>
        <button
          onClick={() => handleResponse(false)}
          disabled={responded || !showingLetter}
          style={{
            padding: '0.75rem 2rem',
            borderRadius: 'var(--radius)',
            background: 'var(--accent-danger)',
            color: 'white',
            fontWeight: 600,
            fontSize: '1rem',
            opacity: responded || !showingLetter ? 0.5 : 1,
            transition: 'all 0.2s',
          }}
        >
          No Match
        </button>
      </div>
      {feedback && (
        <div style={{
          marginTop: '0.75rem',
          fontSize: '0.95rem',
          fontWeight: 600,
          color: feedback === 'Hit!' || feedback === 'Correct'
            ? 'var(--accent-success)'
            : 'var(--accent-danger)',
        }}>
          {feedback}
        </div>
      )}
    </div>
  );
}
