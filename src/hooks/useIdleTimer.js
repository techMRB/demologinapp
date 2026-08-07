// Watches for user inactivity and triggers a callback after a specified timeout. Mirrors
// your backend session timeout. This is a custom hook that can be used in any component.

import { useEffect, useRef, useCallback } from "react";

const ONE_HOUR_IN_MS = 30 * 1000; // 1 hour in milliseconds
const CHECK_EVERY_MS = 60 * 1000; // Check every minute
const ACTIVITY_EVENTS = ["mousemove", "keydown", "mousedown", "touchstart"];

export const useIdleTimer = (onIdle, isEnabled) => {
  const lastActivityTime = useRef(Date.now());
  const markActivityNow = useCallback(() => {
    lastActivityTime.current = Date.now();
  }, []);

  useEffect(() => {
    if (!isEnabled) return;
    markActivityNow(); // Reset the timer on mount

    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, markActivityNow);
    });

    const intervalId = setInterval(() => {
        const idleFor = Date.now() - lastActivityTime.current;
        if (idleFor > ONE_HOUR_IN_MS) {
            onIdle();
        }
    },CHECK_EVERY_MS);

    return () => {
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, markActivityNow);
      });
      clearInterval(intervalId);
    };
    }, [onIdle, isEnabled, markActivityNow]);
}