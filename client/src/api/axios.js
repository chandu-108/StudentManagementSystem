import axios from 'axios';

function resolveBaseURL() {
  const fromEnv =
    import.meta.env.VITE_API_URL && String(import.meta.env.VITE_API_URL).replace(/\/$/, '');
  if (fromEnv) return fromEnv;
  if (import.meta.env.DEV) return 'http://localhost:5000/api';
  return '/api';
}

const baseURL = resolveBaseURL();

const api = axios.create({
  baseURL,
});

api.interceptors.request.use(
  async config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

api.interceptors.response.use(
  response => response,
  async function (error) {
    const originalRequest = error.config;
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }
    originalRequest._retry = true;
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return Promise.reject(error);
    }
    try {
      const res = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
      if (res.status === 200) {
        localStorage.setItem('token', res.data.token);
        api.defaults.headers.common['Authorization'] = 'Bearer ' + res.data.token;
        originalRequest.headers.Authorization = 'Bearer ' + res.data.token;
        return api(originalRequest);
      }
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
