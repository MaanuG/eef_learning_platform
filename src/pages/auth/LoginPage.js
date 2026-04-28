import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api, {
  formatApiError,
  resolveApiBaseURL,
  isHostedFrontendMissingApiOrigin,
} from '../../utils/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  /** null = still checking */
  const [apiReachable, setApiReachable] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    api
      .get('/health', { timeout: 20000 })
      .then(() => {
        if (!cancelled) setApiReachable(true);
      })
      .catch(() => {
        if (!cancelled) setApiReachable(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (isHostedFrontendMissingApiOrigin()) {
      setError(
        'This site was built without an API URL. On your hosting provider set API_ORIGIN (build-time) or REACT_APP_API_URL ' +
          'to your FastAPI origin (example: https://your-api.onrender.com — no /api suffix). Then rebuild and redeploy the frontend. ' +
          'Otherwise login calls /api on this domain only and nothing answers.'
      );
      return;
    }
    setLoading(true);
    try {
      const user = await login(email, password);
      const role = user?.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'educator') navigate('/educator');
      else navigate('/student');
    } catch (err) {
      const msg = formatApiError(err, 'Login failed');
      if (msg.includes('pending')) setError('Your account is pending admin approval. Please check back soon.');
      else if (msg.includes('rejected')) setError('Your account request was not approved. Contact support.');
      else setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">🌟</div>
          <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#0f766e', fontSize: '22px' }}>
            Empowering Education
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: 4 }}>Foundation Learning Platform</p>
        </div>

        {isHostedFrontendMissingApiOrigin() && (
          <div
            style={{
              background: '#fef2f2',
              color: '#991b1b',
              padding: '14px 16px',
              borderRadius: 8,
              fontSize: 12,
              marginBottom: 16,
              border: '1px solid #fecaca',
              lineHeight: 1.55,
            }}
          >
            <strong>API URL not configured for this deployment.</strong> Set{' '}
            <code style={{ fontSize: 11 }}>API_ORIGIN</code> or{' '}
            <code style={{ fontSize: 11 }}>REACT_APP_API_URL=https://your-backend-host</code> when you build the frontend, then redeploy.
            Value must be the API <em>origin only</em> (no <code style={{ fontSize: 11 }}>/api</code> path).
          </div>
        )}

        {apiReachable === false && (
          <div
            style={{
              background: '#fffbeb',
              color: '#92400e',
              padding: '12px 14px',
              borderRadius: 8,
              fontSize: 12,
              marginBottom: 16,
              border: '1px solid #fde68a',
              lineHeight: 1.5,
            }}
          >
            <strong>Cannot reach the API.</strong> Requests use{' '}
            <code style={{ fontSize: 11 }}>{resolveApiBaseURL() || '(unset)'}</code>
            . Start the backend (<code style={{ fontSize: 11 }}>uvicorn main:app --port 8000</code>) and run{' '}
            <code style={{ fontSize: 11 }}>npm start</code>, or rebuild with the correct{' '}
            <code style={{ fontSize: 11 }}>API_ORIGIN</code> / <code style={{ fontSize: 11 }}>REACT_APP_API_URL</code>.
            For hosted Postgres (e.g. Render), confirm <code style={{ fontSize: 11 }}>DATABASE_URL</code> on the API service.
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16, border: '1px solid #fee2e2' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', justifyContent: 'center', marginBottom: 16 }} disabled={loading}>
            {loading ? <><div className="spinner" style={{ borderTopColor: 'white' }} /> Signing in...</> : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: 14 }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#0d9488', fontWeight: 600, textDecoration: 'none' }}>
            Request Access
          </Link>
        </div>

        <div style={{ marginTop: 20, padding: '12px 16px', background: '#f0fdfa', borderRadius: 8, fontSize: 12, color: '#0f766e', border: '1px solid #99f6e4' }}>
          <strong>Default admin (use as email, not username):</strong> admin@eef.org<br />
          <strong>Password:</strong> Admin@123!<br />
          <span style={{ color: '#94a3b8' }}>POST <code style={{ fontSize: 11 }}>/api/auth/seed-admin</code> once if no admin exists yet.</span>
        </div>
      </div>
    </div>
  );
}
