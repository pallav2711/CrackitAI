import axios from 'axios';
import useAuthStore from '../store/authStore';
import { cache } from '../utils/performance';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Request deduplication map
const pendingRequests = new Map();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Create request key for deduplication
const createRequestKey = (config) => {
  return `${config.method}:${config.url}:${JSON.stringify(config.params)}:${JSON.stringify(config.data)}`;
};

// Request interceptor with caching and deduplication
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add compression support
    config.headers['Accept-Encoding'] = 'gzip, deflate, br';

    // Request deduplication for GET requests
    if (config.method === 'get') {
      const requestKey = createRequestKey(config);
      
      // Check cache first
      const cachedResponse = cache.get(requestKey);
      if (cachedResponse) {
        return Promise.resolve({
          ...config,
          data: cachedResponse,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
          fromCache: true
        });
      }

      // Check if request is already pending
      if (pendingRequests.has(requestKey)) {
        return pendingRequests.get(requestKey);
      }

      // Store pending request
      const requestPromise = axios(config);
      pendingRequests.set(requestKey, requestPromise);
      
      // Clean up after request completes
      requestPromise.finally(() => {
        pendingRequests.delete(requestKey);
      });
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor with caching and retry logic
api.interceptors.response.use(
  (response) => {
    // Don't process cached responses
    if (response.fromCache) {
      return response;
    }

    // Cache GET responses
    if (response.config.method === 'get' && response.status === 200) {
      const requestKey = createRequestKey(response.config);
      cache.set(requestKey, response.data);
    }

    return response;
  },
  async (error) => {
    const config = error.config;
    
    // Check if it's an HTML response (backend sleeping/waking up)
    const isHtmlError = error.response?.headers?.['content-type']?.includes('text/html') ||
                        error.message?.includes('DOCTYPE') ||
                        error.message?.includes('Unexpected token');
    
    // Retry logic for backend wake-up
    if (!config._retry && isHtmlError) {
      config._retry = true;
      config._retryCount = (config._retryCount || 0) + 1;
      
      // Retry up to 3 times with exponential backoff
      if (config._retryCount <= 3) {
        console.log(`Backend waking up, retrying... (${config._retryCount}/3)`);
        await new Promise(resolve => setTimeout(resolve, 2000 * config._retryCount));
        return api(config);
      }
    }
    
    // Handle 401 errors
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Batch request utility
export const batchRequests = async (requests, batchSize = 5) => {
  const results = [];
  
  for (let i = 0; i < requests.length; i += batchSize) {
    const batch = requests.slice(i, i + batchSize);
    const batchResults = await Promise.allSettled(batch.map(req => api(req)));
    results.push(...batchResults);
  }
  
  return results;
};

// Prefetch utility
export const prefetch = (url, config = {}) => {
  return api.get(url, { ...config, priority: 'low' });
};

// Clear cache utility
export const clearApiCache = () => {
  cache.clear();
  pendingRequests.clear();
};

export default api;
