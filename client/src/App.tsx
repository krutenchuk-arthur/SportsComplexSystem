import { useEffect, useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import { defaultTabForRole, navItemsForRole, type TabId } from './components/layout/navigation';
import { useAuth } from './context/AuthContext';
import DashboardPage from './pages/DashboardPage';
import StaffPage from './pages/StaffPage';
import SchedulePage from './pages/SchedulePage';
import InventoryPage from './pages/InventoryPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';

function App() {
  const { user, initializing } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');

  // При зміні користувача відкриваємо стартову вкладку його ролі
  useEffect(() => {
    if (user) setActiveTab(defaultTabForRole(user.role));
  }, [user]);

  if (initializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="font-mono text-xs uppercase tracking-wider text-zinc-500 animate-pulse">Відновлення сесії…</span>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  // Захист від вкладки, недоступної для ролі
  const allowed = navItemsForRole(user.role).some((i) => i.id === activeTab);
  const tab = allowed ? activeTab : defaultTabForRole(user.role);

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar activeTab={tab} onTabChange={setActiveTab} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header activeTab={tab} />
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            {tab === 'dashboard' && <DashboardPage />}
            {tab === 'staff' && <StaffPage />}
            {tab === 'schedule' && <SchedulePage />}
            {tab === 'inventory' && <InventoryPage />}
            {tab === 'settings' && <SettingsPage />}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
