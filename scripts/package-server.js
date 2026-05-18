#!/usr/bin/env node
'use strict';
const { spawnSync } = require('child_process');
const args = process.argv.slice(2);
const passthrough = ['scripts/build-installers.js', '--server', '--skip-install', ...args];
const res = spawnSync(process.execPath, passthrough, { stdio:'inherit' });
process.exit(res.status || 0);
