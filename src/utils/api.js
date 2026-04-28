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

function isLikelyLocalDevHostname(hostname) {
  if (hostname === 'localhost' || hostname === '127.0.0.1') return true;
  const oct = hostname.split('.').map((x) => parseInt(x, 10));
  if (oct.length !== 4 || oct.some((n) => Number.isNaN(n))) return false;
  const [a, b] = oct;
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  return false;
}

/**
 * Deployed sites (Vercel, etc.) must point the SPA at the real API origin.
 * If neither api-config nor REACT_APP_* provides an https URL, the app only hits same-origin /api — which usually has no server → timeouts.
 */
export function isHostedFrontendMissingApiOrigin() {
  if (typeof window === 'undefined') return false;
  const { hostname } = window.location;
  if (isLikelyLocalDevHostname(hostname)) return false;

  const runtime = window.__EEF_API_ORIGIN__;
  const runtimeOk =
    runtime != null &&
    String(runtime).trim() !== '' &&
    isValidHttpOrigin(runtime);

  const envUrl = sanitizeEnvUrl(process.env.REACT_APP_API_URL);
  const envAbsolute = /^https?:\/\//i.test(envUrl);

  return !runtimeOk && !envAbsolute;
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

/** Human-readable URL that was requested (for errors). */
export function describeFailedRequest(err) {
  const cfg = err?.config;
  if (!cfg) return '';
  const base = String(cfg.baseURL || '').replace(/\/+$/, '');
  const rel = String(cfg.url || '').replace(/^\//, '');
  if (/^https?:\/\//i.test(base)) {
    return rel ? `${base}/${rel}` : base;
  }
  if (typeof window !== 'undefined') {
    const parts = [base.replace(/^\//, ''), rel].filter(Boolean);
    const path = `/${parts.join('/')}`.replace(/\/+/g, '/');
    return `${window.location.origin}${path}`;
  }
  return rel ? `${base}/${rel}` : base;
}

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
    const target = describeFailedRequest(err);
    return (
      `Request timed out (${target || 'unknown URL'}). No response from the server—check that the API is running and reachable, ` +
      `and on hosted backends that the database (DATABASE_URL) is up. ` +
      `Wrong passwords or removed accounts return an error immediately; this is not a browser cache issue.`
    );
  }
  if (!err?.response) {
    const target = describeFailedRequest(err);
    const isRemoteHttps =
      /^https:\/\//i.test(target) && !/localhost|127\.0\.0\.1/i.test(target);
    if (isRemoteHttps) {
      return (
        `Cannot reach the API (${target}). ` +
        `Your app is already using a hosted API URL—this is not about setting API_ORIGIN in the frontend build. ` +
        `The browser got no usable response (network error, service asleep/crashed, or SSL). ` +
        `Check the Render dashboard: web service running, logs for crashes, DATABASE_URL set for Postgres, and try opening the API root in a new tab. Free tiers may sleep until the first request.`
      );
    }
    return (
      `Cannot reach the API${target ? ` (${target})` : ''}. ` +
      `Local dev: run uvicorn on port 8000 and npm start (proxies /api to the backend). ` +
      `If your API is on another host (e.g. Render), build with API_ORIGIN or REACT_APP_API_URL set to that API’s origin (https://… only, no /api path).`
    );
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
