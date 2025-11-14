/**
 * API Client Configuration
 *
 * Axios instance with request/response interceptors for JWT authentication
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';

// API Base URL - configurable via environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const API_PREFIX = '/api/v1';

/**
 * Create axios instance with default configuration
 */
export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}${API_PREFIX}`,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Create a separate axios instance for auth requests (no interceptors)
 */
const authApiClient = axios.create({
  baseURL: `${API_BASE_URL}${API_PREFIX}`,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: (status) => status >= 200 && status < 300, // Throw for anything outside 2xx
});

/**
 * Request interceptor - Add JWT token to all requests
 */
apiClient.interceptors.request.use(
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

    // Get access token from auth store
    const accessToken = useAuthStore.getState().accessToken;

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle token refresh and errors
 */
apiClient.interceptors.response.use(
  (response) => {
    // Return successful responses as-is
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
      skipAuthInterceptor?: boolean;
    };

    // Skip token refresh logic if explicitly disabled or for auth endpoints
    const skipRefresh = originalRequest.skipAuthInterceptor ||
                       originalRequest.url?.includes('/auth/login') ||
                       originalRequest.url?.includes('/auth/refresh') ||
                       originalRequest.url?.includes('/auth/password-reset');

    // Handle 401 Unauthorized errors (but not for auth endpoints)
    if (error.response?.status === 401 && !originalRequest._retry && !skipRefresh) {

      originalRequest._retry = true;

      // Check for dev mode - skip redirect if in dev mode
      if (typeof window !== 'undefined') {
        const devMode = localStorage.getItem('dev-mode');
        if (devMode === 'true') {
          // In dev mode, don't redirect to login on 401
          return Promise.reject(error);
        }
      }

      try {
        // Get refresh token from auth store
        const refreshToken = useAuthStore.getState().refreshToken;

        if (!refreshToken) {
          // No refresh token available - logout
          useAuthStore.getState().logout();
          if (typeof window !== 'undefined') {
            window.location.href = '/en/login';
          }
          return Promise.reject(error);
        }

        // Attempt to refresh the token
        const response = await axios.post(`${API_BASE_URL}${API_PREFIX}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        const { access_token, refresh_token } = response.data.tokens;

        // Update tokens in store
        useAuthStore.getState().setTokens(access_token, refresh_token);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh token failed - logout user
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/en/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle other errors (including auth endpoint errors)
    return Promise.reject(error);
  }
);

/**
 * Generic error handler for API errors
 */
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{
      detail?: string | Array<{ msg: string; loc: string[]; type: string }>;
      message?: string
    }>;

    // Server responded with error
    if (axiosError.response) {
      const detail = axiosError.response.data?.detail;

      // Handle validation errors (422) with structured detail array
      if (Array.isArray(detail) && detail.length > 0) {
        return detail[0].msg || 'Validation error';
      }

      // Handle simple string errors
      return (typeof detail === 'string' ? detail : null) ||
             axiosError.response.data?.message ||
             'An error occurred';
    }

    // Request was made but no response received
    if (axiosError.request) {
      return 'Network error. Please check your connection';
    }
  }

  // Something else happened
  return 'An unexpected error occurred';
};

/**
 * Health check function
 */
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data.status === 'healthy';
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

export default apiClient;
export { authApiClient };
