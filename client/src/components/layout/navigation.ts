import { LayoutDashboard, Users, CalendarClock, Dumbbell, Settings, type LucideIcon } from 'lucide-react';
import type { UserRole } from '../../types/auth';

export type TabId = 'dashboard' | 'staff' | 'schedule' | 'inventory' | 'settings';

export interface NavItem {
  id: TabId;
  label: string;
  icon: LucideIcon;
  code: string;
  roles: UserRole[];
}

export const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Дашборд', icon: LayoutDashboard, code: '01', roles: ['Admin', 'Trainer', 'Technician'] },
  { id: 'staff', label: 'Персонал', icon: Users, code: '02', roles: ['Admin'] },
  { id: 'schedule', label: 'Розклад', icon: CalendarClock, code: '03', roles: ['Admin', 'Trainer', 'Technician'] },
  { id: 'inventory', label: 'Інвентар і ТО', icon: Dumbbell, code: '04', roles: ['Admin', 'Trainer', 'Technician'] },
  { id: 'settings', label: 'Налаштування', icon: Settings, code: '05', roles: ['Admin', 'Trainer', 'Technician'] },
];

export function navItemsForRole(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter((i) => i.roles.includes(role));
}

/** Стартова вкладка після входу: технік одразу потрапляє в інвентар. */
export function defaultTabForRole(role: UserRole): TabId {
  return role === 'Technician' ? 'inventory' : 'dashboard';
}

/** Мітка вкладки з урахуванням ролі (для тренера дашборд особистий). */
export function tabLabel(id: TabId, role: UserRole): string {
  if (id === 'dashboard' && role === 'Trainer') return 'Мій дашборд';
  return NAV_ITEMS.find((i) => i.id === id)?.label ?? '';
}
