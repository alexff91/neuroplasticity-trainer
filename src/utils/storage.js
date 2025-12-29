// LocalStorage utility functions with error handling

const STORAGE_KEYS = {
  FLASHCARDS: 'neurolearn_flashcards',
  USER_STATS: 'neurolearn_user_stats',
  ACHIEVEMENTS: 'neurolearn_achievements',
  SKILL_TREE: 'neurolearn_skill_tree',
  SESSIONS: 'neurolearn_sessions',
  COGNITIVE_LOAD: 'neurolearn_cognitive_load',
  SETTINGS: 'neurolearn_settings',
  POMODORO_HISTORY: 'neurolearn_pomodoro_history',
};

export function getItem(key) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error reading from localStorage: ${key}`, error);
    return null;
  }
}

export function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.error(`Error writing to localStorage: ${key}`, error);
    return false;
  }
}

export function removeItem(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing from localStorage: ${key}`, error);
    return false;
  }
}

export function getFlashcards() {
  return getItem(STORAGE_KEYS.FLASHCARDS) || [];
}

export function setFlashcards(cards) {
  return setItem(STORAGE_KEYS.FLASHCARDS, cards);
}

export function getUserStats() {
  const defaultStats = {
    xp: 0,
    level: 1,
    streak: 0,
    lastStudyDate: null,
    totalCardsStudied: 0,
    totalTimeSpent: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    pomodorosCompleted: 0,
    skillsUnlocked: 1,
    dailyGoal: 20,
    dailyProgress: 0,
  };
  return getItem(STORAGE_KEYS.USER_STATS) || defaultStats;
}

export function setUserStats(stats) {
  return setItem(STORAGE_KEYS.USER_STATS, stats);
}

export function getAchievements() {
  return getItem(STORAGE_KEYS.ACHIEVEMENTS) || [];
}

export function setAchievements(achievements) {
  return setItem(STORAGE_KEYS.ACHIEVEMENTS, achievements);
}

export function getSkillTree() {
  return getItem(STORAGE_KEYS.SKILL_TREE);
}

export function setSkillTree(tree) {
  return setItem(STORAGE_KEYS.SKILL_TREE, tree);
}

export function getSessions() {
  return getItem(STORAGE_KEYS.SESSIONS) || [];
}

export function setSessions(sessions) {
  return setItem(STORAGE_KEYS.SESSIONS, sessions);
}

export function getCognitiveLoadHistory() {
  return getItem(STORAGE_KEYS.COGNITIVE_LOAD) || [];
}

export function setCognitiveLoadHistory(history) {
  return setItem(STORAGE_KEYS.COGNITIVE_LOAD, history);
}

export function getSettings() {
  const defaultSettings = {
    pomodoroWork: 25,
    pomodoroBreak: 5,
    pomodoroLongBreak: 15,
    soundEnabled: true,
    notificationsEnabled: true,
    darkMode: true,
    dailyGoal: 20,
  };
  return getItem(STORAGE_KEYS.SETTINGS) || defaultSettings;
}

export function setSettings(settings) {
  return setItem(STORAGE_KEYS.SETTINGS, settings);
}

export function getPomodoroHistory() {
  return getItem(STORAGE_KEYS.POMODORO_HISTORY) || [];
}

export function setPomodoroHistory(history) {
  return setItem(STORAGE_KEYS.POMODORO_HISTORY, history);
}

export { STORAGE_KEYS };
