# ⚡ Fuel EU Compliance Dashboard

A modern, full-stack maritime emissions tracking and compliance management system built with **React**, **Node.js**, **TypeScript**, and **MongoDB Atlas**. This application helps shipping companies monitor and manage their compliance with EU FuelEU Maritime regulations.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![React](https://img.shields.io/badge/React-19.2-61dafb)
![Node](https://img.shields.io/badge/Node-20+-green)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248)

---

## 🚀 Live Demo

- **Frontend**: [(https://fuel-eu-eight.vercel.app/)](hhttps://fuel-eu-eight.vercel.app/) 
- **Backend API**: [https://fuel-eu-oqpj.onrender.com](https://fuel-eu-oqpj.onrender.com)
- **API Health**: [https://fuel-eu-oqpj.onrender.com/health](https://fuel-eu-oqpj.onrender.com/health)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Testing](#-testing)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)

---

## ✨ Features

### Core Functionality
- 🚢 **Route Management**: Track and analyze maritime routes with GHG intensity calculations
- 📊 **Compliance Monitoring**: Real-time compliance balance (CB) calculations per ship and year
- 🏦 **Banking System**: Bank surplus emissions and apply them to deficit periods
- 💧 **Pooling**: Create compliance pools to redistribute emissions across multiple vessels
- 📈 **Comparison Dashboard**: Compare routes against baseline and target intensities

### Technical Features
- ✅ **Real-time Data**: Live updates from MongoDB Atlas
- 📱 **Mobile Responsive**: Optimized for desktop, tablet, and mobile devices
- 🎨 **Modern UI**: Glassmorphism design with neon accents
- 🔒 **Type-Safe**: Full TypeScript implementation
- 🏗️ **Hexagonal Architecture**: Clean separation of concerns
- 🌐 **RESTful API**: Well-documented endpoints
- 🔄 **CORS Enabled**: Cross-origin resource sharing configured

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19.2 with TypeScript
- **Build Tool**: Vite 7.2
- **Styling**: Tailwind CSS 4.1 with custom neon theme
- **State Management**: React Hooks
- **HTTP Client**: Fetch API
- **Deployment**: Vercel

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Express 5.1
- **Language**: TypeScript 5.9
- **Database**: MongoDB Atlas (Cloud)
- **ODM**: Mongoose 9.0
- **Architecture**: Hexagonal (Ports & Adapters)
- **Deployment**: Render

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint
- **Version Control**: Git & GitHub
- **API Testing**: Postman

---

## 🏗️ Architecture

This project follows **Hexagonal Architecture** (also known as Ports and Adapters pattern) for both frontend and backend, ensuring clean separation of concerns and testability.

### Backend Architecture

```
backend/
├── src/
│   ├── core/                    # Business Logic (Domain Layer)
│   │   ├── domain/
│   │   │   ├── entities.ts      # Domain entities (Route, Compliance, etc.)
│   │   │   ├── RouteService.ts
│   │   │   ├── ComplianceService.ts
│   │   │   ├── BankingService.ts
│   │   │   └── PoolingService.ts
│   │   └── ports/
│   │       └── repositories.ts  # Repository interfaces (outbound ports)
│   │
│   ├── adapters/                # Adapters Layer
│   │   ├── inbound/             # Inbound Adapters (Controllers)
│   │   │   └── http/
│   │   │       ├── RouteController.ts
│   │   │       ├── ComplianceController.ts
│   │   │       ├── BankingController.ts
│   │   │       └── PoolingController.ts
│   │   │
│   │   └── outbound/            # Outbound Adapters (Repositories)
│   │       └── mongodb/
│   │           ├── models/      # Mongoose schemas
│   │           ├── MongoRouteRepository.ts
│   │           ├── MongoComplianceRepository.ts
│   │           ├── MongoBankingRepository.ts
│   │           └── MongoPoolRepository.ts
│   │
│   ├── db/
│   │   ├── mongo_connection.ts  # MongoDB connection
│   │   └── mongo_seed.ts        # Database seeding
│   │
│   └── index.ts                 # Application entry point
```

### Frontend Architecture

```
frontend/
├── src/
│   ├── adapters/
│   │   ├── infrastructure/      # API Repositories (Outbound Adapters)
│   │   │   ├── ApiRouteRepository.ts
│   │   │   ├── ApiComplianceRepository.ts
│   │   │   ├── ApiBankingRepository.ts
│   │   │   └── ApiPoolRepository.ts
│   │   │
│   │   └── ui/                  # UI Components (Inbound Adapters)
│   │       └── components/
│   │           ├── RoutesTab.tsx
│   │           ├── CompareTab.tsx
│   │           ├── BankingTab.tsx
│   │           └── PoolingTab.tsx
│   │
│   ├── shared/
│   │   └── config.ts            # API configuration
│   │
│   ├── App.tsx                  # Main application component
│   ├── main.tsx                 # Application entry point
│   └── index.css                # Global styles
```

**Key Architectural Principles:**
- ✅ **Domain-Driven Design**: Business logic isolated in the core
- ✅ **Dependency Inversion**: Core depends on abstractions, not implementations
- ✅ **Testability**: Easy to mock and test each layer independently
- ✅ **Flexibility**: Easy to swap MongoDB for another database without changing business logic

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 20.x or higher
- **npm**: 10.x or higher
- **MongoDB Atlas Account**: [Sign up here](https://www.mongodb.com/cloud/atlas/register)
- **Git**: For version control

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/chandu004-pixel/fuel-eu.git
   cd fuel-eu
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Configuration

#### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=3000
MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/fueleu_db?retryWrites=true&w=majority
```

**MongoDB Atlas Setup:**
1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user
3. Whitelist your IP address (or use `0.0.0.0/0` for development)
4. Get your connection string and replace `<username>` and `<password>`

#### Frontend Configuration

Update `frontend/src/shared/config.ts`:

```typescript
// For local development
export const API_BASE_URL = 'http://localhost:3000/api';

// For production
export const API_BASE_URL = 'https://fuel-eu-oqpj.onrender.com/api';
```

### Running Locally

#### Start Backend
```bash
cd backend
npm run dev
```
Backend will run on `http://localhost:3000`

#### Start Frontend
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

### Building for Production

#### Backend
```bash
cd backend
npm run build
npm start
```

#### Frontend
```bash
cd frontend
npm run build
npm run preview
```

---

## 🌐 Deployment

### Backend Deployment (Render)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy to Render"
   git push origin main
   ```

2. **Create Render Web Service**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub repository
   - Configure:
     - **Name**: `fuel-eu-backend`
     - **Root Directory**: `backend`
     - **Environment**: `Node`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`

3. **Add Environment Variables**
   - Go to **Environment** tab
   - Add: `MONGO_URI` with your MongoDB Atlas connection string

4. **Deploy**
   - Click **"Create Web Service"**
   - Wait for deployment (first deploy takes ~5 minutes)

### Frontend Deployment (Vercel)

1. **Install Vercel CLI** (optional)
   ```bash
   npm install -g vercel
   ```

2. **Deploy via Vercel Dashboard** (Recommended)
   - Go to [Vercel Dashboard](https://vercel.com/new)
   - Import your GitHub repository
   - Configure:
     - **Framework Preset**: Vite
     - **Root Directory**: `frontend`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`
   - Click **"Deploy"**

3. **Deploy via CLI** (Alternative)
   ```bash
   cd frontend
   vercel --prod
   ```

4. **Update API URL**
   - After backend is deployed, update `frontend/src/shared/config.ts` with your Render backend URL
   - Commit and push changes
   - Vercel will auto-redeploy

---

## 📚 API Documentation

### Base URL
```
Production: https://fuel-eu-oqpj.onrender.com/api
Local: http://localhost:3000/api
```

### Endpoints

#### Routes
- `GET /routes` - Get all routes
- `GET /routes/:id` - Get route by ID
- `GET /routes/comparison` - Compare routes against baseline
- `POST /routes/:id/baseline` - Set route as baseline

#### Compliance
- `GET /compliance/cb?year=YYYY` - Get compliance for year
- `GET /compliance/adjusted-cb?year=YYYY` - Get adjusted CB for year
- `GET /compliance/cb/:shipId/:year` - Get specific ship compliance
- `POST /compliance/cb/:shipId/:year` - Calculate compliance

#### Banking
- `POST /banking/bank` - Bank surplus emissions
- `POST /banking/apply` - Apply banked surplus
- `GET /banking/total/:shipId` - Get total banked amount
- `GET /banking/records?shipId=XXX` - Get banking history

#### Pooling
- `POST /pools` - Create compliance pool
- `GET /pools/:poolId/members` - Get pool members

### Example Requests

**Bank Surplus**
```bash
curl -X POST https://fuel-eu-oqpj.onrender.com/api/banking/bank \
  -H "Content-Type: application/json" \
  -d '{
    "shipId": "SHIP-002",
    "year": 2024,
    "amount": 1000
  }'
```

**Create Pool**
```bash
curl -X POST https://fuel-eu-oqpj.onrender.com/api/pools \
  -H "Content-Type: application/json" \
  -d '{
    "year": 2025,
    "shipIds": ["SHIP-002", "SHIP-004"]
  }'
```

---

## 🧪 Testing

### Run Tests

**Frontend**
```bash
cd frontend
npm run test
```

**Backend**
```bash
cd backend
npm run test
```

### API Testing with Postman

1. Import the collection: `fuel_eu_api_tests.json`
2. Set environment variable: `baseUrl` = `https://fuel-eu-oqpj.onrender.com`
3. Run the collection

**Test Sequence:**
1. Health Check
2. Get Routes
3. Get Compliance
4. Bank Surplus
5. Get Banked Total
6. Create Pool
7. Get Pool Members

---

## 📁 Project Structure

```
fuel-eu/
├── backend/                 # Backend API (Node.js + Express + MongoDB)
│   ├── src/
│   │   ├── core/           # Business logic
│   │   ├── adapters/       # Controllers & Repositories
│   │   ├── db/             # Database connection & seeding
│   │   └── index.ts        # Entry point
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
├── frontend/                # Frontend App (React + Vite)
│   ├── src/
│   │   ├── adapters/       # API repositories & UI components
│   │   ├── shared/         # Configuration
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── vercel.json
│
├── AGENT_WORKFLOW.md        # Development workflow documentation
├── README.md                # This file
├── REFLECTION.md            # Technical decisions and learnings
└── fuel_eu_api_tests.json   # Postman collection
```

---

## 🔑 Key Technical Decisions

### Why MongoDB Atlas instead of PostgreSQL?

**Original Plan**: PostgreSQL with Prisma  
**Final Implementation**: MongoDB Atlas with Mongoose

**Reasons for Migration:**
1. **Installation Issues**: PostgreSQL installation failed on development machine
2. **Cloud-First**: MongoDB Atlas provides free tier with zero local setup
3. **Flexibility**: Document model suited for evolving compliance schemas
4. **Performance**: Built-in sharding and replication for scalability
5. **Developer Experience**: Mongoose provides excellent TypeScript support

### Why Hexagonal Architecture?

1. **Testability**: Easy to mock repositories and test business logic
2. **Flexibility**: Can swap MongoDB for PostgreSQL without changing core logic
3. **Maintainability**: Clear separation between business rules and infrastructure
4. **Scalability**: Easy to add new adapters (GraphQL, gRPC, etc.)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Authors

- **Chandril Das** - [@chandu004-pixel](https://github.com/chandu004-pixel)

---

## 🙏 Acknowledgments

- EU FuelEU Maritime Regulation guidelines
- MongoDB Atlas for cloud database hosting
- Render for backend hosting
- Vercel for frontend hosting
- React and Vite communities

---

## 📞 Support

For issues and questions:
- **GitHub Issues**: [Create an issue](https://github.com/chandu004-pixel/fuel-eu/issues)
- **Email**: your-email@example.com *(Update with your email)*

---

**Built with ⚡ by Chandril Das**
