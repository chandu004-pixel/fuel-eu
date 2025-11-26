# Database Schema & Formula Implementation Summary

## ✅ Changes Completed

### 🧱 Database Schema Updates

All tables have been updated to match the professional schema specification:

#### **routes** table
- Added `id` (SERIAL PRIMARY KEY)
- Changed `route_id` to UNIQUE NOT NULL
- Changed `baseline` (DECIMAL) → `is_baseline` (BOOLEAN)
- Increased precision: `ghg_intensity` DECIMAL(10, 4)
- ✅ One baseline route set to `true` in seed data

#### **ship_compliance** table
- Added `id` (SERIAL PRIMARY KEY)
- Removed `ghg_intensity` and `fuel_consumption` columns
- Renamed `cb` → `cb_gco2eq`
- Changed PRIMARY KEY to `UNIQUE(ship_id, year)`

#### **bank_entries** table
- Renamed `amount` → `amount_gco2eq`

#### **pools** & **pool_members** tables
- No changes needed (already matched spec)

---

## 🧮 Core Formulas Applied

### **Target Intensity (2025)**
```
89.3368 gCO₂e/MJ
```

### **Energy in Scope**
```typescript
energyInScope = fuelConsumption × 41,000 MJ/t
```

### **Compliance Balance (CB)**
```typescript
CB = (Target - Actual) × Energy in scope
```
- **Positive CB** = Surplus (better than target)
- **Negative CB** = Deficit (worse than target)

---

## 📁 Backend Files Updated

### Database Layer
1. **`backend/src/db/connection.ts`**
   - Updated schema with DROP TABLE statements for clean migration
   - Applied new column names and types

2. **`backend/src/db/seed.ts`**
   - Seeded 5 routes for year 2025
   - Set R001 as baseline (`is_baseline = true`)
   - Calculated CB using correct formula for ship_compliance

### Domain Layer
3. **`backend/src/core/domain/entities.ts`**
   - `Route.baseline` → `Route.isBaseline` (boolean)
   - `ShipCompliance.cb` → `ShipCompliance.cbGco2eq`
   - Removed `ghgIntensity` and `fuelConsumption` from ShipCompliance
   - `BankEntry.amount` → `BankEntry.amountGco2eq`

4. **`backend/src/core/ports/repositories.ts`**
   - `RouteRepository.setBaseline()` - removed baseline parameter
   - `ComplianceRepository.update()` - renamed cb → cbGco2eq

5. **`backend/src/core/domain/RouteService.ts`**
   - Updated `setBaseline()` to not require baseline value
   - Updated `compareRoutes()` to use `isBaseline` flag
   - Uses route's `ghgIntensity` as baseline value

6. **`backend/src/core/domain/ComplianceService.ts`**
   - Updated to save only `cbGco2eq` (removed ghgIntensity, fuelConsumption)
   - All CB references updated to `cbGco2eq`

7. **`backend/src/core/domain/BankingService.ts`**
   - Updated to use `amountGco2eq`
   - Updated to use `cbGco2eq`

8. **`backend/src/core/domain/PoolingService.ts`**
   - Updated to use `cbGco2eq`

### Repository Implementations
9. **`backend/src/adapters/outbound/postgres/RouteRepositoryImpl.ts`**
   - Updated SQL queries to use `is_baseline`
   - Updated `setBaseline()` to set boolean flag
   - Updated mapping to use `isBaseline`

10. **`backend/src/adapters/outbound/postgres/ComplianceRepositoryImpl.ts`**
    - Updated SQL to use `cb_gco2eq`
    - Removed `ghg_intensity` and `fuel_consumption` from queries
    - Updated mapping

11. **`backend/src/adapters/outbound/postgres/BankingRepositoryImpl.ts`**
    - Updated SQL to use `amount_gco2eq`
    - Added `findByShip()` method
    - Updated mapping

### HTTP Layer
12. **`backend/src/adapters/inbound/http/RouteController.ts`**
    - Updated `setBaseline()` to not expect baseline in request body

13. **`backend/src/index.ts`**
    - Switched from InMemory to Postgres repositories
    - Enabled `initializeDatabase()` and `seedDatabase()` on startup

---

## 📁 Frontend Files Updated

### Domain Layer
14. **`frontend/src/core/domain/Route.ts`**
    - `Route.baseline` → `Route.isBaseline` (boolean)

15. **`frontend/src/core/ports/RouteRepository.ts`**
    - `setBaseline()` - removed baseline parameter

### Infrastructure Layer
16. **`frontend/src/adapters/infrastructure/ApiRouteRepository.ts`**
    - Updated `setBaseline()` to not send baseline in request body

### UI Components
17. **`frontend/src/adapters/ui/components/RoutesTab.tsx`**
    - Updated `handleSetBaseline()` to not pass ghgIntensity
    - Updated state management to use `isBaseline` boolean
    - Updated baseline check logic

---

## 🎯 Professional Improvements

### Data Integrity
- ✅ Proper primary keys (SERIAL) with unique constraints
- ✅ Consistent naming convention (`_gco2eq` suffix for emissions)
- ✅ Boolean flags instead of nullable values for state
- ✅ Proper precision for GHG intensity (4 decimal places)

### Formula Accuracy
- ✅ Correct CB calculation: `(89.3368 - ghgIntensity) × fuelConsumption × 41000`
- ✅ Consistent use of 2025 target intensity
- ✅ Proper energy conversion factor (41,000 MJ/t)

### Code Quality
- ✅ Type safety maintained across frontend and backend
- ✅ Clean separation of concerns (Hexagonal Architecture)
- ✅ Consistent entity interfaces
- ✅ Proper error handling

---

## 🚀 Next Steps

The database will be automatically reinitialized and seeded when the backend restarts. All formulas are now correctly applied throughout the application.

**To verify:**
1. Backend should restart automatically (nodemon watching)
2. Check console for "✅ Database tables initialized successfully"
3. Check console for "✅ Database seeded successfully"
4. Frontend will now display baseline correctly with the new schema

---

## 📊 Seed Data Summary

**Routes (5 total, all year 2025):**
- R001: Container, HFO, 91.0 gCO₂e/MJ, **BASELINE** ✓
- R002: Bulk Carrier, LNG, 88.0 gCO₂e/MJ
- R003: Tanker, MDO, 93.5 gCO₂e/MJ
- R004: RoRo, HFO, 89.2 gCO₂e/MJ
- R005: Container, LNG, 90.5 gCO₂e/MJ

**Ship Compliance:**
- Calculated using: CB = (89.3368 - ghgIntensity) × fuelConsumption × 41000
- All 5 ships have corresponding compliance records
