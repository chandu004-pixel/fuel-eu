import type { ComplianceStatus } from '../../core/domain/Compliance';
import type { ComplianceRepository } from '../../core/ports/ComplianceRepository';

export class MockComplianceRepository implements ComplianceRepository {
    async getCompliance(year: number): Promise<ComplianceStatus> {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return {
            cb_before: 1200,
            applied: 0,
            cb_after: 1200,
            year
        };
    }

    async bankSurplus(): Promise<void> {
        console.log('Surplus banked');
    }

    async applySurplus(): Promise<void> {
        console.log('Surplus applied');
    }
}
