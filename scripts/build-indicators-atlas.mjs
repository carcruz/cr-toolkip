// One-off script that derives public/data/*_cantonal.json from the raw
// "Atlas 2026" xlsx files in scripts/raw/atlas_2026/ (user-supplied).
// Not part of the app build. Run with: node scripts/build-indicators-atlas.mjs
// Requires the "xlsx" package (SheetJS) — install once with:
//   npm install --no-save https://cdn.sheetjs.com/xlsx-0.20.3/xlsx-0.20.3.tgz
import fs from "node:fs";
import path from "node:path";
import XLSX from "xlsx";

const RAW_DIR = "scripts/raw/atlas_2026";
const OUT_DIR = "public/data";
const SOURCE_NOTE =
  "Datos suministrados por el usuario (archivo Atlas 2026); origen exacto (editor/URL) no verificado " +
  "independientemente, pero consistente con el Atlas de Desarrollo Humano Cantonal.";

// Cantón names in the xlsx that don't slugify to an id already present in
// cantones.geojson. "leon_cortes" -> geoBoundaries kept "...Castro" in the
// name. Monteverde has no separate polygon yet (folded into Puntarenas, see
// DATA_SOURCES.md) so it's dropped rather than mismatched onto a canton it
// isn't part of.
const ALIASES = { leon_cortes: "leon_cortes_castro" };
const DROP = new Set(["monteverde"]);

const slugify = (s) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

const cantones = JSON.parse(fs.readFileSync("public/data/cantones.geojson"));
const validIds = new Set(cantones.features.map((f) => f.properties.id));

// macOS stores filenames as NFD (decomposed) on disk; our literals here are
// NFC (composed), so match by normalized form instead of raw byte equality.
const rawFilesByNormalizedName = new Map(fs.readdirSync(RAW_DIR).map((f) => [f.normalize("NFC"), f]));
function resolveRawFile(file) {
  const onDisk = rawFilesByNormalizedName.get(file.normalize("NFC"));
  if (!onDisk) throw new Error(`Raw file not found: ${file}`);
  return onDisk;
}

function readSheet(file, sheetName) {
  // XLSX.readFile's own file access doesn't resolve under plain ESM (`require`
  // is undefined there), so read the bytes ourselves and hand it a buffer.
  const buf = fs.readFileSync(path.join(RAW_DIR, resolveRawFile(file)));
  const wb = XLSX.read(buf, { type: "buffer" });
  const ws = wb.Sheets[sheetName];
  if (!ws) throw new Error(`Sheet "${sheetName}" not found in ${file}`);
  return XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: null });
}

function cantonRows(rows) {
  return rows.slice(1).flatMap((row) => {
    const raw = row[0];
    const m = typeof raw === "string" && raw.match(/^\d+:\s*(.+)$/);
    if (!m) return [];
    let slug = slugify(m[1].trim());
    if (DROP.has(slug)) return [];
    slug = ALIASES[slug] ?? slug;
    if (!validIds.has(slug)) {
      console.warn(`  ! no canton match for "${m[1].trim()}" (slug "${slug}")`);
      return [];
    }
    return [{ id: slug, row }];
  });
}

// Time-series sheet: header row is ["Cantón", year, year, ...]. Takes the
// last column that has a value for at least half the cantones.
function buildFromYearSeries(file, sheetName, { indicator, label }) {
  const rows = readSheet(file, sheetName);
  const header = rows[0];
  const entries = cantonRows(rows);

  let year = null;
  let colIndex = -1;
  for (let c = header.length - 1; c >= 1; c--) {
    if (typeof header[c] !== "number") continue;
    const filled = entries.filter((e) => typeof e.row[c] === "number").length;
    if (filled >= entries.length / 2) {
      year = header[c];
      colIndex = c;
      break;
    }
  }
  if (colIndex === -1) throw new Error(`No usable year column found in ${file}/${sheetName}`);

  const values = Object.fromEntries(
    entries.filter((e) => typeof e.row[colIndex] === "number").map((e) => [e.id, e.row[colIndex]])
  );
  return finish(indicator, label, year, values);
}

