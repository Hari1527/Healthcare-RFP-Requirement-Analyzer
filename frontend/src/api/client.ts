import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { ApiErrorResponse } from '../types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

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

// Response Interceptor: Standardize error format
apiClient.interceptors.response.use(
  (response) => response,
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
        readableMessage = 'AI / Vector service is currently unavailable. Please verify API keys.';
      } else {
        readableMessage = `Server error (${error.response.status}). Please try again later.`;
      }
    } else if (error.request) {
      readableMessage = 'Unable to reach backend server. Please verify the backend is running.';
    }

    return Promise.reject(new Error(readableMessage));
  }
);
