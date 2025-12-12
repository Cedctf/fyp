// Service Worker for Background Location Tracking
const CACHE_NAME = 'dengue-alert-v1';
const LOCATION_UPDATE_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Background sync for location updates
self.addEventListener('sync', (event) => {
  if (event.tag === 'location-sync') {
    event.waitUntil(syncLocation());
  }
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'location-periodic-sync') {
    event.waitUntil(syncLocation());
  }
});

async function syncLocation() {
  try {
    // Get stored location data from IndexedDB or cache
    const locationData = await getStoredLocation();
    
    if (locationData) {
      // Send location update to server
      const response = await fetch('/api/user/location-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(locationData),
      });

      if (response.ok) {
        // Clear stored location after successful sync
        await clearStoredLocation();
      }
    }
  } catch (error) {
    console.error('Background sync error:', error);
  }
}

// Store location data for later sync
async function storeLocation(locationData) {
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.put('location-data', new Response(JSON.stringify(locationData)));
  } catch (error) {
    console.error('Error storing location:', error);
  }
}

// Get stored location data
async function getStoredLocation() {
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match('location-data');
    if (response) {
      return await response.json();
    }
  } catch (error) {
    console.error('Error getting stored location:', error);
  }
  return null;
}

// Clear stored location data
async function clearStoredLocation() {
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.delete('location-data');
  } catch (error) {
    console.error('Error clearing stored location:', error);
  }
}

// Message handler for location updates from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'LOCATION_UPDATE') {
    storeLocation(event.data.location);
  }
});



