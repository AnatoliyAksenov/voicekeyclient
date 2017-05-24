'use strict';


self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');
  console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

  const title = 'VoiceKEY Client';
  const options = {
    body: event.data.text(),
    icon: 'images/icon.png',
    badge: 'images/badge.png'
  };
  const showEvent = self.registration.showNotification(title, options)
  event.waitUntil(showEvent);
});

