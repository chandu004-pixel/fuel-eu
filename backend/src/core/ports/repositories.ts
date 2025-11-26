import { Route, ShipCompliance, BankEntry, Pool, PoolMember } from '../domain/entities';

// Repository ports (outbound)
export interface RouteRepository {
    findAll(): Promise<Route[]>;
    findById(id: string): Promise<Route | null>;
    create(route: Route): Promise<Route>;
    setBaseline(routeId: string): Promise<void>;
}

export interface ComplianceRepository {
    findByShipAndYear(shipId: string, year: number): Promise<ShipCompliance | null>;
    findAll(year: number): Promise<ShipCompliance[]>;
    save(compliance: ShipCompliance): Promise<ShipCompliance>;
    update(shipId: string, year: number, cbGco2eq: number): Promise<void>;
}

export interface BankingRepository {
    findByShipAndYear(shipId: string, year: number): Promise<BankEntry[]>;
    findByShip(shipId: string): Promise<BankEntry[]>;
    create(entry: BankEntry): Promise<BankEntry>;
    getTotalBanked(shipId: string): Promise<number>;
}


export interface PoolRepository {
    create(pool: Pool): Promise<Pool>;
    addMember(member: PoolMember): Promise<void>;
    findById(id: string): Promise<Pool | null>;
    getMembers(poolId: string): Promise<PoolMember[]>;
}
