"use client";

import { useCallback, useEffect, useState } from "react";
import { getItem, getStorageKey, removeItem, setItem, STORAGE_CHANGE_EVENT } from "@/lib/storage";

export function useLocalStorage<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [ready, setReady] = useState(false);

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
        setValue(fallback);
        return;
      }
      setValue(latest);
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== getStorageKey(key)) return;
      syncFromStorage();
    };

    const handleCustomStorage = (event: Event) => {
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
  }, [fallback, key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (v: T) => T)(prev) : next;
        setItem(key, resolved);
        return resolved;
      });
    },
    [key]
  );

  const clear = useCallback(() => {
    setValue(fallback);
    removeItem(key);
  }, [fallback, key]);

  return { value, setValue: update, clear, ready };
}
