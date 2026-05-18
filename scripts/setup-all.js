#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const pkgPath = path.join(root, 'package.json');
const args = process.argv.slice(2);

const options = {
  api: '',
  install: true,
  android: true,
  ios: true,
  desktop: true,
  sync: true,
  buildDesktop: false,
  openAndroid: false,
  openIos: false,
  local: false,
  all: false,
};

for (const arg of args) {
  if (arg.startsWith('--api=')) options.api = arg.slice('--api='.length).trim();
  else if (arg === '--all') options.all = true;
  else if (arg === '--local') options.local = true;
  else if (arg === '--skip-install') options.install = false;
  else if (arg === '--no-android') options.android = false;
  else if (arg === '--android') options.android = true;
  else if (arg === '--ios') options.ios = true;
  else if (arg === '--no-ios') options.ios = false;
  else if (arg === '--no-desktop') options.desktop = false;
  else if (arg === '--desktop') options.desktop = true;
  else if (arg === '--no-sync') options.sync = false;
  else if (arg === '--build-desktop') options.buildDesktop = true;
  else if (arg === '--open-android') options.openAndroid = true;
  else if (arg === '--open-ios') options.openIos = true;
  else if (arg === '--help' || arg === '-h') help(0);
  else {
    console.error(`Unknown option: ${arg}`);
    help(1);
  }
}

function help(code) {
  console.log(`OrderPilot one-command setup\n\nUsage:\n  node scripts/setup-all.js --all --api=https://api.your-domain.co.il\n\nOne command for everything:\n  node scripts/setup-all.js --all --api=https://api.your-domain.co.il\n\nLocal test on this computer:\n  node scripts/setup-all.js --all --local\n\nOptions:\n  --api=URL         Configure Android, iOS and desktop to use this server URL\n  --local           Use local/relative API for testing on this computer\n  --all             Prepare server checks, Android, iOS where available, and desktop\n  --no-android      Skip Android project preparation\n  --no-ios          Skip iOS project preparation\n  --no-desktop      Skip Electron desktop preparation\n  --build-desktop   Build desktop installer with electron-builder\n  --open-android    Open Android Studio after sync\n  --open-ios        Open Xcode after sync. Requires macOS\n  --skip-install    Do not run npm install\n\nNotes:\n  Android requires Android Studio / SDK.\n  iOS requires macOS + Xcode for native build/open. On Windows this script will keep going and clearly explain that iOS must be built on a Mac.\n`);
  process.exit(code);
}

function log(title) {
  console.log(`\n=== ${title} ===`);
}

function cmdName(base) {
  if (process.platform === 'win32' && (base === 'npm' || base === 'npx')) return `${base}.cmd`;
  return base;
}

function quoteForPrint(value) {
  const s = String(value);
  return /\s/.test(s) ? `"${s}"` : s;
}

function quoteForShell(value) {
  const s = String(value);
  if (process.platform === 'win32') {
    return '"' + s.replace(/"/g, '\"') + '"';
  }
  return "'" + s.replace(/'/g, "'\''") + "'";
}

function run(command, commandArgs = [], extra = {}) {
  const resolvedCommand = cmdName(command);
  const printable = [resolvedCommand, ...commandArgs].map(quoteForPrint).join(' ');
  console.log(`$ ${printable}`);

  let result;
  if (process.platform === 'win32') {
    // PowerShell/cmd on Windows can fail with spawnSync EINVAL for npm.cmd or
    // executables under "Program Files" when shell:false. Run through the shell
    // with explicit quoting so one-command setup works from PowerShell.
    const commandLine = [resolvedCommand, ...commandArgs].map(quoteForShell).join(' ');
    result = spawnSync(commandLine, [], {
      cwd: root,
      stdio: 'inherit',
      shell: true,
      windowsHide: false,
      env: { ...process.env, ...extra.env },
    });
  } else {
    result = spawnSync(resolvedCommand, commandArgs, {
      cwd: root,
      stdio: 'inherit',
      shell: false,
      env: { ...process.env, ...extra.env },
    });
  }

  if (result.error) {
    if (extra.optional) {
      console.warn(`[WARN] Optional step failed: ${printable}`);
      console.warn(`[WARN] ${result.error.message}`);
      return false;
    }
    console.error(`\n[ERROR] Step failed: ${printable}`);
    console.error(result.error.message);
    process.exit(1);
  }
  if (result.status !== 0) {
    if (extra.optional) {
      console.warn(`[WARN] Optional step failed: ${printable}`);
      return false;
    }
    console.error(`\n[ERROR] Step failed: ${printable}`);
    process.exit(result.status || 1);
  }
  return true;
}


function findNodeToolCli(tool) {
  // On Windows, running npm.cmd/npx.cmd from spawn/shell can accidentally pick
  // a broken local shim in node_modules. Use the npm CLI bundled with the
  // installed Node.js executable instead.
  const binName = tool === 'npx' ? 'npx-cli.js' : 'npm-cli.js';
  const candidates = [];
  const nodeDir = path.dirname(process.execPath);
  candidates.push(path.join(nodeDir, 'node_modules', 'npm', 'bin', binName));
  candidates.push(path.join(nodeDir, '..', 'node_modules', 'npm', 'bin', binName));
  if (process.env.NPM_CLI_JS) candidates.unshift(process.env.NPM_CLI_JS);
  if (process.env.npm_execpath && tool === 'npm') candidates.unshift(process.env.npm_execpath);
  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) return path.resolve(candidate);
  }
  return '';
}

