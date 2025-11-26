import { RouteRepository } from '../ports/repositories';
import { Route, BaselineComparison } from '../domain/entities';

const BASELINE_2025 = 89.3368; // gCO2e/MJ

export class RouteService {
    constructor(private routeRepo: RouteRepository) { }

    async getAllRoutes(filters?: { vesselType?: string; fuelType?: string; year?: number }): Promise<Route[]> {
        let routes = await this.routeRepo.findAll();

        // Apply filters if provided
        if (filters) {
            if (filters.vesselType) {
                routes = routes.filter(r =>
                    r.vesselType.toLowerCase().includes(filters.vesselType!.toLowerCase())
                );
            }
            if (filters.fuelType) {
                routes = routes.filter(r =>
                    r.fuelType.toLowerCase().includes(filters.fuelType!.toLowerCase())
                );
            }
            if (filters.year) {
                routes = routes.filter(r => r.year === filters.year);
            }
        }

        return routes;
    }

    async getRouteById(id: string): Promise<Route | null> {
        return this.routeRepo.findById(id);
    }

    async createRoute(route: Route): Promise<Route> {
        return this.routeRepo.create(route);
    }

    async setBaseline(routeId: string): Promise<void> {
        await this.routeRepo.setBaseline(routeId);
    }

    /**
     * Compare routes against baseline
     * Target is fixed at 89.3368 gCO₂e/MJ (2% below 91.16)
     * Baseline is used for percent difference calculation
     */
    async compareRoutes(): Promise<any> {
        const routes = await this.routeRepo.findAll();

        // Find the route that is marked as baseline
        const baselineRoute = routes.find(r => r.isBaseline);

        // Use the actual GHG intensity from the baseline route, or fallback to 91.16
        const baselineIntensity = baselineRoute?.ghgIntensity || 91.16;

        // Fixed target: 89.3368 gCO₂e/MJ (2% below 91.16)
        const targetIntensity = 89.3368;

        const comparisonRoutes = routes.map(route => {
            const actual = route.ghgIntensity;
            // percentDiff = ((comparison / baseline) - 1) * 100
            const percentDiff = ((actual / baselineIntensity) - 1) * 100;

            // Compliant if actual is at or below fixed target (89.3368)
            const compliant = actual <= targetIntensity;

            return {
                ...route,
                baselineGhgIntensity: baselineIntensity,
                percentDiff,
                compliant
            };
        });

        return {
            baseline: {
                routeId: baselineRoute?.routeId || 'DEFAULT',
                vesselType: baselineRoute?.vesselType || 'N/A',
                ghgIntensity: baselineIntensity
            },
            targetIntensity,
            routes: comparisonRoutes
        };
    }
}
