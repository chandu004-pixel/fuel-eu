# Fuel EU Compliance Dashboard - Quick Start Guide

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL (optional - uses in-memory storage by default)

### Installation & Running

#### 1. Start the Backend Server
```bash
cd /Users/thunder003/Desktop/fuel-eu/backend
npm install
npm run dev
```
✅ Backend will run on: **http://localhost:3000**

#### 2. Start the Frontend Application
```bash
cd /Users/thunder003/Desktop/fuel-eu/frontend
npm install
npm run dev
```
✅ Frontend will run on: **http://localhost:5173**

## 📊 Dashboard Features

### Tab 1: 🚢 Routes
**Purpose**: View and manage maritime routes

**Features**:
- Filter routes by vessel type, fuel type, and year
- View route details including GHG intensity
- Set baseline values for routes
- See compliance status

**Key Metrics**:
- Total Routes
- Average GHG Intensity
- Compliant Routes

### Tab 2: 📊 Compare
**Purpose**: Compare routes against Fuel EU baseline

**Target**: 89.3368 gCO₂e/MJ (2% below 91.16)

**Features**:
- Summary cards with key statistics
- Visual bar chart comparing intensities
- Detailed comparison table
- Compliance status indicators

**Columns**:
- Route ID
- Vessel Type
- GHG Intensity
- Baseline
- % Difference
- Status (✅ Compliant / ❌ Non-Compliant)

### Tab 3: 🏦 Banking
**Purpose**: Fuel EU Article 20 - Banking mechanism

**Features**:
- View Compliance Balance (CB) by year
- Bank positive CB for future use
- Apply banked surplus to deficits
- Year selector (2024-2030)

**Actions**:
1. **Bank Surplus**: Save positive CB (disabled if CB ≤ 0)
2. **Apply Banking**: Use banked surplus to cover deficits

**KPIs Displayed**:
- CB Before Banking
- Applied Amount
- CB After Banking

### Tab 4: 💧 Pooling
**Purpose**: Fuel EU Article 21 - Pooling mechanism

**Features**:
- View all ships with adjusted CB
- Select multiple ships for pooling
- Real-time pool validation
- Create pools with valid balance

**Validation Rules**:
- ✅ Pool sum must be ≥ 0
- ✅ Deficit ships cannot exit worse
- ✅ Surplus ships cannot exit negative

**Pool Summary Shows**:
- Selected Ships count
- Total Surplus
- Total Deficit
- Net Pool Balance (green = valid, red = invalid)

## 🎨 UI Features

### Design Elements
- **Dark Theme**: Modern dark gradient background
- **Neon Accents**: Cyan and purple highlights
- **Glass Cards**: Frosted glass effect with backdrop blur
- **Smooth Animations**: Fade-in transitions between tabs
- **Responsive Layout**: Works on all screen sizes

### Interactive Elements
- **Hover Effects**: All buttons and cards respond to hover
- **Color Coding**: Green for positive/compliant, Red for negative/non-compliant
- **Real-time Updates**: Pool summary updates as you select ships
- **Loading States**: Shows loading indicators while fetching data

## 📡 API Endpoints

### Routes
- `GET /api/routes` - Get all routes
- `GET /api/routes/comparison` - Get comparison data
- `POST /api/routes/:id/baseline` - Set baseline

### Compliance
- `GET /api/compliance/cb?year=YYYY` - Get CB for year
- `GET /api/compliance/adjusted-cb?year=YYYY` - Get adjusted CB

### Banking
- `POST /api/banking/bank` - Bank surplus
- `POST /api/banking/apply` - Apply banked amount

### Pooling
- `POST /api/pools` - Create pool

## 🧪 Testing the Application

### Test Compare Tab
1. Click "📊 Compare" tab
2. Verify summary cards show data
3. Check comparison chart displays routes
4. Scroll to see full comparison table

### Test Banking Tab
1. Click "🏦 Banking" tab
2. Select different years from dropdown
3. Observe CB values change
4. Note: "Bank Surplus" is disabled if CB ≤ 0

### Test Pooling Tab
1. Click "💧 Pooling" tab
2. Click checkbox for Ship S001 (+1,500)
3. Observe Pool Summary update
4. Click checkbox for Ship S002 (-500)
5. Verify Net Pool Balance = +1,000
6. Note: "Create Pool" button is enabled (green)

## 🔧 Troubleshooting

### Backend not starting?
```bash
# Kill any process on port 3000
lsof -ti:3000 | xargs kill -9

# Restart backend
cd backend && npm run dev
```

### Frontend not loading data?
1. Check backend is running on port 3000
2. Check browser console for errors
3. Verify API_BASE_URL in `frontend/src/shared/config.ts`

### Database connection issues?
- The app uses in-memory storage by default
- No database setup required for testing
- To use PostgreSQL, uncomment database code in `backend/src/index.ts`

## 📦 Mock Data

### Routes (5 total)
- R001: Container / HFO / 91.0 gCO₂e/MJ
- R002: BulkCarrier / LNG / 88.0 gCO₂e/MJ
- R003: Tanker / MGO / 93.5 gCO₂e/MJ
- R004: RoRo / HFO / 89.2 gCO₂e/MJ
- R005: Container / LNG / 90.5 gCO₂e/MJ

### Ships (2 total)
- S001: Ship S001 / CB: +1,500 (surplus)
- S002: Ship S002 / CB: -500 (deficit)

## 🎯 Key Formulas

### Compliance Calculation
```
percentDiff = ((actual / baseline) - 1) × 100
compliant = actual ≤ 89.3368 gCO₂e/MJ
```

### Compliance Balance (CB)
```
CB = (Target - Actual) × Energy in scope
Positive CB = Surplus (better than target)
Negative CB = Deficit (worse than target)
```

### Pool Validation
```
Valid Pool = Sum(adjustedCB) ≥ 0
```

## 📝 Export Reports

Click the **"Export Report"** button in the header to download a JSON report of the current tab's data.

## 🌐 Browser Compatibility

Tested and working on:
- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)

## 📚 Additional Resources

- **Full Documentation**: See `IMPLEMENTATION_COMPLETE.md`
- **Architecture Details**: Hexagonal Architecture (Ports & Adapters)
- **Fuel EU Regulations**: Articles 20 (Banking) & 21 (Pooling)

## 🎉 Success Indicators

You'll know everything is working when:
- ✅ All 4 tabs load without errors
- ✅ Compare tab shows 5 routes with compliance status
- ✅ Banking tab displays CB values for selected year
- ✅ Pooling tab allows ship selection and pool creation
- ✅ All interactive elements respond to clicks
- ✅ Data updates in real-time

---

**Need Help?** Check the browser console (F12) for any error messages.
