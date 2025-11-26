import { ComplianceRepository } from '../../../core/ports/repositories';
import { ShipCompliance } from '../../../core/domain/entities';
import { pool } from '../../../db/connection';

export class PostgresComplianceRepository implements ComplianceRepository {
    async findByShipAndYear(shipId: string, year: number): Promise<ShipCompliance | null> {
        const result = await pool.query(
            'SELECT * FROM ship_compliance WHERE ship_id = $1 AND year = $2',
            [shipId, year]
        );
        return result.rows.length > 0 ? this.mapToCompliance(result.rows[0]) : null;
    }

    async findAll(year: number): Promise<ShipCompliance[]> {
        const result = await pool.query(
            'SELECT * FROM ship_compliance WHERE year = $1',
            [year]
        );
        return result.rows.map(row => this.mapToCompliance(row));
    }

    async save(compliance: ShipCompliance): Promise<ShipCompliance> {
        const result = await pool.query(
            `INSERT INTO ship_compliance (ship_id, year, cb_gco2eq)
       VALUES ($1, $2, $3)
       ON CONFLICT (ship_id, year) 
       DO UPDATE SET cb_gco2eq = $3
       RETURNING *`,
            [
                compliance.shipId,
                compliance.year,
                compliance.cbGco2eq
            ]
        );
        return this.mapToCompliance(result.rows[0]);
    }

    async update(shipId: string, year: number, cbGco2eq: number): Promise<void> {
        await pool.query(
            'UPDATE ship_compliance SET cb_gco2eq = $1 WHERE ship_id = $2 AND year = $3',
            [cbGco2eq, shipId, year]
        );
    }

    private mapToCompliance(row: any): ShipCompliance {
        return {
            shipId: row.ship_id,
            year: row.year,
            cbGco2eq: parseFloat(row.cb_gco2eq)
        };
    }
}
