import { useState, useCallback, useEffect, useRef } from 'react';
import { GpsCoordinates } from '../types';

interface UseGeolocationReturn {
  coordinates: GpsCoordinates | null;
  isCapturing: boolean;
  error: string | null;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'unsupported';
  captureLocation: () => Promise<GpsCoordinates>;
  clearLocation: () => void;
}

// Agricultural benchmark coordinate defaults (Davis AgTech Research Plot, Sector 4B)
const BENCHMARK_FARM_COORDS = {
  latitude: 38.5449,
  longitude: -121.7405,
  accuracy: 3.5,
  altitude: 16.2,
  heading: 42.0,
  speed: 0.0,
  sectorHint: 'North Quadrant Zone 4B (Sector 12)',
};

export function formatGpsCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
}

export function useGeolocation(): UseGeolocationReturn {
  const [coordinates, setCoordinates] = useState<GpsCoordinates | null>(null);
  const [isCapturing, setIsCapturing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const activeRequestRef = useRef<boolean>(false);

  // Monitor Geolocation API permissions where supported
  useEffect(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setPermissionStatus('unsupported');
      return;
    }

    if ('permissions' in navigator && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'geolocation' as PermissionName })
        .then((result) => {
          setPermissionStatus(result.state as 'prompt' | 'granted' | 'denied');
          result.onchange = () => {
            setPermissionStatus(result.state as 'prompt' | 'granted' | 'denied');
          };
        })
        .catch(() => {
          // Permissions query not supported for geolocation in some browsers/sandboxes
        });
    }
  }, []);

  const captureLocation = useCallback(async (): Promise<GpsCoordinates> => {
    setIsCapturing(true);
    setError(null);
    activeRequestRef.current = true;

    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      const fallback: GpsCoordinates = {
        latitude: BENCHMARK_FARM_COORDS.latitude,
        longitude: BENCHMARK_FARM_COORDS.longitude,
        accuracy: BENCHMARK_FARM_COORDS.accuracy,
        altitude: BENCHMARK_FARM_COORDS.altitude,
        heading: BENCHMARK_FARM_COORDS.heading,
        speed: BENCHMARK_FARM_COORDS.speed,
        timestamp: Date.now(),
        formatted: formatGpsCoordinates(BENCHMARK_FARM_COORDS.latitude, BENCHMARK_FARM_COORDS.longitude),
        sectorHint: BENCHMARK_FARM_COORDS.sectorHint,
        isFallback: true,
      };
      setCoordinates(fallback);
      setError('Browser Geolocation API is not supported in this environment. Applied localized farm plot coordinates.');
      setIsCapturing(false);
      activeRequestRef.current = false;
      return fallback;
    }

    return new Promise<GpsCoordinates>((resolve) => {
      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: 15000,
      };

      navigator.geolocation.getCurrentPosition(
        (pos: GeolocationPosition) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const formatted = formatGpsCoordinates(lat, lng);

          const result: GpsCoordinates = {
            latitude: lat,
            longitude: lng,
            accuracy: pos.coords.accuracy ? Math.round(pos.coords.accuracy * 10) / 10 : undefined,
            altitude: pos.coords.altitude !== null ? Math.round(pos.coords.altitude * 10) / 10 : null,
            heading: pos.coords.heading !== null ? Math.round(pos.coords.heading) : null,
            speed: pos.coords.speed !== null ? Math.round(pos.coords.speed * 10) / 10 : null,
            timestamp: pos.timestamp || Date.now(),
            formatted,
            sectorHint: 'Live Field Observation',
            isFallback: false,
          };

          setCoordinates(result);
          setPermissionStatus('granted');
          setIsCapturing(false);
          activeRequestRef.current = false;
          resolve(result);
        },
        (geoError: GeolocationPositionError) => {
          let errorMsg = 'Failed to acquire GPS location.';
          if (geoError.code === geoError.PERMISSION_DENIED) {
            errorMsg = 'GPS permission denied by user or iframe container.';
            setPermissionStatus('denied');
          } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
            errorMsg = 'GPS satellite fix or network positioning unavailable.';
          } else if (geoError.code === geoError.TIMEOUT) {
            errorMsg = 'GPS acquisition request timed out.';
          }

          // Generate stable agricultural sector benchmark fallback with small jitter for realistic field position
          const jitterLat = (Math.random() - 0.5) * 0.0008;
          const jitterLng = (Math.random() - 0.5) * 0.0008;
          const lat = Number((BENCHMARK_FARM_COORDS.latitude + jitterLat).toFixed(4));
          const lng = Number((BENCHMARK_FARM_COORDS.longitude + jitterLng).toFixed(4));
          const formatted = formatGpsCoordinates(lat, lng);

          const fallbackResult: GpsCoordinates = {
            latitude: lat,
            longitude: lng,
            accuracy: BENCHMARK_FARM_COORDS.accuracy,
            altitude: BENCHMARK_FARM_COORDS.altitude,
            heading: BENCHMARK_FARM_COORDS.heading,
            speed: BENCHMARK_FARM_COORDS.speed,
            timestamp: Date.now(),
            formatted,
            sectorHint: BENCHMARK_FARM_COORDS.sectorHint,
            isFallback: true,
          };

          setError(errorMsg);
          setCoordinates(fallbackResult);
          setIsCapturing(false);
          activeRequestRef.current = false;
          resolve(fallbackResult);
        },
        options
      );
    });
  }, []);

  const clearLocation = useCallback(() => {
    setCoordinates(null);
    setError(null);
  }, []);

  return {
    coordinates,
    isCapturing,
    error,
    permissionStatus,
    captureLocation,
    clearLocation,
  };
}
