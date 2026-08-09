'use strict';

const CACHE = 'orderpilot-v34';
const ASSETS = [
  '/',
  '/index.html',
  '/admin.html',
  '/styles.css?v=34.0',
  '/app.js?v=34.0',
  '/admin.js?v=34.0',
  '/config.js?v=34.0',
  '/mobile.js?v=34.0',
  '/manifest.json?v=34.0',
  '/icon.svg',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).catch(() => null));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/')) return;
  event.respondWith(fetch(event.request).then(response => {
    const copy = response.clone();
    if (response && response.ok) caches.open(CACHE).then(cache => cache.put(event.request, copy)).catch(() => {});
    return response;
  }).catch(() => caches.match(event.request).then(match => match || caches.match('/offline.html'))));
});

self.addEventListener('push', event => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch (_) { payload = { title: 'OrderPilot', body: event.data ? event.data.text() : '' }; }
  const title = payload.title || 'OrderPilot';
  const options = { body: payload.body || payload.message || '', icon: '/icon-192.png', badge: '/icon-192.png', data: payload.data || {} };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const client of list) { if ('focus' in client) return client.focus(); }
    return clients.openWindow('/');
  }));
});


// v45-push: display push notifications from the server when available.
self.addEventListener('push', event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (_) { data = { title: 'OrderPilot', body: event.data ? event.data.text() : '' }; }
  const title = data.title || 'OrderPilot';
  const options = { body: data.body || data.message || '', icon: '/icon-192.png', badge: '/icon-192.png', data: data.data || data };
  event.waitUntil(self.registration.showNotification(title, options));
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => list[0] ? list[0].focus() : clients.openWindow('/')));
});
