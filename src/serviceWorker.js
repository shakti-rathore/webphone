// src/serviceWorker.js

/* eslint-disable no-restricted-globals */
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
});

self.addEventListener('fetch', (event) => {
  console.log('Fetch intercepted for:', event.request.url);
});
/* eslint-enable no-restricted-globals */
