import type { PoolMember, Pool } from '../domain/Pool';

export interface PoolRepository {
    getAdjustedCB(year: number): Promise<PoolMember[]>;
    createPool(members: string[], year: number): Promise<Pool>;
}
