import { useCallback, useState } from "react";

export function usePersistentTab<T extends string>(storageKey: string, defaultValue: T) {
  const [value, setValueState] = useState<T>(() => {
    if (typeof window === "undefined") return defaultValue;
    return (window.sessionStorage.getItem(storageKey) as T | null) ?? defaultValue;
  });

  const setValue = useCallback((nextValue: T) => {
    setValueState(nextValue);
    window.sessionStorage.setItem(storageKey, nextValue);
  }, [storageKey]);

  return [value, setValue] as const;
}
