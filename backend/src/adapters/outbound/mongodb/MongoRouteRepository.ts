import { RouteRepository } from '../../../core/ports/repositories';
import { Route } from '../../../core/domain/entities';
import { RouteModel } from './models/RouteModel';

export class MongoRouteRepository implements RouteRepository {
    async findAll(): Promise<Route[]> {
        const routes = await RouteModel.find();
        return routes.map(this.toDomain);
    }

    async findById(id: string): Promise<Route | null> {
        const route = await RouteModel.findOne({ routeId: id });
        return route ? this.toDomain(route) : null;
    }

    async create(route: Route): Promise<Route> {
        await RouteModel.create(route);
        return route;
    }

    async setBaseline(routeId: string): Promise<void> {
        // First, unset any existing baseline
        await RouteModel.updateMany({}, { isBaseline: false });
        // Set the new baseline
        await RouteModel.updateOne({ routeId }, { isBaseline: true });
    }

    // Helper method for the service (not part of interface but useful if service casts)
    // Or if we need to extend the interface later.
    // For now, I'll stick to the interface.

    private toDomain(doc: any): Route {
        return {
            routeId: doc.routeId,
            vesselType: doc.vesselType,
            fuelType: doc.fuelType,
            year: doc.year,
            ghgIntensity: doc.ghgIntensity,
            fuelConsumption: doc.fuelConsumption,
            distance: doc.distance,
            totalEmissions: doc.totalEmissions,
            isBaseline: doc.isBaseline
        };
    }
}
