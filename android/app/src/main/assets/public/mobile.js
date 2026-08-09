'use strict';

(function () {
  const cap = window.Capacitor;
  const plugins = cap?.Plugins || {};
  const isNative = !!(cap?.isNativePlatform && cap.isNativePlatform());
  const platform = cap?.getPlatform ? cap.getPlatform() : (isNative ? 'native' : 'web');
  const TOKEN_KEY = 'orderpilot_store_token_v21';
  let lastPushToken = null;

  function apiBase() {
    return String(window.ORDERPILOT_CONFIG?.API_BASE_URL || window.ORDERPILOT_CONFIG?.apiBase || '').trim().replace(/\/$/, '');
  }

  function apiUrl(path) {
    const base = apiBase();
    if (!base || !path || /^https?:\/\//i.test(path)) return path;
    return `${base}${path.startsWith('/') ? path : `/${path}`}`;
  }

  async function getToken() {
    try {
      if (plugins.Preferences?.get) {
        const result = await plugins.Preferences.get({ key: TOKEN_KEY });
        return result?.value || sessionStorage.getItem(TOKEN_KEY) || '';
      }
    } catch {}
    return sessionStorage.getItem(TOKEN_KEY) || '';
  }

  async function saveToken(token) {
    const value = String(token || '');
    if (value) sessionStorage.setItem(TOKEN_KEY, value);
    try {
      if (plugins.Preferences?.set && value) await plugins.Preferences.set({ key: TOKEN_KEY, value });
    } catch {}
  }

  async function removeToken() {
    sessionStorage.removeItem(TOKEN_KEY);
    try {
      if (plugins.Preferences?.remove) await plugins.Preferences.remove({ key: TOKEN_KEY });
    } catch {}
  }

  async function haptic(style = 'light') {
    try {
      const Haptics = plugins.Haptics;
      if (Haptics?.impact) await Haptics.impact({ style });
    } catch {}
  }

  async function registerPush() {
    try {
      if (!isNative || window.ORDERPILOT_CONFIG?.ENABLE_NATIVE_PUSH === false) return null;
      const PushNotifications = plugins.PushNotifications;
      if (!PushNotifications?.requestPermissions || !PushNotifications?.register) return null;
      const permission = await PushNotifications.requestPermissions();
      if (permission.receive !== 'granted') return null;
      const tokenPromise = new Promise(resolve => {
        let done = false;
        const finish = value => {
          if (done) return;
          done = true;
          resolve(value);
        };
        setTimeout(() => finish(lastPushToken), 8000);
        try {
          PushNotifications.addListener('registration', token => {
            lastPushToken = { token: token.value, platform, appVersion: window.ORDERPILOT_CONFIG?.APP_VERSION || '45.0.0' };
            window.dispatchEvent(new CustomEvent('orderpilot:push-token', { detail: lastPushToken }));
            finish(lastPushToken);
          });
        } catch {
          finish(null);
        }
      });
      await PushNotifications.register();
      return await tokenPromise;
    } catch {
      return null;
    }
  }

  async function networkStatus() {
    try {
      const Network = plugins.Network;
      return Network?.getStatus ? await Network.getStatus() : { connected: navigator.onLine };
    } catch {
      return { connected: navigator.onLine };
    }
  }

  async function scanBarcode() {
    try {
      const BarcodeScanner = plugins.BarcodeScanner || plugins.MLKitBarcodeScanner;
      if (BarcodeScanner?.scan) {
        const result = await BarcodeScanner.scan();
        if (Array.isArray(result?.barcodes) && result.barcodes[0]?.rawValue) return result.barcodes[0].rawValue;
        if (result?.content) return result.content;
        if (result?.text) return result.text;
      }
    } catch {}
    window.dispatchEvent(new CustomEvent('orderpilot:scan-requested'));
    return '';
  }


  async function localNotification(title, body, data = {}) {
    try {
      const LocalNotifications = plugins.LocalNotifications;
      if (!LocalNotifications?.schedule) return false;
      const permission = await LocalNotifications.requestPermissions?.();
      if (permission && permission.display !== 'granted' && permission.display !== true) return false;
      await LocalNotifications.schedule({ notifications: [{ id: Date.now() % 2147483647, title: String(title || 'OrderPilot'), body: String(body || ''), data, schedule: { at: new Date(Date.now() + 600) }, smallIcon: 'ic_stat_icon_config_sample' }] });
      return true;
    } catch { return false; }
  }

  async function scheduleLocalNotifications(notifications = []) {
    try {
      const LocalNotifications = plugins.LocalNotifications;
      if (!LocalNotifications?.schedule || !Array.isArray(notifications) || !notifications.length) return false;
      const permission = await LocalNotifications.requestPermissions?.();
      if (permission && permission.display !== 'granted' && permission.display !== true) return false;
      await LocalNotifications.schedule({ notifications });
      return true;
    } catch { return false; }
  }

  const bridge = {
    isNative,
    platform,
    appVersion: window.ORDERPILOT_CONFIG?.APP_VERSION || '45.0.0',
    apiBase,
    apiUrl,
    getToken,
    saveToken,
    removeToken,
    haptic,
    networkStatus,
    registerPush,
    registerPushNotifications: registerPush,
    scanBarcode,
    localNotification,
    scheduleLocalNotifications,
    getPushToken: async () => lastPushToken
  };

  window.OrderPilotMobile = bridge;
  window.OrderPilotNative = bridge;

  document.documentElement.classList.toggle('native-app', isNative);
  document.documentElement.classList.add(`platform-${platform}`);

  if (plugins.App?.addListener) {
    plugins.App.addListener('backButton', () => {
      const modalClose = document.querySelector('[data-modal-close]');
      if (modalClose) {
        modalClose.click();
        return;
      }
      window.dispatchEvent(new CustomEvent('orderpilot:native-back'));
    }).catch?.(() => {});
  }

  if (plugins.Keyboard?.addListener) {
    plugins.Keyboard.addListener('keyboardWillShow', () => document.documentElement.classList.add('keyboard-open')).catch?.(() => {});
    plugins.Keyboard.addListener('keyboardWillHide', () => document.documentElement.classList.remove('keyboard-open')).catch?.(() => {});
  }



  if (plugins.LocalNotifications?.addListener) {
    plugins.LocalNotifications.addListener('localNotificationActionPerformed', event => {
      window.dispatchEvent(new CustomEvent('orderpilot:push-opened', { detail: event.notification?.extra || event.notification?.data || {} }));
    }).catch?.(() => {});
  }

  if (plugins.Network?.addListener) {
    plugins.Network.addListener('networkStatusChange', status => {
      window.dispatchEvent(new CustomEvent('orderpilot:network', { detail: status }));
    }).catch?.(() => {});
  }

  if (plugins.PushNotifications?.addListener) {
    plugins.PushNotifications.addListener('registration', token => {
      lastPushToken = { token: token.value, platform, appVersion: window.ORDERPILOT_CONFIG?.APP_VERSION || '45.0.0' };
      window.dispatchEvent(new CustomEvent('orderpilot:push-token', { detail: lastPushToken }));
    }).catch?.(() => {});
    plugins.PushNotifications.addListener('registrationError', error => {
      window.dispatchEvent(new CustomEvent('orderpilot:push-error', { detail: error }));
    }).catch?.(() => {});
    plugins.PushNotifications.addListener('pushNotificationActionPerformed', event => {
      window.dispatchEvent(new CustomEvent('orderpilot:push-opened', { detail: event.notification?.data || {} }));
    }).catch?.(() => {});
  }

  window.addEventListener('online', () => window.dispatchEvent(new CustomEvent('orderpilot:network', { detail: { connected: true } })));
  window.addEventListener('offline', () => window.dispatchEvent(new CustomEvent('orderpilot:network', { detail: { connected: false } })));
})();
