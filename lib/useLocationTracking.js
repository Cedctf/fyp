import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for tracking user location
 * @param {boolean} enabled - Whether location tracking is enabled
 * @param {string} userId - User ID for saving location
 */
export function useLocationTracking(enabled, userId) {
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [error, setError] = useState(null);
  const watchIdRef = useRef(null);
  const lastUpdateRef = useRef(null);

  // Minimum distance in meters to trigger an update (to avoid too frequent updates)
  const MIN_DISTANCE = 50; // 50 meters
  // Minimum time between updates in milliseconds (5 minutes)
  const MIN_UPDATE_INTERVAL = 5 * 60 * 1000;

  const saveLocation = async (latitude, longitude, accuracy) => {
    if (!userId) return;

    try {
      const response = await fetch('/api/user/location-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude,
          longitude,
          accuracy,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        console.error('Failed to save location update');
      }
    } catch (err) {
      console.error('Error saving location:', err);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const shouldUpdate = (newLat, newLon) => {
    const now = Date.now();
    
    // If no previous update, always update
    if (!lastUpdateRef.current) {
      return true;
    }

    // Check time interval
    if (now - lastUpdateRef.current.timestamp < MIN_UPDATE_INTERVAL) {
      return false;
    }

    // Check distance
    const distance = calculateDistance(
      lastUpdateRef.current.latitude,
      lastUpdateRef.current.longitude,
      newLat,
      newLon
    );

    return distance >= MIN_DISTANCE;
  };

  const handleLocationUpdate = (position) => {
    const { latitude, longitude, accuracy } = position.coords;

    // Check if we should update
    if (!shouldUpdate(latitude, longitude)) {
      return;
    }

    setCurrentLocation({ latitude, longitude, accuracy });
    setError(null);

    // Save to database
    saveLocation(latitude, longitude, accuracy);

    // Update last update reference
    lastUpdateRef.current = {
      latitude,
      longitude,
      timestamp: Date.now(),
    };
  };

  const handleLocationError = (err) => {
    console.error('Location error:', err);
    setError(err.message);
    setIsTracking(false);
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    if (watchIdRef.current !== null) {
      // Already tracking
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000, // Accept cached position up to 1 minute old
    };

    // Start watching position
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleLocationUpdate,
      handleLocationError,
      options
    );

    setIsTracking(true);
    setError(null);
  };

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setIsTracking(false);
    setCurrentLocation(null);
  };

  useEffect(() => {
    if (enabled && userId) {
      startTracking();
    } else {
      stopTracking();
    }

    // Cleanup on unmount
    return () => {
      stopTracking();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, userId]);

  return {
    isTracking,
    currentLocation,
    error,
    startTracking,
    stopTracking,
  };
}

