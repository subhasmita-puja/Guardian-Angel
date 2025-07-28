
"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';

// Create a custom red icon for the user's location.
const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const zoneColors = {
  safe: '#16a34a', // tailwind green-600
  neutral: '#f59e0b', // tailwind amber-500
  risky: '#dc2626', // tailwind red-600
};

export function LiveMap({ location, accuracy, safetyZones = [], onMapClick = () => {}, t }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const zoneLayersRef = useRef([]);

  // Effect to initialize the map instance, runs only once
  useEffect(() => {
    // Prevent re-initialization
    if (mapContainerRef.current && !mapInstanceRef.current) {
      // Initialize map with a default view, so it's always ready
      const map = L.map(mapContainerRef.current).setView([20, 0], 2); // Default view (world)
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      map.on('click', (e) => {
        onMapClick(e.latlng);
      });

      mapInstanceRef.current = map;
    }

    // Cleanup function to run when the component unmounts
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove(); // This is the key leaflet cleanup function
        mapInstanceRef.current = null;  // Ensure the ref is cleared
      }
    };
  }, [onMapClick]); // Dependency on stable onMapClick function

  // Effect to update the map view and user marker when location changes
  useEffect(() => {
    // Do nothing if map isn't initialized or location is not available
    if (!mapInstanceRef.current || !location || !t) {
      return;
    }

    const map = mapInstanceRef.current;
    const position = [location.latitude, location.longitude];
    const popupContent = `<b>${t('safemap_client.live_map.you_are_here')}</b><br/>${t('safemap_client.live_map.accuracy', { accuracy: accuracy?.toFixed(0) })}`;

    // Animate the view to the new position to make it clear the map is centering
    map.flyTo(position, 16);

    // Update or create the user's location marker
    if (markerRef.current) {
      markerRef.current.setLatLng(position).setPopupContent(popupContent);
    } else {
      markerRef.current = L.marker(position, { icon: redIcon })
        .addTo(map)
        .bindPopup(popupContent);
    }
    
    // Ensure the popup is always open to keep the user's location visible
    if (!markerRef.current.isPopupOpen()) {
        markerRef.current.openPopup();
    }

    // Update or create the accuracy circle
    if (circleRef.current) {
      circleRef.current.setLatLng(position).setRadius(accuracy || 0);
    } else {
      circleRef.current = L.circle(position, {
        radius: accuracy || 0,
        color: 'hsl(var(--destructive))',
        fillColor: 'hsl(var(--destructive))',
        fillOpacity: 0.15,
        weight: 1
      }).addTo(map);
    }
  }, [location, accuracy, t]); // This effect re-runs whenever location or accuracy props change

  // Effect to update safety zones on the map
  useEffect(() => {
    if (!mapInstanceRef.current || !safetyZones || !t) {
      return;
    }
    const map = mapInstanceRef.current;

    // Clear existing zone layers
    zoneLayersRef.current.forEach(layer => map.removeLayer(layer));
    zoneLayersRef.current = [];

    // Add new zones
    safetyZones.forEach(zone => {
      const color = zoneColors[zone.rating] || '#808080';
      const zoneCircle = L.circle(zone.latlng, {
        radius: 50, // 50-meter radius for a zone
        color: color,
        fillColor: color,
        fillOpacity: 0.3,
        weight: 1,
      }).addTo(map);
      
      const ratingText = t(`safemap_client.rate_dialog.${zone.rating}`, {}, zone.rating.charAt(0).toUpperCase() + zone.rating.slice(1));
      zoneCircle.bindPopup(`<b>${ratingText} Zone</b><br/>${t('safemap_client.rate_dialog.marked_on', { date: new Date(zone.timestamp).toLocaleDateString() })}`);

      zoneLayersRef.current.push(zoneCircle);
    });

  }, [safetyZones, t]); // Re-run when safetyZones change

  return <div ref={mapContainerRef} style={{ height: '100%', width: '100%' }} />;
}
