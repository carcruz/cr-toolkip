import { useEffect, useState } from "react";

const cache = new Map<string, unknown>();

export function useJSON<T>(url: string | null): T | null {
  const [data, setData] = useState<T | null>(() => (url ? (cache.get(url) as T | undefined) ?? null : null));

  useEffect(() => {
    if (!url) {
      setData(null);
      return;
    }
    const cached = cache.get(url);
    if (cached) {
      setData(cached as T);
      return;
    }
    let cancelled = false;
    fetch(url)
      .then((res) => res.json())
      .then((json: T) => {
        if (cancelled) return;
        cache.set(url, json);
        setData(json);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return data;
}
