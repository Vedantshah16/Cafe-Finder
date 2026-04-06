'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import type { Coordinates } from '@/types';

interface UseLocationReturn {
  location: Coordinates | null;
  error: string | null;
  isLoading: boolean;
  permission: 'granted' | 'denied' | 'pending' | null;
  requestLocation: () => void;
}

export function useLocation(): UseLocationReturn {
  const { userLocation, locationPermission, setUserLocation, setLocationPermission } =
    useAppStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLoading(true);
    setLocationPermission('pending');
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLocationPermission('granted');
        setIsLoading(false);
      },
      (err) => {
        setIsLoading(false);
        setLocationPermission('denied');
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Location access denied. Please enable location permissions.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Location information is unavailable.');
            break;
          case err.TIMEOUT:
            setError('Location request timed out.');
            break;
          default:
            setError('An unknown error occurred getting your location.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, [setUserLocation, setLocationPermission]);

  // Auto-request on mount if not already granted/denied
  useEffect(() => {
    if (locationPermission === null && typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.permissions
        ?.query({ name: 'geolocation' })
        .then((result) => {
          if (result.state === 'granted') {
            requestLocation();
          }
        })
        .catch(() => {
          // permissions API not supported
        });
    }
  }, [locationPermission, requestLocation]);

  return {
    location: userLocation,
    error,
    isLoading,
    permission: locationPermission,
    requestLocation,
  };
}