function runNpm(args = [], extra = {}) {
  if (process.platform === 'win32') {
    const cli = findNodeToolCli('npm');
    if (cli) return run(process.execPath, [cli, ...args], extra);
    console.warn('[WARN] Could not locate global npm-cli.js; falling back to npm through shell.');
  }
  return run('npm', args, extra);
}

function runNpx(args = [], extra = {}) {
  if (process.platform === 'win32') {
    const cli = findNodeToolCli('npx');
    if (cli) return run(process.execPath, [cli, ...args], extra);
    console.warn('[WARN] Could not locate global npx-cli.js; falling back to npx through shell.');
  }
  return run('npx', args, extra);
}

function exists(rel) {
  return fs.existsSync(path.join(root, rel));
}

function writeFile(rel, content) {
  fs.writeFileSync(path.join(root, rel), content);
}

function readJson(rel) {
  return JSON.parse(fs.readFileSync(path.join(root, rel), 'utf8'));
}

function semverMajor(version) {
  const match = String(version || '').match(/v?(\d+)/);
  return match ? Number(match[1]) : 0;
}

function createEnv() {
  const envPath = path.join(root, '.env');
  if (fs.existsSync(envPath)) {
    console.log('.env already exists, leaving it unchanged.');
    return;
  }
  const api = options.local ? '' : options.api;
  const content = [
    '# OrderPilot environment',
    `ORDERPILOT_API_BASE_URL=${api}`,
    `ORDERPILOT_SERVER_URL=${api}`,
    `ORDERPILOT_DESKTOP_MODE=${api ? 'remote' : 'local'}`,
    'PORT=3000',
    'NODE_ENV=development',
    '',
  ].join('\n');
  writeFile('.env', content);
  console.log('Created .env');
}

function configureTarget(target, env = {}) {
  run(process.execPath, ['scripts/configure-target.js', target], { env });
}

function ensureCapacitorPlatform(platform) {
  const folder = platform === 'android' ? 'android' : 'ios';
  if (exists(folder)) {
    console.log(`${platform} project already exists, skipping cap add ${platform}.`);
    return true;
  }
  if (platform === 'ios' && process.platform !== 'darwin') {
    console.warn('[WARN] iOS native project/build requires macOS + Xcode. Skipping cap add ios on this computer.');
    console.warn('[WARN] Run the same one command on a Mac to create/open/build the iOS app.');
    return false;
  }
  return runNpx(['cap', 'add', platform], { optional: true });
}

function runStaticChecks() {
  const checks = [
    'server.js',
    'public/admin.js',
    'public/app.js',
    'public/mobile.js',
    'desktop/main.js',
    'desktop/preload.js',
    'scripts/project-doctor.js',
    'scripts/mobile-doctor.js',
    'scripts/setup-all.js',
  ];
  for (const file of checks) {
    if (exists(file)) run(process.execPath, ['--check', file]);
  }
  run(process.execPath, ['scripts/project-doctor.js']);
  run(process.execPath, ['scripts/mobile-doctor.js']);
}


function isHttpLocalApi(api) {
  return /^http:\/\//i.test(String(api || ''));
}

function updateCapacitorForApi(api) {
  const cfgPath = path.join(root, 'capacitor.config.json');
  if (!fs.existsSync(cfgPath)) return;
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  cfg.server = cfg.server || {};
  if (isHttpLocalApi(api)) {
    cfg.server.cleartext = true;
    cfg.server.androidScheme = 'http';
  } else {
    cfg.server.cleartext = false;
    cfg.server.androidScheme = 'https';
  }
  fs.writeFileSync(cfgPath, JSON.stringify(cfg, null, 2));
  console.log(`Capacitor cleartext ${cfg.server.cleartext ? 'enabled' : 'disabled'} for API ${api || '(relative)'}`);
}

