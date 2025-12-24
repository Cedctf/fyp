# Comprehensive Project Analysis: Dengue Outbreak Surveillance System

## 1. Executive Summary
This project is an advanced **Dengue Prediction & Surveillance System** designed with a Service-Oriented Architecture (SOA). It integrates a high-performance **Next.js frontend** for geospatial visualization and administrative control with a **Python/Flask backend** dedicated to Machine Learning inference.

The system features authentic multi-horizon forecasting (7, 14, 28 days) using Gradient Boosting regressors, a secure API key infrastructure for external access, and a dual-mode visualization engine (Historical vs. Predicted) built on Google Maps.

---

## 2. Technical Stack Overview

### **Frontend Layer (Client-Side)**
*   **Framework**: Next.js 16.0.1 (React 19) - utilizing Pages Router.
*   **Styling**: TailwindCSS v4 (via PostCSS), Styled-components, Framer Motion (animations).
*   **Geospatial**: `@react-google-maps/api` (Heatmaps), `kepler.gl` (Advanced Deck.gl layers), `deck.gl`.
*   **State Management**: Redux Toolkit (specifically managing Kepler.gl state).
*   **PDF Generation**: `jspdf` + `jspdf-autotable` (Client-side report generation).
*   **Auth**: `next-auth` v4 (Google, GitHub, Credentials).

### **Backend Layer (Inference Engine)**
*   **Server**: Flask (Python) - Lightweight REST API.
*   **ML Libraries**: `scikit-learn` (GradientBoostingRegressor), `pandas`, `numpy`, `joblib`.
*   **Environment**: Python (exact version dependent on host, requirements minimal).
*   **Storage**: Local serialized `.pkl` files (No specialized vector DB used; optimized `pandas` lookups used instead).

### **Database Layer**
*   **Primary DB**: MongoDB (via `mongodb` native driver).
*   **Purpose**: Stores User profiles, OAuth tokens, API Keys (hashed), and Audit logs.

---

## 3. Deep Dive: Machine Learning & Prediction Logic
**Source**: `backend/model_training/train.py`, `backend/predictor.py`

### 3.1. Model Architecture
The system does *not* use a single model. It employs an **ensemble of three distinct Gradient Boosting Regressors**, each trained for a specific time horizon.
*   **`model_7d.pkl`**: Predicts cases for **Week 1** (Next 7 days).
*   **`model_14d.pkl`**: Predicts cases for **Week 2** (Days 8-14).
*   **`model_28d.pkl`**: Predicts cases for **Weeks 3-4** (Days 15-28).

**Algorithm**:
```python
GradientBoostingRegressor(n_estimators=100, max_depth=3)
```
This configuration prioritizes preventing overfitting (`max_depth=3`) while maintaining robustness via boosting (`n_estimators=100`).

### 3.2. Feature Engineering
The models are trained on a combined dataset (`ultimate_combined_data.csv`) aggregated by **Location** and **Week**.
*   **Input Features**:
    1.  `Rainfall_Index`: Environmental factor.
    2.  `Urban_Density`: Demographic factor.
    3.  `Case_Count`: Auto-regressive features (historical cases).
*   **Micro-Location Logic**: Locations are quantized/binned by rounding Lat/Long to 3 decimal places (~100m precision) to create a unique `Location_ID`.

### 3.3. Inference Workflow
1.  **Request**: Frontend sends `{lat, long}` to `/predict/location`.
2.  **Lookup**: Backend searches `location_db.pkl` (a pre-computed state of the latest known world) for the nearest data point within **1km**.
3.  **Fallback**: If no location is found nearby, it defaults to generic estimates (`rain=0.5, density=0.5`).
4.  **Prediction**: All 3 models run in parallel.
    *   **Cumulative Logic**:
        *   7-Day Forecast = `model_7d` output.
        *   14-Day Forecast = `model_7d` + `model_14d`.
        *   28-Day Forecast = `model_7d` + `model_14d` + `model_28d`.
5.  **Risk Scoring**: A compound risk level (LOW/MEDIUM/HIGH) is derived from the 28-day cumulative total.

---

## 4. Deep Dive: Frontend & Visualization
**Source**: `components/DengueHeatmap.js`

This component is the crown jewel of the frontend, comprising ~900 lines of logic.

