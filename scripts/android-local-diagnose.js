#!/usr/bin/env node
'use strict';
const fs=require('fs'); const path=require('path'); const os=require('os');
const root=path.resolve(__dirname,'..');
function read(p){ try{return fs.readFileSync(path.join(root,p),'utf8')}catch(_){return ''} }
function getConfigApi(){ const s=read('public/config.js'); const m=s.match(/API_BASE_URL:\s*"([^"]*)"/); return m?m[1]:''; }
function getIps(){ const out=[]; for(const [name,entries] of Object.entries(os.networkInterfaces())) for(const e of entries||[]) if(e.family==='IPv4'&&!e.internal) out.push(`${name}: ${e.address}`); return out; }
console.log('OrderPilot Android local diagnostics');
console.log('Configured API:', getConfigApi() || '(relative/empty)');
console.log('Local IPv4 addresses:');
console.log(getIps().map(x=>'  '+x).join('\n') || '  none');
console.log('Android manifest cleartext:', /usesCleartextTraffic="true"/.test(read('android/app/src/main/AndroidManifest.xml')) ? 'OK' : 'MISSING');
console.log('Android network security config:', fs.existsSync(path.join(root,'android/app/src/main/res/xml/network_security_config.xml')) ? 'OK' : 'MISSING');
console.log('APK path:', fs.existsSync(path.join(root,'dist-installers/android/OrderPilot-Android-debug.apk')) ? 'dist-installers/android/OrderPilot-Android-debug.apk' : 'not built');
console.log('\nPhone browser must open: ' + (getConfigApi() || 'http://YOUR_PC_IP:3000') + '/api/health');
