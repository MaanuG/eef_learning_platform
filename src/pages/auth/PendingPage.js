import React from 'react';
import { Link } from 'react-router-dom';

export default function PendingPage() {
  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-card-sheen" aria-hidden="true" />
          <div className="auth-card-body auth-card-body--pending">
            <div className="auth-pending-icon" aria-hidden="true">
              <svg width="44" height="44" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="18" stroke="url(#pendingGrad)" strokeWidth="2" />
                <path
                  d="M12 20l6 6 10-12"
                  stroke="url(#pendingGrad)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <defs>
                  <linearGradient id="pendingGrad" x1="8" y1="8" x2="32" y2="32">
                    <stop stopColor="#0d9488" />
                    <stop offset="1" stopColor="#0f766e" />
                  </linearGradient>
                </defs>
              </svg>
            </div>

            <header className="auth-brand auth-brand--center">
              <div>
                <p className="auth-eyebrow">Empowering Education Foundation</p>
                <h1 className="auth-title">Request received</h1>
                <p className="auth-lede auth-lede--center">
                  Your access request is pending. When an administrator approves it, you&apos;ll be able to sign in
                  with the email and password you chose.
                </p>
              </div>
            </header>

            <div className="auth-callout">
              <p className="auth-callout-title">What happens next</p>
              <ul>
                <li>An admin reviews new requests regularly.</li>
                <li>You&apos;ll see an in-app notification once you&apos;re approved.</li>
                <li>Then return here and sign in from the login page.</li>
              </ul>
            </div>

            <Link to="/login" className="btn btn-primary btn-lg auth-pending-cta">
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
