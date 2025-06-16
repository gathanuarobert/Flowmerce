// fetch("http://localhost:8000/api")
//   .then(response => console.log(response))
//   .catch((error) => console.error(error));

import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // For session/cookie auth if needed
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    const csrfToken = getCookie('csrftoken'); // Implement this helper
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Token Refresh Logic
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const response = await axios.post(
          `${api.defaults.baseURL}auth/refresh/`, 
          { refresh: refreshToken }
        );

        localStorage.setItem('access_token', response.data.access);
        if (response.data.refresh) {
          localStorage.setItem('refresh_token', response.data.refresh);
        }

        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        return api(originalRequest);
      } catch (refreshError) {
        handleLogout();
        return Promise.reject(refreshError);
      }
    }

    // Error Handling
    handleError(error);
    return Promise.reject(error);
  }
);

// Helper Functions
function handleLogout() {
  toast.error('Session expired. Please log in again');
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  window.location.href = '/login';
}

function handleError(error) {
  if (!error.response) {
    toast.error('Network error - check your connection');
    return;
  }

  const { status, data } = error.response;
  
  switch (status) {
    case 400:
      toast.error(data.message || 'Invalid request');
      break;
    case 403:
      if (data.code === 'token_not_valid') {
        handleLogout();
      } else {
        toast.error(data.message || 'Forbidden');
      }
      break;
    case 404:
      toast.error(data.message || 'Resource not found');
      break;
    case 500:
      toast.error(data.message || 'Server error');
      break;
    default:
      toast.error(data?.message || 'An error occurred');
  }
}

// CSRF Cookie Helper (for Django)
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

export default api;