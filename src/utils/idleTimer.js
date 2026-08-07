import { useEffect, useRef, useCallback } from "react";
const ONE_HOUR_IN_MS = 30 * 1000;
const CHECK_EVERY_MS = 2 * 1000;
const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"];
export const useIdleTimer = (onIdle, isEnabled) => {
    const lastActivityTime = useRef(Date.now());
    const markActivityNow = useCallback(() => {
        lastActivityTime.current = Date.now();
    }, []);

    useEffect(() => {
        if (!isEnabled) return;
        markActivityNow();
        ACTIVITY_EVENTS.forEach((eventName) => {
            window.addEventListener(eventName, markActivityNow);
        });
        const intervalId = setInterval(() => {
            const idleFor = Date.now() - lastActivityTime.current;
            if (idleFor >= ONE_HOUR_IN_MS) {
                onIdle();
            }
        }, CHECK_EVERY_MS);
        return () => {
            ACTIVITY_EVENTS.forEach((eventName) => {
                window.removeEventListener(eventName, markActivityNow);
            });
            clearInterval(intervalId);
        };
    }, [isEnabled, onIdle, markActivityNow]);

};