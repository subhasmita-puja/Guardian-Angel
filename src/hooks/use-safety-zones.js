"use client";

import { useState, useEffect, useCallback } from 'react';

const ZONES_STORAGE_KEY = 'guardian-angel-safety-zones';

export function useSafetyZones() {
  const [zones, setZones] = useState([]);

  useEffect(() => {
    try {
      const storedZones = localStorage.getItem(ZONES_STORAGE_KEY);
      if (storedZones) {
        setZones(JSON.parse(storedZones));
      }
    } catch (error) {
      console.error("Failed to parse safety zones from localStorage", error);
      setZones([]);
    }
  }, []);

  const addZone = useCallback((zoneData) => {
    const newZone = { ...zoneData, id: Date.now().toString() };
    setZones(prevZones => {
        // Prevent adding too many zones to avoid performance issues, keep the 100 most recent.
        const updatedZones = [newZone, ...prevZones].slice(0, 100);
        localStorage.setItem(ZONES_STORAGE_KEY, JSON.stringify(updatedZones));
        return updatedZones;
    });
  }, []);

  return { zones, addZone };
}
