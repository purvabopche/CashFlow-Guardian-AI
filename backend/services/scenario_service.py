from typing import Dict, Any, List
try:
    from backend.models.schemas import ScenarioParams, ScenarioResult
    from backend.services.forecast_service import forecast_service
    from backend.services.ml_engine import ml_engine
except (ImportError, ValueError):
    try:
        from models.schemas import ScenarioParams, ScenarioResult
        from services.forecast_service import forecast_service
        from services.ml_engine import ml_engine
    except (ImportError, ValueError):
        from ..models.schemas import ScenarioParams, ScenarioResult
        from .forecast_service import forecast_service
        from .ml_engine import ml_engine

class ScenarioService:
    @staticmethod
    def run_simulation(
        params: ScenarioParams,
        current_balance: float,
        monthly_inflow: float,
        monthly_outflow: float,
        invoices: List[Dict[str, Any]],
        payments: List[Dict[str, Any]]
    ) -> ScenarioResult:
        # Run baseline forecast
        baseline = forecast_service.generate_forecast(
            current_balance=current_balance,
            monthly_inflow=monthly_inflow,
            monthly_outflow=monthly_outflow,
            safe_buffer=params.safeBufferAmount,
            days_count=30,
            invoices=invoices,
            payments=payments,
            scenario_delay_days=0,
            scenario_expense=0,
            scenario_rev_pct=0,
            vendor_shift_days=0
        )
        
        baseline_risk = ml_engine.predict_shortage_risk(
            current_balance=current_balance,
            monthly_inflow=monthly_inflow,
            monthly_outflow=monthly_outflow,
            safe_buffer=params.safeBufferAmount,
            invoices=invoices,
            payments=payments
        )
        
        # Run simulated forecast with user parameters
        simulated = forecast_service.generate_forecast(
            current_balance=current_balance,
            monthly_inflow=monthly_inflow,
            monthly_outflow=monthly_outflow,
            safe_buffer=params.safeBufferAmount,
            days_count=30,
            invoices=invoices,
            payments=payments,
            scenario_delay_days=params.customerPaymentDelayDays,
            scenario_expense=params.upcomingExpenseAmount,
            scenario_rev_pct=params.monthlyRevenueChangePercent,
            vendor_shift_days=params.vendorPaymentShiftDays
        )
        
        simulated_risk = ml_engine.predict_shortage_risk(
            current_balance=current_balance,
            monthly_inflow=monthly_inflow,
            monthly_outflow=monthly_outflow,
            safe_buffer=params.safeBufferAmount,
            invoices=invoices,
            payments=payments,
            scenario_delay_days=params.customerPaymentDelayDays,
            scenario_expense=params.upcomingExpenseAmount,
            scenario_rev_pct=params.monthlyRevenueChangePercent
        )
        
        # Build timeline comparison
        timeline = []
        for b_day, s_day in zip(baseline.forecastDays, simulated.forecastDays):
            timeline.append({
                "date": b_day.date,
                "dayIndex": b_day.dayIndex,
                "baselineBalance": b_day.projectedBalance,
                "simulatedBalance": s_day.projectedBalance,
                "safeBuffer": params.safeBufferAmount,
                "variance": round(s_day.projectedBalance - b_day.projectedBalance, 2)
            })
            
        balance_delta = simulated.lowestProjectedPoint - baseline.lowestProjectedPoint
        risk_delta = simulated_risk.riskProbability - baseline_risk.riskProbability
        
        summary_note = (
            f"Under this scenario, minimum cash balance shifts by {'+$' if balance_delta >= 0 else '-$'}{abs(balance_delta):,.0f}. "
            f"Shortage probability changes from {baseline_risk.riskProbability}% to {simulated_risk.riskProbability}% "
            f"({'increased risk' if risk_delta > 0 else 'improved liquidity position'})."
        )
        
        return ScenarioResult(
            params=params,
            baselineMinBalance=baseline.lowestProjectedPoint,
            simulatedMinBalance=simulated.lowestProjectedPoint,
            baselineRiskProbability=baseline_risk.riskProbability,
            simulatedRiskProbability=simulated_risk.riskProbability,
            balanceDelta=round(balance_delta, 2),
            runwayImpactDays=simulated_risk.runwayDays - baseline_risk.runwayDays,
            timeline=timeline,
            summaryNote=summary_note
        )

scenario_service = ScenarioService()
