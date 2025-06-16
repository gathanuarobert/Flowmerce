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