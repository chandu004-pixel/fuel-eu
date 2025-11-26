import { BankingRepository } from '../../../core/ports/repositories';
import { BankEntry } from '../../../core/domain/entities';
import { BankEntryModel } from './models/BankEntryModel';

export class MongoBankingRepository implements BankingRepository {
    async findByShipAndYear(shipId: string, year: number): Promise<BankEntry[]> {
        const docs = await BankEntryModel.find({ shipId, year }).sort({ createdAt: -1 });
        return docs.map(this.toDomain);
    }

    async findByShip(shipId: string): Promise<BankEntry[]> {
        const docs = await BankEntryModel.find({ shipId }).sort({ createdAt: -1 });
        return docs.map(this.toDomain);
    }

    async create(entry: BankEntry): Promise<BankEntry> {
        await BankEntryModel.create({
            id: entry.id,
            shipId: entry.shipId,
            year: entry.year,
            amountGco2eq: entry.amountGco2eq,
            createdAt: entry.createdAt
        });
        return entry;
    }

    async getTotalBanked(shipId: string): Promise<number> {
        const result = await BankEntryModel.aggregate([
            { $match: { shipId } },
            { $group: { _id: null, total: { $sum: '$amountGco2eq' } } }
        ]);
        return result.length > 0 ? result[0].total : 0;
    }

    private toDomain(doc: any): BankEntry {
        return {
            id: doc.id,
            shipId: doc.shipId,
            year: doc.year,
            amountGco2eq: doc.amountGco2eq,
            createdAt: doc.createdAt
        };
    }
}
