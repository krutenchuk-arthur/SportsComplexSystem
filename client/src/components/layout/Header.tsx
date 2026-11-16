import { ChevronRight, LogOut, Menu, Moon, Search, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import { useRealtimeStatus } from '../../hooks/useRealtimeStatus';
import type { UserRole } from '../../types/auth';
import { tabLabel, type TabId } from './navigation';

const ROLE_BADGE: Record<UserRole, string> = {
  Admin: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-500 dark:border-rose-500/30',
  Trainer: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30',
  Technician: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
};

interface HeaderProps {
  activeTab: TabId;
  onOpenPalette: () => void;
  /** Відкрити мобільну навігаційну шторку (< lg) */
  onOpenMobileNav: () => void;
}

/**
 * Верхня панель: гамбургер для мобільних, хлібні крихти, бейдж ролі,
 * командна палітра, перемикач теми, вихід.
 * На < sm ховаються довгі елементи, щоб нічого не налізало на 360–390px.
 */
export default function Header({ activeTab, onOpenPalette, onOpenMobileNav }: HeaderProps) {
  const { user, settings, logout } = useAuth();
  const { theme, toggleTheme } = usePreferences();
  const realtimeConnected = useRealtimeStatus();
  if (!user) return null;

  return (
    <header className="h-14 shrink-0 flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-6 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
        <button
          type="button"
          onClick={onOpenMobileNav}
          aria-label="Відкрити меню"
          title="Меню"
          className="lg:hidden -ml-1 p-2 rounded-md text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Menu size={18} />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm min-w-0">
          <span className="hidden sm:inline text-zinc-500 truncate">{settings?.complexName ?? 'Sports Complex'}</span>
          <ChevronRight size={14} className="hidden sm:block text-zinc-400 shrink-0" />
          <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate">{tabLabel(activeTab, user.role)}</span>
        </nav>
      </div>

      <div className="flex items-center gap-1 sm:gap-2 md:gap-3 shrink-0">
        <button
          onClick={onOpenPalette}
          title="Командна палітра (Ctrl+K)"
          aria-label="Відкрити командну палітру"
          className="flex items-center gap-2 p-2 sm:p-1.5 md:pl-2.5 sm:py-1.5 rounded-md border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <Search size={14} />
          <span className="hidden lg:inline">Пошук…</span>
          <kbd className="hidden md:inline font-mono text-[10px] px-1 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-400">
            Ctrl K
          </kbd>
        </button>

        <span className="hidden md:inline max-w-[150px] truncate text-sm text-zinc-700 dark:text-zinc-300">
          {user.fullName}
        </span>
        <span
          data-testid="realtime-status"
          title={realtimeConnected ? 'Оновлення в реальному часі активні' : 'Немає з’єднання з хабом реального часу'}
          className="hidden sm:flex items-center gap-1.5 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-800 font-mono text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400"
        >
          <span
            aria-hidden
            className={`w-1.5 h-1.5 rounded-full ${
              realtimeConnected ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400 dark:bg-zinc-600'
            }`}
          />
          {realtimeConnected ? 'Live' : 'Offline'}
        </span>

        <span
          data-testid="role-badge"
          className={`px-1.5 py-0.5 rounded border font-mono text-[10px] font-semibold uppercase tracking-wider ${ROLE_BADGE[user.role]}`}
        >
          {user.role}
        </span>

        <div className="hidden sm:block w-px h-6 bg-zinc-200 dark:bg-zinc-800" />

        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Light Industrial' : 'Carbon Dark'}
          aria-label="Перемкнути тему"
          className="p-2 rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button
          onClick={logout}
          title="Вийти з акаунта"
          aria-label="Вийти з акаунта"
          className="flex items-center gap-1.5 p-2 sm:px-2.5 sm:py-1.5 rounded-md text-sm text-zinc-600 hover:text-red-700 hover:bg-red-50 dark:text-zinc-400 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={15} />
          <span className="hidden sm:inline">Вийти</span>
        </button>
      </div>
    </header>
  );
}

