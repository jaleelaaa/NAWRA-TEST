import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Check for dev mode (for local development only)
    if (typeof window !== 'undefined') {
      const devMode = localStorage.getItem('dev-mode');
      const devUserId = localStorage.getItem('dev-user-id');

      if (devMode === 'true' && devUserId && config.headers) {
        // In dev mode, use X-User-Id header instead of Bearer token
        config.headers['X-User-Id'] = devUserId;
        return config;
      }
    }

    const token = useAuthStore.getState().accessToken;

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and we haven't retried yet, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Check for dev mode - skip token refresh and redirect if in dev mode
      if (typeof window !== 'undefined') {
        const devMode = localStorage.getItem('dev-mode');
        if (devMode === 'true') {
          // In dev mode, don't try to refresh or redirect - just return the error
          return Promise.reject(error);
        }
      }

      try {
        const refreshToken = useAuthStore.getState().refreshToken;

        if (refreshToken) {
          // Try to refresh the token
          const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/auth/refresh`,
            { refresh_token: refreshToken }
          );

          const { access_token, refresh_token } = response.data.tokens;

          // Update tokens in store
          useAuthStore.getState().setTokens(access_token, refresh_token);

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
          }
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  login: async (email: string, password: string, rememberMe: boolean = false) => {
    const response = await api.post('/auth/login', {
      email,
      password,
      remember_me: rememberMe,
    });
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default api;
