// One-off script: dissolves public/data/cantones.geojson into MIDEPLAN's 6
// official planning regions, using the canton->region table transcribed by
// the user from an official MIDEPLAN map (scripts/mideplan_regions_source.json).
// Run with: node scripts/build-regiones-mideplan.mjs
import fs from "node:fs";
import { execSync } from "node:child_process";

const slugify = (s) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

const cantones = JSON.parse(fs.readFileSync("public/data/cantones.geojson"));
const source = JSON.parse(fs.readFileSync("scripts/mideplan_regions_source.json"));

const slugToRegion = new Map();
for (const region of source.regions) {
  for (const canton of region.cantons) {
    slugToRegion.set(slugify(canton.name), { id: region.id, name: region.name, color: region.color });
  }
}

const unmatchedFeatures = [];
let tagged = 0;
for (const feature of cantones.features) {
  const region = slugToRegion.get(feature.properties.id);
  if (region) {
    feature.properties.region_id = region.id;
    feature.properties.region_name = region.name;
    feature.properties.region_color = region.color;
    tagged++;
  } else {
    unmatchedFeatures.push(feature.properties.id);
  }
}

const matchedSlugs = new Set(cantones.features.map((f) => f.properties.id));
const unmatchedSourceCantons = [...slugToRegion.keys()].filter((slug) => !matchedSlugs.has(slug));

console.log(`Tagged ${tagged}/${cantones.features.length} cantones.geojson features with a region.`);
console.log("cantones.geojson features with NO region match:", unmatchedFeatures);
console.log("Source cantons with no match in cantones.geojson (expected: montverde, split off after our data's vintage):", unmatchedSourceCantons);

fs.writeFileSync("/tmp/cantones_tagged.geojson", JSON.stringify(cantones));

execSync(
  `npx --yes mapshaper -i /tmp/cantones_tagged.geojson ` +
    `-dissolve region_id copy-fields=region_name,region_color calc='cantones_count=collect(name).length' ` +
    `-simplify 5% keep-shapes ` +
    `-o format=geojson precision=0.0001 /tmp/regiones_mideplan_dissolved.geojson`,
  { stdio: "inherit" }
);

const dissolved = JSON.parse(fs.readFileSync("/tmp/regiones_mideplan_dissolved.geojson"));
const out = {
  type: "FeatureCollection",
  properties: {
    source: source.meta.source,
    transcribedFrom: source.meta.transcribedFrom,
    caveats: [
      "Dissolved at canton granularity from cantones.geojson (geoBoundaries ADM2). Alajuela and San Ramón are kept whole in Central even though the official regionalization carves out their Sarapiquí and Peñas Blancas districts into Huetar Norte — no distrito-level boundaries in this project yet, see DATA_SOURCES.md.",
      "Monteverde canton (Pacífico Central) isn't a separate polygon in cantones.geojson (post-dates that dataset's vintage) — its territory is still folded into the Puntarenas canton polygon, which is already assigned to Pacífico Central, so coverage is complete even though the canton isn't individually distinguishable.",
    ],
  },
  features: dissolved.features.map((f) => ({
    type: "Feature",
    properties: {
      id: f.properties.region_id,
      name: f.properties.region_name,
      color: f.properties.region_color,
      cantones_count: f.properties.cantones_count,
    },
    geometry: f.geometry,
  })),
};
out.features.sort((a, b) => a.properties.name.localeCompare(b.properties.name, "es"));

fs.writeFileSync("public/data/regiones_mideplan.geojson", JSON.stringify(out));
console.log(`\nWrote public/data/regiones_mideplan.geojson — ${out.features.length} regions:`);
for (const f of out.features) console.log(`  ${f.properties.name}: ${f.properties.cantones_count} cantones`);
