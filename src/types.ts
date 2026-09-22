export type BoundaryLevel = "provincias" | "cantones" | "regiones";

export interface BoundaryFeatureProps {
  id: string;
  name: string;
  placeholder?: boolean;
}

export interface IndicatorDataset {
  demo: boolean;
  indicator: string;
  label: string;
  source: string;
  year: number | null;
  scale: [number, number];
  values: Record<string, number>;
}

export interface MapPoint {
  id: string;
  lat: number;
  lng: number;
  label: string;
  color: string;
}

export interface WaterPlantProperties {
  sistema: string;
  region_aya: string;
  tipo: string;
  etapas: string | null;
  n: number;
  anho_min: number;
  anho_max: number;
  tasa_incumplimiento: number;
  nombre: string;
  incumplimiento_por_parametro: Record<string, number>;
}
