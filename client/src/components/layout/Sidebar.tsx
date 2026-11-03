import { Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { navItemsForRole, tabLabel, type TabId } from './navigation';

interface SidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export default function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const { user, settings } = useAuth();
  if (!user) return null;

  return (
    <aside className="w-60 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 flex flex-col shrink-0">
      <div className="h-14 flex items-center gap-2.5 px-5 border-b border-zinc-200 dark:border-zinc-800">
        <div className="w-7 h-7 rounded-md bg-orange-600 flex items-center justify-center">
          <Activity size={16} className="text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-tight truncate" title={settings?.complexName}>
            {settings?.complexName ?? 'Sports Complex'}
          </h1>
          <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Control System</p>
        </div>
      </div>

      <nav className="p-3 space-y-0.5 flex-1">
        {navItemsForRole(user.role).map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 text-left px-3 py-2 rounded-md text-sm font-medium transition-colors border-l-2 ${
                isActive
                  ? 'border-orange-600 bg-orange-50 text-orange-700 dark:bg-orange-600/10 dark:text-orange-500'
                  : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600 w-4">{item.code}</span>
              <Icon size={16} />
              {tabLabel(item.id, user.role)}
            </button>
          );
        })}
      </nav>

      <div className="px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 text-[10px] font-mono text-zinc-400 dark:text-zinc-600">
        {settings ? `ГРАФІК ${String(settings.workDayStartHour).padStart(2, '0')}:00–${String(settings.workDayEndHour).padStart(2, '0')}:00` : '—'}
      </div>
    </aside>
  );
}
