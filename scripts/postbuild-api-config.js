/**
 * Writes build/api-config.js so Render (or any host) can point the SPA at a separate API
 * without rebundling: set API_ORIGIN or REACT_APP_API_URL in the build environment.
 */
const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '..', 'build');
const target = path.join(buildDir, 'api-config.js');

if (!fs.existsSync(buildDir)) {
  console.warn('postbuild-api-config: build/ not found, skip');
  process.exit(0);
}

let origin = process.env.API_ORIGIN || process.env.REACT_APP_API_URL || '';
origin = String(origin).trim().replace(/\/+$/, '');
if (origin.endsWith('/api')) origin = origin.slice(0, -4);

const content =
  '/* Auto-generated at build — do not edit on the server; change API_ORIGIN in Render and rebuild */\n' +
  `window.__EEF_API_ORIGIN__=${JSON.stringify(origin)};\n`;

fs.writeFileSync(target, content, 'utf8');
