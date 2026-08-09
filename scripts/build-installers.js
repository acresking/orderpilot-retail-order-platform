#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const XML_HEADER = '<?xml version="1.0" encoding="utf-8"?>';
const args = process.argv.slice(2);

const opt = {
  all: false,
  api: '',
  local: false,
  install: true,
  android: false,
  ios: false,
  desktop: false,
  server: false,
  debugApk: false,
  installer: true,
  openAndroid: false,
  openDesktopFolder: true,
};

for (const arg of args) {
  if (arg === '--all') opt.all = true;
  else if (arg === '--local') opt.local = true;
  else if (arg.startsWith('--api=')) opt.api = arg.slice(6).trim();
  else if (arg === '--skip-install') opt.install = false;
  else if (arg === '--android') opt.android = true;
  else if (arg === '--ios') opt.ios = true;
  else if (arg === '--desktop') opt.desktop = true;
  else if (arg === '--server') opt.server = true;
  else if (arg === '--debug-apk') opt.debugApk = true;
  else if (arg === '--no-installer') opt.installer = false;
  else if (arg === '--open-android') opt.openAndroid = true;
  else if (arg === '--no-open-folder') opt.openDesktopFolder = false;
  else if (arg === '--help' || arg === '-h') help(0);
  else { console.error(`Unknown option: ${arg}`); help(1); }
}
if (opt.all || (!opt.android && !opt.ios && !opt.desktop && !opt.server)) {
  opt.android = true;
  opt.ios = true;
  opt.desktop = true;
  opt.server = true;
}

