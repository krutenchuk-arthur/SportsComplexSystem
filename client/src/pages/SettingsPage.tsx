import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Download, Loader2, Save, KeyRound } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import { useAuth } from '../context/AuthContext';
import { usePreferences, type Density, type Theme } from '../context/PreferencesContext';
import { authApi, reportsApi, settingsApi } from '../api/authApi';
import { getApiErrorMessage } from '../api/axiosClient';
import { ROLE_LABELS, type SystemSettings } from '../types/auth';
import { SPECIALIZATION_LABELS } from '../types/enums';

const inputClass =
  'w-full px-3 py-2 rounded-md bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-600 focus:border-transparent';
const labelClass = 'block text-xs font-medium uppercase tracking-wider text-zinc-500 mb-1.5';

function Section({ code, title, children, aside }: { code: string; title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-3 border-b border-zinc-200 dark:border-zinc-800">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          <span className="font-mono text-[10px] text-rose-600 dark:text-rose-500">{code}</span>
          {title}
        </h3>
        {aside}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex rounded-md border border-zinc-300 dark:border-zinc-700 overflow-hidden">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`px-3 py-1.5 text-xs font-medium transition-colors ${
            value === o.value
              ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'bg-white text-zinc-600 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Feedback({ ok, error }: { ok?: string | null; error?: string | null }) {
  if (error) return <p role="alert" className="text-sm text-red-700 dark:text-red-400">{error}</p>;
  if (ok) return <p className="text-sm text-emerald-700 dark:text-emerald-400">{ok}</p>;
  return null;
}

function ProfileSection() {
  const { user } = useAuth();
  const { theme, setTheme, density, setDensity } = usePreferences();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!user) return null;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setOk(null);
    setError(null);
    if (next.length < 6) return setError('Новий пароль має містити щонайменше 6 символів.');
    if (next !== confirm) return setError('Паролі не збігаються.');
    setSaving(true);
    try {
      await authApi.changePassword(current, next);
      setOk('Пароль змінено.');
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Не вдалося змінити пароль.'));
    } finally {
      setSaving(false);
    }
  };

  const rows: [string, ReactNode][] = [
    ['ПІБ', user.fullName],
    ['Логін', <span className="font-mono">{user.username ?? '—'}</span>],
    ['Email', <span className="font-mono">{user.email}</span>],
    ['Роль', <span className="font-mono uppercase">{user.role}</span>],
  ];
  if (user.role === 'Trainer') {
    rows.push(['Спеціалізація', user.trainerSpecialization ? SPECIALIZATION_LABELS[user.trainerSpecialization] : 'Не прив\'язано']);
  }

  return (
    <Section code="A" title="Мій профіль" aside={<span className="text-xs text-zinc-500">{ROLE_LABELS[user.role]}</span>}>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-5">
          <dl className="divide-y divide-zinc-200 dark:divide-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-md">
            {rows.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 px-3 py-2 text-sm">
                <dt className="text-zinc-500">{k}</dt>
                <dd className="text-zinc-900 dark:text-zinc-100 text-right">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="flex items-center justify-between gap-4">
            <span className={labelClass + ' mb-0'}>Тема інтерфейсу</span>
            <Segmented<Theme>
              value={theme}
              onChange={setTheme}
              options={[{ value: 'light', label: 'Light Industrial' }, { value: 'dark', label: 'Carbon Dark' }]}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className={labelClass + ' mb-0'}>Щільність таблиць</span>
            <Segmented<Density>
              value={density}
              onChange={setDensity}
              options={[{ value: 'comfortable', label: 'Comfortable' }, { value: 'compact', label: 'Compact' }]}
            />
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3" noValidate>
          <p className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
            <KeyRound size={14} /> Зміна пароля
          </p>
          <div>
            <label className={labelClass} htmlFor="pw-current">Поточний пароль</label>
            <input id="pw-current" type="password" autoComplete="current-password" value={current} onChange={(e) => setCurrent(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="pw-next">Новий пароль</label>
            <input id="pw-next" type="password" autoComplete="new-password" value={next} onChange={(e) => setNext(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass} htmlFor="pw-confirm">Підтвердження</label>
            <input id="pw-confirm" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className={inputClass} />
          </div>
          <Feedback ok={ok} error={error} />
          <button
            type="submit"
            disabled={saving || !current}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white text-sm font-medium disabled:opacity-50"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
            Змінити пароль
          </button>
        </form>
      </div>
    </Section>
  );
}

function ComplexSection() {
  const { settings, setSettings } = useAuth();
  const [form, setForm] = useState<SystemSettings | null>(settings);
  const [saving, setSaving] = useState(false);
  const [ok, setOk] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (settings && !form) setForm(settings);
  }, [settings, form]);

  if (!form) {
    return (
      <Section code="B" title="Параметри спорткомплексу">
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-9 bg-zinc-100 dark:bg-zinc-800 rounded" />)}
        </div>
      </Section>
    );
  }

  const set = <K extends keyof SystemSettings>(k: K, v: SystemSettings[K]) => setForm({ ...form, [k]: v });
  const num = (k: keyof SystemSettings) => (e: React.ChangeEvent<HTMLInputElement>) => set(k, Number(e.target.value) as never);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setOk(null);
    setError(null);
    if (form.complexName.trim().length < 2) return setError('Вкажіть назву комплексу.');
    if (form.workDayEndHour <= form.workDayStartHour) return setError('Кінець робочого дня має бути пізніше за початок.');
    setSaving(true);
    try {
      const saved = await settingsApi.update(form);
      setSettings(saved);
      setForm(saved);
      setOk('Параметри збережено.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Не вдалося зберегти параметри.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Section code="B" title="Параметри спорткомплексу" aside={<span className="font-mono text-[10px] uppercase text-zinc-400">Admin only</span>}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div>
          <label className={labelClass} htmlFor="s-name">Назва закладу</label>
          <input id="s-name" value={form.complexName} onChange={(e) => set('complexName', e.target.value)} className={inputClass} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <label className={labelClass} htmlFor="s-start">Початок дня, год</label>
            <input id="s-start" type="number" min={0} max={23} value={form.workDayStartHour} onChange={num('workDayStartHour')} className={inputClass + ' font-mono'} />
          </div>
          <div>
            <label className={labelClass} htmlFor="s-end">Кінець дня, год</label>
            <input id="s-end" type="number" min={1} max={24} value={form.workDayEndHour} onChange={num('workDayEndHour')} className={inputClass + ' font-mono'} />
          </div>
          <div>
            <label className={labelClass} htmlFor="s-hours">Ліміт год/тиж</label>
            <input id="s-hours" type="number" min={1} max={80} value={form.defaultMaxWeeklyHours} onChange={num('defaultMaxWeeklyHours')} className={inputClass + ' font-mono'} />
          </div>
          <div>
            <label className={labelClass} htmlFor="s-thr">Поріг ТО, год</label>
            <input id="s-thr" type="number" min={1} value={form.defaultMaintenanceThreshold} onChange={num('defaultMaintenanceThreshold')} className={inputClass + ' font-mono'} />
          </div>
          <div>
            <label className={labelClass} htmlFor="s-wear">Попередження, %</label>
            <input id="s-wear" type="number" min={1} max={99} value={form.warningWearPercentage} onChange={num('warningWearPercentage')} className={inputClass + ' font-mono'} />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-rose-600 dark:bg-rose-500 hover:bg-rose-700 text-white text-sm font-medium disabled:opacity-60"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Зберегти
          </button>
          <Feedback ok={ok} error={error} />
        </div>
      </form>
    </Section>
  );
}

function ReportsSection() {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Не вдалося сформувати звіт.'));
    } finally {
      setBusy(null);
    }
  };

  const reports = [
    { key: 'workload', file: 'Табель_завантаженості_персоналу.csv', desc: 'Призначені години, ліміти та завантаженість тренерів за поточний тиждень', fn: reportsApi.trainersWorkload },
    { key: 'maintenance', file: 'Журнал_ТО_та_зносу_інвентарю.csv', desc: 'Напрацювання, знос та історія заявок на ТО по кожній одиниці інвентарю', fn: reportsApi.maintenanceLog },
  ];

  return (
    <Section code="C" title="Експорт звітності" aside={<span className="font-mono text-[10px] uppercase text-zinc-400">CSV · UTF-8 BOM</span>}>
      <div className="grid gap-3 md:grid-cols-2">
        {reports.map((r) => (
          <div key={r.key} className="flex flex-wrap items-start justify-between gap-3 p-3 sm:p-4 border border-zinc-200 dark:border-zinc-800 rounded-md">
            <div className="min-w-0">
              <p className="font-mono text-xs text-zinc-900 dark:text-zinc-100 break-all">{r.file}</p>
              <p className="text-xs text-zinc-500 mt-1">{r.desc}</p>
            </div>
            <button
              onClick={() => run(r.key, r.fn)}
              disabled={busy !== null}
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-700 text-sm text-zinc-700 dark:text-zinc-300 hover:border-rose-600 hover:text-rose-600 dark:hover:text-rose-500 disabled:opacity-50"
            >
              {busy === r.key ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
              CSV
            </button>
          </div>
        ))}
      </div>
      {error && <div className="mt-3"><Feedback error={error} /></div>}
    </Section>
  );
}

type TabKey = 'profile' | 'complex' | 'reports';

export default function SettingsPage() {
  const { hasRole } = useAuth();

  const tabs: { key: TabKey; code: string; label: string }[] = [
    { key: 'profile', code: 'A', label: 'Мій профіль' },
  ];
  if (hasRole('Admin')) tabs.push({ key: 'complex', code: 'B', label: 'Параметри комплексу' });
  if (hasRole('Admin', 'Technician')) tabs.push({ key: 'reports', code: 'C', label: 'Експорт звітів' });

  const [tab, setTab] = useState<TabKey>('profile');
  const active: TabKey = tabs.some((t) => t.key === tab) ? tab : 'profile';

  return (
    <div>
      <PageHeader title="Налаштування та звітність" subtitle="Профіль користувача, параметри комплексу та вивантаження звітів" />

      <div className="flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800 mb-6 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            aria-current={active === t.key ? 'page' : undefined}
            className={`-mb-px shrink-0 flex items-center gap-2 px-4 py-2.5 text-sm border-b-2 transition-colors ${
              active === t.key
                ? 'border-rose-600 text-zinc-900 dark:text-zinc-100 font-medium'
                : 'border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <span className="font-mono text-[10px] text-rose-600 dark:text-rose-500">{t.code}</span>
            {t.label}
          </button>
        ))}
      </div>

      {active === 'profile' && <ProfileSection />}
      {active === 'complex' && hasRole('Admin') && <ComplexSection />}
      {active === 'reports' && hasRole('Admin', 'Technician') && <ReportsSection />}
    </div>
  );
}
