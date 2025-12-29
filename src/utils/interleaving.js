// Interleaved Practice Scheduler
// Implements interleaving for better learning retention

/**
 * Interleaved practice is a learning technique where different topics/skills
 * are mixed during practice sessions, as opposed to blocked practice where
 * one topic is practiced repeatedly before moving to the next.
 *
 * Research shows interleaving leads to better long-term retention and transfer.
 */

/**
 * Create an interleaved practice session from available cards
 */
export function createInterleavedSession(cards, options = {}) {
  const {
    maxCards = 20,
    minCategories = 2,
    difficultyBalance = true,
    prioritizeDue = true,
  } = options;

  if (!cards || cards.length === 0) return [];

  // Group cards by category
  const categoryGroups = {};
  cards.forEach(card => {
    const category = card.category || 'general';
    if (!categoryGroups[category]) {
      categoryGroups[category] = [];
    }
    categoryGroups[category].push(card);
  });

  const categories = Object.keys(categoryGroups);

  // If not enough categories, just shuffle and return
  if (categories.length < minCategories) {
    return shuffleArray(cards).slice(0, maxCards);
  }

  // Sort cards within each category by priority
  categories.forEach(category => {
    categoryGroups[category].sort((a, b) => {
      // Priority: due cards first, then by difficulty
      const aDue = isCardDue(a) ? 0 : 1;
      const bDue = isCardDue(b) ? 0 : 1;
      if (prioritizeDue && aDue !== bDue) return aDue - bDue;

      // Then by ease factor (harder cards first)
      return (a.easeFactor || 2.5) - (b.easeFactor || 2.5);
    });
  });

  // Create interleaved sequence
  const session = [];
  let categoryIndex = 0;
  const categoryOrder = shuffleArray([...categories]);

  while (session.length < maxCards) {
    const category = categoryOrder[categoryIndex % categoryOrder.length];
    const categoryCards = categoryGroups[category];

    if (categoryCards.length > 0) {
      const card = categoryCards.shift();
      session.push({
        ...card,
        sessionOrder: session.length,
        interleavedFrom: category,
      });
    }

    categoryIndex++;

    // Check if all categories are exhausted
    const totalRemaining = categories.reduce(
      (sum, cat) => sum + categoryGroups[cat].length, 0
    );
    if (totalRemaining === 0) break;
  }

  // Optional: Add difficulty balancing (alternate hard/easy)
  if (difficultyBalance && session.length > 4) {
    return balanceDifficulty(session);
  }

  return session;
}

/**
 * Check if a card is due for review
 */
function isCardDue(card) {
  if (!card.nextReview) return true;
  return new Date(card.nextReview) <= new Date();
}

/**
 * Fisher-Yates shuffle
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Balance difficulty to avoid sequences of all hard or all easy cards
 */
function balanceDifficulty(cards) {
  // Sort by difficulty
  const sorted = [...cards].sort((a, b) =>
    (a.easeFactor || 2.5) - (b.easeFactor || 2.5)
  );

  // Interleave from both ends
  const balanced = [];
  let left = 0;
  let right = sorted.length - 1;
  let takeFromLeft = true;

  while (left <= right) {
    if (takeFromLeft) {
      balanced.push(sorted[left++]);
    } else {
      balanced.push(sorted[right--]);
    }
    takeFromLeft = !takeFromLeft;
  }

  return balanced;
}

/**
 * Get practice schedule recommendation
 */
export function getPracticeRecommendation(cards, userStats) {
  const dueCards = cards.filter(isCardDue);
  const categories = [...new Set(cards.map(c => c.category || 'general'))];

  // Calculate optimal session composition
  const recommendation = {
    totalDue: dueCards.length,
    categories: categories.length,
    suggestedSessionSize: Math.min(20, Math.max(10, dueCards.length)),
    practiceType: 'interleaved',
    reasoning: [],
  };

  // Add reasoning
  if (categories.length >= 3) {
    recommendation.reasoning.push(
      'Multiple categories available - interleaving will boost retention'
    );
  }

  if (dueCards.length > 30) {
    recommendation.reasoning.push(
      'Many cards due - consider splitting into multiple sessions'
    );
    recommendation.suggestedSessions = Math.ceil(dueCards.length / 20);
  }

  // Check if user might benefit from focused practice instead
  const recentAccuracy = userStats?.recentAccuracy || 0.8;
  if (recentAccuracy < 0.6) {
    recommendation.practiceType = 'focused';
    recommendation.reasoning.push(
      'Lower accuracy detected - focused practice on weak areas may help'
    );
  }

  return recommendation;
}

/**
 * Generate a weekly practice schedule
 */
export function generateWeeklySchedule(cards, preferences = {}) {
  const {
    studyDays = [1, 2, 3, 4, 5], // Mon-Fri default
    sessionsPerDay = 2,
    cardsPerSession = 15,
  } = preferences;

  const schedule = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const date = new Date(today);
    date.setDate(date.getDate() + dayOffset);
    const dayOfWeek = date.getDay();

    const daySchedule = {
      date: date.toISOString().split('T')[0],
      dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
      isStudyDay: studyDays.includes(dayOfWeek),
      sessions: [],
    };

    if (daySchedule.isStudyDay) {
      // Get cards due on this day
      const dueOnDay = cards.filter(card => {
        if (!card.nextReview) return dayOffset === 0;
        const reviewDate = new Date(card.nextReview);
        reviewDate.setHours(0, 0, 0, 0);
        return reviewDate <= date;
      });

      // Create session recommendations
      for (let i = 0; i < sessionsPerDay; i++) {
        daySchedule.sessions.push({
          sessionNumber: i + 1,
          suggestedTime: i === 0 ? 'Morning' : 'Evening',
          cardsToReview: Math.min(cardsPerSession, Math.ceil(dueOnDay.length / sessionsPerDay)),
          type: 'interleaved',
        });
      }
    }

    schedule.push(daySchedule);
  }

  return schedule;
}

/**
 * Calculate interleaving effectiveness score
 */
export function calculateInterleavingScore(sessionResults) {
  if (!sessionResults || sessionResults.length < 5) {
    return null;
  }

  // Track category switches and performance
  let switches = 0;
  let postSwitchCorrect = 0;
  let postSwitchTotal = 0;

  for (let i = 1; i < sessionResults.length; i++) {
    const prevCategory = sessionResults[i - 1].category;
    const currCategory = sessionResults[i].category;

    if (prevCategory !== currCategory) {
      switches++;
      postSwitchTotal++;
      if (sessionResults[i].correct) {
        postSwitchCorrect++;
      }
    }
  }

  return {
    categorySwitches: switches,
    switchRate: switches / (sessionResults.length - 1),
    postSwitchAccuracy: postSwitchTotal > 0 ? postSwitchCorrect / postSwitchTotal : null,
    effectivenessRating: switches >= 3 ? 'good' : 'low',
  };
}
