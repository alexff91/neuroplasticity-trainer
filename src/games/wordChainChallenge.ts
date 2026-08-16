import { CATEGORIES, isWord, isInCategory } from './wordlist';

/**
 * Prompt generation and answer validation for Word Chain.
 *
 * Kept out of the component so the rules can be unit tested — the score is a
 * verbal-fluency measure, so what counts as a valid word is load-bearing.
 */

// Letters the prompts may ask for. Every letter here must have a comfortable
// number of entries in the lexicon or the round is unwinnable — enforced by
// wordlist.test.ts. ('I' is absent from the endings for that reason: common
// English words almost never end in it.)
export const START_LETTERS = 'ABCDEFGHIJKLMNOPRSTW';
export const END_LETTERS = 'ADEGLMNORST';

export type ChallengeType = 'category' | 'starting-letter' | 'ending-letter';

export interface Challenge {
  type: ChallengeType;
  prompt: string;
  /** Does the word satisfy the prompt's rule (letter / category)? */
  matchesRule: (word: string) => boolean;
  /** Rule satisfied AND the word is a real word we know. */
  validate: (word: string) => boolean;
  hints: string[];
}

export function generateChallenge(difficulty: number): Challenge {
  const types: ChallengeType[] = ['category'];
  if (difficulty >= 3) types.push('starting-letter');
  if (difficulty >= 5) types.push('ending-letter');

  const type = types[Math.floor(Math.random() * types.length)];

  if (type === 'category') {
    const cats = Object.keys(CATEGORIES);
    const cat = cats[Math.floor(Math.random() * cats.length)];
    // Category membership is the whole check here: a word in the category is
    // by definition in the lexicon.
    const matchesRule = (w: string) => isInCategory(w, cat);
    return {
      type: 'category',
      prompt: `Name things in category: ${cat}`,
      matchesRule,
      validate: matchesRule,
      hints: CATEGORIES[cat].slice(0, 5),
    };
  } else if (type === 'starting-letter') {
    const letter = START_LETTERS[Math.floor(Math.random() * START_LETTERS.length)];
    const matchesRule = (w: string) => w.length >= 2 && w[0].toUpperCase() === letter;
    return {
      type: 'starting-letter',
      prompt: `Words starting with "${letter}"`,
      matchesRule,
      validate: (w) => matchesRule(w) && isWord(w),
      hints: [],
    };
  } else {
    const letter = END_LETTERS[Math.floor(Math.random() * END_LETTERS.length)];
    const matchesRule = (w: string) => w.length >= 2 && w[w.length - 1].toUpperCase() === letter;
    return {
      type: 'ending-letter',
      prompt: `Words ending with "${letter}"`,
      matchesRule,
      validate: (w) => matchesRule(w) && isWord(w),
      hints: [],
    };
  }
}
