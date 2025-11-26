import type { PoolMember, Pool } from '../../core/domain/Pool';
import type { PoolRepository } from '../../core/ports/PoolRepository';
import { API_BASE_URL } from '../../shared/config';

export class ApiPoolRepository implements PoolRepository {
    async getAdjustedCB(year: number): Promise<PoolMember[]> {
        const response = await fetch(`${API_BASE_URL}/compliance/adjusted-cb?year=${year}`);
        if (!response.ok) throw new Error('Failed to fetch adjusted CB');
        return response.json();
    }

    async createPool(members: string[], year: number): Promise<Pool> {
        const response = await fetch(`${API_BASE_URL}/pools`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ shipIds: members, year }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to create pool');
        }
        return response.json();
    }
}
