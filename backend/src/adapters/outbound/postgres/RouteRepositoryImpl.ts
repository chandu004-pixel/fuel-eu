import { RouteRepository } from '../../../core/ports/repositories';
import { Route } from '../../../core/domain/entities';
import { pool } from '../../../db/connection';

export class PostgresRouteRepository implements RouteRepository {
    async findAll(): Promise<Route[]> {
        const result = await pool.query(
            'SELECT *, is_baseline FROM routes ORDER BY year DESC, route_id'
        );
        return result.rows.map(this.mapToRoute);
    }

    async findById(id: string): Promise<Route | null> {
        const result = await pool.query(
            'SELECT *, is_baseline FROM routes WHERE route_id = $1',
            [id]
        );
        return result.rows.length > 0 ? this.mapToRoute(result.rows[0]) : null;
    }

    async create(route: Route): Promise<Route> {
        const result = await pool.query(
            `INSERT INTO routes (route_id, vessel_type, fuel_type, year, ghg_intensity, 
       fuel_consumption, distance, total_emissions, is_baseline)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
            [
                route.routeId,
                route.vesselType,
                route.fuelType,
                route.year,
                route.ghgIntensity,
                route.fuelConsumption,
                route.distance,
                route.totalEmissions,
                route.isBaseline
            ]
        );
        return this.mapToRoute(result.rows[0]);
    }

    async setBaseline(routeId: string): Promise<void> {
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            // Clear existing baselines
            await client.query('UPDATE routes SET is_baseline = FALSE');
            // Set new baseline
            await client.query(
                'UPDATE routes SET is_baseline = TRUE WHERE route_id = $1',
                [routeId]
            );
            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    private mapToRoute(row: any): Route {
        return {
            routeId: row.route_id,
            vesselType: row.vessel_type,
            fuelType: row.fuel_type,
            year: row.year,
            ghgIntensity: parseFloat(row.ghg_intensity),
            fuelConsumption: parseFloat(row.fuel_consumption),
            distance: parseFloat(row.distance),
            totalEmissions: parseFloat(row.total_emissions),
            isBaseline: row.is_baseline
        };
    }
}
