# Data sources

All files live in `public/data/`. `scripts/build-data.mjs` is the one-off script
that produced `provincias.geojson`, `cantones.geojson`, and
`ids_cantonal_demo.json` from the raw downloads (raw files are not kept in the
repo — only the cleaned output). `scripts/build-regiones-mideplan.mjs` produced
`regiones_mideplan.geojson` from `cantones.geojson` plus a transcribed
canton→region table.

## provincias.geojson

- **Source:** [geoBoundaries](https://www.geoboundaries.org) — CRI ADM1 (simplified)
- **Direct link:** https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/CRI/ADM1/geoBoundaries-CRI-ADM1_simplified.geojson
- **License:** Open Data Commons Open Database License (ODbL) 1.0, via OpenStreetMap/Wambacher — see geoBoundaries' [license page](https://www.geoboundaries.org/index.html#usage)
- **Admin level:** ADM1 (provincia)
- **Downloaded:** 2026-09-22 (geoBoundaries build date Dec 12, 2023; source data updated Jan 2023)
- **Feature count:** 7 — matches the 7 official provinces
- **Processing:** simplified with `mapshaper -simplify 10% keep-shapes`, properties trimmed to `{id, name}`

## cantones.geojson

- **Source:** [geoBoundaries](https://www.geoboundaries.org) — CRI ADM2 (simplified)
- **Direct link:** https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/CRI/ADM2/geoBoundaries-CRI-ADM2_simplified.geojson
- **License:** CC0 1.0 Universal (Public Domain)
- **Admin level:** ADM2 (cantón)
- **Downloaded:** 2026-09-22 (geoBoundaries build date Dec 12, 2023; source data updated Jan 2023)
- **Feature count:** 83 — **missing Monteverde** (Puntarenas), created as a canton in 2021 after this dataset's source snapshot; its territory is likely still folded into a neighboring canton's polygon (probably Puntarenas). Puerto Jiménez (2022) IS present.
- **Processing:** simplified with `mapshaper -simplify 8% keep-shapes` (repaired 4 self-intersections introduced by simplification), properties trimmed to `{id, name}`, several names re-accented (geoBoundaries stripped diacritics — e.g. "Escazu" → "Escazú", "Palmeras" → "Palmares" typo fix) — see `NAME_FIXES` in `scripts/build-data.mjs`.

## regiones_mideplan.geojson

- **Status:** real, official regionalization — no longer a placeholder.
- **Source:** canton→region table transcribed by the user from an official
  MIDEPLAN map (Área de Planificación Regional, 2024; Decreto Ejecutivo
  16068-PLAN — Regionalización Oficial de Costa Rica). Saved verbatim as
  `scripts/mideplan_regions_source.json`.
- **How it was built:** `scripts/build-regiones-mideplan.mjs` matches each of
  the 84 cantons in that table (by slugified name) against `cantones.geojson`
  (83/84 matched — see caveats), tags each canton feature with its region,
  then dissolves cantons into region polygons with `mapshaper -dissolve`.
  Region colors (`color` property) are MIDEPLAN's own map colors, carried
  through from the source table.
- **Feature count:** 6 regions — Central (45 cantones), Chorotega (11),
  Pacífico Central (8, see caveat), Brunca (7), Huetar Caribe (6), Huetar
  Norte (6).
- **Caveats:**
  - Dissolved at canton granularity. The official regionalization actually
    carves two districts out of their parent canton — Sarapiquí (district
    20114, canton Alajuela) and Peñas Blancas (district 20213, canton San
    Ramón) both belong to Huetar Norte, while the rest of each canton is
    Central. This project has no distrito-level boundaries yet (see below),
    so Alajuela and San Ramón are kept whole in Central. Small inaccuracy at
    those two canton edges.
  - Monteverde canton (Pacífico Central, per the source table) isn't a
    separate polygon in `cantones.geojson` (postdates that dataset's
    vintage, see below) — its territory is still folded into the Puntarenas
    canton polygon, which is already assigned to Pacífico Central, so the
    region's coverage is complete even though Monteverde isn't individually
    distinguishable inside it.
- **To improve further:** get real distrito boundaries (see "What's missing"
  below) and re-dissolve at distrito granularity to fix the Alajuela/San
  Ramón edge case exactly.

## ids_cantonal_demo.json — ⚠️ FAKE DATA

- **Status:** entirely fabricated demo values, `demo: true` flagged in the
  file itself. These are **not** MIDEPLAN's real Índice de Desarrollo Social
  figures — they're a seeded-random number per cantón (0–100) so the
  choropleth has something to render.
- **To fix properly:** MIDEPLAN publishes the real IDS by cantón/distrito
  periodically (last known edition: IDS 2023) as a PDF/Excel table on
  mideplan.go.cr — no ready GeoJSON/API found. Replace the `values` map with
  real figures keyed by the same `id` slugs used in `cantones.geojson`, and
  flip `demo` to `false`.

## idh_cantonal.json, idg_cantonal.json, idh_d_cantonal.json, idg_d_cantonal.json, isc_cantonal.json, ivdac_cantonal.json, ipm_cantonal.json

- **Status:** real values, `demo: false`. **Source not independently
  verified** — the user supplied seven xlsx files ("Índice de ... Atlas
  2026.xlsx") whose sheet layout and index names match the PNUD Costa Rica
  Atlas de Desarrollo Humano Cantonal, but the exact publisher/edition/URL
  wasn't confirmed. Treat as user-supplied data, same caveat as
  `plantas_potabilizadoras_aya.geojson` above.
- **Raw files:** kept at `scripts/raw/atlas_2026/*.xlsx` (not served —
  outside `public/`). Each xlsx has one "composite index" sheet plus several
  sub-component sheets (e.g. IDH's file also has life-expectancy, income,
  and schooling sub-indices per sex/component); **only the composite sheet
  is ingested for v1** — the sub-components are sitting in the raw files for
  potential future indicators.
- **Processing:** `scripts/build-indicators-atlas.mjs` reads each xlsx's
  composite sheet, keyed by rows like `"101: San José"`. For sheets shaped as
  a year-by-cantón time series (all of these except IPM), it takes the most
  recent year column with data for at least half the cantones — that's 2024
  for idh/idg/idh_d/idg_d/ivdac, 2025 for isc. `ipm_cantonal.json` is a
  single-year (2024) snapshot sheet with several columns; only the `IPM`
  composite column is used (Incidencia/Intensidad/Severidad/etc. sub-columns
  and `IPM_rank` are in the raw file but not ingested).
- **Cantón matching:** row labels are matched to `cantones.geojson` ids by
  slugifying the name after the `NNN:` code prefix. Two mismatches handled by
  the script: **"León Cortés"** slugifies to `leon_cortes`, aliased to the
  existing `leon_cortes_castro` id; **"Monteverde"** (canton 612) has no
  separate polygon in `cantones.geojson` yet (see the cantones.geojson entry
  above) and is dropped — all 7 datasets cover 83/84 cantones.
- **Scale:** `[min, max]` computed from the actual data range per indicator
  (not a fixed 0–1), so the choropleth stretches across what's actually
  observed. Color direction is magnitude-only (light → dark), it does **not**
  flip based on whether higher is "good" or "bad" for a given index — read
  the label before interpreting a dark canton as better or worse.
- **To improve further:** confirm the exact PNUD publication/edition and
  cite it properly; ingest the sub-component sheets as additional indicators
  if useful; consider a distrito-level version once distrito boundaries
  exist (see "What's missing" below).

## regiones_cafetaleras_icafe.geojson

- **Source:** ICAFE (Instituto del Café de Costa Rica), via SNIT (Sistema Nacional de Información Territorial) node, served as an ArcGIS-hosted WFS
- **Title:** "Distribución regiones cafetaleras en Costa Rica a escala 1:5000" (ICAFE_REGIONES_CAFETALERAS_2022_5K), created 2022-01-03
- **WFS endpoint:** `https://dservices5.arcgis.com/LF48CxpifRE4aglv/arcgis/services/Cobertura_Cafe_Costa_Rica_WFS/WFSServer`, typeName `Cobertura_Cafe_Costa_Rica_WFS:Distribucion_regiones_cafetaleras` (found by loading SNIT's metadata page in a browser and reading its "Distribución" tab — the ISO 19115-3 XML metadata record itself doesn't embed the service URL)
- **License:** access constraints and use constraints both listed as "No restringido (irrestricto)" in the official metadata
- **Admin level:** thematic (not administrative) — ICAFE's own 7 coffee-growing regions: Valle Central, Valle Occidental, Los Santos, Turrialba, Pérez Zeledón, Coto Brus, Zona Norte. **Not the same regionalization as MIDEPLAN's 6 planning regions** — different boundaries, different purpose (coffee denomination-of-origin zones vs. socioeconomic planning), don't conflate the two.
- **Downloaded:** 2026-09-22, fetched live via `GetFeature&outputFormat=GEOJSON&srsName=EPSG:4326` (native CRS is EPSG:8908, reprojected server-side on request)
- **Feature count:** 7 (matches the 7 named regions)
- **Processing:** simplified with `mapshaper -simplify 1% keep-shapes` (19MB → 184KB; repaired 6 self-intersections), properties trimmed to `{id, name, area_ha}`

## plantas_potabilizadoras_aya.geojson

- **Source:** user-provided (`/Users/carlos_cruz/Downloads/plantas.geojson`), AyA (Instituto Costarricense de Acueductos y Alcantarillados) water-quality sampling data per potabilizadora, 2017–2021. License/original source URL not specified by the user — treat as user-supplied data, not independently verified against an official AyA publication.
- **Content:** one point per planta potabilizadora, with `tasa_incumplimiento` (share of samples that failed a limit), `n` (sample count), `anho_min`/`anho_max`, the parameter(s) evaluated (`tipo`, `etapas`), and a per-parameter breakdown (`incumplimiento_por_parametro`).
- **Feature count:** source file has 41 features; **1 has no geometry** (Planta Potabilizadora Santa Rosa2, Brunca) and is dropped from the map layer — 40 plantas are plotted. The user described this as "43 potabilizadoras"; the file itself only contains 41.
- **`region_aya` property:** AyA's own 6 operating regions (Chorotega, Brunca, Central Oeste, Metropolitana, Huetar Caribe, Pacífico Central) — a third, independent regionalization, distinct from both MIDEPLAN's planning regions and ICAFE's coffee regions. Not dissolved into a boundary layer, kept as a point attribute only.
- **Processing:** copied as-is, only the geometry-less feature removed. No simplification needed (19KB).

## What's missing / TODO

- Distritos (admin level 3) — not included in v1. geoBoundaries doesn't
  publish CRI ADM3; would need SNIT/IGN (https://www.snitcr.go.cr) or the
  ArcGIS Hub "Distritos de Costa Rica" layer referenced during research.
  Would also let us fix the Alajuela/San Ramón region-boundary caveat above.
- Monteverde canton polygon (see cantones.geojson above).
- Real IDS values (see ids_cantonal_demo.json above) — still fake.
