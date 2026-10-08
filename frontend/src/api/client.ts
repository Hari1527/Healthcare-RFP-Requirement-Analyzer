import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiErrorResponse } from '../types';

const envUrl = import.meta.env.VITE_API_BASE_URL;
const BASE_URL = envUrl && envUrl.trim() !== '' ? envUrl : '/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60 seconds timeout for AI & large doc operations
  headers: {
    'Accept': 'application/json',
  },
});

// Request Interceptor: Attach authentication token if available
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Request in-flight deduplication and short TTL response caching
const cache = new Map<string, { data: any; timestamp: number }>();
const inFlight = new Map<string, Promise<any>>();
const CACHE_TTL_MS = 3500;

export const clearApiCache = () => {
  cache.clear();
  inFlight.clear();
};

export const cachedGet = async <T>(url: string, params?: any): Promise<T> => {
  const cacheKey = `${url}?${JSON.stringify(params || {})}`;
  const now = Date.now();
  const cached = cache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  if (inFlight.has(cacheKey)) {
    return inFlight.get(cacheKey)!;
  }

  const promise = apiClient.get<T>(url, { params }).then((res) => {
    cache.set(cacheKey, { data: res.data, timestamp: Date.now() });
    inFlight.delete(cacheKey);
    return res.data;
  }).catch((err) => {
    inFlight.delete(cacheKey);
    throw err;
  });

  inFlight.set(cacheKey, promise);
  return promise;
};

// Response Interceptor: Standardize error format and invalidate cache on mutations
apiClient.interceptors.response.use(
  (response) => {
    const method = response.config.method?.toLowerCase();
    if (method && ['post', 'put', 'patch', 'delete'].includes(method)) {
      clearApiCache();
    }
    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    let readableMessage = 'An unexpected error occurred while communicating with the server.';

    if (error.response) {
      // Backend returned custom error format: { error: { code, message } }
      if (error.response.data?.error?.message) {
        readableMessage = error.response.data.error.message;
      } else if (typeof error.response.data === 'string') {
        readableMessage = error.response.data;
      } else if (error.response.status === 404) {
        readableMessage = 'Requested resource was not found.';
      } else if (error.response.status === 413) {
        readableMessage = 'The file is too large to be uploaded.';
      } else if (error.response.status === 503) {
        readableMessage = (error.response.data as any)?.error?.message || 'Backend service is starting up or reloading. Please wait a few seconds and refresh.';
      } else {
        readableMessage = `Server error (${error.response.status}). Please try again later.`;
      }
    } else if (error.request) {
      readableMessage = 'Unable to reach backend server. Please verify the backend is running.';
    }

    return Promise.reject(new Error(readableMessage));
  }
);
