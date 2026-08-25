from fastapi import FastAPI, Query, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional

from backend.models.schemas import (
    CashFlowSummary,
    ForecastResponse,
    RiskPrediction,
    ScenarioParams,
    ScenarioResult,
    ActionInsight,
    Invoice,
    Payment
)
from backend.services.ml_engine import ml_engine
from backend.services.forecast_service import forecast_service
from backend.services.scenario_service import scenario_service
from backend.services.insights_service import insights_service

app = FastAPI(
    title="CashFlow Guardian AI - ML Risk & Forecast Backend",
    description="Production-ready predictive cash flow forecasting, shortage risk scoring, explainable AI, and scenario simulation API for SMEs.",
    version="1.0.0"
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Demo mock business dataset presets for standalone backend testing
DATASETS: Dict[str, Dict[str, Any]] = {
    "tech_startup": {
        "name": "NovaScale SaaS (Tech Startup)",
        "currentBalance": 42500.0,
        "monthlyInflow": 58000.0,
        "monthlyOutflow": 64500.0,
        "safeBufferThreshold": 25000.0,
        "invoices": [
            {"id": "INV-1042", "client": "Apex Global Corp", "amount": 18500.0, "dueDate": "2026-09-05", "status": "overdue", "daysOverdue": 14, "probabilityOfDelay": 0.85, "expectedDelayDays": 18},
            {"id": "INV-1045", "client": "Horizon Media", "amount": 12200.0, "dueDate": "2026-09-12", "status": "pending", "daysOverdue": 0, "probabilityOfDelay": 0.20, "expectedDelayDays": 2},
            {"id": "INV-1048", "client": "Vertex Labs", "amount": 9400.0, "dueDate": "2026-09-18", "status": "pending", "daysOverdue": 0, "probabilityOfDelay": 0.40, "expectedDelayDays": 7},
            {"id": "INV-1051", "client": "Starlight Ventures", "amount": 15000.0, "dueDate": "2026-09-26", "status": "pending", "daysOverdue": 0, "probabilityOfDelay": 0.15, "expectedDelayDays": 0},
        ],
        "payments": [
            {"id": "PAY-801", "vendor": "Gusto Bi-Weekly Payroll", "amount": 24000.0, "dueDate": "2026-09-15", "category": "Payroll", "isFlexible": False, "urgency": "Critical"},
            {"id": "PAY-802", "vendor": "AWS Cloud Infrastructure", "amount": 6200.0, "dueDate": "2026-09-08", "category": "SaaS", "isFlexible": True, "urgency": "Medium"},
            {"id": "PAY-803", "vendor": "WeWork Office Lease", "amount": 5500.0, "dueDate": "2026-09-01", "category": "Rent", "isFlexible": False, "urgency": "High"},
            {"id": "PAY-804", "vendor": "Acquisition Marketing Agency", "amount": 8500.0, "dueDate": "2026-09-19", "category": "Vendor", "isFlexible": True, "urgency": "Medium"},
            {"id": "PAY-805", "vendor": "Quarterly State Tax Escrow", "amount": 9800.0, "dueDate": "2026-09-22", "category": "Tax", "isFlexible": False, "urgency": "Critical"},
        ]
    },
    "ecommerce": {
        "name": "Lumina Goods (E-commerce Retail)",
        "currentBalance": 68000.0,
        "monthlyInflow": 112000.0,
        "monthlyOutflow": 118000.0,
        "safeBufferThreshold": 40000.0,
        "invoices": [
            {"id": "INV-EC-201", "client": "Shopify Payouts Batch", "amount": 42000.0, "dueDate": "2026-09-04", "status": "pending", "daysOverdue": 0, "probabilityOfDelay": 0.05, "expectedDelayDays": 1},
            {"id": "INV-EC-202", "client": "Amazon Settlement", "amount": 38000.0, "dueDate": "2026-09-14", "status": "pending", "daysOverdue": 0, "probabilityOfDelay": 0.10, "expectedDelayDays": 2},
            {"id": "INV-EC-203", "client": "Wholesale Distributor B2B", "amount": 26500.0, "dueDate": "2026-09-02", "status": "overdue", "daysOverdue": 9, "probabilityOfDelay": 0.65, "expectedDelayDays": 14},
        ],
        "payments": [
            {"id": "PAY-EC-101", "vendor": "Overseas Factory Bulk Inventory", "amount": 52000.0, "dueDate": "2026-09-16", "category": "Inventory", "isFlexible": True, "urgency": "High"},
            {"id": "PAY-EC-102", "vendor": "Meta & TikTok Ad Spend", "amount": 28000.0, "dueDate": "2026-09-10", "category": "Vendor", "isFlexible": True, "urgency": "Medium"},
            {"id": "PAY-EC-103", "vendor": "3PL Fulfillment Logistics", "amount": 16500.0, "dueDate": "2026-09-20", "category": "Vendor", "isFlexible": False, "urgency": "High"},
            {"id": "PAY-EC-104", "vendor": "Operations Staff Payroll", "amount": 14000.0, "dueDate": "2026-09-15", "category": "Payroll", "isFlexible": False, "urgency": "Critical"},
        ]
    },
    "agency": {
        "name": "Kite Creative (Design & Growth Agency)",
        "currentBalance": 31000.0,
        "monthlyInflow": 48000.0,
        "monthlyOutflow": 45000.0,
        "safeBufferThreshold": 20000.0,
        "invoices": [
            {"id": "INV-AG-301", "client": "FinTech Unicorn Brand Redesign", "amount": 22000.0, "dueDate": "2026-08-28", "status": "overdue", "daysOverdue": 21, "probabilityOfDelay": 0.90, "expectedDelayDays": 25},
            {"id": "INV-AG-302", "client": "HealthTech Retainer Q3", "amount": 14000.0, "dueDate": "2026-09-10", "status": "pending", "daysOverdue": 0, "probabilityOfDelay": 0.25, "expectedDelayDays": 5},
            {"id": "INV-AG-303", "client": "E-Com Mobile App SOW", "amount": 16000.0, "dueDate": "2026-09-24", "status": "pending", "daysOverdue": 0, "probabilityOfDelay": 0.35, "expectedDelayDays": 8},
        ],
        "payments": [
            {"id": "PAY-AG-201", "vendor": "Designers & Dev Payroll", "amount": 28000.0, "dueDate": "2026-09-15", "category": "Payroll", "isFlexible": False, "urgency": "Critical"},
            {"id": "PAY-AG-202", "vendor": "Figma / Adobe / Notion Subscriptions", "amount": 2400.0, "dueDate": "2026-09-05", "category": "SaaS", "isFlexible": True, "urgency": "Low"},
            {"id": "PAY-AG-203", "vendor": "Contract Motion Animator", "amount": 6500.0, "dueDate": "2026-09-18", "category": "Vendor", "isFlexible": True, "urgency": "Medium"},
            {"id": "PAY-AG-204", "vendor": "Studio Loft Lease", "amount": 4200.0, "dueDate": "2026-09-01", "category": "Rent", "isFlexible": False, "urgency": "High"},
        ]
    }
}

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CashFlow Guardian ML Engine",
        "version": "1.0.0",
        "modelReady": True,
        "inferencePipeline": "Online"
    }

