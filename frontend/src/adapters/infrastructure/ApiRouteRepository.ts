import type { Route, RoutesComparisonResponse } from '../../core/domain/Route';
import type { RouteRepository } from '../../core/ports/RouteRepository';
import { API_BASE_URL } from '../../shared/config';

export class ApiRouteRepository implements RouteRepository {
    async getRoutes(filters?: { vesselType?: string; fuelType?: string; year?: number }): Promise<Route[]> {
        const params = new URLSearchParams();
        if (filters?.vesselType) params.append('vesselType', filters.vesselType);
        if (filters?.fuelType) params.append('fuelType', filters.fuelType);
        if (filters?.year) params.append('year', filters.year.toString());

        const response = await fetch(`${API_BASE_URL}/routes?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch routes');
        return response.json();
    }

    async setBaseline(routeId: string): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/routes/${routeId}/baseline`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        });
        if (!response.ok) throw new Error('Failed to set baseline');
    }

    async getComparison(): Promise<RoutesComparisonResponse> {
        const response = await fetch(`${API_BASE_URL}/routes/comparison`);
        if (!response.ok) throw new Error('Failed to fetch comparison');
        return response.json();
    }
}
