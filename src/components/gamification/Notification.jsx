import { useEffect, useState } from 'react';
import { Trophy, Zap, Star, X } from 'lucide-react';
import { useApp } from '../../contexts/AppContext';

export default function Notification() {
  const { state, actions } = useApp();
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (state.notification) {
      setData(state.notification);
      setVisible(true);

      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          actions.clearNotification();
          setData(null);
        }, 300);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [state.notification]);

  if (!data) return null;

  const renderContent = () => {
    switch (data.type) {
      case 'achievement':
        return (
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-3xl achievement-unlock">
              {data.data.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-1">
                <Trophy className="w-4 h-4" />
                Achievement Unlocked!
              </div>
              <h3 className="text-xl font-bold text-white">{data.data.name}</h3>
              <p className="text-slate-400 text-sm">{data.data.description}</p>
              <div className="flex items-center gap-1 mt-2 text-emerald-400 text-sm">
                <Zap className="w-4 h-4" />
                +{data.data.xp} XP
              </div>
            </div>
          </div>
        );

      case 'levelUp':
        return (
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center animate-celebrate">
              <Star className="w-10 h-10 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-indigo-400 text-sm font-medium mb-1">
                <Zap className="w-4 h-4" />
                Level Up!
              </div>
              <h3 className="text-2xl font-bold text-white">Level {data.data.level}</h3>
              <p className="text-slate-400 text-sm">Keep learning to unlock more!</p>
            </div>
          </div>
        );

      case 'xp':
        return (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-emerald-400">+{data.data.amount} XP</div>
              <p className="text-slate-400 text-sm">{data.data.reason}</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`fixed top-6 right-6 z-[100] transition-all duration-300 ${
        visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'
      }`}
    >
      <div className="glass-card rounded-2xl p-4 pr-12 shadow-2xl shadow-indigo-500/10 border border-indigo-500/30 min-w-[320px]">
        {renderContent()}
        <button
          onClick={() => {
            setVisible(false);
            setTimeout(() => {
              actions.clearNotification();
              setData(null);
            }, 300);
          }}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
