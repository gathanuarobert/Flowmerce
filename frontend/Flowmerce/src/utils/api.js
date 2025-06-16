// fetch("http://localhost:8000/api")
//   .then(response => console.log(response))
//   .catch((error) => console.error(error));

import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
    baseURL: "http://localhost:8000/api",
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
    (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refresh_token');
                const { data } = await axios.post('/api/auth/refresh/', { refresh: refreshToken});

                localStorage.setItem('access_token', data.access);
                localStorage.setItem('refresh_token', data.refresh);

                originalRequest.headers.Authorization = `Bearer ${data.access}`;
                return api(originalRequest);
            } catch (refreshError) {
                toast.error('Session expired. Please log in again');
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        if (error.response) {
            switch (error.response.status) {
                case 403:
                    toast.error('You are not authorized!');
                    break;
                case 404:
                    toast.error('Resource not found!');
                    break;
                case 500:
                    toast.error('Server error - try again later.');
                    break
                default:
                    toast.error(error.response.data?.message || 'Unknown error');            
            }
        }

        return Promise.reject(error);
    }
);

export default api;