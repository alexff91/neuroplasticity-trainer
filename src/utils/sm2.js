// SM-2 (SuperMemo 2) Spaced Repetition Algorithm
// Based on: https://www.supermemo.com/en/archives1990-2015/english/ol/sm2

/**
 * SM-2 Algorithm Implementation
 *
 * Quality ratings (q):
 * 0 - Complete blackout
 * 1 - Incorrect; correct answer remembered
 * 2 - Incorrect; correct answer seemed easy to recall
 * 3 - Correct with serious difficulty
 * 4 - Correct with some hesitation
 * 5 - Perfect response
 */

export function calculateSM2(card, quality) {
  // Validate quality rating
  const q = Math.max(0, Math.min(5, quality));

  // Get current card values or defaults
  let { repetitions = 0, easeFactor = 2.5, interval = 0 } = card;

  // Calculate new ease factor
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  let newEaseFactor = easeFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));

  // Ease factor should not be less than 1.3
  newEaseFactor = Math.max(1.3, newEaseFactor);

  let newRepetitions;
  let newInterval;

  if (q < 3) {
    // Incorrect response - reset repetitions
    newRepetitions = 0;
    newInterval = 1;
  } else {
    // Correct response - increment repetitions
    newRepetitions = repetitions + 1;

    if (newRepetitions === 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = 6;
    } else {
      // I(n) = I(n-1) * EF
      newInterval = Math.round(interval * newEaseFactor);
    }
  }

  // Calculate next review date
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);

  return {
    repetitions: newRepetitions,
    easeFactor: newEaseFactor,
    interval: newInterval,
    nextReview: nextReview.toISOString(),
    lastReview: new Date().toISOString(),
    quality: q,
  };
}

/**
 * Get cards due for review
 */
export function getDueCards(cards) {
  const now = new Date();
  return cards.filter(card => {
    if (!card.nextReview) return true;
    return new Date(card.nextReview) <= now;
  });
}

/**
 * Get cards by difficulty level
 */
export function getCardsByDifficulty(cards) {
  return {
    new: cards.filter(c => c.repetitions === 0 || c.repetitions === undefined),
    learning: cards.filter(c => c.repetitions > 0 && c.repetitions < 3),
    review: cards.filter(c => c.repetitions >= 3),
    mature: cards.filter(c => c.interval >= 21),
  };
}

/**
 * Calculate retention rate from review history
 */
export function calculateRetention(cards) {
  const cardsWithHistory = cards.filter(c => c.quality !== undefined);
  if (cardsWithHistory.length === 0) return 0;

  const correctCards = cardsWithHistory.filter(c => c.quality >= 3);
  return Math.round((correctCards.length / cardsWithHistory.length) * 100);
}

/**
 * Estimate study time for due cards
 */
export function estimateStudyTime(dueCards) {
  // Assume average of 30 seconds per card
  const seconds = dueCards.length * 30;
  const minutes = Math.ceil(seconds / 60);
  return minutes;
}

/**
 * Get review forecast for next 7 days
 */
export function getReviewForecast(cards) {
  const forecast = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    const dueCount = cards.filter(card => {
      if (!card.nextReview) return i === 0;
      const reviewDate = new Date(card.nextReview);
      return reviewDate >= date && reviewDate < nextDay;
    }).length;

    forecast.push({
      date: date.toISOString().split('T')[0],
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      count: dueCount,
    });
  }

  return forecast;
}

/**
 * Create a new flashcard with SM-2 defaults
 */
export function createCard(front, back, category = 'general', skill = null) {
  return {
    id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    front,
    back,
    category,
    skill,
    repetitions: 0,
    easeFactor: 2.5,
    interval: 0,
    nextReview: new Date().toISOString(),
    lastReview: null,
    quality: null,
    createdAt: new Date().toISOString(),
    timesStudied: 0,
  };
}
