import { Request, Response } from 'express';
import { PoolingService } from '../../../core/domain/PoolingService';

export class PoolingController {
    constructor(private poolingService: PoolingService) { }

    createPool = async (req: Request, res: Response) => {
        try {
            const { year, shipIds } = req.body;

            if (!Array.isArray(shipIds) || shipIds.length < 2) {
                return res.status(400).json({ error: 'Pool must have at least 2 ship IDs' });
            }

            const pool = await this.poolingService.createPool(year, shipIds);
            res.json(pool);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    };

    getPoolMembers = async (req: Request, res: Response) => {
        try {
            const { poolId } = req.params;
            const members = await this.poolingService.getPoolMembers(poolId);
            res.json(members);
        } catch (error) {
            res.status(500).json({ error: 'Failed to get pool members' });
        }
    };
}
