import { ComplianceRepository } from '../ports/repositories';
import { ComplianceResult } from '../domain/entities';

// Fuel EU compliance formulas
const TARGET_INTENSITY_2025 = 89.3368; // gCO2e/MJ
const COMPLIANCE_THRESHOLD = 0.02; // 2% above baseline

export class ComplianceService {
    constructor(private complianceRepo: ComplianceRepository) { }

    /**
     * Calculate Compliance Balance (CB)
     * Formula: CB = (Target - Actual) × Energy in scope
     * Positive CB = Surplus (better than target)
     * Negative CB = Deficit (worse than target)
     */
    async calculateCB(
        shipId: string,
        year: number,
        actualIntensity: number,
        fuelConsumption: number
    ): Promise<ComplianceResult> {
        const targetIntensity = this.getTargetIntensity(year);

        // Energy in scope (MJ) = fuel consumption (t) × 41,000 MJ/t (approximate LCV)
        const energyInScope = fuelConsumption * 41000;

        // CB = (Target - Actual) × Energy
        const complianceBalance = (targetIntensity - actualIntensity) * energyInScope;

        // Check if compliant (within 2% above baseline)
        const maxAllowed = targetIntensity * (1 + COMPLIANCE_THRESHOLD);
        const isCompliant = actualIntensity <= maxAllowed;

        const result: ComplianceResult = {
            shipId,
            year,
            targetIntensity,
            actualIntensity,
            energyInScope,
            complianceBalance,
            isCompliant
        };

        // Store in database
        await this.complianceRepo.save({
            shipId,
            year,
            cbGco2eq: complianceBalance
        });

        return result;
    }

    async getCB(shipId: string, year: number): Promise<number> {
        const compliance = await this.complianceRepo.findByShipAndYear(shipId, year);
        return compliance?.cbGco2eq || 0;
    }

    async getAllCompliance(year: number): Promise<any[]> {
        const compliances = await this.complianceRepo.findAll(year);
        return compliances.map(c => ({
            shipId: c.shipId,
            name: `Ship ${c.shipId}`, // Mock name since we don't have ship names in compliance table
            adjustedCB: c.cbGco2eq
        }));
    }

    async getComplianceForShip(shipId: string, year: number): Promise<any> {
        const compliance = await this.complianceRepo.findByShipAndYear(shipId, year);
        if (!compliance) return null;

        return {
            shipId: compliance.shipId,
            name: `Ship ${compliance.shipId}`,
            adjustedCB: compliance.cbGco2eq
        };
    }

    private getTargetIntensity(year: number): number {
        // For 2025, use the specified target
        // In a real system, this would vary by year according to EU regulations
        return TARGET_INTENSITY_2025;
    }
}
