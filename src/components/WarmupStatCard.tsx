import { Timer, TrendingDown, TrendingUp } from 'lucide-react';
import type { ReactionStat } from '../warmup';

interface Props {
  stat: ReactionStat;
  compact?: boolean;
}

export default function WarmupStatCard({ stat, compact }: Props) {
  let headline: string;
  let caption: string;
  let color = 'var(--text-muted)';
  let Icon = Timer;

  if (stat.todayAvgMs === null) {
    headline = '—';
    caption = 'Finish a warm-up to start tracking your reaction time.';
  } else if (stat.deltaMs === null) {
    headline = `${stat.todayAvgMs}ms`;
    color = 'var(--accent-info)';
    caption = 'Today’s average · building your 7-day baseline.';
  } else if (stat.improved) {
    headline = `−${Math.abs(stat.deltaMs)}ms`;
    color = 'var(--accent-success)';
    Icon = TrendingDown;
    caption = `Faster than your 7-day average. Sharp today — ${stat.todayAvgMs}ms vs ${stat.baselineAvgMs}ms.`;
  } else if (stat.deltaMs === 0) {
    headline = '0ms';
    color = 'var(--accent-info)';
    caption = `Dead even with your 7-day average of ${stat.baselineAvgMs}ms.`;
  } else {
    headline = `+${stat.deltaMs}ms`;
    color = 'var(--accent-warning)';
    Icon = TrendingUp;
    caption = `Slower than your 7-day average. Shake it off — ${stat.todayAvgMs}ms vs ${stat.baselineAvgMs}ms.`;
  }

  return (
    <div style={{
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      gap: '0.85rem',
      background: 'rgba(15, 23, 42, 0.55)',
      border: `1px solid ${color}33`,
      borderRadius: 'var(--radius)',
      padding: compact ? '0.7rem 0.9rem' : '1rem 1.15rem',
      textAlign: 'left',
      backdropFilter: 'blur(6px)',
      margin: compact ? 0 : '0 auto 1.5rem',
      maxWidth: compact ? undefined : '420px',
    }}>
      {/* Soft glow keyed to the trend color */}
      <div
        className="warmup-stat-glow"
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-10%',
          top: '50%',
          width: '160px',
          height: '160px',
          transform: 'translateY(-50%)',
          background: `radial-gradient(circle, ${color}2e, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: compact ? '34px' : '40px',
        height: compact ? '34px' : '40px',
        flexShrink: 0,
        borderRadius: '10px',
        background: `${color}1f`,
        border: `1px solid ${color}40`,
      }}>
        <Icon size={compact ? 17 : 20} color={color} />
      </div>

      <div style={{ position: 'relative', minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: compact ? '1.15rem' : '1.4rem',
            fontWeight: 800,
            color,
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
          }}>
            {headline}
          </span>
          <span style={{
            fontSize: '0.62rem',
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}>
            vs 7-day avg
          </span>
        </div>
        <div style={{
          fontSize: compact ? '0.75rem' : '0.82rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.4,
          marginTop: '0.1rem',
        }}>
          {caption}
        </div>
      </div>
    </div>
  );
}
