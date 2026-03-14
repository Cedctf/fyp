import { useState, useEffect, useRef } from 'react';
import { toast } from "sonner";
import { useSession } from 'next-auth/react';
import { MapPin, Bell, Radio, Phone, ShieldCheck } from 'lucide-react';
import { useLocationTracking } from '@/lib/useLocationTracking';

export default function LocationAndAlertsSettings() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [alertAccessEnabled, setAlertAccessEnabled] = useState(false);

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  const [error, setError] = useState('');

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
        setPhone(data.phone || '');
        setPhoneVerified(data.phoneVerified || false);
        hasLoadedRef.current = true;
      }
    } catch (error) {
      console.error('Error fetching location settings:', error);
      setError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    try {
      setSendingOtp(true);

      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');

      setOtpSent(true);
      toast.success('OTP sent successfully! Check your phone.', { style: { color: '#1B7946' } });
    } catch (error) {
      toast.error(error.message, { style: { color: '#571111' } });
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    try {
      setVerifyingOtp(true);

      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code: otp }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to verify OTP');

      setPhoneVerified(true);
      toast.success('Phone verified successfully!', { style: { color: '#1B7946' } });
    } catch (error) {
      toast.error(error.message, { style: { color: '#571111' } });
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleSaveLocation = async () => {
    setSaving(true);
    setError('');

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
        toast.success('Settings Update Successfully', { style: { color: '#1B7946' } });
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

      {/* Phone OTP Verification */}
      <div className="px-6 py-4 border-t border-[rgb(27,55,121)]/10">
        <div className="flex items-center gap-3 mb-4">
          <Phone className="w-4 h-4 text-[rgb(27,55,121)]/70" />
          <div>
            <span className="text-base font-semibold uppercase tracking-widest text-[rgb(27,55,121)]/70 block">
              Phone Verification
            </span>
            <span className="text-sm text-[rgb(27,55,121)]/60 mt-1 block">
              Verify your phone number to receive SMS alerts
            </span>
          </div>
          {phoneVerified && (
            <span className="ml-auto flex items-center gap-1 text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
              <ShieldCheck className="w-4 h-4" />
              Verified
            </span>
          )}
        </div>

        <div className="space-y-3">
          {/* Step 1: Phone Number Input */}
          {!otpSent && !phoneVerified && (
            <>
              <div className="flex gap-2">
                <input
                  type="tel"
                  placeholder="+60123456789"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setPhoneVerified(false);
                  }}
                  disabled={sendingOtp}
                  className="flex-1 px-4 py-2 border border-[rgb(27,55,121)]/20 rounded-lg text-sm text-[rgb(27,55,121)] placeholder:text-[rgb(27,55,121)]/40 focus:outline-none focus:ring-2 focus:ring-[rgb(27,55,121)]/20 disabled:opacity-50"
                />
                <button
                  onClick={handleSendOtp}
                  disabled={!phone || sendingOtp}
                  className="px-4 py-2 bg-[rgb(27,55,121)] text-white text-sm font-medium rounded-lg hover:bg-[rgb(27,55,121)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {sendingOtp ? 'Sending...' : 'Send OTP'}
                </button>
              </div>
              {phone && (
                <p className="text-sm text-[rgb(27,55,121)]/60">
                  We will send a 6-digit verification code to <strong className="text-[rgb(27,55,121)]">{phone}</strong>
                </p>
              )}
            </>
          )}

          {/* Step 2: OTP Code Input (shown after OTP is sent) */}
          {otpSent && !phoneVerified && (
            <>
              <div className="bg-[rgb(27,55,121)]/5 rounded-lg p-3">
                <p className="text-sm text-[rgb(27,55,121)]">
                  Enter the 6-digit code sent to <strong>{phone}</strong>
                </p>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={verifyingOtp}
                  maxLength={6}
                  className="flex-1 px-4 py-2 border border-[rgb(27,55,121)]/20 rounded-lg text-sm text-[rgb(27,55,121)] placeholder:text-[rgb(27,55,121)]/40 focus:outline-none focus:ring-2 focus:ring-[rgb(27,55,121)]/20 disabled:opacity-50 tracking-widest text-center font-mono"
                />
                <button
                  onClick={handleVerifyOtp}
                  disabled={!otp || verifyingOtp}
                  className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {verifyingOtp ? 'Verifying...' : 'Verify'}
                </button>
              </div>
              <button
                onClick={() => { setOtpSent(false); setOtp(''); }}
                className="text-sm text-[rgb(27,55,121)]/60 hover:text-[rgb(27,55,121)] transition-colors underline"
              >
                Edit Number
              </button>
            </>
          )}

          {/* Verified state: show phone number */}
          {phoneVerified && (
            <div className="flex items-center gap-2 text-sm text-[rgb(27,55,121)]/70">
              <span>Verified number: <strong className="text-[rgb(27,55,121)]">{phone}</strong></span>
              <button
                onClick={() => { setPhoneVerified(false); setOtpSent(false); setOtp(''); }}
                className="text-[rgb(27,55,121)]/50 hover:text-[rgb(27,55,121)] transition-colors underline ml-2"
              >
                Change
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-[rgb(87,17,17)]/5 border border-[rgb(87,17,17)]/20 rounded-md text-sm text-[rgb(87,17,17)]">
          {error}
        </div>
      )}

    </div>
  );
}

