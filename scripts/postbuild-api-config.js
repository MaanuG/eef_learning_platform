const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '..', 'build');
const target = path.join(buildDir, 'api-config.js');

if (!fs.existsSync(buildDir)) {
  console.warn('postbuild-api-config: build/ not found, skip');
  process.exit(0);
}

let origin = process.env.API_ORIGIN || process.env.REACT_APP_API_URL || '';
origin = String(origin).trim();
if ((origin.startsWith('"') && origin.endsWith('"')) || (origin.startsWith("'") && origin.endsWith("'"))) {
  origin = origin.slice(1, -1).trim();
}
origin = origin.replace(/\/+$/, '');
if (origin.endsWith('/api')) origin = origin.slice(0, -4);

const content = `window.__EEF_API_ORIGIN__=${JSON.stringify(origin)};\n`;

fs.writeFileSync(target, content, 'utf8');
