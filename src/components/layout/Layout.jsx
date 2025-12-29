import Sidebar from './Sidebar';
import Notification from '../gamification/Notification';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="ml-64 min-h-screen p-8">
        {children}
      </main>
      <Notification />
    </div>
  );
}
