import type { ComplianceStatus, BankEntry } from '../domain/Compliance';

export interface ComplianceRepository {
    getCompliance(year: number, shipId?: string): Promise<ComplianceStatus>;
    bankSurplus(): Promise<void>;
    applySurplus(): Promise<void>;
    getBankingRecords(shipId: string, year?: number): Promise<BankEntry[]>;
}
