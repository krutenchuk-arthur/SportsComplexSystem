import { Activity, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { navItemsForRole, tabLabel, type TabId } from './navigation';

interface SidebarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  /** Десктоп: меню згорнуто до w-[72px] */
  collapsed: boolean;
  onToggleCollapse: () => void;
  /** Мобільна шторка (< lg) */
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const itemBase = 'w-full flex items-center rounded-md text-sm font-medium transition-colors border-l-2';

function navItemClass(isActive: boolean) {
  return isActive
    ? 'border-rose-600 bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-500'
    : 'border-transparent text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100';
}

/** Логотип + назва комплексу. У згорнутому стані лишається тільки логотип. */
function Brand({ collapsed, onClose }: { collapsed: boolean; onClose?: () => void }) {
  const { settings } = useAuth();
  const name = settings?.complexName ?? 'Sports Complex';

  return (
    <div
      className={`h-14 shrink-0 flex items-center border-b border-zinc-200 dark:border-zinc-800 ${
        collapsed ? 'justify-center px-2' : onClose ? 'justify-between gap-2 px-3' : 'gap-2.5 px-4'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 shrink-0 rounded-md bg-rose-600 dark:bg-rose-500 flex items-center justify-center">
          <Activity size={16} className="text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            {/* Повна назва без обрізання: у розгорнутому стані (w-64) вміщується цілком */}
            <h1
              className="text-[13px] font-semibold text-zinc-900 dark:text-zinc-100 leading-tight"
              title={name}
            >
              {name}
            </h1>
            <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Control System</p>
          </div>
        )}
      </div>

      {!collapsed && onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрити меню"
          title="Закрити"
          className="shrink-0 p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
function NavLinks({
  activeTab,
  onTabChange,
  collapsed,
  onNavigate,
}: {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <nav className={`flex-1 overflow-y-auto py-3 space-y-1 ${collapsed ? 'px-2' : 'px-3'}`}>
      {navItemsForRole(user.role).map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        const label = tabLabel(item.id, user.role);

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              onTabChange(item.id);
              onNavigate?.();
            }}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
            title={collapsed ? label : undefined}
            className={`${itemBase} ${navItemClass(isActive)} ${
              collapsed ? 'justify-center px-0 py-2.5' : 'gap-3 px-3 py-2 text-left'
            }`}
          >
            {!collapsed && (
              <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-600 w-4 shrink-0">{item.code}</span>
            )}
            <Icon size={16} className="shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </button>
        );
      })}
    </nav>
  );
}
/** Футер: робочі години + кнопка згортання/розгортання десктопного меню. */
function SidebarFooter({ collapsed, onToggleCollapse }: { collapsed: boolean; onToggleCollapse: () => void }) {
  const { settings } = useAuth();

  return (
    <div className="border-t border-zinc-200 dark:border-zinc-800 p-2">
      {!collapsed && (
        <p className="px-2 pb-2 font-mono text-[10px] text-zinc-400 dark:text-zinc-600">
          {settings
            ? `ГРАФІК ${String(settings.workDayStartHour).padStart(2, '0')}:00–${String(settings.workDayEndHour).padStart(2, '0')}:00`
            : '—'}
        </p>
      )}
      <button
        type="button"
        onClick={onToggleCollapse}
        aria-label={collapsed ? 'Розгорнути меню' : 'Згорнути меню'}
        title={collapsed ? 'Розгорнути меню' : 'Згорнути меню'}
        className={`w-full flex items-center gap-2 px-2 py-2 rounded-md text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${
          collapsed ? 'justify-center' : ''
        }`}
      >
        {collapsed ? (
          <PanelLeftOpen size={16} />
        ) : (
          <>
            <PanelLeftClose size={16} />
            <span>Згорнути меню</span>
          </>
        )}
      </button>
    </div>
  );
}

/**
 * Навігація: стаціонарний сайдбар для десктопа (lg+) зі згортанням
 * та виїзна мобільна шторка для екранів < lg.
 */
export default function Sidebar({
  activeTab,
  onTabChange,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <>
      <aside
        className={`hidden lg:flex flex-col shrink-0 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-200 ${
          collapsed ? 'w-[72px]' : 'w-64'
        }`}
      >
        <Brand collapsed={collapsed} />
        <NavLinks activeTab={activeTab} onTabChange={onTabChange} collapsed={collapsed} />
        <SidebarFooter collapsed={collapsed} onToggleCollapse={onToggleCollapse} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Головне меню">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="absolute inset-y-0 left-0 w-64 flex flex-col bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 shadow-2xl">
            <Brand collapsed={false} onClose={onCloseMobile} />
            <NavLinks
              activeTab={activeTab}
              onTabChange={onTabChange}
              collapsed={false}
              onNavigate={onCloseMobile}
            />
          </aside>
        </div>
      )}
    </>
  );
}


