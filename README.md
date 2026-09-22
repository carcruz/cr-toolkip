# Costa Rica Toolkit

Interactive socioeconomic map of Costa Rica. Vibe-coded personal project — see
`CLAUDE.md` for conventions and `DATA_SOURCES.md` for exactly what's real vs.
placeholder/demo data.

## Run it

```bash
npm install
npm run dev
```

Open the printed localhost URL. That's it — no backend, no env vars, no API
keys. The basemap is Esri's Dark Gray Canvas, which is free and anonymous.

```bash
npm run build     # type-check + production build to dist/
npm run preview   # serve the production build locally
```

## What's here (v1)

- Base map (Esri Dark Gray Canvas via Leaflet — free, no API key required)
- Toggleable layers: provincias, cantones, regiones de planificación MIDEPLAN, regiones cafetaleras ICAFE, plantas potabilizadoras AyA (all real data — see `DATA_SOURCES.md` for caveats)
- Choropleth on cantones by a demo indicator (fake data, clearly labeled)
- Click-to-add or drag-from-palette points, draggable, deletable, exportable as GeoJSON

See `DATA_SOURCES.md` for what's real data vs. placeholder/demo data, and what's
still missing (distritos, real MIDEPLAN regions, real IDS values).
