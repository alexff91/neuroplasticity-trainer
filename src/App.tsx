import { useState, useCallback, useEffect } from 'react';
import type { AppView, ExerciseResult } from './types';
import { loadProfile, saveProfile, getTodayString } from './storage';
import { EXERCISES, ACHIEVEMENTS } from './exercises';
import { updateDifficulty, getOrCreateDifficultyState, rankExercisesForSession, interleaveExercises } from './difficulty';
import Header from './components/Header';
import HomeView from './components/HomeView';
import SessionRunner from './components/SessionRunner';
import Dashboard from './components/Dashboard';
import SciencePage from './components/SciencePage';
import WarmupStatCard from './components/WarmupStatCard';
import { buildWarmupCircuit, computeReactionStat, advanceWarmupStreak, WARMUP_SESSION_PREFIX, type WarmupStep } from './warmup';

function App() {
  const [view, setView] = useState<AppView>('home');
  const [profile, setProfile] = useState(() => loadProfile());
  const [sessionExercises, setSessionExercises] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState('');
  const [warmupSteps, setWarmupSteps] = useState<WarmupStep[]>([]);

  // Save profile whenever it changes
  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/neuroplasticity-trainer/sw.js').catch(() => {
        // SW registration failed, offline support unavailable
      });
    }
  }, []);

  const updateStreak = useCallback(() => {
    const today = getTodayString();
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    setProfile(prev => {
      if (prev.lastSessionDate === today) return prev;

      let newStreak = 1;
      if (prev.lastSessionDate === yesterday) {
        newStreak = prev.currentStreak + 1;
      }

      return {
        ...prev,
        currentStreak: newStreak,
        longestStreak: Math.max(prev.longestStreak, newStreak),
        lastSessionDate: today,
      };
    });
  }, []);

  const handleStartSession = useCallback((durationMinutes: number) => {
    const exerciseCount = Math.min(Math.floor(durationMinutes * 0.8), EXERCISES.length);
    const allIds = EXERCISES.map(e => e.id);
    const ranked = rankExercisesForSession(profile, allIds);
    const selected = interleaveExercises(ranked, exerciseCount);

    setSessionExercises(selected);
    setSessionId(`session-${Date.now()}`);
    setView('session');
    updateStreak();
  }, [profile, updateStreak]);

  const handleStartExercise = useCallback((exerciseId: string) => {
    setSessionExercises([exerciseId]);
    setSessionId(`single-${Date.now()}`);
    setView('session');
    updateStreak();
  }, [updateStreak]);

  const handleStartWarmup = useCallback(() => {
    setWarmupSteps(buildWarmupCircuit(profile));
    setSessionId(`${WARMUP_SESSION_PREFIX}-${Date.now()}`);
    setView('warmup');
    updateStreak();
  }, [profile, updateStreak]);

  const handleWarmupEnd = useCallback(() => {
    setProfile(prev => {
      const today = getTodayString();
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      const dailyLogs = prev.dailyLogs.map(d =>
        d.date === today ? { ...d, sessionsCompleted: d.sessionsCompleted + 1 } : d
      );
      return {
        ...prev,
        totalSessions: prev.totalSessions + 1,
        dailyLogs,
        ...advanceWarmupStreak(prev, today, yesterday),
      };
    });
    setView('home');
  }, []);

  const handleExerciseComplete = useCallback((result: ExerciseResult) => {
    setProfile(prev => {
      const exercise = EXERCISES.find(e => e.id === result.exerciseId);
      if (!exercise) return prev;

      // Update difficulty
      const diffState = getOrCreateDifficultyState(prev, result.exerciseId);
      const newDiffState = updateDifficulty(diffState, result, exercise.minDifficulty, exercise.maxDifficulty);

      // Update daily log
      const today = getTodayString();
      const dailyLogs = [...prev.dailyLogs];
      let todayLog = dailyLogs.find(d => d.date === today);
      if (!todayLog) {
        todayLog = {
          date: today,
          sessionsCompleted: 0,
          totalExercises: 0,
          averageScore: 0,
          skillScores: {},
          timeSpentMs: 0,
        };
        dailyLogs.push(todayLog);
      }
      const oldTotal = todayLog.totalExercises;
      todayLog.totalExercises += 1;
      todayLog.averageScore = (todayLog.averageScore * oldTotal + result.score) / todayLog.totalExercises;
      todayLog.timeSpentMs += result.responseTimeMs;
      todayLog.skillScores[result.skill] = result.score;

      // Check for new achievements
      const newResults = [...prev.results, result];
      const tempProfile = { ...prev, results: newResults, totalExercises: prev.totalExercises + 1 };
      const newAchievements = ACHIEVEMENTS
        .filter(a => a.condition(tempProfile) && !prev.achievements.includes(a.id))
        .map(a => a.id);

      return {
        ...prev,
        totalExercises: prev.totalExercises + 1,
        results: newResults,
        difficultyStates: {
          ...prev.difficultyStates,
          [result.exerciseId]: newDiffState,
        },
        dailyLogs,
        achievements: [...prev.achievements, ...newAchievements],
      };
    });
  }, []);

  const handleSessionEnd = useCallback(() => {
    setProfile(prev => {
      const today = getTodayString();
      const dailyLogs = prev.dailyLogs.map(d =>
        d.date === today ? { ...d, sessionsCompleted: d.sessionsCompleted + 1 } : d
      );
      return {
        ...prev,
        totalSessions: prev.totalSessions + 1,
        dailyLogs,
      };
    });
    setView('home');
  }, []);

  return (
    <>
      <Header view={view} onNavigate={setView} streak={profile.currentStreak} />
      <main>
        {view === 'home' && (
          <HomeView
            profile={profile}
            onStartSession={handleStartSession}
            onStartExercise={handleStartExercise}
            onStartWarmup={handleStartWarmup}
          />
        )}
        {view === 'session' && (
          <SessionRunner
            exerciseIds={sessionExercises}
            profile={profile}
            sessionId={sessionId}
            onExerciseComplete={handleExerciseComplete}
            onSessionEnd={handleSessionEnd}
          />
        )}
        {view === 'warmup' && (
          <SessionRunner
            exerciseIds={warmupSteps.map(s => s.exerciseId)}
            profile={profile}
            sessionId={sessionId}
            onExerciseComplete={handleExerciseComplete}
            onSessionEnd={handleWarmupEnd}
            difficultyOverrides={Object.fromEntries(warmupSteps.map(s => [s.exerciseId, s.difficulty]))}
            finishContent={<WarmupStatCard stat={computeReactionStat(profile)} />}
          />
        )}
        {view === 'dashboard' && <Dashboard profile={profile} />}
        {view === 'science' && <SciencePage />}
      </main>
    </>
  );
}

export default App;
