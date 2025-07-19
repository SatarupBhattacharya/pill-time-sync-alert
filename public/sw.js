const CACHE_NAME = 'pill-monitor-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/src/assets/pill-monitor-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Handle background sync for notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'pill-check') {
    event.waitUntil(checkPillAlerts());
  }
});

async function checkPillAlerts() {
  try {
    const espIP = localStorage.getItem('esp-ip') || '192.168.1.100';
    const response = await fetch(`http://${espIP}/alert`);
    const alert = await response.text();
    
    if (alert) {
      self.registration.showNotification('Pill Monitor', {
        body: alert,
        icon: '/src/assets/pill-monitor-icon.png',
        badge: '/src/assets/pill-monitor-icon.png',
        tag: 'pill-alert',
        requireInteraction: true,
        actions: [
          {
            action: 'taken',
            title: 'Mark as Taken'
          },
          {
            action: 'snooze',
            title: 'Remind Later'
          }
        ]
      });
    }
  } catch (error) {
    console.error('Failed to check pill alerts:', error);
  }
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'taken') {
    // Could send a request to ESP to mark as taken
    clients.openWindow('/');
  } else if (event.action === 'snooze') {
    // Set a reminder for later
    setTimeout(() => {
      self.registration.showNotification('Pill Monitor Reminder', {
        body: 'Don\'t forget to take your medicine!',
        icon: '/src/assets/pill-monitor-icon.png',
      });
    }, 10 * 60 * 1000); // 10 minutes
  } else {
    clients.openWindow('/');
  }
});