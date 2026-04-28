/**
 * Explicit /api → backend proxy for local dev.
 * The string "proxy" in package.json uses heuristics (GET + Accept) that can miss API calls;
 * this middleware always forwards /api to FastAPI on port 8000.
 */
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function setupProxy(app) {
  const target = process.env.BACKEND_PROXY_TARGET || 'http://127.0.0.1:8000';
  app.use(
    '/api',
    createProxyMiddleware({
      target,
      changeOrigin: true,
      logLevel: 'silent',
    })
  );
};
