import mongoose, { Schema, Document } from 'mongoose';

export interface IRoute extends Document {
    routeId: string;
    vesselType: string;
    fuelType: string;
    year: number;
    ghgIntensity: number;
    fuelConsumption: number;
    distance: number;
    totalEmissions: number;
    isBaseline: boolean;
}

const RouteSchema: Schema = new Schema({
    routeId: { type: String, required: true, unique: true },
    vesselType: { type: String, required: true },
    fuelType: { type: String, required: true },
    year: { type: Number, required: true },
    ghgIntensity: { type: Number, required: true },
    fuelConsumption: { type: Number, required: true },
    distance: { type: Number, required: true },
    totalEmissions: { type: Number, required: true },
    isBaseline: { type: Boolean, default: false }
});

export const RouteModel = mongoose.model<IRoute>('Route', RouteSchema);