### 4.1. Visualization Modes
1.  **Historical Mode**:
    *   **Source**: Parses `ultimate_combined_data.csv` directly in the browser via `papaparse`.
    *   **Filtering**: Client-side filtering by Year (`2024`, `2025`), Month, or Rolling Windows (`7/14/28 days`).
2.  **Predicted Mode**:
    *   **Source**: Fetches `heatmap_data.json` (pre-generated predictions).
    *   **Dynamic Visuals**: Visual intensity (`maxIntensity`) and radius adjust dynamically based on the selected forecast horizon (7d/14d/28d) to prevent the map from looking "all red" or "too sparse".

### 4.2. Advanced Features
*   **GeoJSON Mapping**: Loads `kl_parliament_11.geojson` to map raw lat/long points to specific Districts (e.g., "Bukit Bintang"). This enables the "Top Districts" leaderboard.
*   **Client-Side PDF Reports**: Uses `jspdf` to generate a professional "Situational Report" on the fly, calculating statistics from the currently visible map data. It draws headers, charts, and tables directly onto a canvas-like PDF structure.

---

## 5. Security & Infrastructure Architecture

### 5.1. Authentication (Zero-Trust)
**Source**: `pages/api/auth/[...nextauth].js`
*   **Providers**: Google, GitHub, and Email/Password (Credentials).
*   **Synchronization**: A custom `signIn` callback ensures that even OAuth users are explicitly created in the local MongoDB `users` collection. This allows the system to attach custom roles (`admin`, `user`) to Google accounts.
*   **Session**: JWT-based. The user's internal MongoDB `_id` is embedded into the session token, ensuring seamless relation across the app.

### 5.2. API Key Management
**Source**: `lib/api-keys.js`
*   **Key Format**: `fyp_sk_<32_bytes_hex>` (Stripe-like format).
*   **Storage Strategy**: **Hashing**. The DB only stores `SHA256(key)`. The raw key is shown to the user exactly once.
*   **Audit**: Every key creation, revocation, or status change is logged via `lib/audit.js`.

---

## 6. Directory Map (Detailed)

```
/
├── backend/                   # Python Flask Service
│   ├── app.py                 # API Routes (/predict, /alerts)
│   ├── predictor.py           # Core Inference Class (loads models)
│   ├── model_training/        # Training Pipeline
│   │   ├── train.py           # Main training script (GradientBoosting)
│   │   └── evaluate_model.py  # Performance metrics generator
│   ├── models/                # Binary Artifacts
│   │   ├── model_*.pkl        # The 3 Trained Models
│   │   └── location_db.pkl    # Spatial Lookup Database
│   └── models_metrics/        # Training accuracy plots (PNGs)
│
├── components/                # React Components
│   ├── DengueHeatmap.js       # Main Map Visualization (900 lines)
│   ├── ApiKeyManager.js       # Security Dashboard
│   ├── admin/                 # Admin-specific tables/charts
│   └── ui/                    # Reusable Radix UI primitives
│
├── lib/                       # Core Logic
│   ├── mongodb.js             # DB Connection (Singleton pattern)
│   ├── api-keys.js            # Key interaction logic (Crypto/Hash)
│   └── audit.js               # Activity Logging
│
├── pages/                     # Next.js Routes
│   ├── api/                   # Serverless Functions (BFF)
│   │   ├── auth/              # NextAuth endpoints
│   │   └── v1/                # Public API (e.g., /data)
│   ├── admin.js               # Admin Dashboard
│   ├── api-dashboard.js       # User Developer Portal
│   └── _app.js                # Global Providers (Session, Redux)
│
└── public/                    # Static Assets
    ├── heatmap_data.json      # Pre-computed prediction cache
    ├── ultimate_combined_data.csv # Raw historical data
    └── geo/                   # GeoJSON boundary files
```

## 7. Configuration Details
*   **`next.config.mjs`**: Enforces strict mode. configured to allow images from `lh3.googleusercontent.com` (Google Avatars) and `avatars.githubusercontent.com`.
*   **`store.js`**: Redux store is explicitly configured with `taskMiddleware` from `react-palm` to support Kepler.gl's complex side-effects.

---

## 8. Conclusion
The system is a production-grade prototype. It demonstrates a sophisticated understanding of separating concerns: heavy math is done in Python, interactive visuals in React/Drei/Google Maps, and state is managed securely with NextAuth and MongoDB. The use of ensemble modeling for multi-horizon forecasting is a standout feature, providing more nuanced risk assessment than a simple single-target regression.
