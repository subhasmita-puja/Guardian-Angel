"use client";

import { useState, useEffect, useCallback } from 'react';

const ALERTS_STORAGE_KEY = 'guardian-angel-alerts';

export function useAlerts() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    try {
      const storedAlerts = localStorage.getItem(ALERTS_STORAGE_KEY);
      if (storedAlerts) {
        setAlerts(JSON.parse(storedAlerts));
      }
    } catch (error) {
      console.error("Failed to parse alerts from localStorage", error);
      setAlerts([]);
    }
  }, []);

  const addAlert = useCallback((alertData) => {
    const newAlert = { ...alertData, id: Date.now().toString(), timestamp: new Date().toISOString() };
    setAlerts(prevAlerts => {
        const updatedAlerts = [newAlert, ...prevAlerts];
        localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(updatedAlerts));
        return updatedAlerts;
    });
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
    localStorage.removeItem(ALERTS_STORAGE_KEY);
  }, []);

  return { alerts, addAlert, clearAlerts };
}
