import { HubConnectionBuilder, HubConnectionState, LogLevel, type HubConnection } from '@microsoft/signalr';
import { LOGOUT_EVENT, TOKEN_KEY } from './axiosClient';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5054/api';

/** URL SignalR-хаба реального часу (живе на корені API, без /api-префікса). */
export const HUB_URL = `${apiBaseUrl.replace(/\/api\/?$/, '')}/hubs/complex`;

/** Назва події, яку бекенд надсилає після будь-якої зміни даних. */
const DATA_CHANGED_EVENT = 'DataChanged';

type DataChangedListener = (entityType: string) => void;
type StatusListener = (connected: boolean) => void;

let connection: HubConnection | null = null;
let startPromise: Promise<void> | null = null;
const listeners = new Set<DataChangedListener>();
const statusListeners = new Set<StatusListener>();
let isConnected = false;

function notify(entityType: string) {
  listeners.forEach((listener) => listener(entityType));
}

function setConnected(next: boolean) {
  if (isConnected === next) return;
  isConnected = next;
  statusListeners.forEach((listener) => listener(next));
}

/** Підписка на стан з'єднання з хабом (для індикатора Live у хедері). */
export function subscribeToRealtimeStatus(listener: StatusListener): () => void {
  statusListeners.add(listener);
  listener(isConnected);
  return () => {
    statusListeners.delete(listener);
  };
}

/**
 * Ліниве підключення до хаба: JWT передається query-параметром `access_token`,
 * бо WebSocket не дозволяє кастомні заголовки (бекенд читає його в OnMessageReceived).
 */
async function ensureConnected(): Promise<void> {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return;
  if (connection && connection.state !== HubConnectionState.Disconnected) return startPromise ?? undefined;

  connection = new HubConnectionBuilder()
    .withUrl(`${HUB_URL}?access_token=${encodeURIComponent(token)}`, { withCredentials: true })
    .withAutomaticReconnect([0, 2_000, 5_000, 10_000])
    .configureLogging(LogLevel.Warning)
    .build();

  connection.on(DATA_CHANGED_EVENT, (entityType?: string) => notify(entityType ?? 'Unknown'));
  connection.onreconnecting(() => setConnected(false));
  connection.onreconnected(() => setConnected(true));
  connection.onclose(() => setConnected(false));

  startPromise = connection
    .start()
    .then(() => setConnected(true))
    .catch((err: unknown) => {
      setConnected(false);
      console.warn('SignalR: не вдалося підключитися до хаба реального часу', err);
    });

  await startPromise;
}

/**
 * Підписка на серверні події DataChanged.
 * Повертає функцію відписки — її викликає useEffect при розмонтуванні.
 */
export function subscribeToDataChanges(listener: DataChangedListener): () => void {
  listeners.add(listener);
  void ensureConnected();
  return () => {
    listeners.delete(listener);
  };
}

/** Повне відключення (викликається при виході з акаунта). */
export async function stopRealtime(): Promise<void> {
  const current = connection;
  connection = null;
  startPromise = null;
  setConnected(false);
  if (!current) return;
  try {
    await current.stop();
  } catch {
    // з'єднання вже закрите — нічого робити
  }
}

window.addEventListener(LOGOUT_EVENT, () => {
  void stopRealtime();
});
