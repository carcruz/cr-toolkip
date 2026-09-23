import type { IndicatorDataset, IndicatorManifestEntry } from "../types";
import type { MapTheme } from "../utils/color";

interface Props {
  theme: MapTheme;
  setTheme: (t: MapTheme) => void;
  onClose?: () => void;
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
  indicators: IndicatorManifestEntry[];
  selectedIndicatorId: string;
  setSelectedIndicatorId: (id: string) => void;
  indicator?: IndicatorDataset;
}

export default function LayerControlPanel(props: Props) {
  const {
    theme,
    setTheme,
    onClose,
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
    indicators,
    selectedIndicatorId,
    setSelectedIndicatorId,
    indicator,
  } = props;

  const realIndicators = indicators.filter((i) => !i.demo);

  return (
    <aside className="panel" aria-label="Panel de control de capas del mapa">
      <header className="panel-header">
        <div>
          <h1>Costa Rica Toolkit</h1>
          <p className="subtitle">Mapa socioeconómico interactivo</p>
        </div>
        <div className="panel-header-actions">
          <button
            className="theme-toggle"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            title="Cambiar tema del mapa"
            aria-label={theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
            aria-pressed={theme === "light"}
          >
            <span aria-hidden="true">{theme === "dark" ? "☾" : "☀"}</span>
          </button>
          {onClose && (
            <button className="panel-close" onClick={onClose} aria-label="Cerrar panel de capas">
              <span aria-hidden="true">✕</span>
            </button>
          )}
        </div>
      </header>

      <fieldset className="section">
        <legend>Límites administrativos</legend>
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
      </fieldset>

      <hr className="divider" />

      <fieldset className="section">
        <legend>Choropleth</legend>
        <label className="option-row">
          <input
            type="checkbox"
            checked={choroplethOn}
            disabled={!showCantones}
            onChange={(e) => setChoroplethOn(e.target.checked)}
            aria-describedby={indicator ? "hint-indicador" : undefined}
          />
          Colorear cantones por indicador
        </label>
        {!showCantones && <p className="hint">Activá la capa de Cantones para habilitar el choropleth.</p>}
        {realIndicators.length > 0 && (
          <>
            <label className="sr-only" htmlFor="indicator-select">
              Indicador a colorear
            </label>
            <select
              id="indicator-select"
              value={selectedIndicatorId}
              onChange={(e) => setSelectedIndicatorId(e.target.value)}
            >
              {realIndicators.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.label}
                </option>
              ))}
            </select>
            {indicator && (
              <p className="hint" id="hint-indicador">
                {indicator.year && `${indicator.year} — `}
                {indicator.source}
              </p>
            )}
          </>
        )}
      </fieldset>

      <hr className="divider" />

      <fieldset className="section">
        <legend>Capas temáticas</legend>
        <label className="option-row">
          <input
            type="checkbox"
            checked={showRegionesCafetaleras}
            onChange={(e) => setShowRegionesCafetaleras(e.target.checked)}
            aria-describedby="hint-cafetaleras"
          />
          Regiones cafetaleras (ICAFE, 7)
        </label>
        <p className="hint" id="hint-cafetaleras">
          Zonas productoras de café 2022, fuente real (SNIT/ICAFE, WFS, uso irrestricto). No confundir con las regiones
          de planificación MIDEPLAN de arriba.
        </p>

        <label className="option-row option-row-spaced">
          <input
            type="checkbox"
            checked={showPlantasAgua}
            onChange={(e) => setShowPlantasAgua(e.target.checked)}
            aria-describedby="hint-plantas-agua"
          />
          Plantas potabilizadoras AyA (40)
        </label>
        <p className="hint" id="hint-plantas-agua">
          Muestras de calidad de agua 2017–2021 por planta potabilizadora, dato provisto por el usuario. Color = tasa
          de incumplimiento (verde bajo, rojo alto). Clic en un punto para el detalle por parámetro.
        </p>
      </fieldset>
    </aside>
  );
}
