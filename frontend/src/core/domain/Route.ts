export interface Route {
  routeId: string;
  vesselType: string;
  fuelType: string;
  year: number;
  ghgIntensity: number; // gCO2e/MJ
  fuelConsumption: number; // t
  distance: number; // km
  totalEmissions: number; // t
  isBaseline: boolean; // Baseline flag
}

export interface RouteComparison extends Route {
  baselineGhgIntensity: number;
  percentDiff: number;
  compliant: boolean;
}

export interface BaselineRoute {
  routeId: string;
  vesselType: string;
  ghgIntensity: number;
}

export interface RoutesComparisonResponse {
  baseline: BaselineRoute;
  targetIntensity: number;
  routes: RouteComparison[];
}
