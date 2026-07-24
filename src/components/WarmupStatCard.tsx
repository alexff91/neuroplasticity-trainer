import { Timer, TrendingDown, TrendingUp } from 'lucide-react';
import type { ReactionStat } from '../warmup';

interface Props {
  stat: ReactionStat;
  compact?: boolean;
}

export default function WarmupStatCard({ stat, compact }: Props) {
  let message: string;
  let color = 'var(--text-muted)';
  let Icon = Timer;

  if (stat.todayAvgMs === null) {
    message = 'Finish a warm-up to track your reaction time.';
  } else if (stat.deltaMs === null) {
    message = `Avg reaction ${stat.todayAvgMs}ms today — building your 7-day baseline.`;
  } else if (stat.improved) {
    color = 'var(--accent-success)';
    Icon = TrendingDown;
    message = `${Math.abs(stat.deltaMs)}ms faster than your 7-day average. Sharp today!`;
  } else if (stat.deltaMs === 0) {
    message = 'Right on pace with your 7-day average.';
  } else {
    color = 'var(--accent-warning)';
    Icon = TrendingUp;
    message = `${stat.deltaMs}ms slower than your 7-day average — shake it off and go again.`;
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: 'var(--radius-sm)',
      padding: compact ? '0.5rem 0.75rem' : '0.75rem 1rem',
      fontSize: compact ? '0.8rem' : '0.85rem',
      color: 'var(--text-secondary)',
      textAlign: 'left',
      lineHeight: 1.4,
      margin: compact ? 0 : '0 auto 1.5rem',
      maxWidth: '420px',
    }}>
      <Icon size={18} color={color} style={{ flexShrink: 0 }} />
      <span><strong style={{ color }}>Reaction:</strong> {message}</span>
    </div>
  );
}
