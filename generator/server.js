'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync, exec } = require('child_process');
const AdmZip = require('adm-zip');
const { FEATURES, EXTRA_DELIVERY_TYPE_PRICE, defaultFeatureIds, priceFor } = require('../platform/src/shared/features');
const { createClient, VENDOR_EMAIL, patchClientBranding } = require('./lib/create-client');
const registry = require('./lib/registry');

const PORT = Number(process.env.GENERATOR_PORT || 4100);
const PUBLIC_DIR = path.join(__dirname, 'public');
const PLATFORM_DIR = path.join(__dirname, '..', 'platform');
const EXPORTS_DIR = path.join(__dirname, 'exports');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.zip': 'application/zip' };

function platformVersion() {
  try { return JSON.parse(fs.readFileSync(path.join(PLATFORM_DIR, 'package.json'), 'utf8')).version; }
  catch (_) { return '0.0.0'; }
}

// Walks a directory and returns { abs, rel } for every file, skipping any directory
// named in ignoreDirs (used to keep the large, static tesseract vendor bundle out of
// update packages — it doesn't change between code releases).
function collectFiles(absDir, baseDir, ignoreDirs) {
  let results = [];
  for (const entry of fs.readdirSync(absDir, { withFileTypes: true })) {
    if (ignoreDirs.includes(entry.name)) continue;
    const abs = path.join(absDir, entry.name);
    if (entry.isDirectory()) results = results.concat(collectFiles(abs, baseDir, ignoreDirs));
    else results.push({ abs, rel: path.relative(baseDir, abs).split(path.sep).join('/') });
  }
  return results;
}

function exportUpdatePackage() {
  const version = platformVersion();
  fs.mkdirSync(EXPORTS_DIR, { recursive: true });
  const zip = new AdmZip();
  const targets = [
    { dir: path.join(PLATFORM_DIR, 'src'), zipBase: 'src', ignoreDirs: [] },
    { dir: path.join(PLATFORM_DIR, 'public'), zipBase: 'public', ignoreDirs: ['vendor'] },
    { dir: path.join(PLATFORM_DIR, 'scripts'), zipBase: 'scripts', ignoreDirs: [] },
  ];
  for (const t of targets) {
    if (!fs.existsSync(t.dir)) continue;
    for (const f of collectFiles(t.dir, t.dir, t.ignoreDirs)) {
      zip.addFile(`${t.zipBase}/${f.rel}`, fs.readFileSync(f.abs));
    }
  }
  zip.addFile('server.js', fs.readFileSync(path.join(PLATFORM_DIR, 'server.js')));
  zip.addFile('package.json', fs.readFileSync(path.join(PLATFORM_DIR, 'package.json')));
  const fileName = `OrderPilot-Update-v${version}.zip`;
  const outPath = path.join(EXPORTS_DIR, fileName);
  zip.writeZip(outPath);
  return { fileName, version, size: fs.statSync(outPath).size, createdAt: new Date().toISOString() };
}

function listExports() {
  fs.mkdirSync(EXPORTS_DIR, { recursive: true });
  return fs.readdirSync(EXPORTS_DIR)
    .filter(f => f.toLowerCase().endsWith('.zip'))
    .map(f => { const st = fs.statSync(path.join(EXPORTS_DIR, f)); return { fileName: f, size: st.size, createdAt: st.mtime.toISOString() }; })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function sendJson(res, status, payload) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (c) => {
      size += c.length;
      if (size > 30 * 1024 * 1024) { req.destroy(); reject(new Error('payload_too_large')); return; }
      chunks.push(c);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); } catch (_) { reject(new Error('invalid_json')); }
    });
    req.on('error', reject);
  });
}

