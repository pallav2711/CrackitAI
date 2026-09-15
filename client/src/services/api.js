import axios from 'axios';
import useAuthStore from '../store/authStore';
import { cache } from '../utils/performance';

const API_URL = import.meta.env.VITE_API_URL || 'https://crackitai-dwhs.onrender.com/api';

// Expose for non-axios callers (e.g. TTS fetch)
export const getApiUrl = () => API_URL;
export const getAuthToken = () => useAuthStore.getState().token || '';

const pendingRequests = new Map();

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

const createRequestKey = (config) =>
  `${config.method}:${config.url}:${JSON.stringify(config.params)}`;

// ── Request interceptor ───────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // Inject auth token
    const token = useAuthStore.getState().token;
    if (token) config.headers.Authorization = `Bearer ${token}`;

    // NOTE: Do NOT set Accept-Encoding — browsers manage this header themselves
    // and will throw "Refused to set unsafe header" if you try.

    // Deduplicate GET requests
    if (config.method === 'get') {
      const key = createRequestKey(config);

      const cached = cache.get(key);
      if (cached) {
        return Promise.resolve({
          ...config, data: cached, status: 200,
          statusText: 'OK', headers: {}, config, fromCache: true,
        });
      }

      if (pendingRequests.has(key)) return pendingRequests.get(key);

      const req = axios(config);
      pendingRequests.set(key, req);
      req.finally(() => pendingRequests.delete(key));
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ──────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    if (response.fromCache) return response;

    if (response.config.method === 'get' && response.status === 200) {
      cache.set(createRequestKey(response.config), response.data);
    }
    return response;
  },
  async (error) => {
    const config = error.config;

    // Retry on backend cold-start HTML response (Render free tier)
    const isHtmlError =
      error.response?.headers?.['content-type']?.includes('text/html') ||
      error.message?.includes('DOCTYPE');

    if (config && !config._retry && isHtmlError) {
      config._retry = true;
      config._retryCount = (config._retryCount || 0) + 1;
      if (config._retryCount <= 3) {
        await new Promise((r) => setTimeout(r, 2000 * config._retryCount));
        return api(config);
      }
    }

    // Auto-logout on 401
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export const batchRequests = async (requests, batchSize = 5) => {
  const results = [];
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    results.push(...(await Promise.allSettled(batch.map((r) => api(r)))));
  }
  return results;
};

export const prefetch = (url, config = {}) => api.get(url, { ...config, priority: 'low' });
export const clearApiCache = () => { cache.clear(); pendingRequests.clear(); };

export default api;
