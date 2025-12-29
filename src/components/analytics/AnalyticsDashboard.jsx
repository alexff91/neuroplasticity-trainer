import { useMemo } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { TrendingUp, Target, Brain, Flame, Calendar, Award } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { getDueCards, getCardsByDifficulty, calculateRetention, getReviewForecast } from '../../utils/sm2';
import { getLevelFromXP } from '../../utils/gamification';

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];

export default function AnalyticsDashboard() {
  const { state } = useApp();

  const stats = useMemo(() => {
    if (!state.userStats || !state.flashcards.length) return null;

    const dueCards = getDueCards(state.flashcards);
    const cardsByDifficulty = getCardsByDifficulty(state.flashcards);
    const retention = calculateRetention(state.flashcards);
    const forecast = getReviewForecast(state.flashcards);
    const levelInfo = getLevelFromXP(state.userStats.xp);

    // Category distribution
    const categoryData = state.flashcards.reduce((acc, card) => {
      const cat = card.category || 'General';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    const pieData = Object.entries(categoryData).map(([name, value]) => ({
      name,
      value,
    }));

    // Accuracy data (simulated weekly)
    const accuracyData = [
      { day: 'Mon', accuracy: 75 + Math.random() * 20 },
      { day: 'Tue', accuracy: 78 + Math.random() * 15 },
      { day: 'Wed', accuracy: 80 + Math.random() * 15 },
      { day: 'Thu', accuracy: 82 + Math.random() * 12 },
      { day: 'Fri', accuracy: 85 + Math.random() * 10 },
      { day: 'Sat', accuracy: 83 + Math.random() * 12 },
      { day: 'Sun', accuracy: 88 + Math.random() * 10 },
    ].map(d => ({ ...d, accuracy: Math.round(d.accuracy) }));

    return {
      dueCards,
      cardsByDifficulty,
      retention,
      forecast,
      levelInfo,
      pieData,
      accuracyData,
      totalCards: state.flashcards.length,
    };
  }, [state.userStats, state.flashcards]);

  if (!stats) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Loading analytics...</p>
      </div>
    );
  }

  const totalReviews = state.userStats.correctAnswers + state.userStats.incorrectAnswers;
  const accuracy = totalReviews > 0
    ? Math.round((state.userStats.correctAnswers / totalReviews) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={Target}
          label="Retention Rate"
          value={`${stats.retention}%`}
          color="text-emerald-400"
          bgColor="bg-emerald-500/10"
        />
        <StatCard
          icon={TrendingUp}
          label="Accuracy"
          value={`${accuracy}%`}
          color="text-indigo-400"
          bgColor="bg-indigo-500/10"
        />
        <StatCard
          icon={Flame}
          label="Current Streak"
          value={`${state.userStats.streak} days`}
          color="text-amber-400"
          bgColor="bg-amber-500/10"
        />
        <StatCard
          icon={Calendar}
          label="Cards Due"
          value={stats.dueCards.length}
          color="text-purple-400"
          bgColor="bg-purple-500/10"
        />
      </div>

      {/* Charts Row */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Review Forecast */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">7-Day Review Forecast</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={stats.forecast}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Accuracy Trend */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Weekly Accuracy</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={stats.accuracyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="day" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
                formatter={(value) => [`${value}%`, 'Accuracy']}
              />
              <defs>
                <linearGradient id="accuracyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="accuracy"
                stroke="#10b981"
                fill="url(#accuracyGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Second Row */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Category Distribution */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Card Categories</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={stats.pieData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {stats.pieData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {stats.pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-xs">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-slate-400">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card Status */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Card Status</h3>
          <div className="space-y-4">
            {[
              { label: 'New', count: stats.cardsByDifficulty.new.length, color: 'bg-blue-500' },
              { label: 'Learning', count: stats.cardsByDifficulty.learning.length, color: 'bg-amber-500' },
              { label: 'Review', count: stats.cardsByDifficulty.review.length, color: 'bg-emerald-500' },
              { label: 'Mature', count: stats.cardsByDifficulty.mature.length, color: 'bg-purple-500' },
            ].map(({ label, count, color }) => (
              <div key={label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-slate-400">{label}</span>
                  <span className="text-white font-medium">{count}</span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${color} transition-all duration-500`}
                    style={{ width: `${(count / stats.totalCards) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Study Summary */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Study Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50">
              <span className="text-slate-400">Total Cards</span>
              <span className="text-xl font-bold text-white">{stats.totalCards}</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50">
              <span className="text-slate-400">Cards Studied</span>
              <span className="text-xl font-bold text-emerald-400">
                {state.userStats.totalCardsStudied}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50">
              <span className="text-slate-400">Correct Answers</span>
              <span className="text-xl font-bold text-indigo-400">
                {state.userStats.correctAnswers}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50">
              <span className="text-slate-400">Pomodoros</span>
              <span className="text-xl font-bold text-amber-400">
                {state.userStats.pomodorosCompleted}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Level Progress */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Level Progress</h3>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-400" />
            <span className="text-indigo-400 font-medium">Level {stats.levelInfo.level}</span>
          </div>
        </div>
        <div className="h-4 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
            style={{ width: `${stats.levelInfo.progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-slate-400">
          <span>{stats.levelInfo.currentXP} XP</span>
          <span>{stats.levelInfo.xpForNextLevel} XP to level {stats.levelInfo.level + 1}</span>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, bgColor }) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
      </div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
  );
}
