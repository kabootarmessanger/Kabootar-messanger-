"use client";
import { useEffect, useRef, useState } from "react";

/**
 * SSR-safe localStorage-backed state.
 * Always starts from `initialValue` on the server & first client render
 * (avoids hydration mismatch), then syncs from localStorage right after mount.
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(initialValue);
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) {
        setValue(JSON.parse(raw));
      }
    } catch (e) {
      // ignore malformed storage
    }
    hydrated.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      // storage full / private mode - ignore
    }
  }, [key, value]);

  return [value, setValue];
}
