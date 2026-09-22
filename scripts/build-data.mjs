// One-off script used to derive the shipped GeoJSON/JSON files in this folder
// from the raw geoBoundaries downloads. Not part of the app build.
// Run with: node build-data.mjs
import fs from "node:fs";

const NAME_FIXES = {
  Aserri: "Aserrí",
  Belen: "Belén",
  Canas: "Cañas",
  Escazu: "Escazú",
  Guacimo: "Guácimo",
  Jimenez: "Jiménez",
  "Leon Cortes Castro": "León Cortés Castro",
  Limon: "Limón",
  Palmeras: "Palmares",
  Paraiso: "Paraíso",
  "Perez Zeledon": "Pérez Zeledón",
  Poas: "Poás",
  Pococi: "Pococí",
  "Rio Cuarto": "Río Cuarto",
  "San Jose": "San José",
  "San Ramon": "San Ramón",
  Sarapiqui: "Sarapiquí",
  Sarchi: "Sarchí",
  Tarrazu: "Tarrazú",
  Tibas: "Tibás",
  Tilaran: "Tilarán",
  "Vazquez de Coronado": "Vázquez de Coronado",
};

const slugify = (s) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

function cleanCollection(raw, { fixNames = false } = {}) {
  const data = JSON.parse(fs.readFileSync(raw));
  const features = data.features.map((f) => {
    let name = f.properties.shapeName.replace(/^Provincia\s+/, "");
    if (fixNames && NAME_FIXES[name]) name = NAME_FIXES[name];
    return {
      type: "Feature",
      properties: { id: slugify(name), name },
      geometry: f.geometry,
    };
  });
  features.sort((a, b) => a.properties.name.localeCompare(b.properties.name, "es"));
  return { type: "FeatureCollection", features };
}

const provincias = cleanCollection("provincias_simp.geojson");
fs.writeFileSync("provincias.geojson", JSON.stringify(provincias));
console.log("provincias.geojson:", provincias.features.length, "features");

const cantones = cleanCollection("cantones_simp.geojson", { fixNames: true });
fs.writeFileSync("cantones.geojson", JSON.stringify(cantones));
console.log("cantones.geojson:", cantones.features.length, "features");

// Obviously-fake demo indicator values, keyed by canton id. NOT real MIDEPLAN IDS data.
let seed = 42;
const rand = () => {
  seed = (seed * 1103515245 + 12345) & 0x7fffffff;
  return seed / 0x7fffffff;
};
const demoIDS = {
  demo: true,
  indicator: "ids_demo",
  label: "Índice de Desarrollo Social (DEMO — valores ficticios)",
  source: "FAKE DATA generated for this project, not MIDEPLAN IDS figures",
  year: null,
  scale: [0, 100],
  values: Object.fromEntries(
    cantones.features.map((f) => [f.properties.id, Math.round(rand() * 100 * 100) / 100])
  ),
};
fs.writeFileSync("ids_cantonal_demo.json", JSON.stringify(demoIDS, null, 2));
console.log("ids_cantonal_demo.json:", Object.keys(demoIDS.values).length, "cantones");

fs.rmSync("provincias_raw.geojson");
fs.rmSync("cantones_raw.geojson");
fs.rmSync("provincias_simp.geojson");
fs.rmSync("cantones_simp.geojson");
console.log("cleaned up intermediate files");
