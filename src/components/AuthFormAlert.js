import React from 'react';

export default function AuthFormAlert({ children }) {
  return (
    <div className="auth-alert" role="alert">
      <svg className="auth-alert-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="10" stroke="#dc2626" strokeWidth="1.5" />
        <path d="M12 8v5M12 16.5v.01" stroke="#dc2626" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
      <span>{children}</span>
    </div>
  );
}
