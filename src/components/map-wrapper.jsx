"use client";

import dynamic from 'next/dynamic';
import { useTranslation } from '@/context/language-context';
import { useState, useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

const LiveMap = dynamic(
  () => import('@/components/live-map').then((mod) => mod.LiveMap),
  { ssr: false }
);

export function MapWrapper() {
  const { t } = useTranslation();
  const [location, setLocation] = useState({
    latitude: 20.2961,  // Default to India's approximate center
    longitude: 85.8245,
    accuracy: 1000
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setError(new Error(t('map.geolocation_not_supported')));
      return;
    }

    const handleSuccess = (position) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      });
      setError(null);
    };

    const handleError = (error) => {
      let errorMessage = '';
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = t('map.permission_denied');
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = t('map.position_unavailable');
          break;
        case error.TIMEOUT:
          errorMessage = t('map.timeout');
          break;
        default:
          errorMessage = t('map.unknown_error');
      }
      setError(new Error(errorMessage));
      console.error('Geolocation error:', { code: error.code, message: errorMessage });
    };

    const watchId = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      { 
        enableHighAccuracy: true, 
        timeout: 10000, 
        maximumAge: 0 
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [t]);

  return (
    <div className="relative w-full h-[300px] rounded-lg overflow-hidden">
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center bg-background/95 backdrop-blur-sm p-4 text-center">
          <div className="space-y-2">
            <p className="text-destructive font-semibold">{error.message}</p>
            <p className="text-sm text-muted-foreground">{t('map.try_again_later')}</p>
          </div>
        </div>
      ) : null}
      <LiveMap 
        location={location} 
        accuracy={location.accuracy} 
        safetyZones={[]} 
        onMapClick={() => {}} 
        t={t} 
      />
    </div>
  );
}