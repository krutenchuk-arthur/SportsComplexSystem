import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Theme = 'light' | 'dark';
export type Density = 'comfortable' | 'compact';

interface PreferencesValue {
  theme: Theme;
  density: Density;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  setDensity: (d: Density) => void;
}

const THEME_KEY = 'scs.theme';
const DENSITY_KEY = 'scs.density';

const PreferencesContext = createContext<PreferencesValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'));
  const [density, setDensity] = useState<Density>(() =>
    localStorage.getItem(DENSITY_KEY) === 'compact' ? 'compact' : 'comfortable'
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.classList.toggle('density-compact', density === 'compact');
    localStorage.setItem(DENSITY_KEY, density);
  }, [density]);

  return (
    <PreferencesContext.Provider
      value={{ theme, density, setTheme, setDensity, toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')) }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error('usePreferences must be used inside PreferencesProvider');
  return ctx;
}
