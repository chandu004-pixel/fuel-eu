import { BankingRepository, ComplianceRepository } from '../ports/repositories';
import { BankEntry } from '../domain/entities';

export class BankingService {
    constructor(
        private bankingRepo: BankingRepository,
        private complianceRepo: ComplianceRepository
    ) { }

    /**
     * Bank positive CB for future use
     * Rule: Can only bank if CB > 0
     */
    async bankSurplus(shipId: string, year: number, amount: number): Promise<BankEntry> {
        const currentCB = await this.getCurrentCB(shipId, year);

        if (currentCB <= 0) {
            throw new Error('Cannot bank negative or zero CB');
        }

        if (amount > currentCB) {
            throw new Error(`Cannot bank more than available CB (${currentCB})`);
        }

        const entry: BankEntry = {
            id: `bank_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            shipId,
            year,
            amountGco2eq: amount,
            createdAt: new Date()
        };

        const created = await this.bankingRepo.create(entry);

        // Update CB after banking
        await this.complianceRepo.update(shipId, year, currentCB - amount);

        return created;
    }

    /**
     * Apply banked surplus to cover a deficit
     * Rules:
     * - Deficit ship cannot exit worse
     * - Surplus ship cannot exit negative
     */
    async applyBanked(shipId: string, year: number, amount: number): Promise<void> {
        const totalBanked = await this.bankingRepo.getTotalBanked(shipId);

        if (totalBanked < amount) {
            throw new Error(`Insufficient banked surplus. Available: ${totalBanked}`);
        }

        const currentCB = await this.getCurrentCB(shipId, year);

        if (currentCB >= 0) {
            throw new Error('Cannot apply banked surplus to positive CB');
        }

        // Apply the banked amount
        const newCB = currentCB + amount;

        // Ensure deficit ship doesn't exit worse
        if (newCB < currentCB) {
            throw new Error('Application would make deficit worse');
        }

        // Create a negative bank entry to record usage
        const entry: BankEntry = {
            id: `apply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            shipId,
            year,
            amountGco2eq: -amount, // Negative amount for application
            createdAt: new Date()
        };

        await this.bankingRepo.create(entry);
        await this.complianceRepo.update(shipId, year, newCB);
    }

    async getTotalBanked(shipId: string): Promise<number> {
        return this.bankingRepo.getTotalBanked(shipId);
    }

    async getBankingRecords(shipId: string, year?: number): Promise<BankEntry[]> {
        const allRecords = await this.bankingRepo.findByShip(shipId);

        if (year) {
            return allRecords.filter((record: BankEntry) => record.year === year);
        }

        return allRecords;
    }

    private async getCurrentCB(shipId: string, year: number): Promise<number> {
        const compliance = await this.complianceRepo.findByShipAndYear(shipId, year);
        return compliance?.cbGco2eq || 0;
    }
}
