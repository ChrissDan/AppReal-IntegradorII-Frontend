import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: 'https://3.14.129.201:8080',
});

// Interceptor para añadir el token antes de cada solicitud
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default axiosInstance;
