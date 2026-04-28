import axios from 'axios';

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
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
