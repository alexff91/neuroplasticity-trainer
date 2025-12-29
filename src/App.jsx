import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import FlashcardsPage from './pages/FlashcardsPage';
import PracticePage from './pages/PracticePage';
import SkillTreePage from './pages/SkillTreePage';
import AnalyticsPage from './pages/AnalyticsPage';
import PomodoroPage from './pages/PomodoroPage';
import AchievementsPage from './pages/AchievementsPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/flashcards" element={<FlashcardsPage />} />
            <Route path="/practice" element={<PracticePage />} />
            <Route path="/skill-tree" element={<SkillTreePage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/pomodoro" element={<PomodoroPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
