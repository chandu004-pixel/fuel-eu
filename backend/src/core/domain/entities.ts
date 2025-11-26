// Domain entities and types

export interface Route {
    routeId: string;
    vesselType: string;
    fuelType: string;
    year: number;
    ghgIntensity: number; // gCO2e/MJ
    fuelConsumption: number; // tonnes
    distance: number; // km
    totalEmissions: number; // tonnes
    isBaseline: boolean; // Baseline flag
}

export interface ShipCompliance {
    shipId: string;
    year: number;
    cbGco2eq: number; // Compliance Balance
}

export interface BankEntry {
    id: string;
    shipId: string;
    year: number;
    amountGco2eq: number;
    createdAt: Date;
}

export interface Pool {
    id: string;
    year: number;
    createdAt: Date;
}

export interface PoolMember {
    poolId: string;
    shipId: string;
    cbBefore: number;
    cbAfter: number;
}

export interface ComplianceResult {
    shipId: string;
    year: number;
    targetIntensity: number;
    actualIntensity: number;
    energyInScope: number; // MJ
    complianceBalance: number;
    isCompliant: boolean;
}

export interface BaselineComparison {
    route: string;
    baseline: number;
    actual: number;
    difference: number;
    percentDiff: number;
    compliant: boolean;
}
