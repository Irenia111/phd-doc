"use client";

import { useCallback, useEffect, useState } from "react";
import { getItem, removeItem, setItem } from "@/lib/storage";

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
  }, [key]);

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
