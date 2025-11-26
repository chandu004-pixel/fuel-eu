import mongoose, { Schema, Document } from 'mongoose';

export interface IPoolMember {
    shipId: string;
    cbBefore: number;
    cbAfter: number;
}

export interface IPool extends Document {
    id: string; // Custom ID
    year: number;
    members: IPoolMember[];
    createdAt: Date;
}

const PoolSchema: Schema = new Schema({
    id: { type: String, required: true, unique: true },
    year: { type: Number, required: true },
    members: [{
        shipId: { type: String, required: true },
        cbBefore: { type: Number, required: true },
        cbAfter: { type: Number, required: true }
    }],
    createdAt: { type: Date, default: Date.now }
});

export const PoolModel = mongoose.model<IPool>('Pool', PoolSchema);
