import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Search,
  Sun,
  Moon,
  AlignJustify,
  LogOut,
  User,
  Dumbbell,
  CornerDownLeft,
  type LucideIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';
import { useTrainers } from '../../hooks/useTrainers';
import { useEquipment } from '../../hooks/useEquipment';
import { navItemsForRole, tabLabel, type TabId } from './navigation';
import { SPECIALIZATION_LABELS } from '../../types/enums';

interface CommandPaletteProps {
  onClose: () => void;
  onNavigate: (tab: TabId) => void;
}

interface PaletteItem {
  id: string;
  label: string;
  hint?: string;
  group: string;
  icon: LucideIcon;
  keywords?: string;
  /** false — палітра залишається відкритою після дії (тема, щільність) */
  closeOnRun?: boolean;
  run: () => void;
}

/**
 * Командна палітра (Ctrl/Cmd + K): рольова навігація, швидкі дії,
 * живий пошук тренерів та інвентарю.
 */
export default function CommandPalette({ onClose, onNavigate }: CommandPaletteProps) {
  const { user, logout } = useAuth();
  const { theme, density, toggleTheme, setDensity } = usePreferences();
  const { trainers } = useTrainers();
  const { equipment } = useEquipment();

  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const groups = useMemo(() => {
    if (!user) return [] as { title: string; items: PaletteItem[] }[];

    const q = query.trim().toLowerCase();
    const matches = (...values: (string | undefined)[]) =>
      q.length === 0 || values.some((v) => (v ?? '').toLowerCase().includes(q));

    const navigation: PaletteItem[] = navItemsForRole(user.role)
      .filter((item) => matches(tabLabel(item.id, user.role), item.code))
      .map((item) => {
        const Icon = item.icon;
        return {
          id: `nav-${item.id}`,
          label: tabLabel(item.id, user.role),
          hint: item.code,
          group: 'Навігація',
          icon: Icon,
          run: () => onNavigate(item.id),
        };
      });

    const actions = ([
      {
        id: 'action-theme',
        label: theme === 'dark' ? 'Перемкнути на світлу тему' : 'Перемкнути на Carbon Dark',
        hint: 'Тема',
        group: 'Дії',
        icon: theme === 'dark' ? Sun : Moon,
        keywords: 'theme light dark світла темна тема вигляд',
        closeOnRun: false,
        run: toggleTheme,
      },
      {
        id: 'action-density',
        label: density === 'compact' ? 'Щільність таблиць: Comfortable' : 'Щільність таблиць: Compact',
        hint: 'Вигляд',
        group: 'Дії',
        icon: AlignJustify,
        keywords: 'density compact comfortable щільність таблиці вигляд',
        closeOnRun: false,
        run: () => setDensity(density === 'compact' ? 'comfortable' : 'compact'),
      },
      {
        id: 'action-logout',
        label: 'Вийти з акаунта',
        hint: user.email,
        group: 'Дії',
        icon: LogOut,
        keywords: 'logout sign out вийти вихід',
        run: logout,
      },
    ] as PaletteItem[]).filter((item) => matches(item.label, item.hint, item.keywords));

    const quickTrainers: PaletteItem[] =
      q.length === 0
        ? []
        : trainers
            .filter((t) => matches(t.fullName, SPECIALIZATION_LABELS[t.specialization]))
            .slice(0, 4)
            .map((t) => ({
              id: `trainer-${t.id}`,
              label: t.fullName,
              hint: `${SPECIALIZATION_LABELS[t.specialization]} · ${Math.round(t.loadPercentage)}%`,
              group: 'Тренери',
              icon: User,
              keywords: t.phoneNumber ?? undefined,
              run: () => onNavigate(user.role === 'Admin' ? 'staff' : 'schedule'),
            }));

    const quickEquipment: PaletteItem[] =
      q.length === 0
        ? []
        : equipment
            .filter((e) => matches(e.name, e.inventoryNumber, e.locationName))
            .slice(0, 4)
            .map((e) => ({
              id: `equipment-${e.id}`,
              label: e.name,
              hint: `${e.inventoryNumber} · знос ${Math.round(e.wearPercentage)}%`,
              group: 'Обладнання',
              icon: Dumbbell,
              run: () => onNavigate('inventory'),
            }));

    return [
      { title: 'Навігація', items: navigation },
      { title: 'Дії', items: actions },
      { title: 'Тренери', items: quickTrainers },
      { title: 'Обладнання', items: quickEquipment },
    ].filter((group) => group.items.length > 0);
  }, [user, query, theme, density, trainers, equipment, onNavigate, toggleTheme, setDensity, logout]);

  const flatItems = useMemo(() => groups.flatMap((g) => g.items), [groups]);
  const groupOffsets = useMemo(() => {
    const offsets: number[] = [];
    let acc = 0;
    for (const group of groups) {
      offsets.push(acc);
      acc += group.items.length;
    }
    return offsets;
  }, [groups]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const execute = (item: PaletteItem | undefined) => {
    if (!item) return;
    item.run();
    if (item.closeOnRun !== false) onClose();
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActive((i) => Math.min(i + 1, flatItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        execute(flatItems[active]);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-6 sm:pt-[12vh] px-3 sm:px-4 bg-zinc-950/50 dark:bg-zinc-950/70 backdrop-blur-sm"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Командна палітра"
        className="w-[calc(100vw-1.5rem)] sm:w-full max-w-xl max-h-[90vh] flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xl overflow-hidden"
      >
        <div className="flex items-center gap-2.5 px-4 h-12 border-b border-zinc-200 dark:border-zinc-800">
          <Search size={16} className="text-zinc-400 shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Пошук вкладок, тренерів, обладнання…"
            className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none"
          />
          <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 text-zinc-400">
            ESC
          </kbd>
        </div>

        <div ref={listRef} className="flex-1 min-h-0 overflow-y-auto py-2">
          {flatItems.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-zinc-400">
              Нічого не знайдено за запитом «{query}»
            </p>
          )}

          {groups.map((group, gi) => (
            <div key={group.title}>
              <p className="px-4 pt-2 pb-1 font-mono text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-600">
                {group.title}
              </p>
              {group.items.map((item, ii) => {
                const index = groupOffsets[gi] + ii;
                const Icon = item.icon;
                const isActive = index === active;
                return (
                  <button
                    key={item.id}
                    type="button"
                    data-index={index}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => execute(item)}
                    className={`w-full flex items-center gap-3 px-4 py-2 text-left text-sm transition-colors ${
                      isActive
                        ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400'
                        : 'text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    <Icon size={15} className="shrink-0" />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.hint && (
                      <span
                        className={`font-mono text-[10px] uppercase tracking-wider truncate max-w-[45%] ${
                          isActive ? 'text-rose-500' : 'text-zinc-400'
                        }`}
                      >
                        {item.hint}
                      </span>
                    )}
                    {isActive && <CornerDownLeft size={12} className="shrink-0 text-rose-500" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4 px-4 h-9 border-t border-zinc-200 dark:border-zinc-800 font-mono text-[10px] uppercase tracking-wider text-zinc-400">
          <span>↑↓ навігація</span>
          <span>↵ відкрити</span>
          <span>esc закрити</span>
          <span className="ml-auto normal-case tracking-normal">{user?.role}</span>
        </div>
      </div>
    </div>
  );
}
