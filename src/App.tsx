import { useEffect, useRef, useState } from "react";
import { useGeoJSON } from "./hooks/useGeoJSON";
import { useJSON } from "./hooks/useJSON";
import MapView from "./components/MapView";
import LayerControlPanel from "./components/LayerControlPanel";
import type { IndicatorDataset, IndicatorManifestEntry } from "./types";
import type { MapTheme } from "./utils/color";

const THEME_STORAGE_KEY = "cr-toolkit-theme";
const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

function initialTheme(): MapTheme {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  return stored === "light" ? "light" : "dark";
}

export default function App() {
  const provincias = useGeoJSON("/data/provincias.geojson");
  const cantones = useGeoJSON("/data/cantones.geojson");
  const regiones = useGeoJSON("/data/regiones_mideplan.geojson");
  const regionesCafetaleras = useGeoJSON("/data/regiones_cafetaleras_icafe.geojson");
  const plantasAgua = useGeoJSON("/data/plantas_potabilizadoras_aya.geojson");

  const indicators = useJSON<IndicatorManifestEntry[]>("/data/indicators_manifest.json");
  const [selectedIndicatorId, setSelectedIndicatorId] = useState("idh");
  const selectedIndicatorEntry = indicators?.find((i) => i.id === selectedIndicatorId);
  const indicatorData = useJSON<IndicatorDataset>(
    selectedIndicatorEntry ? `/data/${selectedIndicatorEntry.file}` : null
  );

  const [theme, setTheme] = useState<MapTheme>(initialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const [showProvincias, setShowProvincias] = useState(false);
  const [showCantones, setShowCantones] = useState(true);
  const [showRegiones, setShowRegiones] = useState(false);
  const [showRegionesCafetaleras, setShowRegionesCafetaleras] = useState(false);
  const [showPlantasAgua, setShowPlantasAgua] = useState(false);
  const [choroplethOn, setChoroplethOn] = useState(true);

  const [panelOpen, setPanelOpen] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // On mobile the drawer behaves like a modal dialog: trap focus inside it,
  // close on Escape, and hand focus back to the button that opened it.
  useEffect(() => {
    if (!panelOpen) return;
    const panel = panelRef.current;
    const focusable = panel?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    focusable?.[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPanelOpen(false);
        return;
      }
      if (e.key === "Tab" && focusable && focusable.length > 0) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      hamburgerRef.current?.focus();
    };
  }, [panelOpen]);

  return (
    <div className="app-shell">
      <a href="#main-map" className="skip-link">
        Saltar al mapa
      </a>

      <button
        ref={hamburgerRef}
        className="panel-open-btn"
        onClick={() => setPanelOpen(true)}
        aria-label="Abrir panel de capas"
        aria-expanded={panelOpen}
      >
        ☰
      </button>

      {panelOpen && <div className="panel-scrim" aria-hidden="true" onClick={() => setPanelOpen(false)} />}

      <div
        className={`panel-wrap ${panelOpen ? "open" : ""}`}
        ref={panelRef}
        role={panelOpen ? "dialog" : undefined}
        aria-modal={panelOpen ? true : undefined}
        aria-label={panelOpen ? "Panel de control de capas" : undefined}
      >
        <LayerControlPanel
          theme={theme}
          setTheme={setTheme}
          onClose={() => setPanelOpen(false)}
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
          indicators={indicators ?? []}
          selectedIndicatorId={selectedIndicatorId}
          setSelectedIndicatorId={setSelectedIndicatorId}
          indicator={indicatorData ?? undefined}
        />
      </div>

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
        theme={theme}
      />
    </div>
  );
}
