// Small hand-rolled sequential scales so we don't need a charting/color
// dependency just for a choropleth and a couple of point layers.
const STOPS: [number, string][] = [
  [0, "#fff7bc"],
  [0.25, "#fec44f"],
  [0.5, "#d95f0e"],
  [0.75, "#993404"],
  [1, "#662506"],
];

// green -> amber -> red, for "share of samples failing a limit" style rates.
const RATE_STOPS: [number, string][] = [
  [0, "#16a34a"],
  [0.15, "#84cc16"],
  [0.35, "#eab308"],
  [0.6, "#ea580c"],
  [1, "#b91c1c"],
];

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  const c = (v: number) => v.toString(16).padStart(2, "0");
  return `#${c(Math.round(r))}${c(Math.round(g))}${c(Math.round(b))}`;
}

function interpolate(stops: [number, string][], value: number, [min, max]: [number, number]): string {
  const t = max === min ? 0.5 : Math.min(1, Math.max(0, (value - min) / (max - min)));
  for (let i = 1; i < stops.length; i++) {
    const [t0, c0] = stops[i - 1];
    const [t1, c1] = stops[i];
    if (t <= t1) {
      const localT = (t - t0) / (t1 - t0);
      const rgb0 = hexToRgb(c0);
      const rgb1 = hexToRgb(c1);
      const mixed: [number, number, number] = [
        rgb0[0] + (rgb1[0] - rgb0[0]) * localT,
        rgb0[1] + (rgb1[1] - rgb0[1]) * localT,
        rgb0[2] + (rgb1[2] - rgb0[2]) * localT,
      ];
      return rgbToHex(mixed);
    }
  }
  return stops[stops.length - 1][1];
}

export function colorForValue(value: number, scale: [number, number]): string {
  return interpolate(STOPS, value, scale);
}

export function colorForRate(value: number, scale: [number, number] = [0, 1]): string {
  return interpolate(RATE_STOPS, value, scale);
}

export const LEGEND_STOPS = STOPS;
export const RATE_LEGEND_STOPS = RATE_STOPS;

export const PALETTE_COLORS = [
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#9333ea",
  "#ea580c",
  "#0891b2",
];
