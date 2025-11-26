import { ComplianceRepository } from '../../../core/ports/repositories';
import { ShipCompliance } from '../../../core/domain/entities';
import { ComplianceModel } from './models/ComplianceModel';

export class MongoComplianceRepository implements ComplianceRepository {
    async findByShipAndYear(shipId: string, year: number): Promise<ShipCompliance | null> {
        const doc = await ComplianceModel.findOne({ shipId, year });
        if (!doc) return null;
        return {
            shipId: doc.shipId,
            year: doc.year,
            cbGco2eq: doc.cbGco2eq
        };
    }

    async findAll(year: number): Promise<ShipCompliance[]> {
        const docs = await ComplianceModel.find({ year });
        return docs.map(doc => ({
            shipId: doc.shipId,
            year: doc.year,
            cbGco2eq: doc.cbGco2eq
        }));
    }

    async save(compliance: ShipCompliance): Promise<ShipCompliance> {
        await ComplianceModel.findOneAndUpdate(
            { shipId: compliance.shipId, year: compliance.year },
            { cbGco2eq: compliance.cbGco2eq },
            { upsert: true, new: true }
        );
        return compliance;
    }

    async update(shipId: string, year: number, cbGco2eq: number): Promise<void> {
        await ComplianceModel.findOneAndUpdate(
            { shipId, year },
            { cbGco2eq },
            { upsert: true }
        );
    }
}
