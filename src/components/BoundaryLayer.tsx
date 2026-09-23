import { GeoJSON } from "react-leaflet";
import type { Feature, FeatureCollection } from "geojson";
import type { Layer, Path, PathOptions } from "leaflet";
import { colorForValue, type MapTheme } from "../utils/color";
import type { IndicatorDataset } from "../types";

interface Props {
  data: FeatureCollection;
  layerKey: string;
  baseColor: string;
  dashed?: boolean;
  indicator?: IndicatorDataset;
  theme: MapTheme;
}

export default function BoundaryLayer({ data, layerKey, baseColor, dashed, indicator, theme }: Props) {
  const style = (feature?: Feature): PathOptions => {
    const id = feature?.properties?.id as string | undefined;
    if (indicator && id && id in indicator.values) {
      return {
        color: theme === "dark" ? "#8993a1" : "#334155",
        weight: 1,
        fillColor: colorForValue(indicator.values[id], indicator.scale, theme),
        fillOpacity: 0.75,
      };
    }
    const categoryColor = feature?.properties?.color as string | undefined;
    if (categoryColor) {
      return {
        color: baseColor,
        weight: dashed ? 1.5 : 1.2,
        fillColor: categoryColor,
        fillOpacity: 0.45,
        dashArray: dashed ? "5 4" : undefined,
      };
    }
    return {
      color: baseColor,
      weight: dashed ? 1.5 : 1.2,
      fillOpacity: 0.04,
      fillColor: baseColor,
      dashArray: dashed ? "5 4" : undefined,
    };
  };

  const onEachFeature = (feature: Feature, layer: Layer) => {
    const name = (feature.properties?.name as string) ?? "?";
    const id = feature.properties?.id as string | undefined;
    const value = indicator && id ? indicator.values[id] : undefined;
    const cantonesCount = feature.properties?.cantones_count as number | undefined;
    const content =
      value !== undefined
        ? `<span class="name">${name}</span><br/><span class="value">${indicator!.label}: ${value.toFixed(1)}</span>`
        : cantonesCount !== undefined
          ? `<span class="name">${name}</span><br/>${cantonesCount} cantones`
          : `<span class="name">${name}</span>`;
    layer.bindTooltip(content, { className: "map-tooltip", sticky: true });

    const path = layer as Path;
    layer.on("mouseover", () => path.setStyle({ weight: 3 }));
    layer.on("mouseout", () => path.setStyle(style(feature)));
  };

  return (
    <GeoJSON
      key={`${layerKey}-${indicator?.indicator ?? "none"}-${theme}`}
      data={data}
      style={style}
      onEachFeature={onEachFeature}
    />
  );
}
