import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthBrandMark from '../../components/AuthBrandMark';
import AuthFormAlert from '../../components/AuthFormAlert';

const LOGIN_FAILED_MESSAGE = 'Email or password is incorrect. Please try again.';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      const role = user?.role;
      if (role === 'admin') navigate('/admin');
      else if (role === 'educator') navigate('/educator');
      else navigate('/student');
    } catch {
      setError(LOGIN_FAILED_MESSAGE);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-card-sheen" aria-hidden="true" />
          <div className="auth-card-body">
            <header className="auth-brand">
              <AuthBrandMark />
              <div>
                <p className="auth-eyebrow">Empowering Education Foundation</p>
                <h1 className="auth-title">Sign in</h1>
                <p className="auth-lede">
                  Welcome back. Use your account credentials to open your dashboard.
                </p>
              </div>
            </header>

            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              <div className="form-group">
                <label className="form-label" htmlFor="login-email">
                  Email
                </label>
                <input
                  id="login-email"
                  className="form-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="login-password">
                  Password
                </label>
                <input
                  id="login-password"
                  className="form-input"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              {error && <AuthFormAlert>{error}</AuthFormAlert>}

              <div className="auth-submit">
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner" style={{ borderTopColor: 'white', width: 17, height: 17 }} />
                      Signing in…
                    </>
                  ) : (
                    'Continue'
                  )}
                </button>
              </div>
            </form>

            <footer className="auth-footer">
              Need access?{' '}
              <Link to="/register">Request an account</Link>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
