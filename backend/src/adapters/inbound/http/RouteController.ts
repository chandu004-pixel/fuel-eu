import { Request, Response } from 'express';
import { RouteService } from '../../../core/domain/RouteService';

export class RouteController {
    constructor(private routeService: RouteService) { }

    getAllRoutes = async (req: Request, res: Response) => {
        try {
            const { vesselType, fuelType, year } = req.query;
            const filters = {
                vesselType: vesselType as string | undefined,
                fuelType: fuelType as string | undefined,
                year: year ? parseInt(year as string) : undefined
            };
            const routes = await this.routeService.getAllRoutes(filters);
            res.json(routes);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch routes' });
        }
    };

    getRouteById = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const route = await this.routeService.getRouteById(id);
            if (!route) {
                return res.status(404).json({ error: 'Route not found' });
            }
            res.json(route);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch route' });
        }
    };

    setBaseline = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            await this.routeService.setBaseline(id);
            res.json({ message: 'Baseline set successfully' });
        } catch (error) {
            res.status(500).json({ error: 'Failed to set baseline' });
        }
    };

    compareRoutes = async (req: Request, res: Response) => {
        try {
            const comparisons = await this.routeService.compareRoutes();
            res.json(comparisons);
        } catch (error) {
            res.status(500).json({ error: 'Failed to compare routes' });
        }
    };
}
