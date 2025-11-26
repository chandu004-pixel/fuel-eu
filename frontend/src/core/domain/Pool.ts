export interface PoolMember {
    shipId: string;
    name: string;
    adjustedCB: number; // Compliance Balance
}

export interface Pool {
    id: string;
    members: PoolMember[];
    totalCB: number;
    isValid: boolean;
}
