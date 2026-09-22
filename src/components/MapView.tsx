import { useEffect } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import type { FeatureCollection } from "geojson";
import BoundaryLayer from "./BoundaryLayer";
import PointsLayer from "./PointsLayer";
import WaterPlantsLayer from "./WaterPlantsLayer";
import Legend, { WaterPlantsLegend } from "./Legend";
import type { IndicatorDataset, MapPoint } from "../types";

const CR_CENTER: [number, number] = [9.7489, -83.7534];

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
  points: MapPoint[];
  onMovePoint: (id: string, lat: number, lng: number) => void;
  onRemovePoint: (id: string) => void;
  addMode: boolean;
  activeColor: string;
  onAddPoint: (lat: number, lng: number, color: string) => void;
}

function ClickToAdd({ addMode, activeColor, onAddPoint }: Pick<Props, "addMode" | "activeColor" | "onAddPoint">) {
  useMapEvents({
    click(e) {
      if (addMode) onAddPoint(e.latlng.lat, e.latlng.lng, activeColor);
    },
  });
  return null;
}

function DropTarget({ onAddPoint }: Pick<Props, "onAddPoint">) {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();

    const onDragOver = (e: DragEvent) => e.preventDefault();
    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      const color = e.dataTransfer?.getData("text/plain");
      if (!color) return;
      const rect = container.getBoundingClientRect();
      const point = L.point(e.clientX - rect.left, e.clientY - rect.top);
      const latlng = map.containerPointToLatLng(point);
      onAddPoint(latlng.lat, latlng.lng, color);
    };

    container.addEventListener("dragover", onDragOver);
    container.addEventListener("drop", onDrop);
    return () => {
      container.removeEventListener("dragover", onDragOver);
      container.removeEventListener("drop", onDrop);
    };
  }, [map, onAddPoint]);

  return null;
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
    points,
    onMovePoint,
    onRemovePoint,
    addMode,
    activeColor,
    onAddPoint,
  } = props;

  return (
    <div className="map-area" style={{ cursor: addMode ? "crosshair" : undefined }}>
      {addMode && <div className="drop-hint">Clic en el mapa para agregar un punto</div>}
      <MapContainer center={CR_CENTER} zoom={8} minZoom={7} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.esri.com">Esri</a> &mdash; Esri, HERE, Garmin, FAO, NOAA, USGS'
          url="https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}"
          maxZoom={16}
        />

        {showProvincias && provincias && (
          <BoundaryLayer data={provincias} layerKey="provincias" baseColor="#334155" />
        )}
        {showRegiones && regiones && (
          <BoundaryLayer data={regiones} layerKey="regiones" baseColor="#4338ca" dashed />
        )}
        {showCantones && cantones && (
          <BoundaryLayer data={cantones} layerKey="cantones" baseColor="#0f766e" indicator={indicator} />
        )}
        {showRegionesCafetaleras && regionesCafetaleras && (
          <BoundaryLayer data={regionesCafetaleras} layerKey="regiones_cafetaleras" baseColor="#7c4a1e" dashed />
        )}
        {showPlantasAgua && plantasAgua && <WaterPlantsLayer data={plantasAgua} />}

        <PointsLayer points={points} onMove={onMovePoint} onRemove={onRemovePoint} />
        <ClickToAdd addMode={addMode} activeColor={activeColor} onAddPoint={onAddPoint} />
        <DropTarget onAddPoint={onAddPoint} />
      </MapContainer>

      <div className="legend-stack">
        {indicator && showCantones && <Legend indicator={indicator} />}
        {showPlantasAgua && <WaterPlantsLegend />}
      </div>
    </div>
  );
}
