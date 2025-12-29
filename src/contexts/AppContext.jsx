import { createContext, useContext, useReducer, useEffect } from 'react';
import * as storage from '../utils/storage';
import { initializeSampleCards, skillTreeData } from '../data/sampleData';
import { getLevelFromXP, checkAchievements, calculateStreak, XP_REWARDS, ACHIEVEMENTS } from '../utils/gamification';
import { calculateSM2 } from '../utils/sm2';

const AppContext = createContext(null);

const initialState = {
  flashcards: [],
  userStats: null,
  achievements: [],
  skillTree: null,
  sessions: [],
  cognitiveLoadHistory: [],
  settings: null,
  pomodoroHistory: [],
  currentSession: null,
  notification: null,
};

function appReducer(state, action) {
  switch (action.type) {
    case 'INIT_DATA':
      return {
        ...state,
        flashcards: action.payload.flashcards,
        userStats: action.payload.userStats,
        achievements: action.payload.achievements,
        skillTree: action.payload.skillTree,
        sessions: action.payload.sessions,
        cognitiveLoadHistory: action.payload.cognitiveLoadHistory,
        settings: action.payload.settings,
        pomodoroHistory: action.payload.pomodoroHistory,
      };

    case 'UPDATE_FLASHCARDS':
      return { ...state, flashcards: action.payload };

    case 'ADD_FLASHCARD':
      return { ...state, flashcards: [...state.flashcards, action.payload] };

    case 'DELETE_FLASHCARD':
      return {
        ...state,
        flashcards: state.flashcards.filter(c => c.id !== action.payload),
      };

    case 'UPDATE_USER_STATS':
      return { ...state, userStats: action.payload };

    case 'UNLOCK_ACHIEVEMENT':
      return {
        ...state,
        achievements: [...state.achievements, action.payload],
        notification: {
          type: 'achievement',
          data: action.payload,
          timestamp: Date.now(),
        },
      };

    case 'UPDATE_SKILL_TREE':
      return { ...state, skillTree: action.payload };

    case 'ADD_SESSION':
      return { ...state, sessions: [...state.sessions, action.payload] };

    case 'UPDATE_COGNITIVE_LOAD':
      return {
        ...state,
        cognitiveLoadHistory: [...state.cognitiveLoadHistory, action.payload],
      };

    case 'UPDATE_SETTINGS':
      return { ...state, settings: action.payload };

    case 'ADD_POMODORO':
      return {
        ...state,
        pomodoroHistory: [...state.pomodoroHistory, action.payload],
      };

    case 'SET_CURRENT_SESSION':
      return { ...state, currentSession: action.payload };

    case 'SET_NOTIFICATION':
      return { ...state, notification: action.payload };

    case 'CLEAR_NOTIFICATION':
      return { ...state, notification: null };

    case 'LEVEL_UP':
      return {
        ...state,
        notification: {
          type: 'levelUp',
          data: action.payload,
          timestamp: Date.now(),
        },
      };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Initialize data from localStorage on mount
  useEffect(() => {
    let flashcards = storage.getFlashcards();
    if (flashcards.length === 0) {
      flashcards = initializeSampleCards();
      storage.setFlashcards(flashcards);
    }

    let skillTree = storage.getSkillTree();
    if (!skillTree) {
      skillTree = skillTreeData;
      storage.setSkillTree(skillTree);
    }

    const userStats = storage.getUserStats();
    const achievements = storage.getAchievements();
    const sessions = storage.getSessions();
    const cognitiveLoadHistory = storage.getCognitiveLoadHistory();
    const settings = storage.getSettings();
    const pomodoroHistory = storage.getPomodoroHistory();

    dispatch({
      type: 'INIT_DATA',
      payload: {
        flashcards,
        userStats,
        achievements,
        skillTree,
        sessions,
        cognitiveLoadHistory,
        settings,
        pomodoroHistory,
      },
    });
  }, []);

  // Persist changes to localStorage
  useEffect(() => {
    if (state.flashcards.length > 0) {
      storage.setFlashcards(state.flashcards);
    }
  }, [state.flashcards]);

  useEffect(() => {
    if (state.userStats) {
      storage.setUserStats(state.userStats);
    }
  }, [state.userStats]);

  useEffect(() => {
    if (state.achievements.length > 0) {
      storage.setAchievements(state.achievements);
    }
  }, [state.achievements]);

  useEffect(() => {
    if (state.skillTree) {
      storage.setSkillTree(state.skillTree);
    }
  }, [state.skillTree]);

  useEffect(() => {
    if (state.settings) {
      storage.setSettings(state.settings);
    }
  }, [state.settings]);

  useEffect(() => {
    if (state.pomodoroHistory.length > 0) {
      storage.setPomodoroHistory(state.pomodoroHistory);
    }
  }, [state.pomodoroHistory]);

  // Action creators
  const actions = {
    // Flashcard actions
    reviewCard: (cardId, quality) => {
      const card = state.flashcards.find(c => c.id === cardId);
      if (!card) return;

      const sm2Result = calculateSM2(card, quality);
      const updatedCard = {
        ...card,
        ...sm2Result,
        timesStudied: (card.timesStudied || 0) + 1,
      };

      const updatedCards = state.flashcards.map(c =>
        c.id === cardId ? updatedCard : c
      );

      dispatch({ type: 'UPDATE_FLASHCARDS', payload: updatedCards });

      // Update user stats
      const isCorrect = quality >= 3;
      const isPerfect = quality === 5;
      const today = new Date().toISOString().split('T')[0];
      const lastStudyDate = state.userStats?.lastStudyDate?.split('T')[0];

      let xpGained = isCorrect ? XP_REWARDS.CARD_CORRECT : 0;
      if (isPerfect) xpGained = XP_REWARDS.CARD_PERFECT;

      const newStats = {
        ...state.userStats,
        xp: state.userStats.xp + xpGained,
        totalCardsStudied: state.userStats.totalCardsStudied + 1,
        correctAnswers: state.userStats.correctAnswers + (isCorrect ? 1 : 0),
        incorrectAnswers: state.userStats.incorrectAnswers + (isCorrect ? 0 : 1),
        lastStudyDate: new Date().toISOString(),
        streak: calculateStreak(state.userStats.lastStudyDate, state.userStats.streak),
        dailyProgress: lastStudyDate === today
          ? state.userStats.dailyProgress + 1
          : 1,
      };

      // Check for level up
      const oldLevel = getLevelFromXP(state.userStats.xp);
      const newLevel = getLevelFromXP(newStats.xp);
      if (newLevel.level > oldLevel.level) {
        newStats.level = newLevel.level;
        dispatch({ type: 'LEVEL_UP', payload: newLevel });
      }

      dispatch({ type: 'UPDATE_USER_STATS', payload: newStats });

      // Update skill tree XP
      if (card.skill && state.skillTree) {
        const skillXp = isCorrect ? 10 : 2;
        actions.addSkillXP(card.skill, skillXp);
      }

      // Check for new achievements
      const unlockedIds = state.achievements.map(a => a.id);
      const newAchievements = checkAchievements(newStats, unlockedIds);
      newAchievements.forEach(achievement => {
        dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: achievement });
        // Add achievement XP
        const achievementDef = ACHIEVEMENTS.find(a => a.id === achievement.id);
        if (achievementDef) {
          actions.addXP(achievementDef.xp);
        }
      });

      return { xpGained, isCorrect, isPerfect };
    },

    addFlashcard: (card) => {
      dispatch({ type: 'ADD_FLASHCARD', payload: card });
    },

    deleteFlashcard: (cardId) => {
      dispatch({ type: 'DELETE_FLASHCARD', payload: cardId });
    },

    addXP: (amount) => {
      const newStats = {
        ...state.userStats,
        xp: state.userStats.xp + amount,
      };

      const oldLevel = getLevelFromXP(state.userStats.xp);
      const newLevel = getLevelFromXP(newStats.xp);

      if (newLevel.level > oldLevel.level) {
        newStats.level = newLevel.level;
        dispatch({ type: 'LEVEL_UP', payload: newLevel });
      }

      dispatch({ type: 'UPDATE_USER_STATS', payload: newStats });
    },

    addSkillXP: (skillId, amount) => {
      if (!state.skillTree) return;

      const updatedNodes = state.skillTree.nodes.map(node => {
        if (node.id === skillId) {
          const newXp = Math.min(node.xp + amount, node.maxXp);
          const wasUnlocked = node.unlocked;
          const isNowComplete = newXp >= node.maxXp;

          // Check if parent skill is unlocked
          const parentNode = state.skillTree.nodes.find(n => n.id === node.parent);
          const canUnlock = !node.parent || (parentNode && parentNode.unlocked);

          return {
            ...node,
            xp: newXp,
            unlocked: canUnlock ? (wasUnlocked || isNowComplete) : wasUnlocked,
          };
        }
        return node;
      });

      // Check for newly unlockable skills (children of completed skills)
      const finalNodes = updatedNodes.map(node => {
        if (!node.unlocked && node.parent) {
          const parentNode = updatedNodes.find(n => n.id === node.parent);
          if (parentNode && parentNode.unlocked && parentNode.xp >= parentNode.maxXp) {
            return { ...node, unlocked: true };
          }
        }
        return node;
      });

      dispatch({
        type: 'UPDATE_SKILL_TREE',
        payload: { ...state.skillTree, nodes: finalNodes },
      });

      // Count unlocked skills
      const unlockedCount = finalNodes.filter(n => n.unlocked).length;
      if (unlockedCount > state.userStats.skillsUnlocked) {
        dispatch({
          type: 'UPDATE_USER_STATS',
          payload: { ...state.userStats, skillsUnlocked: unlockedCount },
        });
        actions.addXP(XP_REWARDS.SKILL_UNLOCK);
      }
    },

    completePomodoro: (duration) => {
      const pomodoro = {
        id: `pomo_${Date.now()}`,
        duration,
        completedAt: new Date().toISOString(),
      };

      dispatch({ type: 'ADD_POMODORO', payload: pomodoro });

      const newStats = {
        ...state.userStats,
        pomodorosCompleted: state.userStats.pomodorosCompleted + 1,
        totalTimeSpent: state.userStats.totalTimeSpent + duration,
      };

      dispatch({ type: 'UPDATE_USER_STATS', payload: newStats });
      actions.addXP(XP_REWARDS.POMODORO_COMPLETE);

      // Check achievements
      const unlockedIds = state.achievements.map(a => a.id);
      const newAchievements = checkAchievements(newStats, unlockedIds);
      newAchievements.forEach(achievement => {
        dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: achievement });
      });
    },

    updateSettings: (newSettings) => {
      dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
    },

    recordCognitiveLoad: (loadData) => {
      dispatch({ type: 'UPDATE_COGNITIVE_LOAD', payload: loadData });
    },

    setNotification: (notification) => {
      dispatch({ type: 'SET_NOTIFICATION', payload: notification });
    },

    clearNotification: () => {
      dispatch({ type: 'CLEAR_NOTIFICATION' });
    },
  };

  return (
    <AppContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
