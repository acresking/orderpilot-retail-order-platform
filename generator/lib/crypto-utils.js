'use strict';
// Small, self-contained duplicates of the crypto helpers from platform/src/server/index.js.
// Duplicated (not required from the platform) on purpose: that file starts an HTTP server and
// binds a port as a side effect of being required, which this tool must never do to itself or
// to a client it's about to seed. Keep these in sync with the platform if the hashing scheme
// there ever changes.
const crypto = require('crypto');

function scryptHash(password, salt) {
  return crypto.scryptSync(String(password || ''), salt, 64).toString('hex');
}

function passwordRecord(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  return { algo: 'scrypt', salt, hash: scryptHash(password, salt) };
}

function randomHex(bytes) {
  return crypto.randomBytes(bytes).toString('hex');
}

function encryptJsonString(str, key) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const enc = Buffer.concat([cipher.update(str, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return JSON.stringify({ __enc: 1, iv: iv.toString('hex'), tag: tag.toString('hex'), data: enc.toString('hex') });
}

function decryptJsonString(raw, key) {
  let parsed;
  try { parsed = JSON.parse(raw); } catch { return raw; }
  if (!parsed || parsed.__enc !== 1) return raw;
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(parsed.iv, 'hex'));
  decipher.setAuthTag(Buffer.from(parsed.tag, 'hex'));
  const dec = Buffer.concat([decipher.update(Buffer.from(parsed.data, 'hex')), decipher.final()]);
  return dec.toString('utf8');
}

function makeId(prefix) {
  return `${prefix}-${new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14)}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

module.exports = { scryptHash, passwordRecord, randomHex, encryptJsonString, decryptJsonString, makeId };
