'use strict';
// Persistent, encrypted registry of every client the generator has created — this is what makes
// the generator "remember every company I created" across restarts.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { encryptJsonString, decryptJsonString } = require('./crypto-utils');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const ENV_PATH = path.join(ROOT, '.env');
const REGISTRY_PATH = path.join(DATA_DIR, 'clients.json');

function loadOrCreateKey() {
  let env = '';
  try { env = fs.readFileSync(ENV_PATH, 'utf8'); } catch (_) {}
  const match = env.match(/GENERATOR_KEY=([0-9a-f]{64})/);
  if (match) return Buffer.from(match[1], 'hex');
  const key = crypto.randomBytes(32);
  fs.mkdirSync(ROOT, { recursive: true });
  fs.appendFileSync(ENV_PATH, `${env && !env.endsWith('\n') ? '\n' : ''}GENERATOR_KEY=${key.toString('hex')}\n`);
  return key;
}

const KEY = loadOrCreateKey();

function load() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(REGISTRY_PATH)) return { clients: [] };
  const raw = fs.readFileSync(REGISTRY_PATH, 'utf8');
  try {
    return JSON.parse(decryptJsonString(raw, KEY));
  } catch (err) {
    console.error(`[generator] Failed to read clients.json: ${err.message}`);
    throw err;
  }
}

function save(registry) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const tmp = `${REGISTRY_PATH}.tmp`;
  fs.writeFileSync(tmp, encryptJsonString(JSON.stringify(registry, null, 2), KEY), 'utf8');
  fs.renameSync(tmp, REGISTRY_PATH);
}

function addClient(entry) {
  const registry = load();
  registry.clients.push(entry);
  save(registry);
  return entry;
}

function updateClient(id, patch) {
  const registry = load();
  const client = registry.clients.find(c => c.id === id);
  if (!client) return null;
  Object.assign(client, patch);
  save(registry);
  return client;
}

function listClients() {
  return load().clients;
}

module.exports = { load, save, addClient, updateClient, listClients };
