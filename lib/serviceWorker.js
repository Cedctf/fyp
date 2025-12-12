/**
 * Register service worker for background location tracking
 */
export function registerServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration.scope);

          // Request periodic background sync if supported
          if ('periodicSync' in registration) {
            registration.periodicSync
              .register('location-periodic-sync', {
                minInterval: 5 * 60 * 1000, // 5 minutes
              })
              .then(() => {
                console.log('Periodic background sync registered');
              })
              .catch((err) => {
                console.log('Periodic background sync not supported:', err);
              });
          }

          // Request background sync if supported
          if ('sync' in registration) {
            // Background sync will be triggered when needed
            console.log('Background sync supported');
          }
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    });
  }
}

/**
 * Unregister service worker
 */
export function unregisterServiceWorker() {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
    });
  }
}

/**
 * Send location update to service worker
 */
export function sendLocationToServiceWorker(locationData) {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.active?.postMessage({
        type: 'LOCATION_UPDATE',
        location: locationData,
      });
    });
  }
}



