import { useState, type FormEvent } from 'react';
import { Activity, ArrowRight, Loader2, ShieldCheck, Dumbbell, Wrench, Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { getApiErrorMessage } from '../api/axiosClient';
import type { UserRole } from '../types/auth';

const DEMO_ACCOUNTS: { role: UserRole; email: string; password: string; title: string; desc: string; icon: typeof ShieldCheck }[] = [
  { role: 'Admin', email: 'admin@sport.ua', password: 'admin123', title: 'Адміністратор', desc: 'Повний доступ: персонал, розклад, інвентар, налаштування', icon: ShieldCheck },
  { role: 'Trainer', email: 'trainer@sport.ua', password: 'trainer123', title: 'Тренер', desc: 'Особисте навантаження, власні заняття, заявки про поломки', icon: Dumbbell },
  { role: 'Technician', email: 'tech@sport.ua', password: 'tech123', title: 'Технік', desc: 'Kanban заявок на ТО, облік напрацювання годин', icon: Wrench },
];

const inputClass =
  'w-full px-3 py-2.5 rounded-md bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-transparent';

export default function LoginPage() {
  const { login } = useAuth();
  const { theme, toggleTheme } = usePreferences();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  const doLogin = async (e: string, p: string, key: string) => {
    setError(null);
    setPending(key);
    try {
      await login(e, p);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Не вдалося підключитися до сервера.'));
      setPending(null);
    }
  };

  const handleSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    if (!email || !password) {
      setError('Вкажіть логін та пароль.');
      return;
    }
    doLogin(email.trim(), password, 'form');
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-[1fr_1.1fr]">
      {/* Ліва панель: бренд */}
      <div className="hidden lg:flex flex-col justify-between p-10 bg-zinc-900 text-zinc-100 border-r border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-rose-600 dark:bg-rose-500 flex items-center justify-center">
            <Activity size={18} className="text-white" />
          </div>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-400">Sports Complex / Control</span>
        </div>
        <div>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight">
            Персонал. Розклад.
            <br />
            Інвентар. <span className="text-rose-500">Один пульт.</span>
          </h1>
          <p className="mt-4 text-sm text-zinc-400 max-w-md">
            Облік навантаження тренерів, диспетчеризація занять та технічне обслуговування обладнання з контролем доступу за ролями.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-px bg-zinc-800 border border-zinc-800 rounded-lg overflow-hidden font-mono text-xs">
          {[['RBAC', '3 ролі'], ['JWT', 'Bearer'], ['CSV', 'UTF-8 BOM']].map(([k, v]) => (
            <div key={k} className="bg-zinc-900 p-3">
              <p className="text-rose-500">{k}</p>
              <p className="text-zinc-500 mt-0.5">{v}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Права панель: форма */}
      <div className="flex flex-col justify-center px-4 py-8 sm:px-6 sm:py-10 lg:px-12 relative overflow-y-auto">
        <button
          onClick={toggleTheme}
          aria-label="Перемкнути тему"
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-md text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        <div className="w-full max-w-md mx-auto">
          {/* Компактний бренд для мобільних: ліва декоративна панель прихована (< lg) */}
          <div className="lg:hidden flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 shrink-0 rounded-md bg-rose-600 dark:bg-rose-500 flex items-center justify-center">
              <Activity size={18} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 leading-tight">Sports Complex / Control</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">RBAC · JWT · CSV</p>
            </div>
          </div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-rose-600 dark:text-rose-500">Вхід у систему</p>
          <h2 className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Авторизація</h2>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4" noValidate>
            <div>
              <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wider text-zinc-500 mb-1.5">Email або логін</label>
              <input id="email" type="text" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin або admin@sport.ua" className={inputClass} />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-medium uppercase tracking-wider text-zinc-500 mb-1.5">Пароль</label>
              <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
            </div>

            {error && (
              <p role="alert" className="text-sm px-3 py-2 rounded-md border border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending !== null}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-rose-600 dark:bg-rose-500 hover:bg-rose-700 disabled:opacity-60 text-white text-sm font-medium transition-colors"
            >
              {pending === 'form' ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
              Увійти
            </button>
          </form>

          <div className="mt-8">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">Швидкий демо-вхід (1 клік)</span>
              <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="grid gap-2">
              {DEMO_ACCOUNTS.map((acc) => {
                const Icon = acc.icon;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    disabled={pending !== null}
                    onClick={() => doLogin(acc.email, acc.password, acc.role)}
                    className="group flex items-center gap-3 text-left p-2.5 sm:p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-rose-600 dark:hover:border-rose-600 disabled:opacity-60 transition-colors"
                  >
                    <div className="w-9 h-9 shrink-0 rounded-md border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-600 dark:text-zinc-300 group-hover:text-rose-600 group-hover:border-rose-600">
                      {pending === acc.role ? <Loader2 size={16} className="animate-spin" /> : <Icon size={16} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{acc.title}</span>
                        <span className="font-mono text-[10px] uppercase text-zinc-400">{acc.role}</span>
                      </div>
                      <p className="text-xs text-zinc-500 truncate">{acc.desc}</p>
                    </div>
                    <span className="hidden sm:block font-mono text-[11px] text-zinc-400">{acc.email}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
