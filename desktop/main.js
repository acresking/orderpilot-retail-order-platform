'use strict';

const { app, BrowserWindow, shell, dialog } = require('electron');
const path = require('path');
const http = require('http');
const childProcess = require('child_process');

const APP_NAME = 'OrderPilot Admin';
const DEFAULT_PORT = Number(process.env.ORDERPILOT_DESKTOP_PORT || process.env.PORT || 3000);
const MODE = process.env.ORDERPILOT_DESKTOP_MODE || 'local'; // local | remote
const REMOTE_URL = process.env.ORDERPILOT_SERVER_URL || process.env.ORDERPILOT_API_BASE_URL || '';
let serverProcess = null;
let mainWindow = null;

function adminUrl() {
  if (MODE === 'remote') {
    if (!REMOTE_URL) return '';
    return REMOTE_URL.replace(/\/$/, '') + '/admin';
  }
  return `http://127.0.0.1:${DEFAULT_PORT}/admin`;
}

function waitForHealth(url, timeoutMs = 15000) {
  const base = url.replace(/\/admin$/, '');
  const healthUrl = `${base}/api/health`;
  const started = Date.now();
  return new Promise((resolve, reject) => {
    function attempt() {
      http.get(healthUrl, (res) => {
        res.resume();
        if (res.statusCode >= 200 && res.statusCode < 500) return resolve(true);
        retry();
      }).on('error', retry);
    }
    function retry(err) {
      if (Date.now() - started > timeoutMs) return reject(err || new Error('Server did not become ready'));
      setTimeout(attempt, 350);
    }
    attempt();
  });
}

function startLocalServer() {
  if (MODE !== 'local') return Promise.resolve();
  const serverPath = path.join(__dirname, '..', 'server.js');
  serverProcess = childProcess.fork(serverPath, [], {
    cwd: path.join(__dirname, '..'),
    env: { ...process.env, PORT: String(DEFAULT_PORT), NODE_ENV: process.env.NODE_ENV || 'production' },
    stdio: ['ignore', 'pipe', 'pipe', 'ipc']
  });
  serverProcess.stdout?.on('data', d => console.log(String(d).trim()));
  serverProcess.stderr?.on('data', d => console.error(String(d).trim()));
  serverProcess.on('exit', (code) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('orderpilot-server-exit', { code });
    }
  });
  return waitForHealth(adminUrl());
}

async function createWindow() {
  const url = adminUrl();
  if (!url) {
    await dialog.showMessageBox({ type: 'error', title: APP_NAME, message: 'Missing ORDERPILOT_SERVER_URL for remote desktop mode.' });
    app.quit();
    return;
  }
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 940,
    minWidth: 1120,
    minHeight: 720,
    title: APP_NAME,
    backgroundColor: '#0f172a',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      devTools: process.env.NODE_ENV !== 'production'
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    shell.openExternal(targetUrl);
    return { action: 'deny' };
  });

  mainWindow.once('ready-to-show', () => mainWindow.show());
  await mainWindow.loadURL(url);
}

app.whenReady().then(async () => {
  try {
    await startLocalServer();
    await createWindow();
  } catch (err) {
    await dialog.showMessageBox({ type: 'error', title: APP_NAME, message: `Could not start OrderPilot.\n${err.message || err}` });
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('before-quit', () => {
  if (serverProcess && !serverProcess.killed) serverProcess.kill();
});
