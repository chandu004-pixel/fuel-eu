import type { ComplianceStatus, BankEntry } from '../../core/domain/Compliance';
import type { ComplianceRepository } from '../../core/ports/ComplianceRepository';
import { API_BASE_URL } from '../../shared/config';

export class ApiComplianceRepository implements ComplianceRepository {
    async getCompliance(year: number, shipId?: string): Promise<ComplianceStatus> {
        const url = shipId
            ? `${API_BASE_URL}/compliance/cb?year=${year}&shipId=${shipId}`
            : `${API_BASE_URL}/compliance/cb?year=${year}`;
        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch compliance status');
        return response.json();
    }

    async bankSurplus(): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/banking/bank`, {
            method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to bank surplus');
    }

    async applySurplus(): Promise<void> {
        const response = await fetch(`${API_BASE_URL}/banking/apply`, {
            method: 'POST',
        });
        if (!response.ok) throw new Error('Failed to apply surplus');
    }

    async getBankingRecords(shipId: string, year?: number): Promise<BankEntry[]> {
        const url = year
            ? `${API_BASE_URL}/banking/records?shipId=${shipId}&year=${year}`
            : `${API_BASE_URL}/banking/records?shipId=${shipId}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch banking records');
        return response.json();
    }
}
