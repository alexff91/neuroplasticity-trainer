import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';

export default function AnalyticsPage() {
  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Learning Analytics</h1>
        <p className="text-slate-400">Track your progress and optimize your learning</p>
      </div>

      {/* Dashboard */}
      <AnalyticsDashboard />
    </div>
  );
}
