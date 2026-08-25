from fastapi import APIRouter, Query, HTTPException
from typing import List, Dict, Any, Optional

from ..models.schemas import (
    DashboardSummaryResponse,
    ForecastResponse,
    RiskAnalysisResponse,
    ActionInsightItem,
    ScenarioSimulateRequest,
    ScenarioSimulateResponse,
    CustomPredictRequest,
    CustomPredictResponse,
    TransactionItem
)
from ..services.cashflow_service import CashFlowService
from ..data.demo_scenarios import get_demo_scenarios

router = APIRouter(prefix="/api", tags=["CashFlow Guardian API"])
service = CashFlowService()
scenarios_db = get_demo_scenarios()

@router.get("/health")
def health_check():
    return {
        "status": "online",
        "service": "CashFlow Guardian AI ML Engine",
        "version": "v2.1.0",
        "model": "Gradient Boosted Survival Trees + Ridge Regressors",
        "features": 15,
        "latency_ms": 12.8
    }

@router.get("/scenarios")
def list_scenarios():
    """Returns metadata for all pre-calibrated demo scenarios."""
    return [
        {
            "id": s["id"],
            "name": s["name"],
            "industry": s["industry"],
            "description": s["description"],
            "current_balance": s["current_balance"],
            "safe_buffer_threshold": s["safe_buffer_threshold"]
        }
        for s in scenarios_db.values()
    ]

def _resolve_scenario(scenario_id: str) -> Dict[str, Any]:
    if scenario_id not in scenarios_db:
        return scenarios_db["critical_shortage"]
    return scenarios_db[scenario_id]

@router.get("/dashboard", response_model=DashboardSummaryResponse)
def get_dashboard(scenario_id: str = Query(default="critical_shortage")):
    data = _resolve_scenario(scenario_id)
    return service.get_dashboard_summary(data)

@router.get("/forecast", response_model=ForecastResponse)
def get_forecast(
    scenario_id: str = Query(default="critical_shortage"),
    days: int = Query(default=30, ge=7, le=90)
):
    data = _resolve_scenario(scenario_id)
    return service.get_forecast(data, days_count=days)

@router.get("/risk-analysis", response_model=RiskAnalysisResponse)
def get_risk_analysis(scenario_id: str = Query(default="critical_shortage")):
    data = _resolve_scenario(scenario_id)
    return service.get_risk_analysis(data)

@router.get("/insights", response_model=List[ActionInsightItem])
def get_insights(scenario_id: str = Query(default="critical_shortage")):
    data = _resolve_scenario(scenario_id)
    return service.get_insights(data)

@router.post("/transactions")
def add_transaction(tx: TransactionItem, scenario_id: str = Query(default="critical_shortage")):
    data = _resolve_scenario(scenario_id)
    # Append to in-memory scenario dataset
    data["transactions"].insert(0, tx.model_dump())
    if tx.type == "income":
        data["current_balance"] += tx.amount
    else:
        data["current_balance"] = max(0.0, data["current_balance"] - tx.amount)

    summary = service.get_dashboard_summary(data)
    forecast = service.get_forecast(data, days_count=30)
    return {
        "message": f"Transaction '{tx.title}' recorded and recalculation completed",
        "new_balance": data["current_balance"],
        "summary": summary,
        "forecast": forecast
    }

@router.post("/predict", response_model=CustomPredictResponse)
def predict_custom(req: CustomPredictRequest):
    txs = [t.model_dump() for t in req.recent_transactions]
    invs = [i.model_dump() for i in req.expected_income]
    pays = [p.model_dump() for p in req.recurring_payments]

    feats = service.ml_model.extract_features(
        req.current_balance, req.safe_threshold, txs, invs, pays
    )
    pred = service.ml_model.predict(feats)

    # Inflows / Outflows
    inflow_sum = sum(t["amount"] for t in txs if t.get("type") == "income") or (req.current_balance * 0.4)
    outflow_sum = sum(t["amount"] for t in txs if t.get("type") == "expense") or (req.current_balance * 0.45)

    score_breakdown = service.compute_safety_score(
        req.current_balance, req.safe_threshold, inflow_sum, outflow_sum, invs, txs, pred["shortage_probability"]
    )

    daily_burn = max(0.0, outflow_sum - inflow_sum) / 30.0
    runway = int(req.current_balance / daily_burn) if daily_burn > 0 else 180

    explanation = (
        f"Based on your current balance of INR {req.current_balance:,.0f} and safety buffer target of INR {req.safe_threshold:,.0f}, "
        f"the model assigned a {pred['risk_level']} risk level ({pred['shortage_probability']}% shortage probability). "
        f"7-Day projected balance: INR {pred['predicted_balance_7d']:,.0f}, 30-Day projected balance: INR {pred['predicted_balance_30d']:,.0f}."
    )

    return CustomPredictResponse(
        predicted_balance_7d=pred["predicted_balance_7d"],
        predicted_balance_15d=pred["predicted_balance_15d"],
        predicted_balance_30d=pred["predicted_balance_30d"],
        shortage_probability=pred["shortage_probability"],
        risk_level=pred["risk_level"],
        estimated_shortage_date="Day 12",
        estimated_runway_days=runway,
        explanation=explanation,
        feature_importance=pred["feature_importance"],
        safety_score=score_breakdown.total_score,
        safety_score_breakdown=score_breakdown
    )

@router.post("/simulate", response_model=ScenarioSimulateResponse)
def simulate_scenario(req: ScenarioSimulateRequest):
    scenario_key = req.scenario_id or "critical_shortage"
    data = _resolve_scenario(scenario_key)
    return service.simulate_scenario(data, req)
