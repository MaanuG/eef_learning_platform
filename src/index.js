import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Avoid stale service-worker caches from older deployments hijacking requests or assets.
if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);
