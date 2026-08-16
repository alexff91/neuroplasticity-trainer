import { describe, it, expect } from 'vitest';
import { WORDS_BY_LEN, wordLengthForDifficulty } from '../games/anagramWords';

describe('anagram word pool', () => {
  it('files every word in the bucket matching its length', () => {
    for (const [len, words] of Object.entries(WORDS_BY_LEN)) {
      for (const word of words) {
        expect(word.length, `${word} in the ${len}-letter bucket`).toBe(Number(len));
      }
    }
  });

  it('uses upper-case letters only, with no duplicates in a bucket', () => {
    for (const [len, words] of Object.entries(WORDS_BY_LEN)) {
      for (const word of words) {
        expect(word, `${word} in bucket ${len}`).toMatch(/^[A-Z]+$/);
      }
      expect(new Set(words).size, `bucket ${len} has duplicates`).toBe(words.length);
    }
  });

  it('gives every bucket enough words to fill the longest round', () => {
    // A round runs up to 8 trials; a thin bucket would repeat words.
    for (const [len, words] of Object.entries(WORDS_BY_LEN)) {
      expect(words.length, `bucket ${len}`).toBeGreaterThanOrEqual(8);
    }
  });

  it('reaches every bucket across the difficulty range', () => {
    const reached = new Set<number>();
    for (let difficulty = 1; difficulty <= 10; difficulty++) {
      reached.add(wordLengthForDifficulty(difficulty));
    }
    const buckets = Object.keys(WORDS_BY_LEN).map(Number).sort();
    expect([...reached].sort()).toEqual(buckets);
  });

  it('has a word pool for every length the difficulty curve can request', () => {
    for (let difficulty = 1; difficulty <= 10; difficulty++) {
      const len = wordLengthForDifficulty(difficulty);
      expect(WORDS_BY_LEN[len], `no pool for difficulty ${difficulty}`).toBeDefined();
    }
  });
});
