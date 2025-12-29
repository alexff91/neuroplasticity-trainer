// Cognitive Load Monitoring System
// Tracks user performance to detect fatigue and optimize learning sessions

// Factors that influence cognitive load
const COGNITIVE_FACTORS = {
  responseTime: 0.3,      // Weight for response time
  accuracy: 0.3,          // Weight for accuracy
  sessionLength: 0.2,     // Weight for session duration
  cardDifficulty: 0.2,    // Weight for card difficulty
};

// Optimal ranges for cognitive load estimation
const OPTIMAL_RANGES = {
  responseTime: { min: 2000, max: 15000 },  // 2-15 seconds optimal
  accuracy: { min: 0.7, max: 0.9 },         // 70-90% optimal (not too easy, not too hard)
  sessionLength: { max: 25 * 60 * 1000 },   // 25 minutes max before break
};

/**
 * Calculate cognitive load score (0-100)
 * Higher score = higher cognitive load (more fatigue)
 */
export function calculateCognitiveLoad(sessionData) {
  const {
    avgResponseTime = 5000,
    recentAccuracy = 0.8,
    sessionDuration = 0,
    avgCardDifficulty = 0.5,
  } = sessionData;

  // Response time factor (slower = higher load)
  let responseTimeFactor = 0;
  if (avgResponseTime > OPTIMAL_RANGES.responseTime.max) {
    responseTimeFactor = Math.min(100, (avgResponseTime - OPTIMAL_RANGES.responseTime.max) / 100);
  }

  // Accuracy factor (lower accuracy = higher load)
  let accuracyFactor = 0;
  if (recentAccuracy < OPTIMAL_RANGES.accuracy.min) {
    accuracyFactor = (OPTIMAL_RANGES.accuracy.min - recentAccuracy) * 100;
  }

  // Session length factor (longer = higher load)
  const sessionFactor = Math.min(100, (sessionDuration / OPTIMAL_RANGES.sessionLength.max) * 100);

  // Card difficulty factor
  const difficultyFactor = avgCardDifficulty * 50;

  // Calculate weighted cognitive load score
  const cognitiveLoad =
    responseTimeFactor * COGNITIVE_FACTORS.responseTime +
    accuracyFactor * COGNITIVE_FACTORS.accuracy +
    sessionFactor * COGNITIVE_FACTORS.sessionLength +
    difficultyFactor * COGNITIVE_FACTORS.cardDifficulty;

  return Math.min(100, Math.max(0, Math.round(cognitiveLoad)));
}

/**
 * Get cognitive load status with recommendations
 */
export function getCognitiveLoadStatus(load) {
  if (load < 30) {
    return {
      status: 'optimal',
      label: 'Optimal',
      color: '#10b981',
      message: 'Your brain is fresh and ready to learn!',
      recommendation: 'Perfect time for challenging material.',
      icon: '🧠',
    };
  } else if (load < 50) {
    return {
      status: 'moderate',
      label: 'Moderate',
      color: '#3b82f6',
      message: 'You\'re doing well, keep going!',
      recommendation: 'Consider mixing easy and hard cards.',
      icon: '💡',
    };
  } else if (load < 70) {
    return {
      status: 'elevated',
      label: 'Elevated',
      color: '#f59e0b',
      message: 'Mental effort is increasing.',
      recommendation: 'A short break soon would be beneficial.',
      icon: '⚡',
    };
  } else if (load < 85) {
    return {
      status: 'high',
      label: 'High',
      color: '#ef4444',
      message: 'Your brain needs a rest.',
      recommendation: 'Take a 5-10 minute break now.',
      icon: '🔥',
    };
  } else {
    return {
      status: 'overload',
      label: 'Overload',
      color: '#dc2626',
      message: 'Cognitive overload detected!',
      recommendation: 'Stop and take a longer break. Consider a walk.',
      icon: '⚠️',
    };
  }
}

/**
 * Suggest optimal session parameters based on time of day and history
 */
