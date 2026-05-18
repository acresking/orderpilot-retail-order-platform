#!/usr/bin/env node
'use strict';

const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const mode = args.includes('--remote') ? 'remote' : 'local';
const serverUrlArg = args.find(a => a.startsWith('--server='));
const serverUrl = serverUrlArg ? serverUrlArg.slice('--server='.length) : (process.env.ORDERPILOT_SERVER_URL || process.env.ORDERPILOT_API_BASE_URL || '');

function findElectron() {
  const exe = process.platform === 'win32' ? 'electron.cmd' : 'electron';
  const local = path.join(root, 'node_modules', '.bin', exe);
  if (fs.existsSync(local)) return local;
  return exe;
}

const env = { ...process.env, ORDERPILOT_DESKTOP_MODE: mode };
if (mode === 'remote' && serverUrl) env.ORDERPILOT_SERVER_URL = serverUrl;

const electron = findElectron();
const result = spawnSync(electron, ['desktop/main.js'], {
  cwd: root,
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env,
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}
process.exit(result.status || 0);
