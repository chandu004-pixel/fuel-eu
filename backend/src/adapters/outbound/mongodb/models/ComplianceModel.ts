import mongoose, { Schema, Document } from 'mongoose';

export interface ICompliance extends Document {
    shipId: string;
    year: number;
    cbGco2eq: number;
}

const ComplianceSchema: Schema = new Schema({
    shipId: { type: String, required: true },
    year: { type: Number, required: true },
    cbGco2eq: { type: Number, required: true }
});

// Compound index for unique ship+year
ComplianceSchema.index({ shipId: 1, year: 1 }, { unique: true });

export const ComplianceModel = mongoose.model<ICompliance>('Compliance', ComplianceSchema);
