const STORAGE_PREFIX = "phd-doc:";
const STORAGE_VERSION = 1;

type Storable<T> = {
  version: number;
  updatedAt: number;
  data: T;
};

function keyOf(key: string) {
  if (key.startsWith(STORAGE_PREFIX)) return key;
  return `${STORAGE_PREFIX}${key}`;
}

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function getItem<T>(key: string): T | null {
  if (!isBrowser()) return null;
  const raw = localStorage.getItem(keyOf(key));
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as T | Storable<T>;
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "version" in parsed &&
      "data" in parsed
    ) {
      return (parsed as Storable<T>).data;
    }
    return parsed as T;
  } catch {
    return null;
  }
}

export function setItem<T>(key: string, value: T): void {
  if (!isBrowser()) return;
  const payload: Storable<T> = {
    version: STORAGE_VERSION,
    updatedAt: Date.now(),
    data: value,
  };
  localStorage.setItem(keyOf(key), JSON.stringify(payload));
}

export function removeItem(key: string): void {
  if (!isBrowser()) return;
  localStorage.removeItem(keyOf(key));
}
