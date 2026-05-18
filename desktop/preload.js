'use strict';

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('OrderPilotDesktop', {
  platform: process.platform,
  version: process.versions.electron,
  onServerExit: (callback) => ipcRenderer.on('orderpilot-server-exit', (_event, payload) => callback(payload))
});
