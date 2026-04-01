import axios from 'axios';

/**
 * Backend mounts all routes under `/api/...` (e.g. `/api/auth/login`).
 * If REACT_APP_API_URL is set to the server root only (e.g. http://localhost:8000),
 * we append `/api` so requests are not sent to `/auth/login` (404).
 * If unset, use same-origin `/api` (CRA dev proxy forwards to the backend).
 */
function resolveApiBaseURL() {
  const raw = process.env.REACT_APP_API_URL;
  if (raw != null && String(raw).trim() !== '') {
    let base = String(raw).trim().replace(/\/+$/, '');
    if (!base.endsWith('/api')) base = `${base}/api`;
    return base;
  }
  return '/api';
}

const api = axios.create({
  baseURL: resolveApiBaseURL(),
  timeout: 30000,
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
  const status = err?.response?.status;
  const d = err?.response?.data?.detail;
  if (status === 404 && (d == null || d === 'Not Found')) {
    return 'API not found. Use REACT_APP_API_URL=http://127.0.0.1:8000 (no /api needed; it is added), or run the backend on port 8000 with npm start’s proxy.';
  }
  if (err?.code === 'ECONNABORTED' || err?.message?.toLowerCase().includes('timeout')) {
    return 'Request timed out. Is the API server running?';
  }
  if (!err?.response) {
    return 'Cannot reach the API. For local dev run the backend (e.g. uvicorn) and use npm start; for production set REACT_APP_API_URL to your API host.';
  }
  if (d == null) return fallback;
  if (typeof d === 'string') return d;
  if (Array.isArray(d)) {
    return d.map((e) => (e && typeof e.msg === 'string' ? e.msg : JSON.stringify(e))).join('; ');
  }
  return String(d);
}

export default api;
