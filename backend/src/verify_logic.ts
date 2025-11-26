
import { RouteService } from './core/domain/RouteService';
import { ComplianceService } from './core/domain/ComplianceService';
import { BankingService } from './core/domain/BankingService';
import { PoolingService } from './core/domain/PoolingService';
import { InMemoryRouteRepository, InMemoryComplianceRepository, InMemoryBankingRepository, InMemoryPoolRepository } from './adapters/outbound/memory/InMemoryRepositories';

async function runVerification() {
    console.log('🧪 Starting Verification Checklist...\n');

    // Initialize Repositories
    const routeRepo = new InMemoryRouteRepository();
    const complianceRepo = new InMemoryComplianceRepository();
    const bankingRepo = new InMemoryBankingRepository();
    const poolRepo = new InMemoryPoolRepository();

    // Initialize Services
    const routeService = new RouteService(routeRepo);
    const complianceService = new ComplianceService(complianceRepo);
    const bankingService = new BankingService(bankingRepo, complianceRepo);
    const poolingService = new PoolingService(poolRepo, complianceRepo);

    let passed = 0;
    let failed = 0;

    const assert = (condition: boolean, message: string) => {
        if (condition) {
            console.log(`✅ ${message}`);
            passed++;
        } else {
            console.error(`❌ ${message}`);
            failed++;
        }
    };

    const assertThrows = async (fn: () => Promise<any>, message: string) => {
        try {
            await fn();
            console.error(`❌ ${message} (Did not throw)`);
            failed++;
        } catch (e) {
            console.log(`✅ ${message} (Threw as expected: ${(e as Error).message})`);
            passed++;
        }
    };

    // 1. Unit - ComputeComparison
    console.log('\n--- 1. ComputeComparison ---');
    const comparison = await routeService.compareRoutes();
    assert(comparison.targetIntensity === 89.3368, 'Target intensity is 89.3368');
    assert(comparison.routes.length > 0, 'Routes returned');
    const firstRoute = comparison.routes[0];
    assert(typeof firstRoute.percentDiff === 'number', 'percentDiff calculated');
    assert(typeof firstRoute.compliant === 'boolean', 'compliant status calculated');

    // 2. Unit - ComputeCB
    console.log('\n--- 2. ComputeCB ---');
    // Test with known values
    // Target = 89.3368
    // Actual = 80.0 (Surplus)
    // Fuel = 100 tons -> Energy = 100 * 41000 = 4,100,000 MJ
    // CB = (89.3368 - 80.0) * 4,100,000 = 9.3368 * 4,100,000 = 38,280,880
    const cbResult = await complianceService.calculateCB('TEST-SHIP-1', 2025, 80.0, 100);
    assert(Math.abs(cbResult.complianceBalance - 38280880) < 1, 'Positive CB calculation correct');
    assert(cbResult.isCompliant === true, 'Should be compliant');

    // Edge Case: Negative CB
    // Actual = 100.0 (Deficit)
    // CB = (89.3368 - 100.0) * 4,100,000 = -10.6632 * 4,100,000 = -43,719,120
    const cbNegative = await complianceService.calculateCB('TEST-SHIP-2', 2025, 100.0, 100);
    assert(cbNegative.complianceBalance < 0, 'Negative CB calculation correct');
    assert(cbNegative.isCompliant === false, 'Should not be compliant (assuming > 2% threshold)');

    // 3. Unit - BankSurplus
    console.log('\n--- 3. BankSurplus ---');
    // Use TEST-SHIP-1 which has positive CB
    const bankEntry = await bankingService.bankSurplus('TEST-SHIP-1', 2025, 1000);
    assert(bankEntry.amountGco2eq === 1000, 'Banked amount correct');
    const newCB = await complianceService.getCB('TEST-SHIP-1', 2025);
    assert(Math.abs(newCB - (38280880 - 1000)) < 1, 'CB updated after banking');

    // Edge Case: Over-apply bank (Bank more than available)
    await assertThrows(async () => {
        await bankingService.bankSurplus('TEST-SHIP-1', 2025, 999999999);
    }, 'Cannot bank more than available');

    // Edge Case: Bank from negative CB
    await assertThrows(async () => {
        await bankingService.bankSurplus('TEST-SHIP-2', 2025, 100);
    }, 'Cannot bank from negative CB');

    // 4. Unit - ApplyBanked
    console.log('\n--- 4. ApplyBanked ---');
    // Need to bank some amount first to apply it.
    // TEST-SHIP-1 banked 1000.
    // But applyBanked is usually for the SAME ship in a different year or SAME ship if it has deficit?
    // Wait, applyBanked checks `totalBanked` for the ship.
    // TEST-SHIP-1 has 1000 banked.
    // Let's make TEST-SHIP-1 have a deficit in 2026.
    await complianceService.calculateCB('TEST-SHIP-1', 2026, 100.0, 100); // Deficit ~ -43M

    await bankingService.applyBanked('TEST-SHIP-1', 2026, 500);
    const cbAfterApply = await complianceService.getCB('TEST-SHIP-1', 2026);
    // Original Deficit: -43,719,120
    // Applied: 500
    // New Deficit: -43,718,620
    assert(cbAfterApply > -43719120, 'CB improved after applying banked');

    // Edge Case: Apply more than banked
    await assertThrows(async () => {
        await bankingService.applyBanked('TEST-SHIP-1', 2026, 999999); // Only have ~500 left (1000 - 500 used?)
        // Wait, applyBanked creates a negative entry, so total banked reduces.
    }, 'Cannot apply more than banked');

    // Edge Case: Apply to positive CB
    await assertThrows(async () => {
        await bankingService.applyBanked('TEST-SHIP-1', 2025, 100); // 2025 is positive
    }, 'Cannot apply to positive CB');

    // 5. Unit - CreatePool
    console.log('\n--- 5. CreatePool ---');
    // Setup ships for pooling
    // Ship A: Surplus 1000
    // Ship B: Deficit -500
    // Total: 500 (Valid pool)
    await complianceRepo.save({ shipId: 'POOL-A', year: 2025, cbGco2eq: 1000 } as any);
    await complianceRepo.save({ shipId: 'POOL-B', year: 2025, cbGco2eq: -500 } as any);

    const pool = await poolingService.createPool(2025, ['POOL-A', 'POOL-B']);
    assert(!!pool.id, 'Pool created');

    const members = await poolingService.getPoolMembers(pool.id);
    assert(members.length === 2, 'Pool has 2 members');

    // Check final CBs
    const cbA = await complianceService.getCB('POOL-A', 2025);
    const cbB = await complianceService.getCB('POOL-B', 2025);

    console.log(`Pool Result: A=${cbA}, B=${cbB}`);
    assert(cbA >= 0, 'Surplus ship A is not negative');
    assert(cbB >= -500, 'Deficit ship B is not worse'); // Actually B should be better or 0
    assert(cbA + cbB === 500, 'Total CB conserved');

    // Edge Case: Invalid Pool (Total < 0)
    await complianceRepo.save({ shipId: 'POOL-C', year: 2025, cbGco2eq: -2000 } as any);
    await assertThrows(async () => {
        await poolingService.createPool(2025, ['POOL-A', 'POOL-C']); // 1000 + (-2000) = -1000
    }, 'Cannot create pool with negative total');

    console.log(`\nResults: ${passed} Passed, ${failed} Failed`);
    if (failed > 0) process.exit(1);
}

runVerification().catch(console.error);
