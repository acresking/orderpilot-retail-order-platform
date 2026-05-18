# OrderPilot v41 — Windows Build Fixes

This is a code-only update. It does not include `data/`, `node_modules/`, `android/`, `ios/`, or old patch files.

## What changed

- Fixed Android APK build on Windows by running the Gradle wrapper from `android/gradlew.bat` with the correct working directory.
- Improved local IP detection so `--local` skips VMware/VirtualBox/WSL/Docker adapters and prefers Wi-Fi/Ethernet.
- Improved desktop packaging on Windows:
  - disables automatic code-signing discovery;
  - tries a Windows portable build first;
  - falls back to unpacked desktop build;
  - if Windows symlink permissions still block electron-builder, creates a fallback desktop launcher under `dist-desktop/OrderPilot-Admin-dev-runner`.
- `flatDir should be avoided` in Android Studio is treated as a warning from Capacitor/Cordova compatibility, not as a build-blocking error.

## One command for local testing

```powershell
node scripts/build-installers.js --all --local
```

If the detected IP is wrong, pass it explicitly:

```powershell
node scripts/build-installers.js --all --api=http://10.100.102.18:3000
```

## Expected outputs

```text
dist-installers/android/OrderPilot-Android-debug.apk
dist-desktop/
dist-server/orderpilot-server/
```

## Run local server

```powershell
npm run run:local
```

Then test from the phone browser:

```text
http://YOUR_PC_IP:3000/api/health
```

## Notes

- iOS still requires macOS + Xcode.
- A production Android release APK/AAB will need signing keys.
- A production Windows installer should eventually be signed with a code-signing certificate.


## OrderPilot v43 - Android Failed to Fetch diagnostics

This update adds Android local HTTP network security configuration, a visible connection test button on the mobile login screen, and GitHub safety files. It does not include `data/`.
