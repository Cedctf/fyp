import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { MapPin, Bell, Radio } from 'lucide-react';
import { useLocationTracking } from '@/lib/useLocationTracking';

export default function LocationAndAlertsSettings() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [alertAccessEnabled, setAlertAccessEnabled] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const hasLoadedRef = useRef(false);

  const trackingEnabled = alertAccessEnabled;
  const { isTracking, currentLocation, error: trackingError } = useLocationTracking(
    trackingEnabled,
    session?.user?.id
  );

  useEffect(() => {
    if (session?.user?.id) {
      fetchSettings();
    }
  }, [session]);

  useEffect(() => {
    if (trackingError) {
      setError(trackingError);
    }
  }, [trackingError]);

  // Auto-save on toggle changes after initial fetch
  useEffect(() => {
    if (!hasLoadedRef.current) return;
    handleSaveLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alertAccessEnabled]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/user/location-settings');
      if (res.ok) {
        const data = await res.json();
        setAlertAccessEnabled(data.alertAccessEnabled || false);
        hasLoadedRef.current = true;
      }
    } catch (error) {
      console.error('Error fetching location settings:', error);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLocation = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/user/location-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertAccessEnabled
        })
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Settings saved successfully');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.message || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="px-6 py-5 text-[rgb(27,55,121)]/70">Loading location settings...</div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="py-5">
        <div className="flex items-center gap-3">
          <MapPin className="w-5 h-5 text-[rgb(27,55,121)]" />
          <h2 className="text-3xl font-serif font-semibold text-[rgb(27,55,121)]">
            Location & Alerts
          </h2>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-4">
        <div className="flex items-center gap-3 mb-3 sm:mb-0">
          <Bell className="w-4 h-4 text-[rgb(27,55,121)]/70" />
          <div>
            <span className="text-base font-semibold uppercase tracking-widest text-[rgb(27,55,121)]/70 block">
              Alert Access
            </span>
            <span className="text-sm text-[rgb(27,55,121)]/60 mt-1 block">
              Enable alerts only when you approve notifications
            </span>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={alertAccessEnabled}
            onChange={(e) => setAlertAccessEnabled(e.target.checked)}
            disabled={saving}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[rgb(27,55,121)]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[rgb(27,55,121)]"></div>
        </label>
      </div>

      {trackingEnabled && (
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <Radio className={`w-4 h-4 ${isTracking ? 'text-green-600' : 'text-gray-400'}`} />
            <div className="flex-1">
              <span className="text-base font-medium text-[rgb(27,55,121)] block">
                Location Tracking: {isTracking ? 'Active' : 'Inactive'}
              </span>
              {currentLocation && (
                <span className="text-sm text-[rgb(27,55,121)]/60 mt-1 block">
                  Current: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
                  {currentLocation.accuracy && ` (±${Math.round(currentLocation.accuracy)}m)`}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
          {success}
        </div>
      )}
    </div>
  );
}

