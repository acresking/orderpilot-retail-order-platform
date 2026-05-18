'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const requiredFiles = [
  'capacitor.config.json',
  'public/index.html',
  'public/manifest.json',
  'public/config.js',
  'public/mobile.js',
  'public/sw.js'
];

let ok = true;
for (const file of requiredFiles) {
  const exists = fs.existsSync(path.join(root, file));
  console.log(`${exists ? 'OK' : 'MISSING'} ${file}`);
  if (!exists) ok = false;
}

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const deps = ['@capacitor/core', '@capacitor/android', '@capacitor/ios', '@capacitor/app', '@capacitor/haptics', '@capacitor/keyboard', '@capacitor/network', '@capacitor/preferences', '@capacitor/push-notifications'];
for (const dep of deps) {
  const exists = pkg.dependencies?.[dep] || pkg.devDependencies?.[dep];
  console.log(`${exists ? 'OK' : 'MISSING'} ${dep}`);
  if (!exists) ok = false;
}

const config = JSON.parse(fs.readFileSync(path.join(root, 'capacitor.config.json'), 'utf8'));
console.log(`APP_ID ${config.appId || ''}`);
console.log(`WEB_DIR ${config.webDir || ''}`);

if (!ok) process.exit(1);
