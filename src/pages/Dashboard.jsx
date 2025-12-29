import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, GitBranch, Timer, Trophy, Zap, Target, Flame, Calendar,
  TrendingUp, Play, ChevronRight, Brain, Sparkles
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { getDueCards, getReviewForecast } from '../utils/sm2';
import { getLevelFromXP, getRankTitle, getRankColor } from '../utils/gamification';

export default function Dashboard() {
  const { state } = useApp();

  const stats = useMemo(() => {
    if (!state.flashcards || !state.userStats) return null;

    const dueCards = getDueCards(state.flashcards);
    const forecast = getReviewForecast(state.flashcards);
    const levelInfo = getLevelFromXP(state.userStats.xp);
    const totalReviews = state.userStats.correctAnswers + state.userStats.incorrectAnswers;
    const accuracy = totalReviews > 0
      ? Math.round((state.userStats.correctAnswers / totalReviews) * 100)
      : 0;

    return { dueCards, forecast, levelInfo, accuracy };
  }, [state.flashcards, state.userStats]);

  if (!stats || !state.userStats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Brain className="w-16 h-16 text-indigo-400 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-400">Loading your learning dashboard...</p>
        </div>
      </div>
    );
  }

  const rankTitle = getRankTitle(stats.levelInfo.level);
  const rankColor = getRankColor(stats.levelInfo.level);

  return (
    <div className="max-w-6xl mx-auto animate-slide-up">
      {/* Welcome Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-indigo-400 text-sm font-medium mb-2">
          <Sparkles className="w-4 h-4" />
          Welcome back, learner!
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">
          Your Learning Dashboard
        </h1>
        <p className="text-slate-400">
          {stats.dueCards.length > 0
            ? `You have ${stats.dueCards.length} cards due for review today.`
            : "You're all caught up! Great job!"}
        </p>
      </div>

      {/* Level & Progress Card */}
      <div className="glass-card rounded-2xl p-6 mb-8 border border-indigo-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold animate-pulse-glow"
              style={{ background: `linear-gradient(135deg, ${rankColor}40, ${rankColor}20)`, color: rankColor }}
            >
              {stats.levelInfo.level}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-2xl font-bold text-white">Level {stats.levelInfo.level}</span>
                <span
                  className="px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{ backgroundColor: rankColor + '20', color: rankColor }}
                >
                  {rankTitle}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Zap className="w-4 h-4 text-amber-400" />
                <span>{state.userStats.xp.toLocaleString()} total XP</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400 mb-1">Progress to Level {stats.levelInfo.level + 1}</div>
            <div className="w-48 h-3 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-500"
                style={{
                  width: `${stats.levelInfo.progress}%`,
                  background: `linear-gradient(90deg, ${rankColor}, ${rankColor}aa)`,
                }}
              />
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {stats.levelInfo.currentXP} / {stats.levelInfo.xpForNextLevel} XP
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Target}
          value={stats.accuracy}
          suffix="%"
          label="Accuracy"
          color="text-emerald-400"
          bgColor="bg-emerald-500/10"
        />
        <StatCard
          icon={Flame}
          value={state.userStats.streak}
          label="Day Streak"
          color="text-amber-400"
          bgColor="bg-amber-500/10"
        />
        <StatCard
          icon={BookOpen}
          value={state.userStats.totalCardsStudied}
          label="Cards Studied"
          color="text-indigo-400"
          bgColor="bg-indigo-500/10"
        />
        <StatCard
          icon={Timer}
          value={state.userStats.pomodorosCompleted}
          label="Pomodoros"
          color="text-purple-400"
          bgColor="bg-purple-500/10"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Due Cards */}
        <div className="md:col-span-2">
          <div className="glass-card rounded-2xl p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Today's Review</h2>
              <Link
                to="/practice"
                className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-sm"
              >
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {stats.dueCards.length > 0 ? (
              <>
                <div className="space-y-3 mb-6">
                  {stats.dueCards.slice(0, 3).map(card => (
                    <div
                      key={card.id}
                      className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs">
                            {card.category}
                          </span>
                          <p className="text-white mt-2 line-clamp-1">{card.front}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  to="/practice"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
                >
                  <Play className="w-5 h-5" />
                  Start Review ({stats.dueCards.length} cards)
                </Link>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🎉</div>
                <p className="text-white font-medium mb-2">All caught up!</p>
                <p className="text-slate-400 text-sm mb-4">
                  No cards due for review. Keep up the great work!
                </p>
                <Link
                  to="/flashcards"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700/50 text-slate-300 hover:bg-slate-700 transition-colors"
                >
                  Add New Cards
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* 7-Day Forecast */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">7-Day Forecast</h2>
          <div className="space-y-3">
            {stats.forecast.map((day, i) => (
              <div key={day.date} className="flex items-center justify-between">
                <span className={`text-sm ${i === 0 ? 'text-indigo-400 font-medium' : 'text-slate-400'}`}>
                  {i === 0 ? 'Today' : day.day}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 transition-all"
                      style={{ width: `${Math.min(100, (day.count / 20) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm text-white w-8">{day.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickLinkCard
          to="/flashcards"
          icon={BookOpen}
          title="Flashcards"
          description="Manage your cards"
          color="indigo"
        />
        <QuickLinkCard
          to="/skill-tree"
          icon={GitBranch}
          title="Skill Tree"
          description="Track your progress"
          color="purple"
        />
        <QuickLinkCard
          to="/pomodoro"
          icon={Timer}
          title="Pomodoro"
          description="Focus sessions"
          color="emerald"
        />
        <QuickLinkCard
          to="/achievements"
          icon={Trophy}
          title="Achievements"
          description={`${state.achievements.length} unlocked`}
          color="amber"
        />
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, value, suffix = '', label, color, bgColor }) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center mb-3`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className={`text-2xl font-bold ${color}`}>
        {value}{suffix}
      </div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
  );
}

function QuickLinkCard({ to, icon: Icon, title, description, color }) {
  const colors = {
    indigo: 'hover:border-indigo-500/40 hover:bg-indigo-500/5',
    purple: 'hover:border-purple-500/40 hover:bg-purple-500/5',
    emerald: 'hover:border-emerald-500/40 hover:bg-emerald-500/5',
    amber: 'hover:border-amber-500/40 hover:bg-amber-500/5',
  };

  const iconColors = {
    indigo: 'text-indigo-400',
    purple: 'text-purple-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
  };

  return (
    <Link
      to={to}
      className={`glass-card rounded-xl p-4 transition-all ${colors[color]} group`}
    >
      <Icon className={`w-8 h-8 ${iconColors[color]} mb-3 group-hover:scale-110 transition-transform`} />
      <h3 className="font-medium text-white">{title}</h3>
      <p className="text-sm text-slate-400">{description}</p>
    </Link>
  );
}
