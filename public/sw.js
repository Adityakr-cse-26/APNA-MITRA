// Service Worker for Apna Mitra Push Notifications & Medication Reminders

self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('message', function(event) {
  if (!event.data) return;
  if (event.data.type === 'MEDICATION_ALARM' || event.data.type === 'TEST_MEDICATION_REMINDER') {
    const title = event.data.title || '💊 Medicine Reminder';
    const body = event.data.body || "It's time to take your scheduled medication.";
    self.registration.showNotification(title, {
      body: body,
      icon: '/chatbot-logo.png',
      badge: '/chatbot-logo.png',
      vibrate: [300, 100, 300, 100, 300, 100, 500],
      requireInteraction: true,
      tag: `med-alarm-${event.data.medicationId || Date.now()}`,
      renotify: true,
      data: {
        url: '/#medicine-tracker',
        medication_id: event.data.medicationId
      }
    });
  }
});

self.addEventListener('push', function(event) {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || '💊 Medicine Reminder';
    
    const options = {
      body: data.body || "It's time to take your scheduled medication.",
      icon: data.icon || '/chatbot-logo.png',
      badge: data.badge || '/chatbot-logo.png',
      vibrate: [300, 100, 300, 100, 300, 100, 500],
      requireInteraction: true, // Remains on screen like an alarm until dismissed
      tag: data.tag || `med-reminder-${Date.now()}`,
      renotify: true,
      data: {
        url: data.url || '/#medicine-tracker',
        medication_id: data.data?.medication_id || data.medication_id,
        type: data.data?.type || data.type || 'MEDICATION_REMINDER',
        timestamp: Date.now()
      },
      actions: data.actions && data.actions.length > 0 ? data.actions : [
        { action: 'open_tracker', title: 'Open Tracker' }
      ]
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (err) {
    console.error('[ServiceWorker] Error processing push payload:', err);
    // Fallback for non-JSON text payloads
    const fallbackText = event.data.text() || "It's time to take your medication.";
    event.waitUntil(
      self.registration.showNotification('💊 Medicine Reminder', {
        body: fallbackText,
        icon: '/chatbot-logo.png',
        badge: '/chatbot-logo.png',
        requireInteraction: true
      })
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const notificationData = event.notification.data || {};
  let targetUrl = notificationData.url || '/#medicine-tracker';

  if (event.action === 'view_location') {
    targetUrl = notificationData.url || '/';
  }

  // Focus an existing client window if open, otherwise open a new window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url && 'focus' in client) {
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            action: event.action,
            data: notificationData
          });
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
