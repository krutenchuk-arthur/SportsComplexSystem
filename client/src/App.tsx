import { useEffect, useState } from 'react';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import CommandPalette from './components/layout/CommandPalette';
import { defaultTabForRole, navItemsForRole, type TabId } from './components/layout/navigation';
import { useAuth } from './context/AuthContext';
import { usePreferences } from './context/PreferencesContext';
import DashboardPage from './pages/DashboardPage';
import StaffPage from './pages/StaffPage';
import SchedulePage from './pages/SchedulePage';
import InventoryPage from './pages/InventoryPage';
import SettingsPage from './pages/SettingsPage';
import LoginPage from './pages/LoginPage';

function App() {
  const { user, initializing } = useAuth();
  const { sidebarCollapsed, toggleSidebarCollapsed } = usePreferences();
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // При зміні користувача відкриваємо стартову вкладку його ролі
  useEffect(() => {
    if (user) {
      setActiveTab(defaultTabForRole(user.role));
    } else {
      setPaletteOpen(false);
    }
    setMobileNavOpen(false);
  }, [user]);

  // Ctrl/Cmd + K — командна палітра
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  /** Навігація: змінює вкладку та закриває мобільну шторку */
  const goToTab = (nextTab: TabId) => {
    setActiveTab(nextTab);
    setMobileNavOpen(false);
  };

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
    <div className="h-screen flex overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      <Sidebar
        activeTab={tab}
        onTabChange={goToTab}
        collapsed={sidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapsed}
        mobileOpen={mobileNavOpen}
        onCloseMobile={() => setMobileNavOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeTab={tab}
          onOpenPalette={() => setPaletteOpen(true)}
          onOpenMobileNav={() => setMobileNavOpen(true)}
        />
        <main className="flex-1 flex flex-col min-h-0 overflow-auto">
          {/* Контент на всю ширину екрана: без max-w-*, картки й таблиці розтягуються до країв */}
          <div className="w-full flex-1 flex flex-col px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
            {tab === 'dashboard' && <DashboardPage />}
            {tab === 'staff' && <StaffPage />}
            {tab === 'schedule' && <SchedulePage />}
            {tab === 'inventory' && <InventoryPage />}
            {tab === 'settings' && <SettingsPage />}
          </div>
        </main>
      </div>

      {paletteOpen && (
        <CommandPalette
          onClose={() => setPaletteOpen(false)}
          onNavigate={goToTab}
        />
      )}
    </div>
  );
}

export default App;

