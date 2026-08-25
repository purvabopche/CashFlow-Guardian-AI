from fastapi import FastAPI, Query, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

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
from backend.model import risk_model

app = FastAPI(
    title="CashFlow Guardian AI - ML Risk & Forecast Backend",
    description="Production-ready predictive cash flow forecasting, shortage risk scoring, explainable AI, and scenario simulation API for SMEs and individuals.",
    version="1.3.0"
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request Schema for the dedicated ML Shortage Risk Endpoint
class PredictRiskRequest(BaseModel):
    current_balance: float = Field(..., description="Current available liquid cash balance")
    recent_transactions: List[Dict[str, Any]] = Field(default_factory=list, description="Historical transaction records")
    recurring_payments: List[Dict[str, Any]] = Field(default_factory=list, description="Scheduled recurring subscriptions/bills")
    expected_income: float = Field(default=0.0, description="Expected primary monthly or milestone income")
    safe_threshold: float = Field(default=5000.0, description="Minimum safe cash buffer threshold")
    forecast_days: int = Field(default=30, description="Horizon in days to project")

# Demo mock business dataset presets for standalone backend testing
DATASETS: Dict[str, Dict[str, Any]] = {
    "individual_freelance": {
        "name": "Alex Chen (Freelance Product Designer)",
        "industry": "Freelance & Creative Services",
        "currentBalance": 38500.0,
        "monthlyInflow": 72000.0,
        "monthlyOutflow": 68000.0,
        "safeBufferThreshold": 12000.0,
        "invoices": [
            {"id": "INV-ALX-01", "client": "Fintech Design Sprint Q3", "amount": 32000.0, "dueDate": "2026-09-04", "status": "overdue", "daysOverdue": 12, "probabilityOfDelay": 0.80, "expectedDelayDays": 16},
            {"id": "INV-ALX-02", "client": "Brand Identity Retainer", "amount": 18000.0, "dueDate": "2026-09-15", "status": "pending", "daysOverdue": 0, "probabilityOfDelay": 0.20, "expectedDelayDays": 2},
            {"id": "INV-ALX-03", "client": "Mobile App UI Overhaul", "amount": 22000.0, "dueDate": "2026-09-24", "status": "pending", "daysOverdue": 0, "probabilityOfDelay": 0.30, "expectedDelayDays": 5},
        ],
        "payments": [
            {"id": "PAY-ALX-01", "vendor": "Apartment Studio Rent & Maintenance", "amount": 22000.0, "dueDate": "2026-09-01", "category": "Rent", "isFlexible": False, "urgency": "High"},
            {"id": "PAY-ALX-02", "vendor": "MacBook Pro Hardware EMI", "amount": 8500.0, "dueDate": "2026-09-10", "category": "Vendor", "isFlexible": False, "urgency": "High"},
            {"id": "PAY-ALX-03", "vendor": "Subcontracted 3D Motion Specialist", "amount": 16000.0, "dueDate": "2026-09-16", "category": "Payroll", "isFlexible": True, "urgency": "Critical"},
            {"id": "PAY-ALX-04", "vendor": "Figma, Adobe CC, Midjourney & Notion", "amount": 4200.0, "dueDate": "2026-09-08", "category": "SaaS", "isFlexible": True, "urgency": "Low"},
            {"id": "PAY-ALX-05", "vendor": "Estimated Advance Tax Installment", "amount": 12500.0, "dueDate": "2026-09-22", "category": "Tax", "isFlexible": False, "urgency": "Critical"},
        ]
    },
    "tech_startup": {
        "name": "NovaScale SaaS (Tech Startup)",
        "industry": "Enterprise Software & Cloud",
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
        "industry": "Consumer Goods & Retail",
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
    }
}

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "CashFlow Guardian ML Engine",
        "version": "1.3.0",
        "modelReady": True,
        "inferencePipeline": "Online"
    }

@app.post("/predict-risk")
@app.post("/api/predict-risk")
def predict_shortage_risk_endpoint(req: PredictRiskRequest):
    """
    Dedicated ML Shortage Risk Endpoint.
    Evaluates current balance, recent transactions, recurring payments, and expected income.
    Returns predicted balance, shortage probability %, risk level, and human-friendly explanation.
    """
    return risk_model.predict_risk(
        current_balance=req.current_balance,
        recent_transactions=req.recent_transactions,
        recurring_payments=req.recurring_payments,
        expected_income=req.expected_income,
        safe_threshold=req.safe_threshold,
        forecast_days=req.forecast_days
    )

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
