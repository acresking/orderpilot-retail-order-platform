#!/usr/bin/env node
'use strict';
// Generates desktop app icons (Windows .ico, macOS .icns, Linux .png) from the
// existing OrderPilot logo (public/icon-512.png) so electron-builder stops
// falling back to the generic default Electron icon.
const fs = require('fs');
const path = require('path');
const p2i = require('png2icons');

const root = path.resolve(__dirname, '..');
const srcPng = path.join(root, 'public', 'icon-512.png');
const outDir = path.join(root, 'build');

if (!fs.existsSync(srcPng)) {
  console.error(`[generate-icons] Source PNG not found: ${srcPng}`);
  process.exit(1);
}
fs.mkdirSync(outDir, { recursive: true });

const input = fs.readFileSync(srcPng);

const ico = p2i.createICO(input, p2i.BICUBIC2, 0, true, true);
if (!ico) { console.error('[generate-icons] Failed to create .ico'); process.exit(1); }
fs.writeFileSync(path.join(outDir, 'icon.ico'), ico);
console.log('[generate-icons] Wrote build/icon.ico');

const icns = p2i.createICNS(input, p2i.BICUBIC2, 0);
if (!icns) { console.error('[generate-icons] Failed to create .icns'); process.exit(1); }
fs.writeFileSync(path.join(outDir, 'icon.icns'), icns);
console.log('[generate-icons] Wrote build/icon.icns');

fs.copyFileSync(srcPng, path.join(outDir, 'icon.png'));
console.log('[generate-icons] Wrote build/icon.png (Linux)');
