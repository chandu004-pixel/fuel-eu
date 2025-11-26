import type { PoolMember, Pool } from '../../core/domain/Pool';
import type { PoolRepository } from '../../core/ports/PoolRepository';

export class MockPoolRepository implements PoolRepository {
    async getAdjustedCB(year: number): Promise<PoolMember[]> {
        await new Promise(resolve => setTimeout(resolve, 500));
        return [
            { shipId: 'S001', name: 'Ever Given', adjustedCB: 500 },
            { shipId: 'S002', name: 'Titanic', adjustedCB: -200 },
            { shipId: 'S003', name: 'Black Pearl', adjustedCB: 100 },
            { shipId: 'S004', name: 'Queen Mary 2', adjustedCB: -50 },
            { shipId: 'S005', name: 'Emma Maersk', adjustedCB: 300 },
        ];
    }

    async createPool(members: string[]): Promise<Pool> {
        return {
            id: 'P001',
            members: members.map(id => ({ shipId: id, name: 'Ship ' + id, adjustedCB: 0 })),
            totalCB: 400,
            isValid: true
        };
    }
}
