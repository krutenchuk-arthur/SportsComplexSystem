import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi, settingsApi } from '../api/authApi';
import { LOGOUT_EVENT, TOKEN_KEY } from '../api/axiosClient';
import type { SystemSettings, User, UserRole } from '../types/auth';

interface AuthContextValue {
  user: User | null;
  settings: SystemSettings | null;
  /** true, поки відновлюється сесія з localStorage */
  initializing: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  hasRole: (...roles: UserRole[]) => boolean;
  setSettings: (s: SystemSettings) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [initializing, setInitializing] = useState(() => !!localStorage.getItem(TOKEN_KEY));

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
    setSettings(null);
  }, []);

  const loadSettings = useCallback(async () => {
    try {
      setSettings(await settingsApi.get());
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    window.addEventListener(LOGOUT_EVENT, logout);
    return () => window.removeEventListener(LOGOUT_EVENT, logout);
  }, [logout]);

  // Відновлення сесії: токен у localStorage перевіряється через /auth/me
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;
    let cancelled = false;
    authApi
      .me()
      .then(async (u) => {
        if (cancelled) return;
        setUser(u);
        await loadSettings();
      })
      .catch(() => logout())
      .finally(() => !cancelled && setInitializing(false));
    return () => {
      cancelled = true;
    };
  }, [loadSettings, logout]);

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await authApi.login(email, password);
      localStorage.setItem(TOKEN_KEY, res.token);
      setUser(res.user);
      await loadSettings();
      return res.user;
    },
    [loadSettings]
  );

  const hasRole = useCallback((...roles: UserRole[]) => !!user && roles.includes(user.role), [user]);

  return (
    <AuthContext.Provider value={{ user, settings, initializing, login, logout, hasRole, setSettings }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
