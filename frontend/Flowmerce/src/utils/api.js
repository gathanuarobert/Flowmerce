import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    const csrfToken = getCookie('csrftoken');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (csrfToken) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    
    // Remove Content-Type for FormData to let axios set it automatically
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Simplified Response Interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401) {
      handleLogout();
      return Promise.reject(error);
    }

    // Handle other errors
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
  
  // Match your Django error response format
  const errorMessage = data.error || data.detail || data.message || 'An error occurred';
  
  if (status === 400) {
    toast.error(errorMessage);
  } else if (status === 403) {
    toast.error(errorMessage || 'Forbidden');
  } else if (status === 404) {
    toast.error(errorMessage || 'Resource not found');
  } else if (status >= 500) {
    toast.error(errorMessage || 'Server error');
  } else {
    toast.error(errorMessage);
  }
}

// CSRF Cookie Helper
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}

export default api;