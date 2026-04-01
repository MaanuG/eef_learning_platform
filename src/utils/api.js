import axios from 'axios';

/**
 * Backend serves under `/api/...` (e.g. `/api/auth/login`).
 * Resolution order:
 * 1) window.__EEF_API_ORIGIN__ — set by public/api-config.js (see postbuild script for Render).
 * 2) REACT_APP_API_URL — baked in at `react-scripts build`.
 * 3) `/api` — CRA dev proxy → backend; production needs (1) or (2) when API is on another host.
 */
function stripTrailingSlashes(s) {
  return String(s).replace(/\/+$/, '');
}

function originToApiBase(origin) {
  let base = stripTrailingSlashes(origin);
  if (!base.endsWith('/api')) base = `${base}/api`;
  return base;
}

function resolveApiBaseURL() {
  if (typeof window !== 'undefined') {
    const runtime = window.__EEF_API_ORIGIN__;
    if (runtime != null && String(runtime).trim() !== '') {
      return originToApiBase(runtime);
    }
  }
  const raw = process.env.REACT_APP_API_URL;
  if (raw != null && String(raw).trim() !== '') {
    return originToApiBase(raw);
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
    return 'API not found. If the API is on another domain (e.g. Vercel), set API_ORIGIN or REACT_APP_API_URL on Render to that URL (origin only, no /api).';
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
