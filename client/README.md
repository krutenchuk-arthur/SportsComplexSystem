# Sports Complex — клієнтський застосунок (SPA)

React + TypeScript + Vite + Tailwind CSS. Реалізує 4 модулі системи управління
спортивним комплексом поверх ASP.NET Core 8 Web API (`../SportsComplexSystem.API`).

## Запуск

1. Підняти PostgreSQL (за замовчуванням `localhost:5432`, БД `SportsComplexDb`, див.
   `SportsComplexSystem.API/appsettings.json`).
2. Запустити бекенд:
   ```powershell
   cd ..\SportsComplexSystem.API
   dotnet run --launch-profile http     # http://localhost:5054
   ```
   Під час першого старту виконуються міграції та сід початкових даних.
3. Запустити фронтенд:
   ```powershell
   npm install
   npm run dev                          # http://localhost:5209
   ```

Порт API задається у `.env` (`VITE_API_BASE_URL`), порт dev-сервера — у `vite.config.ts`.
CORS на бекенді дозволяє `http://localhost:5209` та `http://localhost:5173`.

## Модулі

| Модуль | Сторінка | Ключові можливості |
| --- | --- | --- |
| Аналітичний дашборд | `src/pages/DashboardPage.tsx` | KPI (завантаженість, тренування, інвентар, заявки), розподіл навантаження тренерів, стрічка критичних сповіщень |
| Персонал | `src/pages/StaffPage.tsx` | CRUD тренерів, прогрес-бари тижневих годин, автопідбір вільного тренера |
| Диспетчер розкладу | `src/pages/SchedulePage.tsx` | Тижнева сітка (Пн–Нд), фільтр за локацією, створення/редагування занять із живою перевіркою колізій (зал / тренер / ліміт годин / обладнання) та пропозицією альтернативного тренера |
| Інвентар і ТО | `src/pages/InventoryPage.tsx` | Реєстр обладнання зі зносом, нарахування напрацювання (авто-заявка на ТО при перевищенні порогу), Kanban заявок `Open → InProgress → Completed` |

## Структура `src`

- `api/` — тонкі axios-клієнти для кожного контролера (`axiosClient.ts` — базовий URL та інтерсептори);
- `types/` — DTO-типи, дзеркальні до бекенду, та словники локалізованих enum-підписів;
- `hooks/` — `useDashboard`, `useTrainers`, `useEquipment`, `useMaintenance`, `useSchedule`, `useLocations`
  (завантаження + `refresh()` після мутацій);
- `components/common/` — `StatusBadge`, `ProgressBar`, `KpiCard`, `SkeletonCard`, `SkeletonTable`, `Modal`, `AlertBanner`;
- `components/{dashboard,staff,schedule,inventory}/` — feature-компоненти модулів;
- `utils/` — `statusColors.ts` (семантичні кольори emerald/amber/rose), `formatters.ts`, `timeOverlap.ts`.

## Скрипти

```powershell
npm run dev      # dev-сервер з HMR (порт 5209)
npm run build    # tsc -b && vite build (перевірка типів + прод-збірка)
npm run lint     # oxlint
npm run preview  # перегляд прод-збірки
```
