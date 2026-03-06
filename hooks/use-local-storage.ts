"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getItem, getStorageKey, removeItem, setItem, STORAGE_CHANGE_EVENT } from "@/lib/storage";

export function useLocalStorage<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [ready, setReady] = useState(false);
  const fallbackRef = useRef(fallback);
  fallbackRef.current = fallback;
  const writingRef = useRef(false);

  useEffect(() => {
    const stored = getItem<T>(key);
    if (stored !== null) {
      // Reading localStorage on mount requires updating state inside effect.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValue(stored);
    }
    setReady(true);

    const syncFromStorage = () => {
      const latest = getItem<T>(key);
      if (latest === null) {
        setValue(fallbackRef.current);
        return;
      }
      setValue(latest);
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== getStorageKey(key)) return;
      syncFromStorage();
    };

    const handleCustomStorage = (event: Event) => {
      if (writingRef.current) return;
      const detail = (event as CustomEvent<{ key?: string }>).detail;
      if (!detail?.key || detail.key !== key) return;
      syncFromStorage();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(STORAGE_CHANGE_EVENT, handleCustomStorage);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(STORAGE_CHANGE_EVENT, handleCustomStorage);
    };
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (v: T) => T)(prev) : next;
        writingRef.current = true;
        setItem(key, resolved);
        writingRef.current = false;
        return resolved;
      });
    },
    [key]
  );

  const clear = useCallback(() => {
    writingRef.current = true;
    setValue(fallbackRef.current);
    removeItem(key);
    writingRef.current = false;
  }, [key]);

  return { value, setValue: update, clear, ready };
}
