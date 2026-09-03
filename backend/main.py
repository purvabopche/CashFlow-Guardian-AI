import os
import sys
from pathlib import Path

# Ensure root directory and backend directory are in sys.path for serverless function runtimes
_root = Path(__file__).resolve().parent.parent
_backend = Path(__file__).resolve().parent
for _p in [str(_root), str(_backend)]:
    if _p not in sys.path:
        sys.path.insert(0, _p)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.routes import router as api_router

app = FastAPI(
    title="CashFlow Guardian AI - Predictive Liquidity Intelligence API",
    description=(
        "Production-ready FastAPI backend for early cash shortage prediction, "
        "time-series rolling liquidity forecasting, explainable AI (XAI) feature attribution, "
        "and real-time What-If scenario stress simulations."
    ),
    version="2.3.0"
)

# Allowed CORS Origins Configuration
# In production, specify allowed domains via CORS_ORIGINS (comma-separated):
# Example: CORS_ORIGINS=https://cashflow-guardian.vercel.app,https://my-app.com
cors_env = os.environ.get("CORS_ORIGINS", "").strip()
is_production = os.environ.get("ENV", "development").lower() == "production"

default_dev_origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
]

if cors_env:
    if cors_env == "*":
        allowed_origins = ["*"]
    else:
        allowed_origins = [origin.strip() for origin in cors_env.split(",") if origin.strip()]
        if not is_production:
            for dev_origin in default_dev_origins:
                if dev_origin not in allowed_origins:
                    allowed_origins.append(dev_origin)
else:
    # If CORS_ORIGINS is not set:
    # In development: allow local dev ports + wildcard for rapid testing
    # In production: default to localhost:3000 unless explicitly configured
    allowed_origins = default_dev_origins if is_production else ["*"]

# Auto-detect Vercel deployment domain if present
frontend_env = os.environ.get("FRONTEND_URL", "").strip()
vercel_url_env = os.environ.get("VERCEL_URL", "").strip()
additional_origins = []
if frontend_env:
    additional_origins.append(frontend_env if frontend_env.startswith("http") else f"https://{frontend_env}")
if vercel_url_env:
    additional_origins.append(vercel_url_env if vercel_url_env.startswith("http") else f"https://{vercel_url_env}")

if allowed_origins != ["*"]:
    for extra in additional_origins:
        if extra not in allowed_origins:
            allowed_origins.append(extra)

allow_credentials = allowed_origins != ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API router under /api
app.include_router(api_router)

@app.get("/")
def root():
    return {
        "app": "CashFlow Guardian AI",
        "version": "2.3.0",
        "docs_url": "/docs",
        "redoc_url": "/redoc",
        "health_url": "/api/health",
        "status": "online",
        "environment": os.environ.get("ENV", "development"),
        "ml_engine": "Random Forest Cash Shortage Classifier & Gradient Boosting Regressors"
    }

# Top-level health endpoint (for platforms that check /health instead of /api/health)
@app.get("/health")
def health_check_root():
    return {
        "status": "healthy",
        "service": "CashFlow Guardian AI ML Engine",
        "version": "2.3.0",
        "environment": os.environ.get("ENV", "development"),
        "payment_provider": os.environ.get("PAYMENT_PROVIDER", "demo"),
        "ml_model_loaded": True
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    uvicorn.run("backend.main:app", host=host, port=port, reload=not is_production)
