import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Brain, Settings } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { getBrainBreakSuggestion } from '../../utils/cognitiveLoad';

const TIMER_STATES = {
  WORK: 'work',
  BREAK: 'break',
  LONG_BREAK: 'longBreak',
};

export default function PomodoroTimer() {
  const { state, actions } = useApp();
  const [timerState, setTimerState] = useState(TIMER_STATES.WORK);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [showBreakSuggestion, setShowBreakSuggestion] = useState(false);
  const [breakSuggestion, setBreakSuggestion] = useState(null);
  const audioRef = useRef(null);

  const settings = state.settings || {
    pomodoroWork: 25,
    pomodoroBreak: 5,
    pomodoroLongBreak: 15,
  };

  const getDuration = useCallback(() => {
    switch (timerState) {
      case TIMER_STATES.WORK:
        return settings.pomodoroWork * 60;
      case TIMER_STATES.BREAK:
        return settings.pomodoroBreak * 60;
      case TIMER_STATES.LONG_BREAK:
        return settings.pomodoroLongBreak * 60;
      default:
        return 25 * 60;
    }
  }, [timerState, settings]);

  useEffect(() => {
    setTimeLeft(getDuration());
  }, [timerState, getDuration]);

  useEffect(() => {
    let interval;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);

    // Play sound
    if (state.settings?.soundEnabled) {
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleQ0FFJHq7aF+GwcTh/PypYQbBhKF+/akgxoGEYT+9qOCGgYRhf72o4IaBhGF/vaighkHEYX+9qKCGQcRhf72ooIZBxGF/vaighkH');
        audio.play();
      } catch (e) {
        console.log('Could not play sound');
      }
    }

    if (timerState === TIMER_STATES.WORK) {
      // Work session completed
      const newSessionsCompleted = sessionsCompleted + 1;
      setSessionsCompleted(newSessionsCompleted);
      actions.completePomodoro(settings.pomodoroWork);

      // Get break suggestion
      const suggestion = getBrainBreakSuggestion(50, settings.pomodoroWork * 60 * 1000);
      setBreakSuggestion(suggestion);
      setShowBreakSuggestion(true);

      // Every 4 sessions, take a long break
      if (newSessionsCompleted % 4 === 0) {
        setTimerState(TIMER_STATES.LONG_BREAK);
      } else {
        setTimerState(TIMER_STATES.BREAK);
      }
    } else {
      // Break completed
      setTimerState(TIMER_STATES.WORK);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(getDuration());
  };

  const skipToBreak = () => {
    setIsRunning(false);
    setTimerState(TIMER_STATES.BREAK);
  };

  const skipToWork = () => {
    setIsRunning(false);
    setShowBreakSuggestion(false);
    setTimerState(TIMER_STATES.WORK);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((getDuration() - timeLeft) / getDuration()) * 100;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getStateColor = () => {
    switch (timerState) {
      case TIMER_STATES.WORK:
        return { primary: '#6366f1', secondary: '#818cf8' };
      case TIMER_STATES.BREAK:
        return { primary: '#10b981', secondary: '#34d399' };
      case TIMER_STATES.LONG_BREAK:
        return { primary: '#f59e0b', secondary: '#fbbf24' };
      default:
        return { primary: '#6366f1', secondary: '#818cf8' };
    }
  };

  const colors = getStateColor();

  return (
    <div className="max-w-2xl mx-auto">
      {/* Timer Type Selector */}
      <div className="flex justify-center gap-2 mb-8">
        {[
          { state: TIMER_STATES.WORK, label: 'Focus', icon: Brain },
          { state: TIMER_STATES.BREAK, label: 'Break', icon: Coffee },
          { state: TIMER_STATES.LONG_BREAK, label: 'Long Break', icon: Coffee },
        ].map(({ state: s, label, icon: Icon }) => (
          <button
            key={s}
            onClick={() => {
              setTimerState(s);
              setIsRunning(false);
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              timerState === s
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                : 'text-slate-400 hover:bg-slate-800/50'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Timer Circle */}
      <div className="relative flex justify-center mb-8">
        <svg width="280" height="280" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="140"
            cy="140"
            r="120"
            fill="none"
            stroke="rgba(99, 102, 241, 0.1)"
            strokeWidth="12"
          />
          {/* Progress circle */}
          <circle
            cx="140"
            cy="140"
            r="120"
            fill="none"
            stroke={colors.primary}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000"
            style={{ filter: `drop-shadow(0 0 10px ${colors.primary}40)` }}
          />
        </svg>

        {/* Time Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-6xl font-bold text-white font-mono">
            {formatTime(timeLeft)}
          </span>
          <span className="text-slate-400 mt-2 capitalize">
            {timerState === TIMER_STATES.WORK ? 'Focus Time' : timerState === TIMER_STATES.LONG_BREAK ? 'Long Break' : 'Short Break'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={resetTimer}
          className="p-4 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
        >
          <RotateCcw className="w-6 h-6" />
        </button>
        <button
          onClick={toggleTimer}
          className="p-6 rounded-2xl text-white transition-all transform hover:scale-105"
          style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})` }}
        >
          {isRunning ? (
            <Pause className="w-8 h-8" />
          ) : (
            <Play className="w-8 h-8 ml-1" />
          )}
        </button>
        {timerState === TIMER_STATES.WORK ? (
          <button
            onClick={skipToBreak}
            className="p-4 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
          >
            <Coffee className="w-6 h-6" />
          </button>
        ) : (
          <button
            onClick={skipToWork}
            className="p-4 rounded-xl bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all"
          >
            <Brain className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Session Counter */}
      <div className="flex justify-center gap-2 mb-8">
        {[1, 2, 3, 4].map(i => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all ${
              i <= (sessionsCompleted % 4 || (sessionsCompleted > 0 ? 4 : 0))
                ? 'bg-indigo-500'
                : 'bg-slate-700'
            }`}
          />
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-indigo-400">{sessionsCompleted}</div>
          <div className="text-sm text-slate-400">Today's Sessions</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-emerald-400">
            {state.userStats?.pomodorosCompleted || 0}
          </div>
          <div className="text-sm text-slate-400">Total Sessions</div>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-amber-400">
            {Math.round((state.userStats?.totalTimeSpent || 0) / 60)}h
          </div>
          <div className="text-sm text-slate-400">Focus Time</div>
        </div>
      </div>

      {/* Break Suggestion Modal */}
      {showBreakSuggestion && breakSuggestion && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-8 max-w-md mx-4 animate-slide-up">
            <div className="text-center">
              <div className="text-5xl mb-4">{breakSuggestion.icon}</div>
              <h3 className="text-2xl font-bold text-white mb-2">Great Work!</h3>
              <p className="text-slate-400 mb-6">
                You completed a focus session. Take a well-deserved break!
              </p>

              <div className="p-4 rounded-xl bg-slate-800/50 mb-6">
                <h4 className="font-medium text-white mb-1">{breakSuggestion.activity}</h4>
                <p className="text-sm text-slate-400">{breakSuggestion.description}</p>
                <p className="text-xs text-emerald-400 mt-2">{breakSuggestion.duration}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowBreakSuggestion(false);
                    setIsRunning(true);
                  }}
                  className="flex-1 px-4 py-3 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                >
                  Start Break
                </button>
                <button
                  onClick={skipToWork}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
                >
                  Skip Break
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
