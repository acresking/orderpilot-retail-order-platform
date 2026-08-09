'use strict';
// Auto-generates a release signing keystore for Android builds the first time one is needed —
// the same pattern the server already uses for DATA_ENCRYPTION_KEY: nothing to set up by hand,
// nothing secret ever hardcoded or committed. Every build after the first reuses the same
// keystore, so consecutive releases keep a stable signing identity (required for Android to treat
// them as updates to the same app rather than a different one).
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');

const androidDir = path.join(__dirname, '..', 'android');
const keystorePath = path.join(androidDir, 'release.keystore');
const propertiesPath = path.join(androidDir, 'keystore.properties');

function randomPassword() {
  return crypto.randomBytes(24).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, 24);
}

function ensureKeystore() {
  if (fs.existsSync(keystorePath) && fs.existsSync(propertiesPath)) {
    console.log('[android-keystore] Existing release keystore found, reusing it.');
    return;
  }
  // PKCS12 (keytool's default keystore format since JDK 8) does not support a key password
  // different from the store password — keytool silently ignores -keypass and reuses -storepass,
  // so both properties below must actually match what was generated or Gradle's signing step
  // fails with a "keystore password was incorrect" error.
  const password = randomPassword();
  const alias = 'orderpilot';
  console.log('[android-keystore] No release keystore found — generating a new one (first release build only)...');
  execFileSync('keytool', [
    '-genkeypair',
    '-v',
    '-keystore', keystorePath,
    '-alias', alias,
    '-keyalg', 'RSA',
    '-keysize', '2048',
    '-validity', '10000',
    '-storepass', password,
    '-keypass', password,
    '-dname', 'CN=OrderPilot, OU=OrderPilot, O=OrderPilot, L=, S=, C=IL',
  ], { stdio: 'inherit' });
  const props = [
    'storeFile=release.keystore',
    `storePassword=${password}`,
    `keyAlias=${alias}`,
    `keyPassword=${password}`,
    '',
  ].join('\n');
  fs.writeFileSync(propertiesPath, props, 'utf8');
  console.log(`[android-keystore] Created ${keystorePath} and ${propertiesPath}.`);
  console.log('[android-keystore] IMPORTANT: back up both files somewhere safe outside this folder.');
  console.log('[android-keystore] Losing the keystore means future releases can never update this app again — Android requires the same signature for every update.');
}

if (require.main === module) {
  try {
    ensureKeystore();
  } catch (err) {
    console.error(`[android-keystore] Failed: ${err.message}`);
    console.error('[android-keystore] Is a JDK with keytool on PATH? Release build will proceed unsigned.');
  }
}

module.exports = { ensureKeystore, keystorePath, propertiesPath };
