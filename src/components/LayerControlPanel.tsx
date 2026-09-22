import { PALETTE_COLORS } from "../utils/color";
import type { IndicatorDataset, MapPoint } from "../types";

interface Props {
  showProvincias: boolean;
  setShowProvincias: (v: boolean) => void;
  showCantones: boolean;
  setShowCantones: (v: boolean) => void;
  showRegiones: boolean;
  setShowRegiones: (v: boolean) => void;
  showRegionesCafetaleras: boolean;
  setShowRegionesCafetaleras: (v: boolean) => void;
  showPlantasAgua: boolean;
  setShowPlantasAgua: (v: boolean) => void;
  choroplethOn: boolean;
  setChoroplethOn: (v: boolean) => void;
  indicator?: IndicatorDataset;
  addMode: boolean;
  setAddMode: (v: boolean) => void;
  activeColor: string;
  setActiveColor: (c: string) => void;
  points: MapPoint[];
  onRemovePoint: (id: string) => void;
  onClearPoints: () => void;
  onExport: () => void;
}

export default function LayerControlPanel(props: Props) {
  const {
    showProvincias,
    setShowProvincias,
    showCantones,
    setShowCantones,
    showRegiones,
    setShowRegiones,
    showRegionesCafetaleras,
    setShowRegionesCafetaleras,
    showPlantasAgua,
    setShowPlantasAgua,
    choroplethOn,
    setChoroplethOn,
    indicator,
    addMode,
    setAddMode,
    activeColor,
    setActiveColor,
    points,
    onRemovePoint,
    onClearPoints,
    onExport,
  } = props;

  return (
    <div className="panel">
      <h1>Costa Rica Toolkit</h1>
      <p className="subtitle">Mapa socioeconómico interactivo</p>

      <div className="section">
        <h2>Límites administrativos</h2>
        <label className="option-row">
          <input type="checkbox" checked={showProvincias} onChange={(e) => setShowProvincias(e.target.checked)} />
          Provincias (7)
        </label>
        <label className="option-row">
          <input type="checkbox" checked={showCantones} onChange={(e) => setShowCantones(e.target.checked)} />
          Cantones (83)
        </label>
        <label className="option-row">
          <input type="checkbox" checked={showRegiones} onChange={(e) => setShowRegiones(e.target.checked)} />
          Regiones MIDEPLAN (6)
        </label>
      </div>

      <hr className="divider" />

      <div className="section">
        <h2>Capas temáticas</h2>
        <label className="option-row">
          <input
            type="checkbox"
            checked={showRegionesCafetaleras}
            onChange={(e) => setShowRegionesCafetaleras(e.target.checked)}
          />
          Regiones cafetaleras (ICAFE, 7)
        </label>
        <p className="hint">
          Zonas productoras de café 2022, fuente real (SNIT/ICAFE, WFS, uso irrestricto). No confundir con las regiones
          de planificación MIDEPLAN de arriba.
        </p>

        <label className="option-row" style={{ marginTop: 10 }}>
          <input type="checkbox" checked={showPlantasAgua} onChange={(e) => setShowPlantasAgua(e.target.checked)} />
          Plantas potabilizadoras AyA (40)
        </label>
        <p className="hint">
          Muestras de calidad de agua 2017–2021 por planta potabilizadora, dato provisto por el usuario. Color = tasa
          de incumplimiento (verde bajo, rojo alto). Clic en un punto para el detalle por parámetro.
        </p>
      </div>

      <hr className="divider" />

      <div className="section">
        <h2>Choropleth</h2>
        <label className="option-row">
          <input
            type="checkbox"
            checked={choroplethOn}
            disabled={!showCantones}
            onChange={(e) => setChoroplethOn(e.target.checked)}
          />
          Colorear cantones por indicador
        </label>
        {indicator && (
          <>
            <select disabled value={indicator.indicator}>
              <option value={indicator.indicator}>{indicator.label}</option>
            </select>
            <p className="hint">
              <span className="badge demo">demo</span> {indicator.source}. Único indicador disponible en v1 — agregar más en{" "}
              <code>public/data/</code>.
            </p>
          </>
        )}
      </div>

      <hr className="divider" />

      <div className="section">
        <h2>Puntos</h2>
        <div className="palette">
          {PALETTE_COLORS.map((color) => (
            <div
              key={color}
              className="palette-pin"
              style={{ background: color, outline: activeColor === color ? "2px solid #0f766e" : undefined }}
              draggable
              onDragStart={(e) => e.dataTransfer.setData("text/plain", color)}
              onClick={() => setActiveColor(color)}
              title="Arrastrar al mapa, o seleccionar y hacer clic en el mapa"
            />
          ))}
        </div>
        <p className="hint">Arrastrá un color al mapa, o seleccionalo y activá "clic para agregar".</p>

        <button className={`action ${addMode ? "primary" : ""}`} style={{ marginTop: 10 }} onClick={() => setAddMode(!addMode)}>
          {addMode ? "Clic para agregar: ON" : "Clic para agregar: OFF"}
        </button>

        {points.length > 0 && (
          <div style={{ marginTop: 12 }}>
            {points.map((p) => (
              <div className="point-item" key={p.id}>
                <span className="swatch" style={{ background: p.color }} />
                <span>{p.label}</span>
                <span className="coords">
                  {p.lat.toFixed(3)}, {p.lng.toFixed(3)}
                </span>
                <button onClick={() => onRemovePoint(p.id)}>✕</button>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button className="action" onClick={onExport} disabled={points.length === 0}>
            Exportar GeoJSON
          </button>
          <button className="action" onClick={onClearPoints} disabled={points.length === 0}>
            Limpiar
          </button>
        </div>
      </div>
    </div>
  );
}
