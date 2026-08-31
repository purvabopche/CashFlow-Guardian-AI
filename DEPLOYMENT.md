# CashFlow Guardian AI - Deployment Guide 🚀

This guide provides instructions for deploying **CashFlow Guardian AI** across modern cloud hosting platforms.

---

## 1. Local Development

### Prerequisites
- Node.js 18+ and npm
- Python 3.10+ (tested on Python 3.12)

### Start Backend Service (Terminal 1)
```bash
# Install dependencies
pip install -r backend/requirements.txt

# Start FastAPI server on port 8000
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
# Or directly:
python -m backend.main
```
Backend API will be accessible at: `http://localhost:8000` (Swagger docs at `/docs`).

### Start Frontend Application (Terminal 2)
```bash
# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend will be accessible at: `http://localhost:3000`.

---

## 2. Backend Deployment

Recommended platforms: **Render**, **Railway**, **Fly.io**, **Google Cloud Run**, or **AWS ECS**.

### Build & Start Commands
- **Build Command**:
  ```bash
  pip install -r backend/requirements.txt
  ```
- **Start Command**:
  ```bash
  uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}
  ```

### Required & Optional Environment Variables
| Variable | Required | Default | Description |
| :--- | :---: | :---: | :--- |
| `PORT` | Auto | `8000` | Port assigned by hosting provider |
| `HOST` | Auto | `0.0.0.0` | Bind host address |
| `ENV` | Yes | `production` | Runtime mode (`production` or `development`) |
| `CORS_ORIGINS` | Yes | `*` (dev) | Comma-separated list of allowed frontend domains (e.g. `https://your-app.vercel.app`) |
| `PAYMENT_PROVIDER` | No | `demo` | Active payment provider (`demo` or `razorpay`) |
| `RAZORPAY_KEY_ID` | Optional | — | Required **only** if `PAYMENT_PROVIDER=razorpay` |
| `RAZORPAY_KEY_SECRET` | Optional | — | Required **only** if `PAYMENT_PROVIDER=razorpay` (never exposed to frontend) |

### Health Check Endpoint
- **URL**: `GET /api/health` (also aliased at `GET /health`)
- **Expected Response**: `HTTP 200 OK`
- **Response Format**:
  ```json
  {
    "status": "online",
    "service": "CashFlow Guardian AI ML Engine",
    "version": "2.3.0",
    "features": 12,
    "accuracy": 0.981,
    "latency_ms": 11.2
  }
  ```

### ML Model Artifacts
- The trained ensemble model artifacts (`shortage_classifier.joblib`, `balance_regressor.joblib`, `days_to_shortage_regressor.joblib`, and `model_metadata.json`) reside in `backend/models/`.
- Paths are resolved dynamically relative to `__file__`, guaranteeing seamless operation in containerized or root directory deployments.

---

## 3. Frontend Deployment

Recommended platforms: **Vercel**, **Netlify**, **Cloudflare Pages**, or **AWS Amplify**.

### Build Configuration
- **Framework Preset**: Vite
- **Build Command**:
  ```bash
  npm run build
  ```
- **Output Directory**:
  ```
  dist
  ```
- **Install Command**:
  ```bash
  npm install
  ```

### Environment Variables
Configure these in your hosting provider's environment settings:

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Full URL to the deployed FastAPI backend API | `https://your-backend.onrender.com/api` |
| `VITE_USE_MOCK_API` | Set to `false` to connect to the live ML backend | `false` |
| `VITE_APP_ENV` | Application environment | `production` |

### How API URL Configuration Works
In `src/services/apiClient.ts`:
```typescript
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
```
- In local development, it defaults to `http://localhost:8000/api`.
- In production, it reads the `VITE_API_BASE_URL` build-time environment variable.

---

## 4. Recommended Cloud Architecture

```
                    ┌─────────────────────────┐
                    │     User / Browser      │
                    └────────────┬────────────┘
                                 │
                  HTTPS (Static Assets / HTML)
                                 │
                    ┌────────────▼────────────┐
                    │   Frontend (Vercel)     │
                    │   React 18 + Vite SPA   │
                    └────────────┬────────────┘
                                 │
                     HTTPS REST Requests + JSON
                                 │
                    ┌────────────▼────────────┐
                    │   Backend (Render)      │
                    │   FastAPI + Uvicorn     │
                    │   ML Inference Engine   │
                    └─────────────────────────┘
```

---

## 5. Payment Mode & Zero-Credential Guarantee

- The application is **100% functional out-of-the-box in Demo Mode** with zero external credentials.
- When `PAYMENT_PROVIDER=demo` (or when Razorpay credentials are not provided), all payment settlements, ledger transactions, rolling forecasts, and ML risk evaluations execute immediately via the built-in simulator.
- Razorpay credentials (`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`) are strictly optional and only needed when testing against live Razorpay Test Mode gateways.
- Secrets are **never exposed to the client or committed to Git**.
