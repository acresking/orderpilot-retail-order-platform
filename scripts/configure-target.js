'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const target = process.argv[2] || 'web';
const configPath = path.join(root, 'public', 'config.js');
const apiBase = process.env.ORDERPILOT_API_BASE_URL || process.env.ORDERPILOT_SERVER_URL || '';
const envName = process.env.ORDERPILOT_ENV || target;
const appVersion = '44.0.0';

if ((target === 'mobile' || target === 'desktop-remote') && !apiBase) {
  console.error('Missing ORDERPILOT_API_BASE_URL, for example: https://api.your-domain.co.il');
  process.exit(1);
}

const content = `'use strict';\n\nwindow.ORDERPILOT_CONFIG = {\n  API_BASE_URL: ${JSON.stringify(apiBase)},\n  APP_ENV: ${JSON.stringify(envName)},\n  APP_VERSION: ${JSON.stringify(appVersion)},\n  ENABLE_NATIVE_PUSH: true,\n  ...(window.ORDERPILOT_CONFIG || {})\n};\n`;
fs.writeFileSync(configPath, content);
console.log(`Configured ${target}: API_BASE_URL=${apiBase || '(relative)'}`);
