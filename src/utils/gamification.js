// Gamification System - XP, Levels, and Achievements

// XP required for each level (exponential growth)
export function getXPForLevel(level) {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}

// Get current level from total XP
export function getLevelFromXP(xp) {
  let level = 1;
  let xpNeeded = 100;
  let totalXP = 0;

  while (totalXP + xpNeeded <= xp) {
    totalXP += xpNeeded;
    level++;
    xpNeeded = getXPForLevel(level);
  }

  return {
    level,
    currentXP: xp - totalXP,
    xpForNextLevel: xpNeeded,
    progress: ((xp - totalXP) / xpNeeded) * 100,
    totalXP: xp,
  };
}

// XP rewards for different actions
export const XP_REWARDS = {
  CARD_CORRECT: 10,
  CARD_PERFECT: 25,
  CARD_STREAK_BONUS: 5, // per card in streak
  DAILY_GOAL: 50,
  POMODORO_COMPLETE: 30,
  SKILL_UNLOCK: 100,
  ACHIEVEMENT_UNLOCK: 50,
  STREAK_DAY: 20,
};

// Achievement definitions
export const ACHIEVEMENTS = [
  // Beginner achievements
  {
    id: 'first_card',
    name: 'First Steps',
    description: 'Complete your first flashcard review',
    icon: '🎯',
    condition: (stats) => stats.totalCardsStudied >= 1,
    xp: 25,
  },
  {
    id: 'ten_cards',
    name: 'Getting Started',
    description: 'Review 10 flashcards',
    icon: '📚',
    condition: (stats) => stats.totalCardsStudied >= 10,
    xp: 50,
  },
  {
    id: 'hundred_cards',
    name: 'Dedicated Learner',
    description: 'Review 100 flashcards',
    icon: '🌟',
    condition: (stats) => stats.totalCardsStudied >= 100,
    xp: 100,
  },
  {
    id: 'thousand_cards',
    name: 'Knowledge Seeker',
    description: 'Review 1,000 flashcards',
    icon: '🏆',
    condition: (stats) => stats.totalCardsStudied >= 1000,
    xp: 500,
  },

  // Streak achievements
  {
    id: 'streak_3',
    name: 'Consistency Begins',
    description: 'Maintain a 3-day study streak',
    icon: '🔥',
    condition: (stats) => stats.streak >= 3,
    xp: 50,
  },
  {
    id: 'streak_7',
    name: 'Week Warrior',
    description: 'Maintain a 7-day study streak',
    icon: '💪',
    condition: (stats) => stats.streak >= 7,
    xp: 100,
  },
  {
    id: 'streak_30',
    name: 'Monthly Master',
    description: 'Maintain a 30-day study streak',
    icon: '👑',
    condition: (stats) => stats.streak >= 30,
    xp: 500,
  },

  // Accuracy achievements
  {
    id: 'accuracy_80',
    name: 'Sharp Mind',
    description: 'Achieve 80% accuracy over 50 cards',
    icon: '🎯',
    condition: (stats) => {
      const total = stats.correctAnswers + stats.incorrectAnswers;
      return total >= 50 && (stats.correctAnswers / total) >= 0.8;
    },
    xp: 75,
  },
  {
    id: 'accuracy_95',
    name: 'Near Perfect',
    description: 'Achieve 95% accuracy over 100 cards',
    icon: '✨',
    condition: (stats) => {
      const total = stats.correctAnswers + stats.incorrectAnswers;
      return total >= 100 && (stats.correctAnswers / total) >= 0.95;
    },
    xp: 200,
  },

  // Pomodoro achievements
  {
    id: 'first_pomodoro',
    name: 'Time Manager',
    description: 'Complete your first Pomodoro session',
    icon: '🍅',
    condition: (stats) => stats.pomodorosCompleted >= 1,
    xp: 25,
  },
  {
    id: 'ten_pomodoros',
    name: 'Focus Champion',
    description: 'Complete 10 Pomodoro sessions',
    icon: '⏱️',
    condition: (stats) => stats.pomodorosCompleted >= 10,
    xp: 100,
  },

  // Skill tree achievements
  {
    id: 'skill_unlock_5',
    name: 'Skill Builder',
    description: 'Unlock 5 skills in the skill tree',
    icon: '🌳',
    condition: (stats) => stats.skillsUnlocked >= 5,
    xp: 150,
  },
  {
    id: 'skill_unlock_10',
    name: 'Skill Master',
    description: 'Unlock 10 skills in the skill tree',
    icon: '🏅',
    condition: (stats) => stats.skillsUnlocked >= 10,
    xp: 300,
  },

  // Level achievements
  {
    id: 'level_5',
    name: 'Rising Star',
    description: 'Reach level 5',
    icon: '⭐',
    condition: (stats) => stats.level >= 5,
    xp: 100,
  },
  {
    id: 'level_10',
    name: 'Expert Learner',
    description: 'Reach level 10',
    icon: '🌟',
    condition: (stats) => stats.level >= 10,
    xp: 250,
  },
  {
    id: 'level_25',
    name: 'Grand Master',
    description: 'Reach level 25',
    icon: '👑',
    condition: (stats) => stats.level >= 25,
    xp: 1000,
  },

  // Special achievements
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Study after midnight',
    icon: '🦉',
    condition: (stats) => stats.nightStudy === true,
    xp: 50,
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Study before 6 AM',
    icon: '🐦',
    condition: (stats) => stats.earlyStudy === true,
    xp: 50,
  },
  {
    id: 'perfect_day',
    name: 'Perfect Day',
    description: 'Complete daily goal with 100% accuracy',
    icon: '💯',
    condition: (stats) => stats.perfectDay === true,
    xp: 150,
  },
];

// Check for new achievements
export function checkAchievements(stats, unlockedAchievements = []) {
  const newAchievements = [];

  for (const achievement of ACHIEVEMENTS) {
    if (!unlockedAchievements.includes(achievement.id)) {
      if (achievement.condition(stats)) {
        newAchievements.push({
          ...achievement,
          unlockedAt: new Date().toISOString(),
        });
      }
    }
  }

  return newAchievements;
}

// Calculate streak
export function calculateStreak(lastStudyDate, currentStreak) {
  if (!lastStudyDate) return 1;

  const last = new Date(lastStudyDate);
  const now = new Date();

  // Reset hours to compare dates only
  last.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Same day, keep streak
    return currentStreak;
  } else if (diffDays === 1) {
    // Next day, increment streak
    return currentStreak + 1;
  } else {
    // Streak broken
    return 1;
  }
}

// Get rank title based on level
export function getRankTitle(level) {
  if (level < 5) return 'Novice';
  if (level < 10) return 'Apprentice';
  if (level < 15) return 'Scholar';
  if (level < 20) return 'Expert';
  if (level < 30) return 'Master';
  if (level < 50) return 'Grand Master';
  return 'Legend';
}

// Get rank color based on level
export function getRankColor(level) {
  if (level < 5) return '#9ca3af';
  if (level < 10) return '#10b981';
  if (level < 15) return '#3b82f6';
  if (level < 20) return '#8b5cf6';
  if (level < 30) return '#f59e0b';
  if (level < 50) return '#ef4444';
  return '#ec4899';
}