function help(code) {
  console.log(`OrderPilot build/installable creator\n\nOne command for local testing from your PC:\n  node scripts/build-installers.js --all --local\n\nOne command for a real server URL:\n  node scripts/build-installers.js --all --api=https://api.your-domain.co.il\n\nOutputs:\n  dist-installers/android/OrderPilot-Android.apk (signed release; auto-generates a release keystore on first build)\n  dist-installers/android/OrderPilot-Android.aab (signed release, for Google Play)\n  dist-desktop/OrderPilot Admin Setup*.exe or portable app\n  dist-server/orderpilot-server/\n\nOptions:\n  --local          Detect this PC LAN IP and configure Android/desktop to http://IP:3000\n  --api=URL        Configure apps to a specific server URL\n  --all            Build Android, desktop and server package\n  --android        Build Android only\n  --desktop        Build desktop installer only\n  --server         Package server only\n  --ios            Prepare iOS project if running on macOS\n  --skip-install   Do not run npm install\n  --debug-apk      Build a fast debug-signed APK instead of a signed release build\n`);
  process.exit(code);
}
function log(title){ console.log(`\n=== ${title} ===`); }
function exists(rel){ return fs.existsSync(path.join(root, rel)); }
function mkdir(rel){ fs.mkdirSync(path.join(root, rel), { recursive: true }); }
function copyFile(src, dst){ fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.copyFileSync(src, dst); }
function isWin(){ return process.platform === 'win32'; }
function quote(s){ s=String(s); return /[\s()]/.test(s) ? '"' + s.replace(/"/g,'\\"') + '"' : s; }
function cmdline(cmd, a){ return [cmd, ...a].map(quote).join(' '); }
function run(cmd, a = [], options = {}) {
  const line = cmdline(cmd, a);
  console.log(`$ ${line}`);
  const res = spawnSync(isWin() ? line : cmd, isWin() ? [] : a, {
    cwd: options.cwd || root,
    stdio: 'inherit',
    shell: isWin(),
    env: { ...process.env, ...options.env },
  });
  if (res.error || res.status !== 0) {
    const message = res.error ? res.error.message : `exit ${res.status}`;
    if (options.optional) {
      console.warn(`[WARN] Optional step failed: ${line}`);
      console.warn(`[WARN] ${message}`);
      return false;
    }
    console.error(`\n[ERROR] Step failed: ${line}`);
    console.error(message);
    process.exit(res.status || 1);
  }
  return true;
}
function npmCli(tool){
  if (!isWin()) return tool;
  const bin = tool === 'npx' ? 'npx-cli.js' : 'npm-cli.js';
  const nodeDir = path.dirname(process.execPath);
  const p = path.join(nodeDir, 'node_modules', 'npm', 'bin', bin);
  if (fs.existsSync(p)) return { node: process.execPath, cli: p };
  return tool + '.cmd';
}
function runNpm(a, options={}){ const c=npmCli('npm'); return typeof c==='object' ? run(c.node, [c.cli, ...a], options) : run(c, a, options); }
function runNpx(a, options={}){ const c=npmCli('npx'); return typeof c==='object' ? run(c.node, [c.cli, ...a], options) : run(c, a, options); }
function getLanIp(){
  const nets = os.networkInterfaces();
  const candidates=[];
  const badNames = /vmware|virtualbox|vbox|hyper-v|vethernet|wsl|docker|loopback|bluetooth/i;
  for (const [name, entries] of Object.entries(nets)) {
    if (badNames.test(name)) continue;
    for (const n of entries || []) {
      if (n.family !== 'IPv4' || n.internal) continue;
      if (/^169\.254\./.test(n.address) || /^127\./.test(n.address)) continue;
      candidates.push({ name, address: n.address });
    }
  }
  const preferred = candidates.find(x => /wi-?fi|wireless|wlan|ethernet/i.test(x.name)) || candidates[0];
  if (preferred) return preferred.address;

  // Fallback: include virtual adapters only if there is no better address.
  for (const [name, entries] of Object.entries(nets)) {
    for (const n of entries || []) {
      if (n.family === 'IPv4' && !n.internal && !/^169\.254\./.test(n.address) && !/^127\./.test(n.address)) {
        return n.address;
      }
    }
  }
  return '127.0.0.1';
}
function apiUrl(){
  if (opt.api) return opt.api.replace(/\/$/, '');
  if (opt.local) return `http://${getLanIp()}:3000`;
  console.error('Missing --api=... or --local');
  process.exit(1);
}
function configureEnv(url){
  // Merge into the existing .env rather than overwriting it wholesale — server-generated secrets
  // like CODE_PEPPER / DATA_ENCRYPTION_KEY (auto-created on first run) must survive a rebuild, or
  // encrypted data becomes unrecoverable and existing access codes stop matching.
  const envPath = path.join(root, '.env');
  const existing = {};
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eq = trimmed.indexOf('=');
      if (eq < 0) continue;
      existing[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
    }
  }
  Object.assign(existing, {
    ORDERPILOT_API_BASE_URL: url,
    ORDERPILOT_SERVER_URL: url,
    ORDERPILOT_DESKTOP_MODE: url.startsWith('http://127.') || url.startsWith('http://localhost') ? 'local' : 'remote',
    ORDERPILOT_HOST: existing.ORDERPILOT_HOST || '0.0.0.0',
    PORT: existing.PORT || '3000',
    NODE_ENV: existing.NODE_ENV || 'development',
  });
  const env = ['# OrderPilot environment', ...Object.entries(existing).map(([k, v]) => `${k}=${v}`), ''].join('\n');
  fs.writeFileSync(envPath, env, 'utf8');
  console.log(`Configured .env for ${url}`);
}
function enableAndroidCleartext(url){
  if (!/^http:\/\//i.test(url)) return;
  const manifest = path.join(root, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
  if (!fs.existsSync(manifest)) return;
  const host = (() => { try { return new URL(url).hostname; } catch (_) { return ''; } })();
  const resXml = path.join(root, 'android', 'app', 'src', 'main', 'res', 'xml');
  fs.mkdirSync(resXml, { recursive: true });
  const netCfg = path.join(resXml, 'network_security_config.xml');
  const domains = [host, 'localhost', '10.0.2.2'].filter(Boolean);
  const domainXml = domains.map(d => `    <domain includeSubdomains="true">${d}</domain>`).join('\n');
  fs.writeFileSync(netCfg, `${XML_HEADER}\n<network-security-config>\n  <base-config cleartextTrafficPermitted="true" />\n  <domain-config cleartextTrafficPermitted="true">\n${domainXml}\n  </domain-config>\n</network-security-config>\n`, 'utf8');
  let text = fs.readFileSync(manifest, 'utf8');
  const ensurePermission = (perm) => {
    const needle = `android.permission.${perm}`;
    if (!text.includes(needle)) text = text.replace(/<manifest([^>]*)>/, `<manifest$1>\n    <uses-permission android:name="${needle}" />`);
  };
  ['INTERNET','ACCESS_NETWORK_STATE','CAMERA','POST_NOTIFICATIONS','READ_MEDIA_IMAGES'].forEach(ensurePermission);
  if (!/usesCleartextTraffic=/.test(text)) text = text.replace(/<application\b/, '<application android:usesCleartextTraffic="true"');
  else text = text.replace(/android:usesCleartextTraffic="[^"]*"/, 'android:usesCleartextTraffic="true"');
  if (!/networkSecurityConfig=/.test(text)) text = text.replace(/<application\b/, '<application android:networkSecurityConfig="@xml/network_security_config"');
  else text = text.replace(/android:networkSecurityConfig="[^"]*"/, 'android:networkSecurityConfig="@xml/network_security_config"');
  fs.writeFileSync(manifest, text);
  console.log(`Android cleartext/network security enabled for ${url}.`);
}
function ensureAndroid(){
  if (!exists('android')) runNpx(['cap','add','android']);
}
function ensureIos(){
  if (process.platform !== 'darwin') { console.warn('[WARN] iOS build requires macOS + Xcode. Run this same command on a Mac later.'); return false; }
  if (!exists('ios')) runNpx(['cap','add','ios']);
  return true;
}
function gradleCmd(){ return isWin() ? 'gradlew.bat' : './gradlew'; }
function buildAndroid(url){
  log('Android APK');
  run(process.execPath, ['scripts/configure-target.js', 'mobile'], { env: { ORDERPILOT_API_BASE_URL: url }});
  ensureAndroid();
  runNpx(['cap','sync','android']);
  enableAndroidCleartext(url);
  const androidDir = path.join(root, 'android');
  const gradle = path.join(androidDir, isWin() ? 'gradlew.bat' : 'gradlew');
  if (!fs.existsSync(gradle)) {
    console.warn('[WARN] Android Gradle wrapper not found. Open Android Studio once, let it sync, then run this command again.');
    return;
  }
  if (opt.debugApk) {
    run(gradle, ['assembleDebug'], { optional: true, cwd: androidDir });
    const debugApk = path.join(root, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
    if (fs.existsSync(debugApk)) {
      const out = path.join(root, 'dist-installers', 'android', 'OrderPilot-Android-debug.apk');
      copyFile(debugApk, out);
      console.log(`Debug APK ready: ${out}`);
    } else console.warn('[WARN] Debug APK not found.');
    return;
  }
  try { require('./ensure-android-keystore').ensureKeystore(); }
  catch (e) { console.warn(`[WARN] Could not prepare release keystore: ${e.message}. Release APK will be unsigned.`); }
  run(gradle, ['assembleRelease'], { optional: true, cwd: androidDir });
  const releaseApk = path.join(root, 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
  if (fs.existsSync(releaseApk)) {
    const out = path.join(root, 'dist-installers', 'android', 'OrderPilot-Android.apk');
    copyFile(releaseApk, out);
    console.log(`Signed release APK ready: ${out}`);
  } else {
    console.warn('[WARN] Release APK not found, falling back to a debug build.');
    run(gradle, ['assembleDebug'], { optional: true, cwd: androidDir });
    const debugApk = path.join(root, 'android', 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
    if (fs.existsSync(debugApk)) {
      const out = path.join(root, 'dist-installers', 'android', 'OrderPilot-Android-debug.apk');
      copyFile(debugApk, out);
      console.log(`Debug APK ready: ${out}`);
    } else console.warn('[WARN] APK not found. If Android Studio builds successfully, copy the APK from android/app/build/outputs/apk/.');
    return;
  }
  // Android App Bundle (.aab) — the format Google Play requires for new/updated listings. Uses
  // the same release signingConfig as the APK above; bundleRelease is available for free once the
  // com.android.application plugin is applied, no extra Gradle setup needed.
  run(gradle, ['bundleRelease'], { optional: true, cwd: androidDir });
  const releaseAab = path.join(root, 'android', 'app', 'build', 'outputs', 'bundle', 'release', 'app-release.aab');
  if (fs.existsSync(releaseAab)) {
    const out = path.join(root, 'dist-installers', 'android', 'OrderPilot-Android.aab');
    copyFile(releaseAab, out);
    console.log(`Signed release AAB ready: ${out}`);
  } else {
    console.warn('[WARN] Release AAB not found.');
  }
}
function buildIos(url){
  log('iOS project');
  if (!ensureIos()) return;
  run(process.execPath, ['scripts/configure-target.js', 'mobile'], { env: { ORDERPILOT_API_BASE_URL: url }});
  runNpx(['cap','sync','ios']);
  console.log('iOS project is ready. Open Xcode with: npm run mobile:open:ios');
}
function cleanDesktopOutput(){
  const out = path.join(root, 'dist-desktop');
  try { fs.rmSync(out, { recursive:true, force:true }); }
  catch (e) { console.warn('[WARN] Could not clean dist-desktop. Close OrderPilot desktop app and Explorer previews if build fails.'); }
}
function hasDesktopOutput(){
  const out = path.join(root, 'dist-desktop');
  if (!fs.existsSync(out)) return false;
  const names = fs.readdirSync(out);
  return names.some(n => /win-unpacked|\.exe$|portable/i.test(n));
}
function createDesktopFallback(url){
  const out = path.join(root, 'dist-desktop', 'OrderPilot-Admin-dev-runner');
  fs.rmSync(out, { recursive:true, force:true });
  fs.mkdirSync(out, { recursive:true });
  const cmd = `@echo off\r\ncd /d "${root}"\r\nset ORDERPILOT_DESKTOP_MODE=remote\r\nset ORDERPILOT_SERVER_URL=${url}\r\nnpm run desktop:dev:remote\r\npause\r\n`;
  fs.writeFileSync(path.join(out, 'OrderPilot Admin.cmd'), cmd, 'utf8');
  fs.writeFileSync(path.join(out, 'README.txt'), 'Fallback desktop launcher. It uses the installed project dependencies and opens the Electron desktop app. For a full EXE installer, enable Windows Developer Mode or run PowerShell as Administrator, then run the build again.\r\n', 'utf8');
  console.log(`Desktop fallback launcher ready: ${out}`);
}
function buildDesktop(url){
  log('Desktop installer');
  run(process.execPath, ['scripts/generate-icons.js'], { optional: true });
  cleanDesktopOutput();
  const target = opt.local ? 'desktop' : 'desktop-remote';
  run(process.execPath, ['scripts/configure-target.js', target], { env: { ORDERPILOT_API_BASE_URL: url, ORDERPILOT_SERVER_URL: url }});
  // Code signing: set CSC_LINK (path or base64 of a .pfx) + CSC_KEY_PASSWORD in the environment
  // (or .env) to have electron-builder sign the installer automatically — this is what actually
  // gets past Windows SmartScreen / Smart App Control. Without those, we explicitly disable
  // signing so electron-builder doesn't fail trying to auto-discover a certificate that isn't there.
  const hasCert = !!process.env.CSC_LINK;
  if (hasCert) console.log('CSC_LINK detected — building a SIGNED installer.');
  else console.log('No CSC_LINK set — building an UNSIGNED installer (Windows will show a publisher warning). Set CSC_LINK + CSC_KEY_PASSWORD once you have a code-signing certificate.');
  const env = hasCert ? { USE_HARD_LINKS: 'false' } : {
    CSC_IDENTITY_AUTO_DISCOVERY: 'false',
    ELECTRON_BUILDER_DISABLE_WIN_CODE_SIGN: 'true',
    USE_HARD_LINKS: 'false',
  };
  const signFlags = hasCert ? [] : ['--config.win.signAndEditExecutable=false','--config.win.signDlls=false'];
  let ok = false;
  if (opt.installer) {
    ok = runNpx(['electron-builder','--win','nsis','portable',...signFlags], { optional: true, env });
  }
  if (!ok || !hasDesktopOutput()) {
    console.warn('[WARN] Full Windows installer build failed or produced no output. Trying unpacked desktop build.');
    ok = runNpx(['electron-builder','--dir',...signFlags], { optional: true, env });
  }
  if (!hasDesktopOutput()) createDesktopFallback(url);
  console.log('Desktop output folder: dist-desktop');
  console.log('Look for "OrderPilot-Admin-Setup-*.exe" — that is the real installer (Next > Next > Finish, Start Menu shortcut, uninstaller). The plain .exe without "Setup" in the name is the portable build, which just runs without installing.');
}
function copyDir(src, dst, ignore = () => false){
  if (!fs.existsSync(src) || ignore(src)) return;
  const st = fs.statSync(src);
  if (st.isDirectory()) {
    fs.mkdirSync(dst, { recursive: true });
    for (const name of fs.readdirSync(src)) copyDir(path.join(src,name), path.join(dst,name), ignore);
  } else copyFile(src,dst);
}
function packageServer(url){
  log('Server package');
  const out = path.join(root, 'dist-server', 'orderpilot-server');
  fs.rmSync(out, { recursive:true, force:true });
  fs.mkdirSync(out, { recursive:true });
  const keep = ['server.js','package.json','.env.example','README.md','public','src','scripts'];
  for (const item of keep) {
    const src = path.join(root, item);
    if (fs.existsSync(src)) copyDir(src, path.join(out,item), p => /node_modules|^data$|dist-|android$|ios$|patch_v\d+\.py/.test(path.basename(p)));
  }
  fs.writeFileSync(path.join(out,'.env.example'), [
    'PORT=3000',
    'ORDERPILOT_HOST=0.0.0.0',
    'NODE_ENV=production',
    `ORDERPILOT_API_BASE_URL=${url}`,
    `ORDERPILOT_SERVER_URL=${url}`,
    'CODE_PEPPER=CHANGE_TO_LONG_RANDOM_SECRET',
    ''
  ].join('\n'));
  fs.writeFileSync(path.join(out,'start-server-windows.cmd'), '@echo off\ncd /d %~dp0\nnpm install --omit=dev\nnpm start\npause\n');
  fs.writeFileSync(path.join(out,'start-server-linux.sh'), '#!/usr/bin/env bash\nset -e\ncd "$(dirname "$0")"\nnpm install --omit=dev\nnpm start\n');
  fs.chmodSync(path.join(out,'start-server-linux.sh'), 0o755);
  fs.writeFileSync(path.join(out,'orderpilot.service'), `[Unit]\nDescription=OrderPilot Server\nAfter=network.target\n\n[Service]\nType=simple\nWorkingDirectory=/opt/orderpilot\nExecStart=/usr/bin/node /opt/orderpilot/server.js\nRestart=always\nRestartSec=5\nEnvironment=NODE_ENV=production\nEnvironment=PORT=3000\nEnvironment=ORDERPILOT_HOST=0.0.0.0\n\n[Install]\nWantedBy=multi-user.target\n`);
  fs.writeFileSync(path.join(out,'SERVER-INSTALL.md'), `# OrderPilot Server\n\n## Local Windows test\n\n1. Copy this folder anywhere.\n2. Run:\n\n\`\`\`powershell\nnpm install --omit=dev\nnpm start\n\`\`\`\n\n## Linux later\n\n\`\`\`bash\nsudo mkdir -p /opt/orderpilot\nsudo cp -r * /opt/orderpilot/\ncd /opt/orderpilot\nnpm install --omit=dev\nsudo cp orderpilot.service /etc/systemd/system/orderpilot.service\nsudo systemctl daemon-reload\nsudo systemctl enable --now orderpilot\n\`\`\`\n\nKeep your production data directory backed up.\n`);
  console.log(`Server package ready: ${out}`);
}
function openFolder(rel){
  const p = path.join(root, rel);
  if (!fs.existsSync(p)) return;
  if (isWin()) run('explorer.exe', [p], { optional:true });
  else if (process.platform === 'darwin') run('open', [p], { optional:true });
  else run('xdg-open', [p], { optional:true });
}

log('Preflight');
console.log(`Project: ${pkg.name} v${pkg.version}`);
console.log(`Node: ${process.version}`);
if (Number(process.version.match(/^v(\d+)/)?.[1] || 0) < 22) {
  console.error('Node.js 22 or newer is required.'); process.exit(1);
}
const url = apiUrl();
console.log(`Target server: ${url}`);
configureEnv(url);
if (opt.install) { log('Install dependencies'); runNpm(['install']); }
log('Checks');
for (const f of ['server.js','public/app.js','public/admin.js','public/mobile.js','desktop/main.js','desktop/preload.js','scripts/project-doctor.js','scripts/mobile-doctor.js']) if (exists(f)) run(process.execPath, ['--check', f]);
run(process.execPath, ['scripts/project-doctor.js']);
run(process.execPath, ['scripts/mobile-doctor.js']);
if (opt.android) buildAndroid(url);
if (opt.ios) buildIos(url);
if (opt.desktop) buildDesktop(url);
if (opt.server) packageServer(url);
log('Done');
console.log('Outputs to check:');
console.log('  Android APK:     dist-installers/android/OrderPilot-Android.apk (signed release, direct install)');
console.log('  Android AAB:     dist-installers/android/OrderPilot-Android.aab (signed release, for Google Play)');
console.log('  Desktop install: dist-desktop/');
console.log('  Server package:  dist-server/orderpilot-server/');
console.log('Run local server now with: npm run run:local');
if (opt.openDesktopFolder) openFolder('dist-installers');
