import { pool } from './connection';

export async function seedDatabase() {
    const client = await pool.connect();
    try {
        // Seed routes
        // Seed routes
        const routes = [
            { routeId: 'R001', vesselType: 'Container', fuelType: 'HFO', year: 2024, ghgIntensity: 91.0, fuelConsumption: 5000, distance: 12000, totalEmissions: 4500, isBaseline: true },
            { routeId: 'R002', vesselType: 'Bulk Carrier', fuelType: 'LNG', year: 2024, ghgIntensity: 88.0, fuelConsumption: 4800, distance: 11500, totalEmissions: 4200, isBaseline: false },
            { routeId: 'R003', vesselType: 'Tanker', fuelType: 'MGO', year: 2024, ghgIntensity: 93.5, fuelConsumption: 5100, distance: 12500, totalEmissions: 4700, isBaseline: false },
            { routeId: 'R004', vesselType: 'RoRo', fuelType: 'HFO', year: 2025, ghgIntensity: 89.2, fuelConsumption: 4900, distance: 11800, totalEmissions: 4300, isBaseline: false },
            { routeId: 'R005', vesselType: 'Container', fuelType: 'LNG', year: 2025, ghgIntensity: 90.5, fuelConsumption: 4950, distance: 11900, totalEmissions: 4400, isBaseline: false },
        ];

        const TARGET_INTENSITY_2025 = 89.3368;
        const LCV_MJ_PER_TON = 41000;

        for (const route of routes) {
            await client.query(
                `INSERT INTO routes (route_id, vessel_type, fuel_type, year, ghg_intensity, fuel_consumption, distance, total_emissions, is_baseline)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (route_id) DO NOTHING`,
                [route.routeId, route.vesselType, route.fuelType, route.year, route.ghgIntensity, route.fuelConsumption, route.distance, route.totalEmissions, route.isBaseline]
            );
        }

        // Seed ship compliance data
        // Assuming 1:1 mapping between Route and Ship for this seed, or just creating corresponding compliance records
        const ships = routes.map((route, index) => {
            const energyInScope = route.fuelConsumption * LCV_MJ_PER_TON;
            const cb = (TARGET_INTENSITY_2025 - route.ghgIntensity) * energyInScope;
            return {
                shipId: `SHIP-00${index + 1}`,
                year: route.year,
                cbGco2eq: cb
            };
        });

        for (const ship of ships) {
            await client.query(
                `INSERT INTO ship_compliance (ship_id, year, cb_gco2eq)
         VALUES ($1, $2, $3)
         ON CONFLICT (ship_id, year) DO NOTHING`,
                [ship.shipId, ship.year, ship.cbGco2eq]
            );
        }

        console.log('✅ Database seeded successfully');
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Run seed if this file is executed directly
if (require.main === module) {
    seedDatabase()
        .then(() => {
            console.log('Seed completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('Seed failed:', error);
            process.exit(1);
        });
}
