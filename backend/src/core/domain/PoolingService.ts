import { PoolRepository, ComplianceRepository } from '../ports/repositories';
import { Pool, PoolMember } from '../domain/entities';

export class PoolingService {
    constructor(
        private poolRepo: PoolRepository,
        private complianceRepo: ComplianceRepository
    ) { }

    /**
     * Create a compliance pool
     * Rules (Fuel EU Article 21):
     * - Sum(adjustedCB) ≥ 0
     * - Deficit ship cannot exit worse
     * - Surplus ship cannot exit negative
     */
    async createPool(year: number, shipIds: string[]): Promise<Pool> {
        if (shipIds.length < 2) {
            throw new Error('Pool must have at least 2 members');
        }

        // Get current CB for all ships
        const members: Array<{ shipId: string; cbBefore: number }> = [];
        let totalCB = 0;

        for (const shipId of shipIds) {
            const compliance = await this.complianceRepo.findByShipAndYear(shipId, year);
            const cbBefore = compliance?.cbGco2eq || 0;
            members.push({ shipId, cbBefore });
            totalCB += cbBefore;
        }

        // Validate: Sum of CB must be >= 0
        if (totalCB < 0) {
            throw new Error(`Pool sum must be >= 0. Current sum: ${totalCB}`);
        }

        // Create pool
        const pool: Pool = {
            id: `pool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            year,
            createdAt: new Date()
        };

        const createdPool = await this.poolRepo.create(pool);

        // Calculate CB distribution
        // Simple strategy: distribute evenly or proportionally
        // For now, we'll use a greedy allocation that prioritizes deficit ships
        const cbPerShip = totalCB / shipIds.length;

        for (const member of members) {
            let cbAfter: number;

            // Distribute evenly
            cbAfter = cbPerShip;

            // Validate rules
            if (member.cbBefore < 0 && cbAfter < member.cbBefore) {
                throw new Error(`Deficit ship ${member.shipId} would exit worse`);
            }

            if (member.cbBefore > 0 && cbAfter < 0) {
                throw new Error(`Surplus ship ${member.shipId} would exit negative`);
            }

            const poolMember: PoolMember = {
                poolId: pool.id,
                shipId: member.shipId,
                cbBefore: member.cbBefore,
                cbAfter
            };

            await this.poolRepo.addMember(poolMember);

            // Update ship's CB
            await this.complianceRepo.update(member.shipId, year, cbAfter);
        }

        return createdPool;
    }

    async getPoolMembers(poolId: string): Promise<PoolMember[]> {
        return this.poolRepo.getMembers(poolId);
    }
}
