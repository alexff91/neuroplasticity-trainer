import { Brain, BarChart3, Beaker, Home, Globe } from 'lucide-react';
import type { AppView } from '../types';

interface Props {
  view: AppView;
  onNavigate: (view: AppView) => void;
  streak: number;
}

export default function Header({ view, onNavigate, streak }: Props) {
  const navItems: { view: AppView; label: string; Icon: typeof Home }[] = [
    { view: 'home', label: 'Train', Icon: Home },
    { view: 'dashboard', label: 'Dashboard', Icon: BarChart3 },
    { view: 'global', label: 'Global', Icon: Globe },
    { view: 'science', label: 'Science', Icon: Beaker },
  ];

  return (
    <header style={{
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0.75rem 1rem',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backdropFilter: 'blur(10px)',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <button
          onClick={() => onNavigate('home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            minHeight: '44px',
            background: 'none',
            color: 'var(--text-primary)',
            fontSize: '1.1rem',
            fontWeight: 700,
          }}
        >
          <Brain size={24} color="var(--accent-primary)" />
          <span style={{
            background: 'var(--gradient-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            NeuroForge
          </span>
        </button>

        <nav style={{ display: 'flex', gap: '0.25rem', alignItems: 'center' }}>
          {navItems.map(({ view: v, label, Icon }) => (
            <button
              key={v}
              onClick={() => onNavigate(v)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                padding: '0.5rem 0.75rem',
                minWidth: '44px',
                minHeight: '44px',
                borderRadius: 'var(--radius-sm)',
                background: view === v ? 'var(--bg-accent)' : 'transparent',
                color: view === v ? 'var(--accent-primary)' : 'var(--text-secondary)',
                fontSize: '0.875rem',
                fontWeight: 500,
                transition: 'all 0.2s',
              }}
            >
              <Icon size={16} />
              <span className="nav-label">{label}</span>
            </button>
          ))}
          {streak > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.35rem 0.65rem',
              borderRadius: '20px',
              background: 'rgba(251,191,36,0.15)',
              color: 'var(--accent-warning)',
              fontSize: '0.8rem',
              fontWeight: 700,
              marginLeft: '0.5rem',
            }}>
              <span style={{ fontSize: '1rem' }}>&#x1F525;</span> {streak}
            </div>
          )}
        </nav>
      </div>

      <style>{`
        @media (max-width: 500px) {
          .nav-label { display: none; }
        }
      `}</style>
    </header>
  );
}
