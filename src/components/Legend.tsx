import type { IndicatorDataset } from "../types";
import { legendStops, RATE_LEGEND_STOPS, type MapTheme } from "../utils/color";

function GradientLegend({
  title,
  badge,
  stops,
  minLabel,
  maxLabel,
}: {
  title: string;
  badge?: string;
  stops: [number, string][];
  minLabel: string;
  maxLabel: string;
}) {
  const gradient = `linear-gradient(to right, ${stops.map(([t, c]) => `${c} ${t * 100}%`).join(", ")})`;

  return (
    <div className="legend" role="group" aria-label={`Leyenda: ${title}, de ${minLabel} a ${maxLabel}`}>
      <div className="title">
        {title} {badge && <span className="badge demo">{badge}</span>}
      </div>
      <div className="legend-gradient" style={{ background: gradient }} aria-hidden="true" />
      <div className="legend-scale" aria-hidden="true">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  );
}

export default function Legend({ indicator, theme }: { indicator: IndicatorDataset; theme: MapTheme }) {
  const [min, max] = indicator.scale;
  return (
    <GradientLegend
      title={indicator.label}
      badge={indicator.demo ? "demo" : undefined}
      stops={legendStops(theme)}
      minLabel={String(min)}
      maxLabel={String(max)}
    />
  );
}

export function WaterPlantsLegend() {
  return (
    <GradientLegend
      title="Tasa de incumplimiento (AyA, 2017–2021)"
      stops={RATE_LEGEND_STOPS}
      minLabel="0%"
      maxLabel="≥100%"
    />
  );
}
