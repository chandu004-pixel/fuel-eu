import { RouteRepository, ComplianceRepository, BankingRepository, PoolRepository } from '../../../core/ports/repositories';
import { Route, ShipCompliance, BankEntry, Pool, PoolMember } from '../../../core/domain/entities';

const TARGET_INTENSITY_2025 = 89.3368;
const LCV_MJ_PER_TON = 41000;

export class InMemoryRouteRepository implements RouteRepository {
    private routes: Route[] = [
        { routeId: 'R001', vesselType: 'Container', fuelType: 'HFO', year: 2024, ghgIntensity: 91.0, fuelConsumption: 5000, distance: 12000, totalEmissions: 4500, isBaseline: true },
        { routeId: 'R002', vesselType: 'Bulk Carrier', fuelType: 'LNG', year: 2024, ghgIntensity: 88.0, fuelConsumption: 4800, distance: 11500, totalEmissions: 4200, isBaseline: false },
        { routeId: 'R003', vesselType: 'Tanker', fuelType: 'MGO', year: 2024, ghgIntensity: 93.5, fuelConsumption: 5100, distance: 12500, totalEmissions: 4700, isBaseline: false },
        { routeId: 'R004', vesselType: 'RoRo', fuelType: 'HFO', year: 2025, ghgIntensity: 89.2, fuelConsumption: 4900, distance: 11800, totalEmissions: 4300, isBaseline: false },
        { routeId: 'R005', vesselType: 'Container', fuelType: 'LNG', year: 2025, ghgIntensity: 90.5, fuelConsumption: 4950, distance: 11900, totalEmissions: 4400, isBaseline: false },
    ];

    async findAll(): Promise<Route[]> {
        return this.routes;
    }

    async findById(id: string): Promise<Route | null> {
        return this.routes.find(r => r.routeId === id) || null;
    }

    async create(route: Route): Promise<Route> {
        this.routes.push(route);
        return route;
    }

    async setBaseline(routeId: string): Promise<void> {
        // Clear all baselines
        this.routes.forEach(r => r.isBaseline = false);
        // Set the new baseline
        const route = this.routes.find(r => r.routeId === routeId);
        if (route) {
            route.isBaseline = true;
        }
        console.log(`✅ Baseline set for ${routeId}`);
    }
}

export class InMemoryComplianceRepository implements ComplianceRepository {
    private complianceStore: Map<string, ShipCompliance> = new Map();

    constructor() {
        // Seed data with calculated CB using correct formula
        // CB = (Target - Actual) × Energy in scope
        // Target = 89.3368 gCO₂e/MJ
        const ships = [
            // 2024 - Mixed CB values
            { shipId: 'SHIP-001', year: 2024, ghgIntensity: 91.0, fuelConsumption: 5000 },  // Deficit
            { shipId: 'SHIP-002', year: 2024, ghgIntensity: 88.0, fuelConsumption: 4800 },  // Surplus
            { shipId: 'SHIP-003', year: 2024, ghgIntensity: 93.5, fuelConsumption: 5100 },  // Deficit

            // 2025 - Mixed CB values
            { shipId: 'SHIP-001', year: 2025, ghgIntensity: 92.0, fuelConsumption: 5200 },  // Deficit
            { shipId: 'SHIP-002', year: 2025, ghgIntensity: 87.5, fuelConsumption: 4700 },  // Surplus
            { shipId: 'SHIP-003', year: 2025, ghgIntensity: 94.0, fuelConsumption: 5300 },  // Deficit
            { shipId: 'SHIP-004', year: 2025, ghgIntensity: 89.2, fuelConsumption: 4900 },  // Small surplus
            { shipId: 'SHIP-005', year: 2025, ghgIntensity: 90.5, fuelConsumption: 4950 },  // Deficit

            // 2026 - More varied data
            { shipId: 'SHIP-001', year: 2026, ghgIntensity: 89.0, fuelConsumption: 5100 },  // Small surplus
            { shipId: 'SHIP-002', year: 2026, ghgIntensity: 95.0, fuelConsumption: 4600 },  // Deficit
            { shipId: 'SHIP-003', year: 2026, ghgIntensity: 86.0, fuelConsumption: 5000 },  // Surplus
            { shipId: 'SHIP-004', year: 2026, ghgIntensity: 88.5, fuelConsumption: 4800 },  // Surplus
            { shipId: 'SHIP-005', year: 2026, ghgIntensity: 91.0, fuelConsumption: 5200 },  // Deficit
        ];

        ships.forEach(ship => {
            const energyInScope = ship.fuelConsumption * LCV_MJ_PER_TON;
            const cb = (TARGET_INTENSITY_2025 - ship.ghgIntensity) * energyInScope;
            this.save({
                shipId: ship.shipId,
                year: ship.year,
                cbGco2eq: cb
            });
        });
    }

    async findByShipAndYear(shipId: string, year: number): Promise<ShipCompliance | null> {
        const key = `${shipId}-${year}`;
        return this.complianceStore.get(key) || null;
    }

    async findAll(year: number): Promise<ShipCompliance[]> {
        return Array.from(this.complianceStore.values()).filter(c => c.year === year);
    }

    async save(compliance: ShipCompliance): Promise<ShipCompliance> {
        const key = `${compliance.shipId}-${compliance.year}`;
        this.complianceStore.set(key, compliance);
        return compliance;
    }

    async update(shipId: string, year: number, cbGco2eq: number): Promise<void> {
        const key = `${shipId}-${year}`;
        const existing = this.complianceStore.get(key);
        if (existing) {
            existing.cbGco2eq = cbGco2eq;
            this.complianceStore.set(key, existing);
        }
    }
}

export class InMemoryBankingRepository implements BankingRepository {
    private bankStore: BankEntry[] = [];

    async findByShipAndYear(shipId: string, year: number): Promise<BankEntry[]> {
        return this.bankStore.filter(e => e.shipId === shipId && e.year === year);
    }

    async findByShip(shipId: string): Promise<BankEntry[]> {
        return this.bankStore.filter(e => e.shipId === shipId);
    }

    async create(entry: BankEntry): Promise<BankEntry> {
        this.bankStore.push(entry);
        return entry;
    }

    async getTotalBanked(shipId: string): Promise<number> {
        return this.bankStore
            .filter(e => e.shipId === shipId)
            .reduce((sum, e) => sum + e.amountGco2eq, 0);
    }
}

export class InMemoryPoolRepository implements PoolRepository {
    private pools: Pool[] = [];
    private members: PoolMember[] = [];

    async create(pool: Pool): Promise<Pool> {
        this.pools.push(pool);
        return pool;
    }

    async addMember(member: PoolMember): Promise<void> {
        this.members.push(member);
    }

    async findById(id: string): Promise<Pool | null> {
        return this.pools.find(p => p.id === id) || null;
    }

    async getMembers(poolId: string): Promise<PoolMember[]> {
        return this.members.filter(m => m.poolId === poolId);
    }
}
