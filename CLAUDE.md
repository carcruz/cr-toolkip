# CLAUDE.md

## Purpose

Personal side project: an interactive socioeconomic map of Costa Rica. Started
as a single feature (choropleth + boundary layers + draggable point markers)
that may grow into other Costa Rica-focused tools over time (hence
"toolkit"). Vibe-coded — optimize for speed and a pleasant result over
enterprise structure. No backend, no auth, no tests unless asked for.

## Stack

- Vite + React + TypeScript
- Leaflet via `react-leaflet` (v5, needs React 19)
- No state management library — local `useState`/hooks are enough at this size
- No UI kit, no charting/color library — see `src/utils/color.ts` for the
  hand-rolled sequential scale
- No backend — all data is static files in `public/data/`, fetched client-side

Keep dependencies minimal. Before adding a package, ask whether a ~20-line
hand-rolled version is good enough (it usually is at this scale).

## Structure

```
public/data/            GeoJSON + indicator JSON served as-is (see DATA_SOURCES.md)
scripts/build-data.mjs  one-off script that derived public/data/ from raw downloads
src/
  components/           MapView, BoundaryLayer, PointsLayer, Legend, LayerControlPanel
  hooks/                useGeoJSON (fetch+cache), usePoints (in-memory point state + export)
  utils/color.ts         choropleth color scale + point palette colors
  types.ts               shared types (BoundaryFeatureProps, IndicatorDataset, MapPoint)
```

`App.tsx` owns all top-level state (layer visibility, choropleth on/off,
points, add-point mode) and passes it down. `MapView` owns the Leaflet
`MapContainer` and the click/drag-drop interaction handlers.

## Conventions

- All boundary GeoJSON files share the same minimal property schema:
  `{ id: string (slug), name: string (display, accented) }`. Any indicator
  dataset joins to boundaries via that `id`.
- Indicator datasets (`public/data/*.json`) always carry `demo: boolean` and a
  human-readable `source` string. **Never invent real-looking indicator
  values** — if real data isn't available, generate obviously-fake demo
  values and say so in the data and in the UI (see the `demo` badge in
  `LayerControlPanel`).
- Placeholder boundary files are named `*.PLACEHOLDER.geojson` and carry a
  top-level `properties.placeholder: true` / `warning` field. Check
  `DATA_SOURCES.md` before treating any file as authoritative — it lists
  exactly what's real, what's approximate, and what's fabricated.
- New GeoJSON added to `public/data/` should be simplified (mapshaper or
  similar) before committing — keep the bundle small.
- Spanish UI copy (this is a Costa Rica-focused tool for personal use) with
  Spanish accents preserved in place names.

## Adding a new indicator

1. Add a JSON file to `public/data/` following the `IndicatorDataset` shape
   in `src/types.ts`, keyed by the same canton `id` slugs as `cantones.geojson`.
2. Wire it into the indicator `<select>` in `LayerControlPanel.tsx` (currently
   hardcoded to the single demo indicator — it's a stub, not a real picker,
   since there's only one indicator so far).
3. Update `DATA_SOURCES.md` with the source, license, date, and admin level,
   and mark clearly whether it's real or demo data.
