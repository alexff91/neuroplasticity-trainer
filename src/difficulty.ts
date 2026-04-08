import type { DifficultyState, ExerciseResult, UserProfile } from './types';

/**
 * Adaptive difficulty engine based on a simplified ELO system.
 *
 * The core idea: each exercise has an implicit "rating" and the user has
 * an ELO-like rating for each exercise. When the user succeeds, their
 * rating goes up and the difficulty increases. When they fail, the
 * difficulty eases off.
 *
 * This is informed by Vygotsky's "Zone of Proximal Development" — training
 * is most effective when the challenge is just beyond current ability, not
 * too easy (boredom) or too hard (frustration).
 *
 * Reference: Lomas, D., et al. (2013). Optimizing challenge in an
 * educational game using large-scale design experiments. CHI.
 */

const K_FACTOR = 32;        // How fast the rating changes
const BASE_ELO = 1000;      // Starting ELO
const DIFFICULTY_PER_100_ELO = 1; // Map 100 ELO points to 1 difficulty level

export function getOrCreateDifficultyState(
  profile: UserProfile,
  exerciseId: string
): DifficultyState {
  if (profile.difficultyStates[exerciseId]) {
    return profile.difficultyStates[exerciseId];
  }
  return {
    exerciseId,
    currentDifficulty: 1,
    consecutiveCorrect: 0,
    consecutiveWrong: 0,
    elo: BASE_ELO,
  };
}

export function updateDifficulty(
  state: DifficultyState,
  result: ExerciseResult,
  minDiff: number,
  maxDiff: number
): DifficultyState {
  const isSuccess = result.accuracy >= 0.7; // 70% threshold for "success"
  const isHighSuccess = result.accuracy >= 0.9;
  const isLowFailure = result.accuracy < 0.4;

  // ELO-like update
  // Expected score based on current difficulty vs user's ability
  const difficultyElo = BASE_ELO + (state.currentDifficulty - 1) * (100 / DIFFICULTY_PER_100_ELO);
  const expectedScore = 1 / (1 + Math.pow(10, (difficultyElo - state.elo) / 400));
  const actualScore = result.accuracy;
  const eloChange = K_FACTOR * (actualScore - expectedScore);

  let newElo = state.elo + eloChange;

  // Speed bonus: if response time is fast AND accuracy is high, boost ELO more
  if (isHighSuccess && result.responseTimeMs < 1000) {
    newElo += 5;
  }

  // Clamp ELO
  newElo = Math.max(BASE_ELO - 200, Math.min(BASE_ELO + 900, newElo));

  // Compute new difficulty from ELO
  let newDifficulty = Math.round(1 + (newElo - BASE_ELO) * DIFFICULTY_PER_100_ELO / 100);

  // Consecutive streak adjustments
  let newConsCorrect = isSuccess ? state.consecutiveCorrect + 1 : 0;
  let newConsWrong = !isSuccess ? state.consecutiveWrong + 1 : 0;

  // Accelerate if on a hot streak
  if (newConsCorrect >= 3 && isHighSuccess) {
    newDifficulty = Math.max(newDifficulty, state.currentDifficulty + 1);
  }

  // Safety net: drop difficulty after 3 consecutive failures
  if (newConsWrong >= 3 || isLowFailure) {
    newDifficulty = Math.min(newDifficulty, state.currentDifficulty - 1);
  }

  // Clamp to allowed range
  newDifficulty = Math.max(minDiff, Math.min(maxDiff, newDifficulty));

  return {
    exerciseId: state.exerciseId,
    currentDifficulty: newDifficulty,
    consecutiveCorrect: newConsCorrect,
    consecutiveWrong: newConsWrong,
    elo: newElo,
  };
}

/**
 * Spaced Repetition: prioritize exercises where the user's accuracy is
 * in the "desirable difficulty" zone (60-80%) or where they haven't
 * practiced recently.
 *
 * Reference: Bjork, R.A. (1994). Memory and metamemory considerations
 * in the training of human beings. MIT Press.
 */
export function rankExercisesForSession(
  profile: UserProfile,
  exerciseIds: string[]
): string[] {
  const now = Date.now();
  const scored = exerciseIds.map(id => {
    const results = profile.results.filter(r => r.exerciseId === id);
    const lastResult = results.length > 0 ? results[results.length - 1] : null;

    // Recency penalty: exercises done recently get lower priority
    const timeSinceLast = lastResult ? (now - lastResult.timestamp) / (1000 * 60 * 60) : 999;
    const recencyScore = Math.min(timeSinceLast / 24, 1); // 0-1, maxes out at 24h

    // Accuracy targeting: prefer exercises in the 60-80% accuracy sweet spot
    let accuracyScore = 0.5;
    if (results.length >= 3) {
      const recentAcc = results.slice(-3).reduce((s, r) => s + r.accuracy, 0) / 3;
      // Bell curve centered at 0.7
      accuracyScore = 1 - Math.abs(recentAcc - 0.7) * 2;
    }

    // Novelty: exercises never tried get a big boost
    const noveltyScore = results.length === 0 ? 1.5 : 0;

    return {
      id,
      score: recencyScore * 0.4 + accuracyScore * 0.4 + noveltyScore + Math.random() * 0.2,
    };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored.map(s => s.id);
}

/**
 * Interleaving: mix different exercise types within a session rather
 * than blocking by type. Research shows interleaved practice produces
 * better long-term retention despite feeling harder.
 *
 * Reference: Rohrer, D. & Taylor, K. (2007). The shuffling of
 * mathematics problems improves learning. Instructional Science, 35, 481-498.
 */
export function interleaveExercises(orderedIds: string[], count: number): string[] {
  // Take top candidates and shuffle them for interleaving
  const candidates = orderedIds.slice(0, Math.min(count + 2, orderedIds.length));
  // Fisher-Yates shuffle
  const shuffled = [...candidates];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}
