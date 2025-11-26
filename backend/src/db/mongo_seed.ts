import { RouteModel } from '../adapters/outbound/mongodb/models/RouteModel';
import { ComplianceModel } from '../adapters/outbound/mongodb/models/ComplianceModel';

const TARGET_INTENSITY_2025 = 89.3368;
const LCV_MJ_PER_TON = 41000; // Lower Calorific Value

export async function seedMongoDatabase() {
    try {
        const routeCount = await RouteModel.countDocuments();
        if (routeCount > 0) {
            console.log('ℹ️ MongoDB already seeded');
            return;
        }

        console.log('🌱 Seeding MongoDB...');

        // Seed Routes (From User KPI Dataset)
        const routes = [
            { routeId: 'R001', vesselType: 'Container', fuelType: 'HFO', year: 2024, ghgIntensity: 91.0, fuelConsumption: 5000, distance: 12000, totalEmissions: 4500, isBaseline: false },
            { routeId: 'R002', vesselType: 'BulkCarrier', fuelType: 'LNG', year: 2024, ghgIntensity: 88.0, fuelConsumption: 4800, distance: 11500, totalEmissions: 4200, isBaseline: false },
            { routeId: 'R003', vesselType: 'Tanker', fuelType: 'MGO', year: 2024, ghgIntensity: 93.5, fuelConsumption: 5100, distance: 12500, totalEmissions: 4700, isBaseline: false },
            { routeId: 'R004', vesselType: 'RoRo', fuelType: 'HFO', year: 2025, ghgIntensity: 89.2, fuelConsumption: 4900, distance: 11800, totalEmissions: 4300, isBaseline: false },
            { routeId: 'R005', vesselType: 'Container', fuelType: 'LNG', year: 2025, ghgIntensity: 90.5, fuelConsumption: 4950, distance: 11900, totalEmissions: 4400, isBaseline: false },
        ];

        await RouteModel.insertMany(routes);

        // Seed Compliance (Derived from Routes for consistency)
        // Mapping R00X -> SHIP-00X
        const ships = [
            { shipId: 'SHIP-001', year: 2024, ghgIntensity: 91.0, fuelConsumption: 5000 },
            { shipId: 'SHIP-002', year: 2024, ghgIntensity: 88.0, fuelConsumption: 4800 },
            { shipId: 'SHIP-003', year: 2024, ghgIntensity: 93.5, fuelConsumption: 5100 },
            { shipId: 'SHIP-004', year: 2025, ghgIntensity: 89.2, fuelConsumption: 4900 },
            { shipId: 'SHIP-005', year: 2025, ghgIntensity: 90.5, fuelConsumption: 4950 },

            // Extra data for Banking/Pooling scenarios (same ships, different years)
            { shipId: 'SHIP-001', year: 2025, ghgIntensity: 90.0, fuelConsumption: 5100 }, // Improved in 2025
            { shipId: 'SHIP-002', year: 2025, ghgIntensity: 87.5, fuelConsumption: 4900 }, // Improved in 2025
            { shipId: 'SHIP-003', year: 2025, ghgIntensity: 94.0, fuelConsumption: 5200 }, // Worsened
        ];

        const complianceDocs = ships.map(ship => {
            const energyInScope = ship.fuelConsumption * LCV_MJ_PER_TON;
            const cb = (TARGET_INTENSITY_2025 - ship.ghgIntensity) * energyInScope;
            return {
                shipId: ship.shipId,
                year: ship.year,
                cbGco2eq: cb
            };
        });

        await ComplianceModel.insertMany(complianceDocs);

        console.log('✅ MongoDB seeded successfully');
    } catch (error) {
        console.error('❌ Error seeding MongoDB:', error);
    }
}