function serveStatic(req, res, pathname) {
  let requested = pathname === '/' ? '/index.html' : pathname;
  const filePath = path.join(PUBLIC_DIR, requested);
  if (!filePath.startsWith(PUBLIC_DIR)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
}

// No fixed limit on palette length — one client may have a single brand color, another four or
// more; only hex format and a sane upper bound (to stop an abusive payload) are enforced here.
function sanitizeBrandColors(input) {
  if (!input || typeof input !== 'object') return null;
  const hex = /^#[0-9a-fA-F]{6}$/;
  const palette = (Array.isArray(input.palette) ? input.palette : []).filter(c => hex.test(c)).slice(0, 12);
  if (!palette.length) return null;
  return { palette };
}

function decodeDataUrl(dataUrl) {
  if (!dataUrl || typeof dataUrl !== 'string') return null;
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return { mime: match[1], buffer: Buffer.from(match[2], 'base64') };
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = url.pathname;

    if (req.method === 'GET' && pathname === '/api/features') {
      return sendJson(res, 200, { features: FEATURES, defaultFeatureIds: defaultFeatureIds(), extraDeliveryTypePrice: EXTRA_DELIVERY_TYPE_PRICE });
    }

    if (req.method === 'GET' && pathname === '/api/clients') {
      return sendJson(res, 200, { clients: registry.listClients(), vendorEmail: VENDOR_EMAIL });
    }

    if (req.method === 'POST' && pathname === '/api/price') {
      const body = await readBody(req);
      const count = Array.isArray(body.deliveryTypes) ? body.deliveryTypes.filter(t => t && t.title).length : 1;
      return sendJson(res, 200, { price: priceFor(Array.isArray(body.features) ? body.features : [], count) });
    }

    if (req.method === 'POST' && pathname === '/api/create') {
      const body = await readBody(req);
      if (!body.companyName || !body.ownerEmail || !body.ownerPassword) {
        return sendJson(res, 400, { error: 'missing_fields', message: 'צריך שם חברה, מייל וסיסמה למנהל' });
      }
      const features = Array.isArray(body.features) ? [...new Set(['core', ...body.features])] : defaultFeatureIds();
      const deliveryTypes = Array.isArray(body.deliveryTypes) ? body.deliveryTypes.filter(t => t && t.title) : [];
      const logo = decodeDataUrl(body.logoDataUrl);
      const brandColors = sanitizeBrandColors(body.brandColors);

      const result = await createClient({
        companyName: body.companyName,
        contactEmail: body.contactEmail || '',
        contactPhone: body.contactPhone || '',
        ownerEmail: body.ownerEmail,
        ownerPassword: body.ownerPassword,
        features,
        deliveryTypes,
        logo,
        brandColors,
      });

      const price = priceFor(features, deliveryTypes.length || 1);
      const entry = {
        id: `client-${Date.now()}`,
        name: body.companyName,
        folderName: result.slug,
        createdAt: new Date().toISOString(),
        contact: { email: body.contactEmail || '', phone: body.contactPhone || '' },
        ownerEmail: body.ownerEmail,
        features,
        price,
        hasLogo: !!logo,
        brandColors,
        notes: typeof body.notes === 'string' ? body.notes.slice(0, 4000) : '',
        currentVersionSent: null,
        lastUpdatedAt: null,
      };
      registry.addClient(entry);

      return sendJson(res, result.buildOk ? 201 : 207, {
        ok: result.buildOk,
        client: entry,
        folderPath: result.clientDir,
        installOk: result.installOk,
        buildOk: result.buildOk,
        log: result.log,
      });
    }

    if (req.method === 'POST' && pathname === '/api/export-update') {
      const info = exportUpdatePackage();
      return sendJson(res, 201, { ok: true, ...info });
    }

    if (req.method === 'GET' && pathname === '/api/exports') {
      return sendJson(res, 200, { exports: listExports(), platformVersion: platformVersion() });
    }

    if (req.method === 'GET' && pathname.startsWith('/api/exports/')) {
      const fileName = decodeURIComponent(pathname.slice('/api/exports/'.length));
      if (!fileName || fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) return sendJson(res, 400, { error: 'invalid_filename' });
      const filePath = path.join(EXPORTS_DIR, fileName);
      if (!fs.existsSync(filePath)) return sendJson(res, 404, { error: 'not_found' });
      res.writeHead(200, { 'Content-Type': 'application/zip', 'Content-Disposition': `attachment; filename="${fileName}"`, 'Cache-Control': 'no-store' });
      return fs.createReadStream(filePath).pipe(res);
    }

    if (req.method === 'POST' && pathname.match(/^\/api\/clients\/[^/]+\/mark-sent$/)) {
      const id = pathname.split('/')[3];
      const body = await readBody(req);
      const client = registry.updateClient(id, { currentVersionSent: body.version || platformVersion(), lastUpdatedAt: new Date().toISOString() });
      if (!client) return sendJson(res, 404, { error: 'not_found' });
      return sendJson(res, 200, { ok: true, client });
    }

    if (req.method === 'POST' && pathname.match(/^\/api\/clients\/[^/]+\/customize$/)) {
      const id = pathname.split('/')[3];
      const body = await readBody(req);
      const client = registry.listClients().find(c => c.id === id);
      if (!client) return sendJson(res, 404, { error: 'not_found' });
      const patch = {};
      if (body.notes !== undefined) patch.notes = String(body.notes || '').slice(0, 4000);
      let brandColors;
      if (body.brandColors !== undefined) {
        brandColors = sanitizeBrandColors(body.brandColors);
        patch.brandColors = brandColors;
      }
      const updated = registry.updateClient(id, patch);
      if (brandColors !== undefined) {
        const clientDir = path.join(__dirname, '..', 'clients', client.folderName);
        try {
          patchClientBranding(clientDir, { brandColors });
        } catch (err) {
          return sendJson(res, 207, { ok: false, client: updated, message: `נשמר ברישום, אך עדכון קובץ הלקוח נכשל: ${err.message}. ודאו שהשרת של הלקוח אינו פעיל ונסו שוב.` });
        }
      }
      return sendJson(res, 200, { ok: true, client: updated });
    }

    if (req.method === 'POST' && pathname === '/api/open-folder') {
      const body = await readBody(req);
      const client = registry.listClients().find(c => c.id === body.id);
      if (!client) return sendJson(res, 404, { error: 'not_found' });
      const folderPath = path.join(__dirname, '..', 'clients', client.folderName);
      exec(`start "" "${folderPath}"`, { windowsHide: false });
      return sendJson(res, 200, { ok: true });
    }

    if (req.method !== 'GET' && req.method !== 'HEAD' && !pathname.startsWith('/api/')) {
      res.writeHead(404); return res.end('Not found');
    }
    if (!pathname.startsWith('/api/')) return serveStatic(req, res, pathname);
    return sendJson(res, 404, { error: 'not_found' });
  } catch (err) {
    console.error('[generator-error]', err.stack || err);
    sendJson(res, 500, { error: 'server_error', message: err.message });
  }
});

server.listen(PORT, '127.0.0.1', () => {
  const url = `http://127.0.0.1:${PORT}`;
  console.log(`\nOrderPilot Generator running at ${url}\n`);
  if (process.platform === 'win32') exec(`start "" "${url}"`);
});