@app.get("/api/datasets")
def get_datasets():
    return [
        {"id": key, "name": val["name"], "currentBalance": val["currentBalance"]}
        for key, val in DATASETS.items()
    ]

@app.get("/api/financial-summary", response_model=CashFlowSummary)
def get_summary(dataset_id: str = "tech_startup"):
    data = DATASETS.get(dataset_id, DATASETS["tech_startup"])
    balance = data["currentBalance"]
    inflow = data["monthlyInflow"]
    outflow = data["monthlyOutflow"]
    safe_buffer = data["safeBufferThreshold"]
    
    projected = balance + (inflow - outflow)
    net_burn = max(0.0, outflow - inflow)
    runway = int(balance / (net_burn / 30.0)) if net_burn > 0 else 180
    
    # Calculate health score 0 - 100
    score = 70
    if balance > safe_buffer * 1.5:
        score += 15
    elif balance < safe_buffer:
        score -= 25
        
    if inflow >= outflow:
        score += 15
    else:
        score -= int(min(25, (outflow - inflow) / outflow * 50))
        
    score = max(10, min(98, score))
    
    return CashFlowSummary(
        currentBalance=balance,
        monthlyInflow=inflow,
        monthlyOutflow=outflow,
        projected30DayBalance=projected,
        cashHealthScore=score,
        safeBufferThreshold=safe_buffer,
        runwayDays=runway,
        netBurnRate=net_burn
    )

@app.get("/api/forecast", response_model=ForecastResponse)
def get_forecast(
    dataset_id: str = "tech_startup",
    days: int = Query(default=30, ge=7, le=90)
):
    data = DATASETS.get(dataset_id, DATASETS["tech_startup"])
    return forecast_service.generate_forecast(
        current_balance=data["currentBalance"],
        monthly_inflow=data["monthlyInflow"],
        monthly_outflow=data["monthlyOutflow"],
        safe_buffer=data["safeBufferThreshold"],
        days_count=days,
        invoices=data["invoices"],
        payments=data["payments"]
    )

@app.get("/api/risk-prediction", response_model=RiskPrediction)
def get_risk_prediction(dataset_id: str = "tech_startup"):
    data = DATASETS.get(dataset_id, DATASETS["tech_startup"])
    return ml_engine.predict_shortage_risk(
        current_balance=data["currentBalance"],
        monthly_inflow=data["monthlyInflow"],
        monthly_outflow=data["monthlyOutflow"],
        safe_buffer=data["safeBufferThreshold"],
        invoices=data["invoices"],
        payments=data["payments"]
    )

@app.post("/api/simulate", response_model=ScenarioResult)
def simulate_scenario(
    params: ScenarioParams = Body(...),
    dataset_id: str = Query(default="tech_startup")
):
    data = DATASETS.get(dataset_id, DATASETS["tech_startup"])
    return scenario_service.run_simulation(
        params=params,
        current_balance=data["currentBalance"],
        monthly_inflow=data["monthlyInflow"],
        monthly_outflow=data["monthlyOutflow"],
        invoices=data["invoices"],
        payments=data["payments"]
    )

@app.get("/api/insights", response_model=List[ActionInsight])
def get_insights(dataset_id: str = "tech_startup"):
    data = DATASETS.get(dataset_id, DATASETS["tech_startup"])
    return insights_service.generate_actionable_insights(
        current_balance=data["currentBalance"],
        monthly_inflow=data["monthlyInflow"],
        monthly_outflow=data["monthlyOutflow"],
        safe_buffer=data["safeBufferThreshold"],
        invoices=data["invoices"],
        payments=data["payments"]
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
