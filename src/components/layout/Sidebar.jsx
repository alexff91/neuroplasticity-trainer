import { NavLink } from 'react-router-dom';
import {
  Brain,
  BookOpen,
  GitBranch,
  BarChart3,
  Timer,
  Trophy,
  Settings,
  Shuffle,
  Zap,
} from 'lucide-react';
import { useApp } from '../../contexts/AppContext';
import { getLevelFromXP, getRankTitle, getRankColor } from '../../utils/gamification';

export default function Sidebar() {
  const { state } = useApp();
  const levelInfo = state.userStats ? getLevelFromXP(state.userStats.xp) : { level: 1, progress: 0 };
  const rankTitle = getRankTitle(levelInfo.level);
  const rankColor = getRankColor(levelInfo.level);

  const navItems = [
    { to: '/', icon: Brain, label: 'Dashboard' },
    { to: '/flashcards', icon: BookOpen, label: 'Flashcards' },
    { to: '/practice', icon: Shuffle, label: 'Practice' },
    { to: '/skill-tree', icon: GitBranch, label: 'Skill Tree' },
    { to: '/analytics', icon: BarChart3, label: 'Analytics' },
    { to: '/pomodoro', icon: Timer, label: 'Pomodoro' },
    { to: '/achievements', icon: Trophy, label: 'Achievements' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 glass-card border-r border-indigo-500/20 flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-indigo-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center animate-pulse-glow">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">NeuroLearn</h1>
            <p className="text-xs text-slate-400">Adaptive Learning</p>
          </div>
        </div>
      </div>

      {/* User Level Card */}
      {state.userStats && (
        <div className="p-4 mx-4 mt-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" style={{ color: rankColor }} />
              <span className="text-sm font-medium text-slate-300">Level {levelInfo.level}</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: rankColor + '20', color: rankColor }}>
              {rankTitle}
            </span>
          </div>
          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${levelInfo.progress}%`,
                background: `linear-gradient(90deg, ${rankColor}, ${rankColor}aa)`,
              }}
            />
          </div>
          <div className="flex justify-between mt-1.5 text-xs text-slate-500">
            <span>{levelInfo.currentXP} XP</span>
            <span>{levelInfo.xpForNextLevel} XP</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Settings */}
      <div className="p-4 border-t border-indigo-500/20">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              isActive
                ? 'bg-indigo-500/20 text-indigo-400'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`
          }
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </NavLink>
      </div>

      {/* Stats Footer */}
      {state.userStats && (
        <div className="p-4 border-t border-indigo-500/20">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2 rounded-lg bg-slate-800/30">
              <div className="text-lg font-bold text-amber-400">{state.userStats.streak}</div>
              <div className="text-xs text-slate-500">Day Streak</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-800/30">
              <div className="text-lg font-bold text-emerald-400">{state.userStats.totalCardsStudied}</div>
              <div className="text-xs text-slate-500">Cards Done</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
