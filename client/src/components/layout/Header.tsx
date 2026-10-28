import { ChevronRight, LogOut, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import type { UserRole } from '../../types/auth';
import { tabLabel, type TabId } from './navigation';

const ROLE_BADGE: Record<UserRole, string> = {
  Admin: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-600/10 dark:text-orange-500 dark:border-orange-600/30',
  Trainer: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/30',
  Technician: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30',
};

interface HeaderProps {
  activeTab: TabId;
}

/**
 * Верхня панель: хлібні крихти, бейдж ролі, перемикач теми, вихід.
 */
export default function Header({ activeTab }: HeaderProps) {
  const { user, settings, logout } = useAuth();
  const { theme, toggleTheme } = usePreferences();
  if (!user) return null;

  return (
    <header className="h-14 shrink-0 flex items-center justify-between gap-4 px-6 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm min-w-0">
        <span className="text-zinc-500 truncate">{settings?.complexName ?? 'Sports Complex'}</span>
        <ChevronRight size={14} className="text-zinc-400 shrink-0" />
        <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate">{tabLabel(activeTab, user.role)}</span>
      </nav>

      <div className="flex items-center gap-3 shrink-0">
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-sm text-zinc-700 dark:text-zinc-300">{user.fullName}</span>
          <span
            data-testid="role-badge"
            className={`px-1.5 py-0.5 rounded border font-mono text-[10px] font-semibold uppercase tracking-wider ${ROLE_BADGE[user.role]}`}
          >
            {user.role}
          </span>
        </div>

        <div className="w-px h-6 bg-zinc-200 dark:bg-zinc-800" />

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
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm text-zinc-600 hover:text-red-700 hover:bg-red-50 dark:text-zinc-400 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={15} />
          Вийти
        </button>
      </div>
    </header>
  );
}
