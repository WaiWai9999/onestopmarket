import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Redirect to login on 401 (expired/invalid session)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthEndpoint = error.config?.url?.startsWith('/auth/');
    if (error.response?.status === 401 && !isAuthEndpoint) {
      const wasLoggedIn = !!useAuthStore.getState().user;
      useAuthStore.getState().logout();
      if (wasLoggedIn) sessionStorage.setItem('session_expired', '1');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
