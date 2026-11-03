import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5054/api';

export const TOKEN_KEY = 'scs.token';
/** Подія, яку слухає AuthContext, щоб розлогінити користувача після 401. */
export const LOGOUT_EVENT = 'auth:logout';

const axiosClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isLogin = String(error.config?.url ?? '').endsWith('/auth/login');
    if (status === 401 && !isLogin) {
      localStorage.removeItem(TOKEN_KEY);
      window.dispatchEvent(new Event(LOGOUT_EVENT));
    } else {
      console.error('API Error:', error.response?.data || error.message);
    }
    return Promise.reject(error);
  }
);

/** Повертає людиночитне повідомлення з відповіді API (message або помилки валідації). */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; errors?: Record<string, string[]> } | undefined;
    if (data?.message) return data.message;
    if (data?.errors) return Object.values(data.errors).flat().join(' ');
    if (error.response?.status === 403) return 'Недостатньо прав для цієї дії.';
  }
  return fallback;
}

export default axiosClient;
