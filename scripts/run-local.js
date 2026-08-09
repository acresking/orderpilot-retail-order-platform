#!/usr/bin/env node
'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const PORT = process.env.PORT || process.env.ORDERPILOT_PORT || '3000';

function readEnvFile() {
  const envPath = path.join(ROOT, '.env');
  const out = {};
  if (!fs.existsSync(envPath)) return out;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let value = m[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[m[1]] = value;
  }
  return out;
}

function parseIpFromApi(url) {
  try {
    const u = new URL(url);
    const host = u.hostname;
    if (/^\d+\.\d+\.\d+\.\d+$/.test(host)) return host;
  } catch (_) {}
  return '';
}

function scoreAddress(name, address) {
  const n = String(name || '').toLowerCase();
  if (address === '127.0.0.1') return -1000;
  if (address.startsWith('169.254.')) return -1000;
  if (n.includes('vmware') || n.includes('virtualbox') || n.includes('docker') || n.includes('hyper-v') || n.includes('wsl') || n.includes('loopback')) return -900;
  if (address.startsWith('192.168.72.') || address.startsWith('192.168.181.')) return -900;
  if (n.includes('wi-fi') || n.includes('wifi') || n.includes('wireless')) return 100;
  if (n.includes('ethernet')) return 80;
  if (address.startsWith('10.')) return 60;
  if (address.startsWith('192.168.')) return 50;
  if (address.startsWith('172.')) return 40;
  return 10;
}

function detectLanIp() {
  const env = readEnvFile();
  const explicit = process.env.ORDERPILOT_LOCAL_IP || process.env.LOCAL_IP || parseIpFromApi(process.env.ORDERPILOT_API_BASE_URL || process.env.API_BASE_URL || env.ORDERPILOT_API_BASE_URL || env.API_BASE_URL || '');
  if (explicit && !explicit.startsWith('127.')) return explicit;

  const candidates = [];
  const nets = os.networkInterfaces();
  for (const [name, entries] of Object.entries(nets)) {
    for (const entry of entries || []) {
      if (!entry || entry.family !== 'IPv4' || entry.internal) continue;
      candidates.push({ name, address: entry.address, score: scoreAddress(name, entry.address) });
    }
  }
  candidates.sort((a, b) => b.score - a.score);
  const best = candidates.find(c => c.score > -100) || candidates[0];
  return best ? best.address : '127.0.0.1';
}

const ip = detectLanIp();
const apiBase = `http://${ip}:${PORT}`;
const childEnv = {
  ...process.env,
  HOST: process.env.HOST || '0.0.0.0',
  ORDERPILOT_HOST: process.env.ORDERPILOT_HOST || '0.0.0.0',
  PORT,
  ORDERPILOT_API_BASE_URL: apiBase,
  API_BASE_URL: apiBase,
  ORDERPILOT_LOCAL_IP: ip,
};

console.log('\n==================================================');
console.log(' OrderPilot Local Server starting...');
console.log('==================================================');
console.log(` Branch App (Computer): http://127.0.0.1:${PORT}/`);
console.log(` Company Admin Panel:   http://127.0.0.1:${PORT}/admin`);
console.log(` Phone LAN App:         http://${ip}:${PORT}/`);
console.log(` Health API Check:      http://127.0.0.1:${PORT}/api/health`);
console.log('==================================================');
console.log(' Login Credentials:');
console.log('   Branch App:  Network Code: 100 | Branch Code: 12 | Password: demo');
console.log('   Admin Panel: Email: admin@company.demo | Password: admin123');
console.log('==================================================\n');

const child = spawn(process.execPath, ['server.js'], {
  cwd: ROOT,
  env: childEnv,
  stdio: 'inherit',
  shell: false,
});

child.on('exit', (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code || 0);
});