function ensureAndroidCleartext(api) {
  if (!isHttpLocalApi(api)) return;
  const manifestPath = path.join(root, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
  if (!fs.existsSync(manifestPath)) return;
  let text = fs.readFileSync(manifestPath, 'utf8');
  if (!/usesCleartextTraffic=/.test(text)) {
    text = text.replace(/<application\b/, '<application android:usesCleartextTraffic="true"');
  } else {
    text = text.replace(/android:usesCleartextTraffic="[^"]*"/, 'android:usesCleartextTraffic="true"');
  }
  fs.writeFileSync(manifestPath, text);
  const resXml = path.join(root, 'android', 'app', 'src', 'main', 'res', 'xml');
  fs.mkdirSync(resXml, { recursive: true });
  const netCfg = path.join(resXml, 'network_security_config.xml');
  const host = (() => { try { return new URL(apiBase).hostname; } catch (_) { return ''; } })();
  const domains = [host, 'localhost', '10.0.2.2'].filter(Boolean).map(d => `    <domain includeSubdomains=\"true\">${d}</domain>`).join('\n');
  fs.writeFileSync(netCfg, `<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<network-security-config>\n  <base-config cleartextTrafficPermitted=\"true\" />\n  <domain-config cleartextTrafficPermitted=\"true\">\n${domains}\n  </domain-config>\n</network-security-config>\n`, 'utf8');
  if (!/networkSecurityConfig=/.test(text)) text = text.replace(/<application\b/, '<application android:networkSecurityConfig=\"@xml/network_security_config\"');
  else text = text.replace(/android:networkSecurityConfig=\"[^\"]*\"/, 'android:networkSecurityConfig=\"@xml/network_security_config\"');
  fs.writeFileSync(manifest, text);
  console.log('Android cleartext traffic and network security config enabled for local HTTP testing.');
}

function printLocalHelp(api) {
  if (!isHttpLocalApi(api)) return;
  console.log('\nLocal phone test checklist:');
  console.log(`  1. Keep the server running: npm start`);
  console.log(`  2. On the phone browser, open: ${api.replace(/\/$/, '')}/api/health`);
  console.log('  3. If it does not open, allow Windows Firewall TCP 3000:');
  console.log('     netsh advfirewall firewall add rule name="OrderPilot Local Server 3000" dir=in action=allow protocol=TCP localport=3000');
  console.log('  4. Make sure the phone and computer are on the same Wi-Fi and not isolated by router guest mode.');
}

log('Preflight');
const major = semverMajor(process.version);
console.log(`Node: ${process.version}`);
if (major < 22) {
  console.error('Node.js 22 or newer is required for this project.');
  process.exit(1);
}
if (!fs.existsSync(pkgPath)) {
  console.error('package.json not found. Run this command from the project root.');
  process.exit(1);
}
if (!options.local && !options.api) {
  console.error('Missing --api=https://... for real mobile/remote setup. Use --local for local testing.');
  help(1);
}

const pkg = readJson('package.json');
console.log(`Project: ${pkg.name} v${pkg.version}`);
createEnv();
const activeApi = options.local ? '' : options.api;
updateCapacitorForApi(activeApi);

if (options.install) {
  log('Install dependencies');
  runNpm(['install']);
}

log('Static checks');
runStaticChecks();

log('Configure shared app target');
if (options.local) {
  configureTarget('web', { ORDERPILOT_ENV: 'local', ORDERPILOT_API_BASE_URL: '' });
} else {
  configureTarget('mobile', { ORDERPILOT_ENV: 'production', ORDERPILOT_API_BASE_URL: options.api });
}

if (options.android || options.ios) {
  log('Prepare mobile apps');
  let addedAnyPlatform = false;
  if (options.android) addedAnyPlatform = ensureCapacitorPlatform('android') || addedAnyPlatform;
  if (options.ios) addedAnyPlatform = ensureCapacitorPlatform('ios') || addedAnyPlatform;
  if (options.sync) runNpx(['cap', 'sync'], { optional: true });
  ensureAndroidCleartext(activeApi);
  if (options.openAndroid) runNpx(['cap', 'open', 'android'], { optional: true });
  if (options.openIos) {
    if (process.platform === 'darwin') runNpx(['cap', 'open', 'ios'], { optional: true });
    else console.warn('[WARN] Cannot open iOS project on Windows/Linux. Use a Mac with Xcode.');
  }
  if (!addedAnyPlatform && process.platform !== 'darwin' && options.ios) {
    console.warn('[INFO] Android/desktop can be prepared here. iOS final build must be done on macOS.');
  }
}

if (options.desktop) {
  log('Prepare desktop app');
  if (options.local) {
    configureTarget('desktop', { ORDERPILOT_ENV: 'desktop-local', ORDERPILOT_API_BASE_URL: '' });
  } else {
    configureTarget('desktop-remote', { ORDERPILOT_ENV: 'desktop-remote', ORDERPILOT_SERVER_URL: options.api, ORDERPILOT_API_BASE_URL: options.api });
  }
  if (options.buildDesktop) runNpx(['electron-builder'], { optional: true });
}

log('Done');
console.log('One command completed.');
console.log('Next useful commands:');
console.log('  Server:          npm start');
console.log('  Desktop app:     npm run desktop:dev');
if (!options.local) console.log(`  Remote desktop:  ORDERPILOT_DESKTOP_MODE=remote ORDERPILOT_SERVER_URL=${options.api} npm run desktop:dev:remote`);
if (options.android) console.log('  Android Studio:  npm run mobile:open:android');
if (options.ios) console.log('  iOS/Xcode:       run the same setup command on a Mac, then npm run mobile:open:ios');
printLocalHelp(activeApi);
console.log('\nImportant: this setup does not create or replace data/. Keep your existing data/ folder backed up.');
