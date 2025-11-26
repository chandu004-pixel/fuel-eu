# ⚡ Fuel EU Compliance Dashboard

A full-stack application for managing maritime emissions compliance under the **Fuel EU Maritime Regulation (EU) 2023/1805**.

## 🎯 Overview

This project implements a comprehensive compliance management system with:
- **Frontend**: React + TypeScript + Tailwind CSS (dark & neon theme)
- **Backend**: Node.js + TypeScript + PostgreSQL (hexagonal architecture)
- **Features**: Routes tracking, baseline comparison, CB banking, and pooling

## 🏗️ Architecture

### Backend (Hexagonal/Ports & Adapters)
```
backend/
├── src/
│   ├── core/
│   │   ├── domain/          # Business logic (services)
│   │   └── ports/           # Interfaces (dependency inversion)
│   ├── adapters/
│   │   ├── inbound/http/    # Express controllers
│   │   └── outbound/postgres/ # Repository implementations
│   ├── db/                  # Database connection & migrations
│   └── index.ts             # Application entry point
```

### Frontend (Component-based)
```
frontend/
├── src/
│   ├── components/          # Tab components
│   ├── App.tsx              # Main application
│   └── index.css            # Tailwind + custom styles
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd fuel-eu
```

2. **Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your PostgreSQL credentials
npm run dev
```

3. **Frontend Setup**
```bash
cd frontend
npm install
npm run dev
```

4. **Database Setup**
```bash
# Create PostgreSQL database
createdb fueleu_db

# Run migrations (automatic on first start)
cd backend
npm run dev
```

## 📊 API Endpoints

### Routes
- `GET /api/routes` - Get all routes
- `GET /api/routes/:id` - Get route by ID
- `POST /api/routes/:id/baseline` - Set baseline for route
- `GET /api/routes/comparison` - Get baseline vs comparison data

### Compliance
- `GET /api/compliance/cb/:shipId/:year` - Get compliance balance
- `POST /api/compliance/cb/:shipId/:year` - Calculate CB

### Banking
- `POST /api/banking/bank` - Bank positive CB
- `POST /api/banking/apply` - Apply banked surplus to deficit
- `GET /api/banking/total/:shipId` - Get total banked amount

### Pooling
- `POST /api/pools` - Create compliance pool
- `GET /api/pools/:poolId/members` - Get pool members

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📐 Core Formulas

### Target Intensity (2025)
```
Target = 89.3368 gCO2e/MJ
```

### Compliance Balance (CB)
```
CB = (Target - Actual) × Energy in scope
Energy = Fuel Consumption (t) × 41,000 MJ/t
```

### Compliance Rules
- **Positive CB** = Surplus (better than target)
- **Negative CB** = Deficit (worse than target)
- **Compliant** if within 2% above baseline (≤ 91.16 gCO2e/MJ)

## 🎨 Features

### ✅ Routes Tab
- Display all routes with filters
- Vessel type, fuel type, year filtering
- Compliance status indicators
- Baseline comparison

### ✅ Compare Tab
- Baseline vs actual comparison
- Visual progress bars
- Percentage difference calculation
- Compliance validation

### ✅ Banking Tab
- Bank positive CB for future use
- Apply banked surplus to deficits
- Validation rules enforcement
- Pool creation interface

### ✅ Pooling Tab
- Create compliance pools
- Ship selection with validation
- CB redistribution logic
- Pool sum indicator

## 📚 Documentation

- [AGENT_WORKFLOW.md](./AGENT_WORKFLOW.md) - Development workflow
- [REFLECTION.md](./REFLECTION.md) - Project insights and decisions

## 🔒 Environment Variables

### Backend (.env)
```
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fueleu_db
DB_USER=postgres
DB_PASSWORD=postgres
```

## 🛠️ Tech Stack

### Frontend
- React 19
- TypeScript
- Tailwind CSS v4
- Vite

### Backend
- Node.js
- Express
- TypeScript
- PostgreSQL
- pg (node-postgres)

## 📖 References

- [Fuel EU Maritime Regulation (EU) 2023/1805](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32023R1805)
- [ESSF-SAPS-WST-FuelEU-calculation-methodologies.pdf](https://www.emsa.europa.eu/)

## 👥 Contributing

This is a full-stack demonstration project. For production use, additional features would be needed:
- Authentication & authorization
- Rate limiting
- Input validation & sanitization
- Comprehensive error handling
- Unit & integration tests
- API documentation (Swagger/OpenAPI)

## 📄 License

ISC

---

**Built with ⚡ by AI-Agent Collaboration**
# fuel-eu
