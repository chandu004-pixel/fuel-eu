import type { Route, RouteComparison } from '../../core/domain/Route';
import type { RouteRepository } from '../../core/ports/RouteRepository';

export class MockRouteRepository implements RouteRepository {
    private routes: Route[] = [
        { routeId: 'R001', vesselType: 'Container', fuelType: 'HFO', year: 2024, ghgIntensity: 91.0, fuelConsumption: 5000, distance: 12000, totalEmissions: 4500, isBaseline: false },
        { routeId: 'R002', vesselType: 'Bulk Carrier', fuelType: 'LNG', year: 2024, ghgIntensity: 88.0, fuelConsumption: 4800, distance: 11500, totalEmissions: 4200, isBaseline: false },
        { routeId: 'R003', vesselType: 'Tanker', fuelType: 'MGO', year: 2024, ghgIntensity: 93.5, fuelConsumption: 5100, distance: 12500, totalEmissions: 4700, isBaseline: false },
        { routeId: 'R004', vesselType: 'RoRo', fuelType: 'HFO', year: 2025, ghgIntensity: 89.2, fuelConsumption: 4900, distance: 11800, totalEmissions: 4300, isBaseline: false },
        { routeId: 'R005', vesselType: 'Container', fuelType: 'LNG', year: 2025, ghgIntensity: 90.5, fuelConsumption: 4950, distance: 11900, totalEmissions: 4400, isBaseline: false },
    ];

    async getRoutes(filters?: { vesselType?: string; fuelType?: string; year?: number }): Promise<Route[]> {
        return this.routes.filter(r => {
            if (filters?.vesselType && r.vesselType !== filters.vesselType) return false;
            if (filters?.fuelType && r.fuelType !== filters.fuelType) return false;
            if (filters?.year && r.year !== filters.year) return false;
            return true;
        });
    }

    async setBaseline(routeId: string): Promise<void> {
        // Clear all baselines first
        this.routes.forEach(r => r.isBaseline = false);
        // Set the new baseline
        const route = this.routes.find(r => r.routeId === routeId);
        if (route) {
            route.isBaseline = true;
        }
        console.log(`Baseline set for ${routeId}`);
    }

    async getComparison(): Promise<RoutesComparisonResponse> {
        const baselineRoute = this.routes.find(r => r.isBaseline) || this.routes[0];
        const targetIntensity = 89.3368; // 2025 target

        const comparisonRoutes = this.routes.map(r => ({
            ...r,
            baselineGhgIntensity: baselineRoute.ghgIntensity,
            percentDiff: ((r.ghgIntensity / baselineRoute.ghgIntensity) - 1) * 100,
            compliant: r.ghgIntensity <= targetIntensity
        }));

        return {
            baseline: {
                routeId: baselineRoute.routeId,
                vesselType: baselineRoute.vesselType,
                ghgIntensity: baselineRoute.ghgIntensity
            },
            targetIntensity,
            routes: comparisonRoutes
        };
    }
}
