import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { formatApiError } from '../../utils/api';
import AuthBrandMark from '../../components/AuthBrandMark';
import AuthFormAlert from '../../components/AuthFormAlert';

const requirements = [
  { test: (v) => v.length >= 8, label: '8+ characters' },
  { test: (v) => /[A-Z]/.test(v), label: 'One uppercase' },
  { test: (v) => /\d/.test(v), label: 'One number' },
  { test: (v) => /[!@#$%^&*(),.?":{}|<>]/.test(v), label: 'One special' },
];

export default function RegisterPage() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '', confirm: '', role: 'student' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const passOk = requirements.every((r) => r.test(form.password));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!passOk) return setError('Password does not meet requirements');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    setLoading(true);
    try {
      await register({ full_name: form.full_name, email: form.email, password: form.password, role: form.role });
      navigate('/pending');
    } catch (err) {
      setError(formatApiError(err, 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell auth-shell--register">
        <div className="auth-card">
          <div className="auth-card-sheen" aria-hidden="true" />
          <div className="auth-card-body">
            <header className="auth-brand">
              <AuthBrandMark />
              <div>
                <p className="auth-eyebrow">Empowering Education Foundation</p>
                <h1 className="auth-title">Request access</h1>
                <p className="auth-lede">
                  Tell us who you are. An administrator will review and approve your account before you can sign
                  in.
                </p>
              </div>
            </header>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="reg-name">
                  Full name
                </label>
                <input
                  id="reg-name"
                  className="form-input"
                  placeholder="e.g. Jordan Lee"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-email">
                  School email
                </label>
                <input
                  id="reg-email"
                  className="form-input"
                  type="email"
                  placeholder="name@school.org"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="form-group">
                <span className="form-label" id="reg-role-label">
                  I am a
                </span>
                <div className="auth-role-toggle" role="group" aria-labelledby="reg-role-label">
                  {['student', 'educator'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      className={`auth-role-btn${form.role === role ? ' is-active' : ''}`}
                      onClick={() => setForm({ ...form, role })}
                    >
                      {role === 'student' ? 'Student' : 'Educator'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-password">
                  Password
                </label>
                <input
                  id="reg-password"
                  className="form-input"
                  type="password"
                  placeholder="Create a strong password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  autoComplete="new-password"
                  required
                />
                {form.password && (
                  <div className="auth-pass-chips" aria-live="polite">
                    {requirements.map((r, i) => (
                      <span key={i} className={`auth-chip${r.test(form.password) ? ' is-met' : ' is-unmet'}`}>
                        {r.test(form.password) ? '✓' : '○'} {r.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="reg-confirm">
                  Confirm password
                </label>
                <input
                  id="reg-confirm"
                  className="form-input"
                  type="password"
                  placeholder="Repeat password"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                  autoComplete="new-password"
                  required
                />
                {form.confirm && form.confirm !== form.password && (
                  <p className="error-text">Passwords don&apos;t match yet.</p>
                )}
              </div>

              {error && <AuthFormAlert>{error}</AuthFormAlert>}

              <div className="auth-register-submit">
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner" style={{ borderTopColor: 'white', width: 17, height: 17 }} />
                      Sending…
                    </>
                  ) : (
                    'Submit request'
                  )}
                </button>
              </div>
            </form>

            <footer className="auth-footer">
              Already approved? <Link to="/login">Sign in</Link>
            </footer>
          </div>
        </div>
      </div>
    </div>
  );
}
