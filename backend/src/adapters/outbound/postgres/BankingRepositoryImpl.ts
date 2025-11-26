import { BankingRepository } from '../../../core/ports/repositories';
import { BankEntry } from '../../../core/domain/entities';
import { pool } from '../../../db/connection';

export class PostgresBankingRepository implements BankingRepository {
    async findByShipAndYear(shipId: string, year: number): Promise<BankEntry[]> {
        const result = await pool.query(
            'SELECT * FROM bank_entries WHERE ship_id = $1 AND year = $2 ORDER BY created_at DESC',
            [shipId, year]
        );
        return result.rows.map(this.mapToBankEntry);
    }

    async findByShip(shipId: string): Promise<BankEntry[]> {
        const result = await pool.query(
            'SELECT * FROM bank_entries WHERE ship_id = $1 ORDER BY created_at DESC',
            [shipId]
        );
        return result.rows.map(this.mapToBankEntry);
    }

    async create(entry: BankEntry): Promise<BankEntry> {
        const result = await pool.query(
            `INSERT INTO bank_entries (id, ship_id, year, amount_gco2eq, created_at)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
            [entry.id, entry.shipId, entry.year, entry.amountGco2eq, entry.createdAt]
        );
        return this.mapToBankEntry(result.rows[0]);
    }

    async getTotalBanked(shipId: string): Promise<number> {
        const result = await pool.query(
            'SELECT COALESCE(SUM(amount_gco2eq), 0) as total FROM bank_entries WHERE ship_id = $1',
            [shipId]
        );
        return parseFloat(result.rows[0].total);
    }

    private mapToBankEntry(row: any): BankEntry {
        return {
            id: row.id,
            shipId: row.ship_id,
            year: row.year,
            amountGco2eq: parseFloat(row.amount_gco2eq),
            createdAt: new Date(row.created_at)
        };
    }
}
