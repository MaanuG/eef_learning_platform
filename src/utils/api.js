import axios from 'axios';

function stripTrailingSlashes(s) {
  return String(s).replace(/\/+$/, '');
}

/** Strip accidental quotes from .env (e.g. REACT_APP_API_URL="http://...") */
function sanitizeEnvUrl(raw) {
  if (raw == null) return '';
  let s = String(raw).trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

function originToApiBase(origin) {
  let base = stripTrailingSlashes(sanitizeEnvUrl(origin));
  if (!base.endsWith('/api')) base = `${base}/api`;
  return base;
}

/** Reject junk values that would produce URLs like "undefined/api" and hang until timeout. */
function isValidHttpOrigin(raw) {
  const s = sanitizeEnvUrl(raw);
  if (!s) return false;
  const lower = s.toLowerCase();
  if (lower === 'undefined' || lower === 'null') return false;
  return /^https?:\/\/.+/i.test(s);
}

/** Resolve at request time so build/runtime api-config.js is always visible (avoids race with module init). */
export function resolveApiBaseURL() {
  if (typeof window !== 'undefined') {
    const runtime = window.__EEF_API_ORIGIN__;
    if (
      runtime != null &&
      String(runtime).trim() !== '' &&
      isValidHttpOrigin(runtime)
    ) {
      return originToApiBase(runtime);
    }
  }
  const raw = sanitizeEnvUrl(process.env.REACT_APP_API_URL);
  if (raw !== '') {
    return originToApiBase(raw);
  }
  return '/api';
}

const api = axios.create({
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  config.baseURL = resolveApiBaseURL();
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export function formatApiError(err, fallback = 'Request failed') {
  if (
    err &&
    err.response == null &&
    err.isAxiosError !== true &&
    typeof err.message === 'string' &&
    err.message
  ) {
    return err.message;
  }

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
    return d
      .map((e) => {
        if (!e || typeof e !== 'object') return JSON.stringify(e);
        const loc = Array.isArray(e.loc)
          ? e.loc.filter((x) => x !== 'body' && typeof x === 'string').join('.')
          : '';
        const msg = typeof e.msg === 'string' ? e.msg : typeof e.message === 'string' ? e.message : JSON.stringify(e);
        return loc ? `${loc}: ${msg}` : msg;
      })
      .join('; ');
  }
  return String(d);
}

export default api;
