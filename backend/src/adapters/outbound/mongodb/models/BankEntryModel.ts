import mongoose, { Schema, Document } from 'mongoose';

export interface IBankEntry extends Document {
    id: string; // Custom ID from domain
    shipId: string;
    year: number;
    amountGco2eq: number;
    createdAt: Date;
}

const BankEntrySchema: Schema = new Schema({
    id: { type: String, required: true, unique: true },
    shipId: { type: String, required: true },
    year: { type: Number, required: true },
    amountGco2eq: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

export const BankEntryModel = mongoose.model<IBankEntry>('BankEntry', BankEntrySchema);
