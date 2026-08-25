import os
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
    version="2.1.0"
)

# CORS middleware for seamless local Vite dev and staging
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API router
app.include_router(api_router)

@app.get("/")
def root():
    return {
        "app": "CashFlow Guardian AI",
        "version": "2.3.0",
        "docs_url": "/docs",
        "redoc_url": "/redoc",
        "status": "online",
        "ml_engine": "Random Forest Cash Shortage Classifier & Gradient Boosting Regressors"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
