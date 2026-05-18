#!/usr/bin/env node
'use strict';
const fs=require('fs'); const path=require('path');
const root=path.resolve(__dirname,'..');
const required=['server.js','package.json','public','scripts','.gitignore','README.md'];
let ok=true;
for(const item of required){ if(!fs.existsSync(path.join(root,item))){ console.error('[MISSING]',item); ok=false; } }
const forbidden=['data','node_modules','dist-installers','dist-desktop','dist-server','.env'];
console.log('GitHub safety check');
for(const item of forbidden){ if(fs.existsSync(path.join(root,item))) console.log('[IGNORED]',item); }
const gi=fs.readFileSync(path.join(root,'.gitignore'),'utf8');
for(const item of forbidden){ if(!gi.includes(item)){ console.error('[GITIGNORE MISSING]',item); ok=false; } }
if(!ok) process.exit(1);
console.log('OK. Suggested commands:');
console.log('  git init');
console.log('  git add .');
console.log('  git commit -m "Initial OrderPilot app"');
console.log('  git branch -M main');
console.log('  git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git');
console.log('  git push -u origin main');
