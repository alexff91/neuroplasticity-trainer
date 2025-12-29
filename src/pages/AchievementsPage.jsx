import Achievements from '../components/gamification/Achievements';

export default function AchievementsPage() {
  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Achievements</h1>
        <p className="text-slate-400">Track your accomplishments and earn rewards</p>
      </div>

      {/* Achievements */}
      <Achievements />
    </div>
  );
}
