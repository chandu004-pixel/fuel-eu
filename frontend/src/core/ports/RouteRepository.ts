import type { Route, RoutesComparisonResponse } from '../domain/Route';

export interface RouteRepository {
    getRoutes(filters?: { vesselType?: string; fuelType?: string; year?: number }): Promise<Route[]>;
    setBaseline(routeId: string): Promise<void>;
    getComparison(): Promise<RoutesComparisonResponse>;
}
