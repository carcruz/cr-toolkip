import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { MapPoint } from "../types";

const iconCache = new Map<string, L.DivIcon>();

function iconFor(color: string): L.DivIcon {
  const cached = iconCache.get(color);
  if (cached) return cached;
  const icon = L.divIcon({
    className: "",
    html: `<div style="
      width:22px;height:22px;border-radius:50% 50% 50% 0;
      transform:rotate(-45deg);
      background:${color};border:2px solid white;
      box-shadow:0 1px 3px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 22],
  });
  iconCache.set(color, icon);
  return icon;
}

interface Props {
  points: MapPoint[];
  onMove: (id: string, lat: number, lng: number) => void;
  onRemove: (id: string) => void;
}

export default function PointsLayer({ points, onMove, onRemove }: Props) {
  return (
    <>
      {points.map((p) => (
        <Marker
          key={p.id}
          position={[p.lat, p.lng]}
          icon={iconFor(p.color)}
          draggable
          eventHandlers={{
            dragend: (e) => {
              const { lat, lng } = e.target.getLatLng();
              onMove(p.id, lat, lng);
            },
          }}
        >
          <Popup>
            <div style={{ fontSize: 13 }}>
              <strong>{p.label}</strong>
              <br />
              <span style={{ fontVariantNumeric: "tabular-nums", color: "#6b7684" }}>
                {p.lat.toFixed(5)}, {p.lng.toFixed(5)}
              </span>
              <br />
              <button
                onClick={() => onRemove(p.id)}
                style={{
                  marginTop: 6,
                  border: "none",
                  background: "#fee2e2",
                  color: "#b91c1c",
                  borderRadius: 6,
                  padding: "3px 8px",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                Eliminar
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
}
