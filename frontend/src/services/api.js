import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const ASSET_BASE_URL = (import.meta.env.VITE_ASSET_BASE_URL || API_BASE_URL.replace(/\/api$/, '')).replace(/\/$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (_) {
    localStorage.removeItem('user');
    return null;
  }
};

export const getAssetUrl = (path) => {
  if (!path) return '#';
  if (/^https?:\/\//i.test(path)) return path;
  return `${ASSET_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
};

export const notifyToast = (message, type = 'info') => {
  if (typeof window === 'undefined' || !message) return;
  window.dispatchEvent(new CustomEvent('sits:toast', { detail: { message, type } }));
};

// Automatically attach JWT from localStorage
api.interceptors.request.use((config) => {
  const user = getStoredUser();
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('user');
      notifyToast('Session expired. Please login again.', 'error');
    }

    const message = error?.response?.data?.message || 'Something went wrong. Please try again.';
    if (error?.response?.status !== 401) {
      notifyToast(message, 'error');
    }
    return Promise.reject({ ...error, userMessage: message });
  }
);

export default api;