export function getOptimalSessionParams(history = [], currentHour = new Date().getHours()) {
  // Time-of-day adjustments
  let timeMultiplier = 1;
  let suggestedDuration = 25; // Default Pomodoro duration

  // Early morning (6-9): Good focus, moderate session
  if (currentHour >= 6 && currentHour < 9) {
    timeMultiplier = 0.9;
    suggestedDuration = 25;
  }
  // Late morning (9-12): Peak focus, longer sessions OK
  else if (currentHour >= 9 && currentHour < 12) {
    timeMultiplier = 0.8;
    suggestedDuration = 30;
  }
  // Early afternoon (12-14): Post-lunch dip
  else if (currentHour >= 12 && currentHour < 14) {
    timeMultiplier = 1.2;
    suggestedDuration = 20;
  }
  // Afternoon (14-17): Good focus returns
  else if (currentHour >= 14 && currentHour < 17) {
    timeMultiplier = 0.9;
    suggestedDuration = 25;
  }
  // Evening (17-21): Moderate focus
  else if (currentHour >= 17 && currentHour < 21) {
    timeMultiplier = 1.0;
    suggestedDuration = 25;
  }
  // Late night (21+): Lower focus
  else {
    timeMultiplier = 1.3;
    suggestedDuration = 15;
  }

  // Adjust based on recent history
  const recentSessions = history.slice(-5);
  if (recentSessions.length > 0) {
    const avgLoad = recentSessions.reduce((sum, s) => sum + (s.cognitiveLoad || 50), 0) / recentSessions.length;
    if (avgLoad > 60) {
      suggestedDuration = Math.max(15, suggestedDuration - 5);
    }
  }

  return {
    suggestedDuration,
    suggestedBreak: Math.ceil(suggestedDuration / 5),
    timeMultiplier,
    cardsPerSession: Math.floor(suggestedDuration * 1.5),
  };
}

/**
 * Brain break suggestions based on cognitive load and session type
 */
export function getBrainBreakSuggestion(cognitiveLoad, sessionDuration) {
  const shortBreaks = [
    { activity: 'Deep Breathing', duration: '2 min', description: 'Take 10 deep breaths to reset your focus.', icon: '🌬️' },
    { activity: 'Eye Rest', duration: '1 min', description: 'Close your eyes and relax your eye muscles.', icon: '👁️' },
    { activity: 'Stretch', duration: '2 min', description: 'Stand up and stretch your arms and neck.', icon: '🧘' },
    { activity: 'Hydrate', duration: '1 min', description: 'Drink a glass of water to stay hydrated.', icon: '💧' },
  ];

  const mediumBreaks = [
    { activity: 'Quick Walk', duration: '5 min', description: 'Take a short walk around the room.', icon: '🚶' },
    { activity: 'Mindful Moment', duration: '5 min', description: 'Practice brief mindfulness meditation.', icon: '🧘‍♂️' },
    { activity: 'Power Snack', duration: '5 min', description: 'Have a healthy brain-boosting snack.', icon: '🥜' },
    { activity: 'Music Break', duration: '5 min', description: 'Listen to your favorite uplifting song.', icon: '🎵' },
  ];

  const longBreaks = [
    { activity: 'Nature Walk', duration: '15 min', description: 'Go outside and enjoy some fresh air.', icon: '🌳' },
    { activity: 'Power Nap', duration: '20 min', description: 'Take a brief restorative nap.', icon: '😴' },
    { activity: 'Exercise', duration: '15 min', description: 'Do some light exercise or yoga.', icon: '🏃' },
    { activity: 'Creative Break', duration: '15 min', description: 'Doodle, journal, or do something creative.', icon: '🎨' },
  ];

  let suggestions;
  let breakType;

  if (cognitiveLoad < 50 && sessionDuration < 25 * 60 * 1000) {
    suggestions = shortBreaks;
    breakType = 'short';
  } else if (cognitiveLoad < 70) {
    suggestions = mediumBreaks;
    breakType = 'medium';
  } else {
    suggestions = longBreaks;
    breakType = 'long';
  }

  // Return random suggestion from appropriate category
  const suggestion = suggestions[Math.floor(Math.random() * suggestions.length)];

  return {
    ...suggestion,
    breakType,
  };
}

/**
 * Track response times and calculate metrics
 */
export function analyzeResponseTimes(responseTimes) {
  if (!responseTimes || responseTimes.length === 0) {
    return { avg: 0, trend: 'stable', variance: 0 };
  }

  const avg = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;

  // Calculate trend (are response times increasing?)
  let trend = 'stable';
  if (responseTimes.length >= 5) {
    const firstHalf = responseTimes.slice(0, Math.floor(responseTimes.length / 2));
    const secondHalf = responseTimes.slice(Math.floor(responseTimes.length / 2));
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    if (secondAvg > firstAvg * 1.2) trend = 'slowing';
    else if (secondAvg < firstAvg * 0.8) trend = 'improving';
  }

  // Calculate variance
  const variance = responseTimes.reduce((sum, time) => sum + Math.pow(time - avg, 2), 0) / responseTimes.length;

  return { avg, trend, variance: Math.sqrt(variance) };
}
