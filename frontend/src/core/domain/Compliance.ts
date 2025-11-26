export interface ComplianceStatus {
    cb_before: number;
    applied: number;
    cb_after: number;
    year: number;
}

export interface BankEntry {
    id: string;
    shipId: string;
    year: number;
    amountGco2eq: number;
    createdAt: Date | string;
}
