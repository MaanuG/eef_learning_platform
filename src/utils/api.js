import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/** FastAPI may return `detail` as a string or a list of validation errors. */
export function formatApiError(err, fallback = 'Request failed') {
  const d = err?.response?.data?.detail;
  if (d == null) return fallback;
  if (typeof d === 'string') return d;
  if (Array.isArray(d)) {
    return d.map((e) => (e && typeof e.msg === 'string' ? e.msg : JSON.stringify(e))).join('; ');
  }
  return String(d);
}

export default api;
