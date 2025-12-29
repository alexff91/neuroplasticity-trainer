import PomodoroTimer from '../components/pomodoro/PomodoroTimer';

export default function PomodoroPage() {
  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Pomodoro Timer</h1>
        <p className="text-slate-400">Stay focused with timed study sessions</p>
      </div>

      {/* Timer */}
      <PomodoroTimer />
    </div>
  );
}
