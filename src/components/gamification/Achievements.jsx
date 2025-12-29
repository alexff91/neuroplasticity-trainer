import { useMemo } from 'react';
import { Trophy, Lock, Zap, Calendar } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { ACHIEVEMENTS } from '../../utils/gamification';

export default function Achievements() {
  const { state } = useApp();

  const achievementStatus = useMemo(() => {
    const unlockedIds = state.achievements.map(a => a.id);

    return ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      unlocked: unlockedIds.includes(achievement.id),
      unlockedData: state.achievements.find(a => a.id === achievement.id),
    }));
  }, [state.achievements]);

  const unlockedCount = achievementStatus.filter(a => a.unlocked).length;
  const totalXpEarned = state.achievements.reduce((sum, a) => {
    const def = ACHIEVEMENTS.find(d => d.id === a.id);
    return sum + (def?.xp || 0);
  }, 0);

  const categories = [
    { id: 'progress', name: 'Progress', filter: (a) => a.id.includes('card') || a.id.includes('level') },
    { id: 'streak', name: 'Streaks', filter: (a) => a.id.includes('streak') },
    { id: 'accuracy', name: 'Accuracy', filter: (a) => a.id.includes('accuracy') || a.id.includes('perfect') },
    { id: 'pomodoro', name: 'Pomodoro', filter: (a) => a.id.includes('pomodoro') },
    { id: 'skills', name: 'Skills', filter: (a) => a.id.includes('skill') },
    { id: 'special', name: 'Special', filter: (a) => a.id.includes('owl') || a.id.includes('bird') || a.id.includes('perfect_day') },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="glass-card rounded-xl p-6 text-center">
          <Trophy className="w-8 h-8 text-amber-400 mx-auto mb-2" />
          <div className="text-3xl font-bold text-white">{unlockedCount}</div>
          <div className="text-sm text-slate-400">Achievements</div>
        </div>
        <div className="glass-card rounded-xl p-6 text-center">
          <div className="text-3xl font-bold text-white">{ACHIEVEMENTS.length}</div>
          <div className="text-sm text-slate-400">Total Available</div>
        </div>
        <div className="glass-card rounded-xl p-6 text-center">
          <Zap className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <div className="text-3xl font-bold text-emerald-400">{totalXpEarned}</div>
          <div className="text-sm text-slate-400">XP Earned</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="glass-card rounded-xl p-6 mb-8">
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-400">Achievement Progress</span>
          <span className="text-white font-medium">
            {unlockedCount} / {ACHIEVEMENTS.length}
          </span>
        </div>
        <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500"
            style={{ width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Achievement Categories */}
      {categories.map(category => {
        const categoryAchievements = achievementStatus.filter(category.filter);
        if (categoryAchievements.length === 0) return null;

        return (
          <div key={category.id} className="mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">{category.name}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {categoryAchievements.map(achievement => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AchievementCard({ achievement }) {
  const { unlocked, unlockedData, icon, name, description, xp } = achievement;

  return (
    <div
      className={`glass-card rounded-xl p-4 transition-all ${
        unlocked
          ? 'border-amber-500/30 hover:border-amber-500/50'
          : 'opacity-60'
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl ${
            unlocked
              ? 'bg-gradient-to-br from-amber-400 to-orange-500'
              : 'bg-slate-700/50'
          }`}
        >
          {unlocked ? icon : <Lock className="w-6 h-6 text-slate-500" />}
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold ${unlocked ? 'text-white' : 'text-slate-500'}`}>
            {name}
          </h3>
          <p className="text-sm text-slate-400 mb-2">{description}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs">
              <Zap className={`w-3 h-3 ${unlocked ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span className={unlocked ? 'text-emerald-400' : 'text-slate-500'}>
                {xp} XP
              </span>
            </div>
            {unlocked && unlockedData?.unlockedAt && (
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Calendar className="w-3 h-3" />
                {new Date(unlockedData.unlockedAt).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
