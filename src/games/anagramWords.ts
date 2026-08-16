/**
 * Word pool for the Anagram exercise.
 *
 * Every word must sit in the bucket matching its length — a round draws from
 * WORDS_BY_LEN[wordLen] and lays the word out as that many letter tiles, so a
 * misfiled word breaks the trial. `anagram.test.ts` enforces this, along with
 * the rule that every length `wordLengthForDifficulty` can return has a bucket.
 */
export const WORDS_BY_LEN: Record<number, string[]> = {
  4: ['CALM', 'LEAF', 'PLAY', 'WIND', 'HOPE', 'TREE', 'SAND', 'FIRE', 'COLD', 'WARM', 'BLUE', 'STAR', 'MOON', 'BOOK', 'GOLD', 'IRON', 'BIRD', 'SHIP', 'KING', 'WAVE'],
  5: ['BRAIN', 'LIGHT', 'PLANT', 'OCEAN', 'STORM', 'NORTH', 'CLOUD', 'PEACE', 'POWER', 'STONE', 'TIGER', 'EAGLE', 'PIANO', 'RIVER', 'CRAFT', 'MUSIC', 'HEART', 'BLOOM', 'FLAME', 'SOLAR'],
  6: ['MEMORY', 'BRIGHT', 'CIRCLE', 'PLANET', 'WONDER', 'FOREST', 'GARDEN', 'SILVER', 'ORANGE', 'PURPLE', 'WINTER', 'SUMMER', 'CASTLE', 'GUITAR', 'DESERT', 'JUNGLE', 'POETRY', 'GALAXY', 'MARBLE', 'MOMENT'],
  7: ['NEURONS', 'JOURNEY', 'CRYSTAL', 'HARMONY', 'ANCIENT', 'COMPLEX', 'PASSION', 'MYSTERY', 'BALANCE', 'DIAMOND', 'CONCERT', 'FREEDOM', 'SCIENCE', 'PROJECT', 'CAPTURE', 'AMAZING', 'HORIZON', 'SUNRISE', 'CRIMSON', 'OUTLINE', 'TRIUMPH', 'WHISPER'],
  8: ['MOUNTAIN', 'INFINITE', 'PARADISE', 'UNIVERSE', 'CREATIVE', 'ELEPHANT', 'FRAGMENT', 'PATIENCE', 'STRENGTH', 'DAYLIGHT', 'TREASURE', 'LANGUAGE', 'SUNLIGHT', 'NOTEBOOK', 'RESEARCH', 'TWILIGHT'],
};

/**
 * Word length for a difficulty level: 4 letters at level 1 rising to 8 at
 * level 8 and above.
 */
export function wordLengthForDifficulty(difficulty: number): number {
  return Math.min(4 + Math.floor(difficulty / 2), 8);
}
