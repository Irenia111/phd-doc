"use client";

import { useMemo } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";

const API_KEY_STORAGE_KEY = "api-key";

export function useApiKey() {
  const { value, setValue, clear, ready } = useLocalStorage<string>(API_KEY_STORAGE_KEY, "");

  const status = useMemo(() => (value ? "configured" : "missing"), [value]);

  return {
    apiKey: value,
    setApiKey: setValue,
    clearApiKey: clear,
    status,
    ready,
  };
}
