import { useEffect, useState } from "react";
import { useGeoJSON } from "./hooks/useGeoJSON";
import { usePoints } from "./hooks/usePoints";
import { PALETTE_COLORS } from "./utils/color";
import MapView from "./components/MapView";
import LayerControlPanel from "./components/LayerControlPanel";
import type { IndicatorDataset } from "./types";

export default function App() {
  const provincias = useGeoJSON("/data/provincias.geojson");
  const cantones = useGeoJSON("/data/cantones.geojson");
  const regiones = useGeoJSON("/data/regiones_mideplan.geojson");
  const regionesCafetaleras = useGeoJSON("/data/regiones_cafetaleras_icafe.geojson");
  const plantasAgua = useGeoJSON("/data/plantas_potabilizadoras_aya.geojson");
  const [indicatorData, setIndicatorData] = useState<IndicatorDataset | null>(null);

  useEffect(() => {
    fetch("/data/ids_cantonal_demo.json")
      .then((r) => r.json())
      .then(setIndicatorData);
  }, []);

  const [showProvincias, setShowProvincias] = useState(true);
  const [showCantones, setShowCantones] = useState(true);
  const [showRegiones, setShowRegiones] = useState(false);
  const [showRegionesCafetaleras, setShowRegionesCafetaleras] = useState(false);
  const [showPlantasAgua, setShowPlantasAgua] = useState(true);
  const [choroplethOn, setChoroplethOn] = useState(false);

  const [addMode, setAddMode] = useState(false);
  const [activeColor, setActiveColor] = useState(PALETTE_COLORS[0]);

  const { points, addPoint, movePoint, removePoint, clearPoints, exportGeoJSON } = usePoints();

  return (
    <div className="app-shell">
      <LayerControlPanel
        showProvincias={showProvincias}
        setShowProvincias={setShowProvincias}
        showCantones={showCantones}
        setShowCantones={setShowCantones}
        showRegiones={showRegiones}
        setShowRegiones={setShowRegiones}
        showRegionesCafetaleras={showRegionesCafetaleras}
        setShowRegionesCafetaleras={setShowRegionesCafetaleras}
        showPlantasAgua={showPlantasAgua}
        setShowPlantasAgua={setShowPlantasAgua}
        choroplethOn={choroplethOn}
        setChoroplethOn={setChoroplethOn}
        indicator={indicatorData ?? undefined}
        addMode={addMode}
        setAddMode={setAddMode}
        activeColor={activeColor}
        setActiveColor={setActiveColor}
        points={points}
        onRemovePoint={removePoint}
        onClearPoints={clearPoints}
        onExport={exportGeoJSON}
      />
      <MapView
        provincias={provincias}
        cantones={cantones}
        regiones={regiones}
        regionesCafetaleras={regionesCafetaleras}
        plantasAgua={plantasAgua}
        showProvincias={showProvincias}
        showCantones={showCantones}
        showRegiones={showRegiones}
        showRegionesCafetaleras={showRegionesCafetaleras}
        showPlantasAgua={showPlantasAgua}
        indicator={choroplethOn ? indicatorData ?? undefined : undefined}
        points={points}
        onMovePoint={movePoint}
        onRemovePoint={removePoint}
        addMode={addMode}
        activeColor={activeColor}
        onAddPoint={addPoint}
      />
    </div>
  );
}
