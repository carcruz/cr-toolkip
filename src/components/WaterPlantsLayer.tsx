import { CircleMarker, Popup } from "react-leaflet";
import type { Feature, FeatureCollection } from "geojson";
import { colorForRate } from "../utils/color";
import type { WaterPlantProperties } from "../types";

interface Props {
  data: FeatureCollection;
}

export default function WaterPlantsLayer({ data }: Props) {
  return (
    <>
      {data.features.map((feature: Feature, i) => {
        if (feature.geometry?.type !== "Point") return null;
        const [lng, lat] = feature.geometry.coordinates;
        const p = feature.properties as WaterPlantProperties;
        const color = colorForRate(p.tasa_incumplimiento);

        return (
          <CircleMarker
            key={i}
            center={[lat, lng]}
            radius={7}
            pathOptions={{ color: "#1a1a1a", weight: 1, fillColor: color, fillOpacity: 0.85 }}
          >
            <Popup>
              <div style={{ fontSize: 13, maxWidth: 240 }}>
                <strong>{p.nombre}</strong>
                <br />
                <span style={{ color: "#6b7684" }}>{p.sistema}</span>
                <br />
                Región AyA: {p.region_aya}
                <br />
                Tasa de incumplimiento: <strong>{(p.tasa_incumplimiento * 100).toFixed(1)}%</strong> ({p.n} muestras,{" "}
                {p.anho_min}–{p.anho_max})
                <br />
                Parámetro(s) evaluado(s): {p.tipo}
                {p.etapas && (
                  <>
                    <br />
                    Etapas de tratamiento: {p.etapas}
                  </>
                )}
                <br />
                <table style={{ marginTop: 6, fontSize: 12, borderCollapse: "collapse" }}>
                  <tbody>
                    {Object.entries(p.incumplimiento_por_parametro).map(([param, rate]) => (
                      <tr key={param}>
                        <td style={{ paddingRight: 8, color: "#6b7684" }}>{param}</td>
                        <td>{(rate * 100).toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}
