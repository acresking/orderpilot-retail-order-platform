'use strict';
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const { FEATURES } = require('../src/shared/features');
// Injected as a real top-level `const` into both bundles (not a require() — browser scripts have
// no module system here), so every IIFE patch in app.js/admin.js can read feature ids/labels via
// the same scope-chain lookup as everything else in this codebase's "top-level = shared" pattern.
const featuresInject = `const ORDERPILOT_FEATURES = ${JSON.stringify(FEATURES)};\n`;
const files = [
  ['src/client/mobile/app.js', 'public/app.js', '// Generated runtime bundle. Source of truth: src/client/mobile/app.js\n// Run: npm run build:web\n' + featuresInject],
  ['src/client/admin/admin.js', 'public/admin.js', '// Generated runtime bundle. Source of truth: src/client/admin/admin.js\n// Run: npm run build:web\n' + featuresInject],
  ['src/client/shared/styles.css', 'public/styles.css', '/* Generated runtime stylesheet. Source of truth: src/client/shared/styles.css */\n'],
];
for (const [src, dest, header] of files) {
  const srcPath = path.join(root, src);
  const destPath = path.join(root, dest);
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, header + fs.readFileSync(srcPath, 'utf8'));
  console.log(`built ${dest}`);
}
