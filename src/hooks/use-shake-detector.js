"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

const SHAKE_THRESHOLD = 15; // m/s^2, a higher value means less sensitive
const SHAKE_TIMEOUT = 1000; // ms, time to wait between shakes
const GRACE_PERIOD = 500; // ms, ignore events immediately after permission is granted

export function useShakeDetector({ onShake, threshold = SHAKE_THRESHOLD }) {
  const [permissionGranted, setPermissionGranted] = useState(null);
  const lastShakeTimeRef = useRef(0);
  const onShakeRef = useRef(onShake);
  const listenerAttachedTimeRef = useRef(0);

  // Keep the ref updated with the latest onShake callback.
  useEffect(() => {
    onShakeRef.current = onShake;
  }, [onShake]);

  const handleMotionEvent = useCallback((event) => {
    const now = Date.now();
    // Ignore events that fire immediately after permission is granted.
    if (now - listenerAttachedTimeRef.current < GRACE_PERIOD) {
      return;
    }

    if (now - lastShakeTimeRef.current < SHAKE_TIMEOUT) {
      return;
    }

    const { accelerationIncludingGravity } = event;
    const { x, y, z } = accelerationIncludingGravity;

    if (x === null || y === null || z === null) {
      return;
    }

    const magnitude = Math.sqrt(x * x + y * y + z * z);

    if (magnitude > threshold) {
      lastShakeTimeRef.current = now;
      if (typeof onShakeRef.current === 'function') {
        onShakeRef.current();
      }
    }
  }, [threshold]);

  const requestPermission = useCallback(async () => {
    // For iOS 13+ devices that require explicit permission
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const permissionState = await DeviceMotionEvent.requestPermission();
        if (permissionState === 'granted') {
          setPermissionGranted(true);
          return true;
        } else {
          setPermissionGranted(false);
          return false;
        }
      } catch (error) {
        console.error("DeviceMotionEvent permission request failed", error);
        setPermissionGranted(false);
        return false;
      }
    }
    
    // For other browsers (like Android Chrome) that support the event without a specific permission prompt
    if (typeof window.DeviceMotionEvent !== 'undefined') {
        setPermissionGranted(true);
        return true;
    }
    
    // If the API is not supported at all
    setPermissionGranted(false);
    return false;
  }, []);

  useEffect(() => {
    if (permissionGranted === true) {
      // Set the time *before* adding the listener to start the grace period.
      listenerAttachedTimeRef.current = Date.now();
      window.addEventListener('devicemotion', handleMotionEvent);
    }
    return () => {
      window.removeEventListener('devicemotion', handleMotionEvent);
    };
  }, [permissionGranted, handleMotionEvent]);
  
  return { requestPermission, permissionGranted };
}
