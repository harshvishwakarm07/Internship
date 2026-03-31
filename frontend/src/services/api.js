import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

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
    }

    const message = error?.response?.data?.message || 'Something went wrong. Please try again.';
    return Promise.reject({ ...error, userMessage: message });
  }
);

export default api;
