import { useCallback, useState } from "react";
import type { MapPoint } from "../types";

let counter = 0;
const nextId = () => `pt_${Date.now()}_${counter++}`;

export function usePoints() {
  const [points, setPoints] = useState<MapPoint[]>([]);

  const addPoint = useCallback((lat: number, lng: number, color: string, label?: string) => {
    setPoints((prev) => [
      ...prev,
      { id: nextId(), lat, lng, color, label: label ?? `Punto ${prev.length + 1}` },
    ]);
  }, []);

  const movePoint = useCallback((id: string, lat: number, lng: number) => {
    setPoints((prev) => prev.map((p) => (p.id === id ? { ...p, lat, lng } : p)));
  }, []);

  const removePoint = useCallback((id: string) => {
    setPoints((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const clearPoints = useCallback(() => setPoints([]), []);

  const exportGeoJSON = useCallback(() => {
    const fc = {
      type: "FeatureCollection",
      features: points.map((p) => ({
        type: "Feature",
        properties: { id: p.id, label: p.label, color: p.color },
        geometry: { type: "Point", coordinates: [p.lng, p.lat] },
      })),
    };
    const blob = new Blob([JSON.stringify(fc, null, 2)], { type: "application/geo+json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "puntos.geojson";
    a.click();
    URL.revokeObjectURL(url);
  }, [points]);

  return { points, addPoint, movePoint, removePoint, clearPoints, exportGeoJSON };
}
