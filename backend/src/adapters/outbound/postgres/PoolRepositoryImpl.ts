import { PoolRepository } from '../../../core/ports/repositories';
import { Pool, PoolMember } from '../../../core/domain/entities';
import { pool } from '../../../db/connection';

export class PostgresPoolRepository implements PoolRepository {
    async create(poolData: Pool): Promise<Pool> {
        const result = await pool.query(
            `INSERT INTO pools (id, year, created_at)
       VALUES ($1, $2, $3)
       RETURNING *`,
            [poolData.id, poolData.year, poolData.createdAt]
        );
        return this.mapToPool(result.rows[0]);
    }

    async addMember(member: PoolMember): Promise<void> {
        await pool.query(
            `INSERT INTO pool_members (pool_id, ship_id, cb_before, cb_after)
       VALUES ($1, $2, $3, $4)`,
            [member.poolId, member.shipId, member.cbBefore, member.cbAfter]
        );
    }

    async findById(id: string): Promise<Pool | null> {
        const result = await pool.query(
            'SELECT * FROM pools WHERE id = $1',
            [id]
        );
        return result.rows.length > 0 ? this.mapToPool(result.rows[0]) : null;
    }

    async getMembers(poolId: string): Promise<PoolMember[]> {
        const result = await pool.query(
            'SELECT * FROM pool_members WHERE pool_id = $1',
            [poolId]
        );
        return result.rows.map(this.mapToPoolMember);
    }

    private mapToPool(row: any): Pool {
        return {
            id: row.id,
            year: row.year,
            createdAt: new Date(row.created_at)
        };
    }

    private mapToPoolMember(row: any): PoolMember {
        return {
            poolId: row.pool_id,
            shipId: row.ship_id,
            cbBefore: parseFloat(row.cb_before),
            cbAfter: parseFloat(row.cb_after)
        };
    }
}
