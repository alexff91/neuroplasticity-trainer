import { useState, useEffect, useRef } from 'react';

interface Props {
  difficulty: number;
  onComplete: (score: number, accuracy: number, responseTimeMs: number) => void;
}

// Word lists by category
const CATEGORIES: Record<string, string[]> = {
  'Animals': ['cat', 'dog', 'bird', 'fish', 'lion', 'bear', 'wolf', 'deer', 'hawk', 'frog', 'snake', 'whale', 'shark', 'eagle', 'tiger', 'zebra', 'horse', 'mouse', 'goat', 'duck', 'swan', 'crab', 'seal', 'dove', 'crow', 'moth', 'wasp', 'ant', 'bee', 'owl'],
  'Foods': ['rice', 'cake', 'bread', 'soup', 'fish', 'meat', 'corn', 'bean', 'plum', 'lime', 'pear', 'date', 'fig', 'jam', 'nut', 'pie', 'ham', 'yam', 'oat', 'egg', 'milk', 'salt', 'sage', 'mint', 'dill', 'kale', 'tofu', 'lamb', 'veal', 'tuna'],
  'Colors': ['red', 'blue', 'gold', 'pink', 'gray', 'teal', 'lime', 'plum', 'ruby', 'jade', 'navy', 'rose', 'sage', 'rust', 'wine', 'sand', 'coal', 'snow', 'moss', 'fawn'],
  'Body Parts': ['arm', 'leg', 'eye', 'ear', 'toe', 'lip', 'hip', 'rib', 'jaw', 'shin', 'knee', 'palm', 'nail', 'bone', 'skin', 'hair', 'back', 'neck', 'foot', 'hand'],
  'Nature': ['tree', 'lake', 'hill', 'rain', 'snow', 'wind', 'rock', 'sand', 'clay', 'moss', 'vine', 'leaf', 'root', 'bark', 'wave', 'tide', 'reef', 'cave', 'peak', 'vale'],
};

type ChallengeType = 'category' | 'starting-letter' | 'ending-letter';

interface Challenge {
  type: ChallengeType;
  prompt: string;
  validate: (word: string) => boolean;
  hints: string[];
}

function generateChallenge(difficulty: number): Challenge {
  const types: ChallengeType[] = ['category'];
  if (difficulty >= 3) types.push('starting-letter');
  if (difficulty >= 5) types.push('ending-letter');

  const type = types[Math.floor(Math.random() * types.length)];

  if (type === 'category') {
    const cats = Object.keys(CATEGORIES);
    const cat = cats[Math.floor(Math.random() * cats.length)];
    return {
      type: 'category',
      prompt: `Name things in category: ${cat}`,
      validate: (w) => {
        // Accept any reasonable word (we're lenient)
        return w.length >= 2 && /^[a-z]+$/i.test(w);
      },
      hints: CATEGORIES[cat].slice(0, 5),
    };
  } else if (type === 'starting-letter') {
    const letter = 'ABCDEFGHIJKLMNOPRSTW'[Math.floor(Math.random() * 20)];
    return {
      type: 'starting-letter',
      prompt: `Words starting with "${letter}"`,
      validate: (w) => w.length >= 2 && w[0].toUpperCase() === letter,
      hints: [],
    };
  } else {
    const letters = 'ADEGILMNORST';
    const letter = letters[Math.floor(Math.random() * letters.length)];
    return {
      type: 'ending-letter',
      prompt: `Words ending with "${letter}"`,
      validate: (w) => w.length >= 2 && w[w.length - 1].toUpperCase() === letter,
      hints: [],
    };
  }
}

export default function WordChain({ difficulty, onComplete }: Props) {
  const timeLimitSec = Math.max(20, 45 - difficulty * 2);
  const targetWords = Math.min(3 + difficulty, 12);

  const [challenge] = useState(() => generateChallenge(difficulty));
  const [input, setInput] = useState('');
  const [words, setWords] = useState<string[]>([]);
  const [invalid, setInvalid] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(timeLimitSec);
  const [startTime] = useState(Date.now());
  const [done, setDone] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (done) return;
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setDone(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [done]);

  useEffect(() => {
    if (done) {
      const acc = Math.min(words.length / targetWords, 1);
      const score = Math.round(acc * 100);
      onComplete(score, acc, Date.now() - startTime);
    }
  }, [done, words.length, targetWords, onComplete, startTime]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const word = input.trim().toLowerCase();
    if (!word) return;

    if (words.includes(word)) {
      setInvalid('Already used!');
      setTimeout(() => setInvalid(null), 1000);
      setInput('');
      return;
    }

    if (!challenge.validate(word)) {
      setInvalid('Does not match the rule!');
      setTimeout(() => setInvalid(null), 1000);
      setInput('');
      return;
    }

    setWords(w => [...w, word]);
    setInput('');

    if (words.length + 1 >= targetWords) {
      setDone(true);
    }
  };

  const timeColor = timeLeft <= 5 ? 'var(--accent-danger)' : timeLeft <= 10 ? 'var(--accent-warning)' : 'var(--accent-success)';

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem',
      }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          {words.length} / {targetWords} words
        </span>
        <span style={{ color: timeColor, fontWeight: 700, fontSize: '1.25rem', fontFamily: 'monospace' }}>
          {timeLeft}s
        </span>
      </div>
      <div style={{
        background: 'var(--bg-primary)',
        borderRadius: 'var(--radius)',
        padding: '1rem',
        marginBottom: '1rem',
        fontSize: '1.1rem',
        fontWeight: 600,
        color: 'var(--accent-primary)',
      }}>
        {challenge.prompt}
      </div>
      {!done && (
        <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type a word..."
              autoComplete="off"
              autoCapitalize="off"
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius)',
                border: `2px solid ${invalid ? 'var(--accent-danger)' : 'var(--border-color)'}`,
                background: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: 'var(--radius)',
                background: 'var(--accent-primary)',
                color: 'white',
                fontWeight: 600,
                fontSize: '1rem',
              }}
            >
              Enter
            </button>
          </div>
          {invalid && (
            <div style={{ marginTop: '0.5rem', color: 'var(--accent-danger)', fontSize: '0.875rem' }}>
              {invalid}
            </div>
          )}
        </form>
      )}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        justifyContent: 'center',
        minHeight: '40px',
      }}>
        {words.map((w, i) => (
          <span key={i} style={{
            padding: '0.35rem 0.75rem',
            borderRadius: '20px',
            background: 'var(--bg-accent)',
            color: 'var(--accent-primary)',
            fontSize: '0.875rem',
            fontWeight: 500,
            animation: 'fadeIn 0.3s ease-out',
          }}>
            {w}
          </span>
        ))}
      </div>
    </div>
  );
}
