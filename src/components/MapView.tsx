import { MapContainer, TileLayer } from "react-leaflet";
import type { FeatureCollection } from "geojson";
import BoundaryLayer from "./BoundaryLayer";
import WaterPlantsLayer from "./WaterPlantsLayer";
import Legend, { WaterPlantsLegend } from "./Legend";
import type { IndicatorDataset } from "../types";
import type { MapTheme } from "../utils/color";

const CR_CENTER: [number, number] = [9.7489, -83.7534];

const TILE_URL: Record<MapTheme, string> = {
  dark: "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
  light: "https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
};

const BOUNDARY_COLORS: Record<MapTheme, { provincias: string; regiones: string; cantones: string; cafetaleras: string }> = {
  dark: { provincias: "#94a3b8", regiones: "#818cf8", cantones: "#2dd4bf", cafetaleras: "#d9a066" },
  light: { provincias: "#475569", regiones: "#4338ca", cantones: "#0f766e", cafetaleras: "#7c4a1e" },
};

interface Props {
  provincias: FeatureCollection | null;
  cantones: FeatureCollection | null;
  regiones: FeatureCollection | null;
  regionesCafetaleras: FeatureCollection | null;
  plantasAgua: FeatureCollection | null;
  showProvincias: boolean;
  showCantones: boolean;
  showRegiones: boolean;
  showRegionesCafetaleras: boolean;
  showPlantasAgua: boolean;
  indicator?: IndicatorDataset;
  theme: MapTheme;
}

export default function MapView(props: Props) {
  const {
    provincias,
    cantones,
    regiones,
    regionesCafetaleras,
    plantasAgua,
    showProvincias,
    showCantones,
    showRegiones,
    showRegionesCafetaleras,
    showPlantasAgua,
    indicator,
    theme,
  } = props;

  const boundaryColors = BOUNDARY_COLORS[theme];

  return (
    <main id="main-map" className="map-area" aria-label="Mapa interactivo de Costa Rica" tabIndex={-1}>
      <MapContainer center={CR_CENTER} zoom={8} minZoom={7} scrollWheelZoom>
        <TileLayer
          key={theme}
          attribution='&copy; <a href="https://www.esri.com">Esri</a> &mdash; Esri, HERE, Garmin, FAO, NOAA, USGS'
          url={TILE_URL[theme]}
          maxZoom={16}
        />

        {showProvincias && provincias && (
          <BoundaryLayer data={provincias} layerKey="provincias" baseColor={boundaryColors.provincias} theme={theme} />
        )}
        {showRegiones && regiones && (
          <BoundaryLayer data={regiones} layerKey="regiones" baseColor={boundaryColors.regiones} dashed theme={theme} />
        )}
        {showCantones && cantones && (
          <BoundaryLayer
            data={cantones}
            layerKey="cantones"
            baseColor={boundaryColors.cantones}
            indicator={indicator}
            theme={theme}
          />
        )}
        {showRegionesCafetaleras && regionesCafetaleras && (
          <BoundaryLayer
            data={regionesCafetaleras}
            layerKey="regiones_cafetaleras"
            baseColor={boundaryColors.cafetaleras}
            dashed
            theme={theme}
          />
        )}
        {showPlantasAgua && plantasAgua && <WaterPlantsLayer data={plantasAgua} />}
      </MapContainer>

      <div className="legend-stack" aria-label="Leyendas del mapa">
        {indicator && showCantones && <Legend indicator={indicator} theme={theme} />}
        {showPlantasAgua && <WaterPlantsLegend />}
      </div>
    </main>
  );
}
