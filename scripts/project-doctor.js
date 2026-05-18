'use strict';

const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const checks = [
  'server.js',
  'package.json',
  'public/index.html',
  'public/admin.html',
  'public/app.js',
  'public/admin.js',
  'public/mobile.js',
  'public/manifest.json',
  'capacitor.config.json',
  'desktop/main.js',
  'desktop/preload.js'
];
let ok = true;
for (const file of checks) {
  const exists = fs.existsSync(path.join(root, file));
  console.log(`${exists ? 'OK' : 'MISSING'} ${file}`);
  if (!exists) ok = false;
}
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
for (const dep of ['@capacitor/core', '@capacitor/android', '@capacitor/ios']) {
  const exists = pkg.dependencies?.[dep] || pkg.devDependencies?.[dep];
  console.log(`${exists ? 'OK' : 'MISSING'} ${dep}`);
  if (!exists) ok = false;
}
for (const dep of ['electron', 'electron-builder']) {
  const exists = pkg.dependencies?.[dep] || pkg.devDependencies?.[dep];
  console.log(`${exists ? 'OK' : 'MISSING'} ${dep}`);
  if (!exists) ok = false;
}
if (fs.existsSync(path.join(root, 'data'))) {
  console.log('NOTE data/ exists locally. It is used at runtime but should not be committed into code-only updates.');
}
if (!ok) process.exit(1);
