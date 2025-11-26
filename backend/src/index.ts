import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './db/connection';
import { seedDatabase } from './db/seed';

// Repositories - Using InMemory for now (switch to Postgres when DB is ready)
// import { PostgresRouteRepository } from './adapters/outbound/postgres/RouteRepositoryImpl';
// import { PostgresComplianceRepository } from './adapters/outbound/postgres/ComplianceRepositoryImpl';
// import { PostgresBankingRepository } from './adapters/outbound/postgres/BankingRepositoryImpl';
// import { PostgresPoolRepository } from './adapters/outbound/postgres/PoolRepositoryImpl';
import { InMemoryRouteRepository, InMemoryComplianceRepository, InMemoryBankingRepository, InMemoryPoolRepository } from './adapters/outbound/memory/InMemoryRepositories';

// Services
import { RouteService } from './core/domain/RouteService';
import { ComplianceService } from './core/domain/ComplianceService';
import { BankingService } from './core/domain/BankingService';
import { PoolingService } from './core/domain/PoolingService';

// Controllers
import { RouteController } from './adapters/inbound/http/RouteController';
import { ComplianceController } from './adapters/inbound/http/ComplianceController';
import { BankingController } from './adapters/inbound/http/BankingController';
import { PoolingController } from './adapters/inbound/http/PoolingController';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize repositories (dependency injection) - Using InMemory
const routeRepo = new InMemoryRouteRepository();
const complianceRepo = new InMemoryComplianceRepository();
const bankingRepo = new InMemoryBankingRepository();
const poolRepo = new InMemoryPoolRepository();

// Initialize services
const routeService = new RouteService(routeRepo);
const complianceService = new ComplianceService(complianceRepo);
const bankingService = new BankingService(bankingRepo, complianceRepo);
const poolingService = new PoolingService(poolRepo, complianceRepo);

// Initialize controllers
const routeController = new RouteController(routeService);
const complianceController = new ComplianceController(complianceService);
const bankingController = new BankingController(bankingService);
const poolingController = new PoolingController(poolingService);

// Routes
app.get('/api/routes', routeController.getAllRoutes);
app.get('/api/routes/comparison', routeController.compareRoutes);
app.get('/api/routes/:id', routeController.getRouteById);
app.post('/api/routes/:id/baseline', routeController.setBaseline);

app.get('/api/compliance/cb', complianceController.getCBForYear);
app.get('/api/compliance/adjusted-cb', complianceController.getAllCompliance);
app.get('/api/compliance/cb/:shipId/:year', complianceController.getCB);
app.post('/api/compliance/cb/:shipId/:year', complianceController.calculateCB);

app.post('/api/banking/bank', bankingController.bankSurplus);
app.post('/api/banking/apply', bankingController.applyBanked);
app.get('/api/banking/total/:shipId', bankingController.getTotalBanked);
app.get('/api/banking/records', bankingController.getBankingRecords);

app.post('/api/pools', poolingController.createPool);
app.get('/api/pools/:poolId/members', poolingController.getPoolMembers);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Fuel EU Compliance API is running' });
});

// Start server
async function startServer() {
    try {
        // Database initialization disabled - using InMemory repositories
        // await initializeDatabase();
        // await seedDatabase();
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
