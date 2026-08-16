import { describe, it, expect, afterEach, vi } from 'vitest';
import { CATEGORIES, LEXICON, isWord, isInCategory } from '../games/wordlist';
import { generateChallenge, START_LETTERS, END_LETTERS } from '../games/wordChainChallenge';

// A round can ask for up to 12 words (min(3 + difficulty, 12)), so every
// letter the prompts can pick needs a healthy margin above that.
const MIN_WORDS_PER_LETTER = 20;

describe('word lexicon', () => {
  it('contains only lower-case alphabetic words', () => {
    const bad = [...LEXICON].filter(w => !/^[a-z]+$/.test(w));
    expect(bad).toEqual([]);
  });

  it('is big enough to be a real check but small enough to ship', () => {
    expect(LEXICON.size).toBeGreaterThan(1500);
    expect(LEXICON.size).toBeLessThan(6000);
  });

  it('has enough words for every start letter the game can ask for', () => {
    for (const letter of START_LETTERS) {
      const count = [...LEXICON].filter(w => w.startsWith(letter.toLowerCase())).length;
      expect(count, `words starting with ${letter}`).toBeGreaterThanOrEqual(MIN_WORDS_PER_LETTER);
    }
  });

  it('has enough words for every end letter the game can ask for', () => {
    for (const letter of END_LETTERS) {
      const count = [...LEXICON].filter(w => w.endsWith(letter.toLowerCase())).length;
      expect(count, `words ending with ${letter}`).toBeGreaterThanOrEqual(MIN_WORDS_PER_LETTER);
    }
  });

  it('gives every category enough members for a full round', () => {
    for (const [name, words] of Object.entries(CATEGORIES)) {
      expect(words.length, `category ${name}`).toBeGreaterThanOrEqual(12);
      expect(new Set(words).size, `category ${name} has duplicates`).toBe(words.length);
    }
  });

  it('folds every category word into the lexicon', () => {
    for (const words of Object.values(CATEGORIES)) {
      for (const w of words) expect(isWord(w)).toBe(true);
    }
  });

  it('recognises real words and rejects nonsense', () => {
    expect(isWord('planet')).toBe(true);
    expect(isWord('PLANET')).toBe(true);
    expect(isWord(' planet ')).toBe(true);
    expect(isWord('aa')).toBe(false);
    expect(isWord('bb')).toBe(false);
    expect(isWord('zzzz')).toBe(false);
  });

  it('checks category membership rather than mere wordhood', () => {
    expect(isInCategory('tiger', 'Animals')).toBe(true);
    expect(isInCategory('planet', 'Animals')).toBe(false);
    expect(isInCategory('tiger', 'Nonexistent')).toBe(false);
  });
});

describe('WordChain challenges', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('only offers category prompts at low difficulty', () => {
    for (let i = 0; i < 20; i++) {
      expect(generateChallenge(1).type).toBe('category');
    }
  });

  it('rejects nonsense the old lenient rule used to accept', () => {
    // 'aa bb cc' was worth full marks before the lexicon existed.
    for (const difficulty of [1, 4, 6, 10]) {
      for (let i = 0; i < 30; i++) {
        const challenge = generateChallenge(difficulty);
        expect(challenge.validate('aa')).toBe(false);
        expect(challenge.validate('bb')).toBe(false);
        expect(challenge.validate('qqqq')).toBe(false);
      }
    }
  });

  it('accepts a genuine word that satisfies a starting-letter prompt', () => {
    // First draw picks the challenge type, second picks the letter:
    // difficulty 3 offers ['category', 'starting-letter'].
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.9).mockReturnValue(0);
    const challenge = generateChallenge(3);
    expect(challenge.type).toBe('starting-letter');
    expect(challenge.prompt).toContain('A');
    expect(challenge.validate('apple')).toBe(true);
    expect(challenge.validate('planet')).toBe(false); // wrong letter
    expect(challenge.validate('azzzz')).toBe(false);  // right letter, not a word
  });

  it('separates "wrong rule" from "not a word" for the error message', () => {
    vi.spyOn(Math, 'random').mockReturnValueOnce(0.9).mockReturnValue(0);
    const challenge = generateChallenge(3);
    expect(challenge.matchesRule('azzzz')).toBe(true);
    expect(challenge.validate('azzzz')).toBe(false);
    expect(challenge.matchesRule('planet')).toBe(false);
  });

  it('accepts only members of the named category', () => {
    const challenge = generateChallenge(1);
    const category = challenge.prompt.replace('Name things in category: ', '');
    const members = CATEGORIES[category];
    expect(members).toBeDefined();
    expect(challenge.validate(members[0])).toBe(true);
    const outsider = [...LEXICON].find(w => !members.includes(w))!;
    expect(challenge.validate(outsider)).toBe(false);
  });

  it('offers hints drawn from the category itself', () => {
    const challenge = generateChallenge(1);
    const category = challenge.prompt.replace('Name things in category: ', '');
    expect(challenge.hints).toHaveLength(5);
    for (const hint of challenge.hints) {
      expect(isInCategory(hint, category)).toBe(true);
    }
  });
});
