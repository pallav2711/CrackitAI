import axios from 'axios';
import useAuthStore from '../store/authStore';

const API_URL = import.meta.env.VITE_API_URL || 'https://crackitai-dwhs.onrender.com/api';

export const getApiUrl   = () => API_URL;
export const getAuthToken = () => useAuthStore.getState().token || '';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

// ── Request: inject auth token ────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response: handle errors ───────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;

    // Render free tier cold-start: server returns HTML instead of JSON.
    // Retry up to 3 times with backoff.
    const isHtmlError =
      error.response?.headers?.['content-type']?.includes('text/html') ||
      error.message?.includes('DOCTYPE');

    if (config && !config._retry && isHtmlError) {
      config._retry     = true;
      config._retryCount = (config._retryCount || 0) + 1;
      if (config._retryCount <= 3) {
        await new Promise((r) => setTimeout(r, 2000 * config._retryCount));
        return api(config);
      }
    }

    // 401 → token expired or invalid → log out and redirect
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
