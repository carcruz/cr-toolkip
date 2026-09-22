import { useEffect, useState } from "react";
import type { FeatureCollection } from "geojson";

const cache = new Map<string, FeatureCollection>();

export function useGeoJSON(url: string | null): FeatureCollection | null {
  const [data, setData] = useState<FeatureCollection | null>(url ? cache.get(url) ?? null : null);

  useEffect(() => {
    if (!url) {
      setData(null);
      return;
    }
    const cached = cache.get(url);
    if (cached) {
      setData(cached);
      return;
    }
    let cancelled = false;
    fetch(url)
      .then((res) => res.json())
      .then((json: FeatureCollection) => {
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