// Snapshot sheet: header row names columns directly, pick one by name.
function buildFromColumn(file, sheetName, columnName, { indicator, label, year }) {
  const rows = readSheet(file, sheetName);
  const header = rows[0];
  const colIndex = header.indexOf(columnName);
  if (colIndex === -1) throw new Error(`Column "${columnName}" not found in ${file}/${sheetName}`);

  const entries = cantonRows(rows);
  const values = Object.fromEntries(
    entries.filter((e) => typeof e.row[colIndex] === "number").map((e) => [e.id, e.row[colIndex]])
  );
  return finish(indicator, label, year, values);
}

function finish(indicator, label, year, values) {
  const nums = Object.values(values);
  const round = (n) => Math.round(n * 1000) / 1000;
  return {
    demo: false,
    indicator,
    label,
    source: SOURCE_NOTE,
    year,
    scale: [round(Math.min(...nums)), round(Math.max(...nums))],
    values,
  };
}

const DATASETS = [
  {
    file: "Índice de Desarrollo Humano Atlas 2026.xlsx",
    sheet: "IDH",
    kind: "series",
    indicator: "idh",
    label: "Índice de Desarrollo Humano (IDH)",
  },
  {
    file: "Índice de Desarrollo Género Atlas 2026.xlsx",
    sheet: "IDG",
    kind: "series",
    indicator: "idg",
    label: "Índice de Desarrollo de Género (IDG)",
  },
  {
    file: "Índice de Desarrollo Humano ajustado por Desigualdad Atlas 2026.xlsx",
    sheet: "IDH-D",
    kind: "series",
    indicator: "idh_d",
    label: "IDH ajustado por Desigualdad (IDH-D)",
  },
  {
    file: "Índice de Desigualdad de Género Atlas 2026.xlsx",
    sheet: "IDG-D",
    kind: "series",
    indicator: "idg_d",
    label: "Índice de Desigualdad de Género (IDG-D)",
  },
  {
    file: "Índice de Seguridad Ciudadana Atlas 2026.xlsx",
    sheet: "ISC",
    kind: "series",
    indicator: "isc",
    label: "Índice de Seguridad Ciudadana (ISC)",
  },
  {
    file: "Índice de Vulnerabilidad a Drogas y Acrividades Conexas Atlas 2026.xlsx",
    sheet: "IVDAC",
    kind: "series",
    indicator: "ivdac",
    label: "Índice de Vulnerabilidad a Drogas y Actividades Conexas (IVDAC)",
  },
  {
    file: "Índice de Pobreza Multidimensional Atlas 2026.xlsx",
    sheet: "IPM 2024",
    kind: "column",
    column: "IPM",
    year: 2024,
    indicator: "ipm",
    label: "Índice de Pobreza Multidimensional (IPM)",
  },
];

const manifest = [];
for (const d of DATASETS) {
  console.log(d.file);
  const dataset =
    d.kind === "series"
      ? buildFromYearSeries(d.file, d.sheet, d)
      : buildFromColumn(d.file, d.sheet, d.column, d);
  const outFile = `${d.indicator}_cantonal.json`;
  fs.writeFileSync(path.join(OUT_DIR, outFile), JSON.stringify(dataset, null, 2));
  console.log(
    `  -> ${outFile}: ${Object.keys(dataset.values).length} cantones, year ${dataset.year}, scale ${dataset.scale}`
  );
  manifest.push({ id: d.indicator, file: outFile, label: d.label, demo: false });
}

// Keep the existing fabricated demo indicator available in the picker too.
manifest.push({ id: "ids_demo", file: "ids_cantonal_demo.json", label: "Índice de Desarrollo Social (DEMO)", demo: true });

fs.writeFileSync(path.join(OUT_DIR, "indicators_manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`indicators_manifest.json: ${manifest.length} indicators`);
