self.addEventListener('push', function(event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/vite.svg',
      badge: '/vite.svg',
      data: {
        url: data.url || '/'
      },
      actions: data.actions || [] // Ensure actions are passed to the notification
    };
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  // Handle action buttons (like "View Patient Location")
  if (event.action === 'view_location') {
     // If the push payload included an action URL, use it, otherwise fallback to the data URL
     const urlToOpen = (event.notification.data && event.notification.data.url) ? event.notification.data.url : '/';
     event.waitUntil(clients.openWindow(urlToOpen));
     return;
  }

  // Handle normal clicks on the notification body
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});
