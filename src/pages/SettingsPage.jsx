import { useState, useEffect } from 'react';
import { Save, Volume2, VolumeX, Bell, BellOff, Moon, Sun, RotateCcw } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export default function SettingsPage() {
  const { state, actions } = useApp();
  const [settings, setSettings] = useState(state.settings || {});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (state.settings) {
      setSettings(state.settings);
    }
  }, [state.settings]);

  const handleSave = () => {
    actions.updateSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      const defaultSettings = {
        pomodoroWork: 25,
        pomodoroBreak: 5,
        pomodoroLongBreak: 15,
        soundEnabled: true,
        notificationsEnabled: true,
        darkMode: true,
        dailyGoal: 20,
      };
      setSettings(defaultSettings);
      actions.updateSettings(defaultSettings);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-400">Customize your learning experience</p>
      </div>

      <div className="space-y-6">
        {/* Pomodoro Settings */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Pomodoro Timer</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Focus Duration (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.pomodoroWork || 25}
                onChange={(e) => setSettings({ ...settings, pomodoroWork: parseInt(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Short Break (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.pomodoroBreak || 5}
                onChange={(e) => setSettings({ ...settings, pomodoroBreak: parseInt(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-2">
                Long Break (minutes)
              </label>
              <input
                type="number"
                min="1"
                max="60"
                value={settings.pomodoroLongBreak || 15}
                onChange={(e) => setSettings({ ...settings, pomodoroLongBreak: parseInt(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Study Settings */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Study Goals</h2>
          <div>
            <label className="block text-sm text-slate-400 mb-2">
              Daily Card Goal
            </label>
            <input
              type="number"
              min="5"
              max="100"
              value={settings.dailyGoal || 20}
              onChange={(e) => setSettings({ ...settings, dailyGoal: parseInt(e.target.value) })}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
            />
            <p className="text-xs text-slate-500 mt-2">
              Number of cards to study each day to maintain your streak
            </p>
          </div>
        </div>

        {/* Preferences */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Preferences</h2>
          <div className="space-y-4">
            {/* Sound */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50">
              <div className="flex items-center gap-3">
                {settings.soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-indigo-400" />
                ) : (
                  <VolumeX className="w-5 h-5 text-slate-500" />
                )}
                <div>
                  <div className="text-white font-medium">Sound Effects</div>
                  <div className="text-sm text-slate-400">Play sounds for notifications</div>
                </div>
              </div>
              <button
                onClick={() => setSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  settings.soundEnabled ? 'bg-indigo-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                    settings.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50">
              <div className="flex items-center gap-3">
                {settings.notificationsEnabled ? (
                  <Bell className="w-5 h-5 text-indigo-400" />
                ) : (
                  <BellOff className="w-5 h-5 text-slate-500" />
                )}
                <div>
                  <div className="text-white font-medium">Notifications</div>
                  <div className="text-sm text-slate-400">Get reminders to study</div>
                </div>
              </div>
              <button
                onClick={() => setSettings({ ...settings, notificationsEnabled: !settings.notificationsEnabled })}
                className={`w-12 h-6 rounded-full transition-colors relative ${
                  settings.notificationsEnabled ? 'bg-indigo-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                    settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-500 text-white hover:bg-indigo-600 transition-colors"
          >
            <Save className="w-5 h-5" />
            {saved ? 'Saved!' : 'Save Settings'}
          </button>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-700 text-slate-300 hover:bg-slate-600 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
