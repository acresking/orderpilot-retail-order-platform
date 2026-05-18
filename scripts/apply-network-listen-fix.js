#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const serverPath = path.join(root, 'server.js');
if (!fs.existsSync(serverPath)) {
  console.error('[ERROR] server.js not found');
  process.exit(1);
}

let src = fs.readFileSync(serverPath, 'utf8');
const original = src;

if (!/ORDERPILOT_HOST|const\s+HOST\s*=|let\s+HOST\s*=|var\s+HOST\s*=/.test(src)) {
  const portDecl = src.match(/(?:const|let|var)\s+PORT\s*=\s*[^;]+;/);
  if (portDecl) {
    src = src.replace(portDecl[0], `${portDecl[0]}\nconst HOST = process.env.HOST || process.env.ORDERPILOT_HOST || '0.0.0.0';`);
  } else {
    src = `const HOST = process.env.HOST || process.env.ORDERPILOT_HOST || '0.0.0.0';\n` + src;
  }
}

// Common Express patterns: app.listen(PORT, () => ...), server.listen(PORT, () => ...)
src = src.replace(/(\b(?:app|server|httpServer)\.listen\s*\(\s*PORT\s*),\s*(\(\s*\)\s*=>)/g, '$1, HOST, $2');
src = src.replace(/(\b(?:app|server|httpServer)\.listen\s*\(\s*port\s*),\s*(\(\s*\)\s*=>)/g, '$1, HOST, $2');
src = src.replace(/(\b(?:app|server|httpServer)\.listen\s*\(\s*PORT\s*),\s*(function\s*\()/g, '$1, HOST, $2');
src = src.replace(/(\b(?:app|server|httpServer)\.listen\s*\(\s*port\s*),\s*(function\s*\()/g, '$1, HOST, $2');

// If it already uses app.listen(PORT, 'localhost', ...), replace localhost/127 with HOST.
src = src.replace(/(\b(?:app|server|httpServer)\.listen\s*\(\s*(?:PORT|port)\s*,\s*)['"](?:localhost|127\.0\.0\.1)['"]/g, '$1HOST');

if (src !== original) {
  const backup = serverPath + `.bak-${Date.now()}`;
  fs.writeFileSync(backup, original, 'utf8');
  fs.writeFileSync(serverPath, src, 'utf8');
  console.log(`OK patched server.js to listen on HOST/0.0.0.0. Backup: ${backup}`);
} else {
  console.log('No server.js changes needed, or pattern not detected. run-local.js will still pass HOST=0.0.0.0.');
}
