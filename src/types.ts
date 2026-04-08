export type CognitiveSkill =
  | 'pattern-recognition'
  | 'working-memory'
  | 'reaction-time'
  | 'spatial-reasoning'
  | 'verbal-fluency'
  | 'attention-control';

export interface ExerciseConfig {
  id: string;
  name: string;
  skill: CognitiveSkill;
  description: string;
  scienceNote: string;
  scienceRef: string;
  icon: string;
  minDifficulty: number;
  maxDifficulty: number;
}

export interface ExerciseResult {
  exerciseId: string;
  skill: CognitiveSkill;
  score: number;        // 0-100
  accuracy: number;     // 0-1
  responseTimeMs: number;
  difficulty: number;   // 1-10
  timestamp: number;
  sessionId: string;
}

export interface DifficultyState {
  exerciseId: string;
  currentDifficulty: number;
  consecutiveCorrect: number;
  consecutiveWrong: number;
  elo: number;          // ELO-like rating for adaptive difficulty
}

export interface DailyLog {
  date: string;         // YYYY-MM-DD
  sessionsCompleted: number;
  totalExercises: number;
  averageScore: number;
  skillScores: Partial<Record<CognitiveSkill, number>>;
  timeSpentMs: number;
}

export interface UserProfile {
  createdAt: number;
  totalSessions: number;
  totalExercises: number;
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string | null;
  achievements: string[];
  difficultyStates: Record<string, DifficultyState>;
  dailyLogs: DailyLog[];
  results: ExerciseResult[];
}

export interface SessionPlan {
  exercises: ExerciseConfig[];
  duration: number; // minutes
  focusSkills: CognitiveSkill[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (profile: UserProfile) => boolean;
}

export type AppView = 'home' | 'session' | 'exercise' | 'dashboard' | 'science';
