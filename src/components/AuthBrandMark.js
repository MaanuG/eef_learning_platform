import React from 'react';

/** Book mark — shared on login & register (teal system) */
export default function AuthBrandMark() {
  return (
    <div className="auth-brand-mark" aria-hidden="true">
      <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M9 7h14a2 2 0 012 2v16l-9-4.5L7 25V9a2 2 0 012-2z"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinejoin="round"
        />
        <path d="M11 12h10M11 16h10M11 20h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}
