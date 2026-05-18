'use strict';
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
function arg(name, def=''){
  const pref='--'+name+'=';
  const hit=process.argv.find(a=>a.startsWith(pref));
  if(hit) return hit.slice(pref.length);
  const idx=process.argv.indexOf('--'+name);
  if(idx>=0 && process.argv[idx+1]) return process.argv[idx+1];
  return def;
}
function has(flag){ return process.argv.includes('--'+flag); }
function run(cmd,args,opts={}){
  console.log('$ '+[cmd,...args].join(' '));
  const res=spawnSync(cmd,args,{cwd:root,stdio:'inherit',shell:process.platform==='win32',...opts});
  if(res.status!==0) process.exit(res.status||1);
}
function capture(cmd,args){
  const res=spawnSync(cmd,args,{cwd:root,encoding:'utf8',shell:process.platform==='win32'});
  return {code:res.status||0, out:(res.stdout||'').trim(), err:(res.stderr||'').trim()};
}
function ensureGitignore(){
  const gi=path.join(root,'.gitignore');
  const required=['node_modules/','data/','.env','dist-desktop/','dist-installers/','dist-server/','android/','ios/','*.keystore','*.jks','*.p12','*.mobileprovision'];
  let text=fs.existsSync(gi)?fs.readFileSync(gi,'utf8'):'';
  for(const line of required){ if(!text.split(/\r?\n/).includes(line)) text += (text.endsWith('\n')?'':'\n')+line+'\n'; }
  fs.writeFileSync(gi,text);
}
const repo=arg('repo') || path.basename(root).replace(/[^a-zA-Z0-9_.-]/g,'-');
const visibility=has('public')?'--public':'--private';
const gh=capture('gh',['--version']);
if(gh.code!==0){
  console.error('\nGitHub CLI is not installed or not in PATH.');
  console.error('Install it from https://cli.github.com/ then run: gh auth login');
  console.error('After that run: node scripts/github-create.js --repo='+repo+' --private');
  process.exit(1);
}
const auth=capture('gh',['auth','status']);
if(auth.code!==0){
  console.error('\nYou are not logged in to GitHub CLI. Run first:');
  console.error('  gh auth login');
  console.error('Then run again:');
  console.error('  node scripts/github-create.js --repo='+repo);
  process.exit(1);
}
ensureGitignore();
if(!fs.existsSync(path.join(root,'.git'))) run('git',['init']);
run('git',['add','.']);
const status=capture('git',['status','--porcelain']);
if(status.out) run('git',['commit','-m','Initial OrderPilot app']);
else console.log('No new files to commit.');
const rem=capture('git',['remote','get-url','origin']);
if(rem.code===0 && rem.out){ console.log('Origin already exists: '+rem.out); }
else run('gh',['repo','create',repo,visibility,'--source','.', '--remote','origin','--push']);
if(rem.code===0 && rem.out) run('git',['push','-u','origin','main'],{stdio:'inherit'});
console.log('\nGitHub repository is ready. data/ and secrets were ignored.');
