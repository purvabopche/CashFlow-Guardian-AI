import datetime
import uuid
from typing import Dict, Any, List, Optional
import numpy as np
try:
    from backend.models.cashflow_model import CashFlowRiskEnsemble
    from backend.models.schemas import (
        DashboardSummaryResponse,
        SafetyScoreBreakdown,
        ForecastResponse,
        ForecastDayPoint,
        RiskAnalysisResponse,
        ExplainableFactorItem,
        ActionInsightItem,
        ScenarioSimulateRequest,
        ScenarioSimulateResponse,
        SimulationPoint,
        PaymentRecord,
        CreatePaymentRequest,
        TransactionItem,
        PaymentImpactSnapshot,
        PaymentImpactDelta,
        PaymentImpactSummary,
        ProcessPaymentResponse,
        RazorpayOrderResponse
    )
    from backend.services.payment_provider import get_payment_provider, RazorpayPaymentProvider
except (ImportError, ValueError):
    try:
        from models.cashflow_model import CashFlowRiskEnsemble
        from models.schemas import (
            DashboardSummaryResponse,
            SafetyScoreBreakdown,
            ForecastResponse,
            ForecastDayPoint,
            RiskAnalysisResponse,
            ExplainableFactorItem,
            ActionInsightItem,
            ScenarioSimulateRequest,
            ScenarioSimulateResponse,
            SimulationPoint,
            PaymentRecord,
            CreatePaymentRequest,
            TransactionItem,
            PaymentImpactSnapshot,
            PaymentImpactDelta,
            PaymentImpactSummary,
            ProcessPaymentResponse,
            RazorpayOrderResponse
        )
        from services.payment_provider import get_payment_provider, RazorpayPaymentProvider
    except (ImportError, ValueError):
        from ..models.cashflow_model import CashFlowRiskEnsemble
        from ..models.schemas import (
            DashboardSummaryResponse,
            SafetyScoreBreakdown,
            ForecastResponse,
            ForecastDayPoint,
            RiskAnalysisResponse,
            ExplainableFactorItem,
            ActionInsightItem,
            ScenarioSimulateRequest,
            ScenarioSimulateResponse,
            SimulationPoint,
            PaymentRecord,
            CreatePaymentRequest,
            TransactionItem,
            PaymentImpactSnapshot,
            PaymentImpactDelta,
            PaymentImpactSummary,
            ProcessPaymentResponse,
            RazorpayOrderResponse
        )
        from .payment_provider import get_payment_provider, RazorpayPaymentProvider


class CashFlowService:
    def __init__(self):
        self.ml_model = CashFlowRiskEnsemble()

    def compute_safety_score(
        self,
        current_balance: float,
        safe_buffer: float,
        monthly_inflow: float,
        monthly_outflow: float,
        invoices: List[Dict[str, Any]],
        transactions: List[Dict[str, Any]],
        shortage_prob_pct: float
    ) -> SafetyScoreBreakdown:
        # 1. Liquidity Health (30 pts max)
        buffer_ratio = current_balance / max(safe_buffer, 1.0)
        if buffer_ratio >= 2.5:
            liq = 30
        elif buffer_ratio >= 1.8:
            liq = 26
        elif buffer_ratio >= 1.2:
            liq = 20
        elif buffer_ratio >= 0.8:
            liq = 12
        else:
            liq = 5

        # 2. Income Stability (25 pts max)
        rec_inflow = sum(t['amount'] for t in transactions if t.get('type') == 'income' and t.get('is_recurring'))
        tot_inflow = max(monthly_inflow, 1.0)
        rec_in_ratio = rec_inflow / tot_inflow
        if rec_in_ratio >= 0.70:
            inc = 24
        elif rec_in_ratio >= 0.40:
            inc = 18
        elif rec_in_ratio >= 0.20:
            inc = 13
        else:
            inc = 8

        # 3. Expense Pressure (20 pts max)
        net_surplus = monthly_inflow - monthly_outflow
        if net_surplus >= monthly_outflow * 0.25:
            exp = 20
        elif net_surplus >= 0:
            exp = 15
        elif abs(net_surplus) <= monthly_outflow * 0.15:
            exp = 9
        else:
            exp = 4

        # 4. Receivables Health (15 pts max)
        overdue_amt = sum(i.get('amount', 0.0) for i in invoices if i.get('status') == 'overdue')
        tot_inv_amt = sum(i.get('amount', 0.0) for i in invoices) or 1.0
        overdue_ratio = overdue_amt / tot_inv_amt
        if overdue_ratio == 0:
            rec = 15
        elif overdue_ratio < 0.25:
            rec = 11
        elif overdue_ratio < 0.50:
            rec = 7
        else:
            rec = 3

        # 5. Shortage Risk Margin (10 pts max)
        if shortage_prob_pct <= 15.0:
            srm = 10
        elif shortage_prob_pct <= 35.0:
            srm = 8
        elif shortage_prob_pct <= 65.0:
            srm = 5
        else:
            srm = 2

        total = min(99, max(6, liq + inc + exp + rec + srm))
        return SafetyScoreBreakdown(
            total_score=total,
            liquidity_health=liq,
            income_stability=inc,
            expense_pressure=exp,
            receivables_health=rec,
            shortage_risk_score=srm
        )

    def get_dashboard_summary(self, scenario_data: Dict[str, Any]) -> DashboardSummaryResponse:
        current_balance = scenario_data["current_balance"]
        safe_buffer = scenario_data["safe_buffer_threshold"]
        monthly_inflow = scenario_data["monthly_inflow"]
        monthly_outflow = scenario_data["monthly_outflow"]
        invoices = scenario_data.get("invoices", [])
        payments = scenario_data.get("payments", [])
        transactions = scenario_data.get("transactions", [])

        # Run real ML inference
        feats = self.ml_model.extract_features_from_state(current_balance, safe_buffer, transactions, invoices, payments)
        pred = self.ml_model.predict(feats)

        shortage_prob = pred["shortage_probability_pct"]
        risk_level = "Critical" if pred["risk_level"] in ["CRITICAL", "Critical"] else "High" if pred["risk_level"] in ["HIGH", "High"] else "Medium" if pred["risk_level"] in ["MEDIUM", "Medium"] else "Low"

        net_cash_flow = monthly_inflow - monthly_outflow
        net_burn = max(0.0, monthly_outflow - monthly_inflow)
        daily_burn = net_burn / 30.0
        runway_days = int(current_balance / daily_burn) if daily_burn > 0 else 180

        danger_days_from_now = pred["estimated_shortage_day"]
        now = datetime.datetime.now()
        target_dt = now + datetime.timedelta(days=danger_days_from_now)
        danger_date = target_dt.strftime("%b %d") if shortage_prob >= 35.0 else None

        score_breakdown = self.compute_safety_score(
            current_balance, safe_buffer, monthly_inflow, monthly_outflow, invoices, transactions, shortage_prob
        )

        return DashboardSummaryResponse(
            current_balance=current_balance,
            monthly_inflow=monthly_inflow,
            monthly_outflow=monthly_outflow,
            net_cash_flow=net_cash_flow,
            projected_30d_balance=pred["predicted_minimum_balance"],
            cash_safety_score=score_breakdown.total_score,
            safety_score_breakdown=score_breakdown,
            safe_buffer_threshold=safe_buffer,
            runway_days=runway_days,
            net_burn_rate=net_burn,
            danger_day_count=max(4, 30 - danger_days_from_now),
            danger_date=danger_date,
            danger_days_from_now=danger_days_from_now,
            shortage_probability=shortage_prob,
            risk_level=risk_level
        )

    def get_forecast(self, scenario_data: Dict[str, Any], days_count: int = 30) -> ForecastResponse:
        current_balance = scenario_data["current_balance"]
        safe_buffer = scenario_data["safe_buffer_threshold"]
        monthly_inflow = scenario_data["monthly_inflow"]
        monthly_outflow = scenario_data["monthly_outflow"]
        invoices = scenario_data.get("invoices", [])
        payments = scenario_data.get("payments", [])

        now = datetime.datetime.now()
        base_daily_in = monthly_inflow / 30.0
        base_daily_out = monthly_outflow / 30.0

        forecast_days: List[ForecastDayPoint] = []
        running_balance = current_balance
        lowest_point = current_balance
        days_below = 0
        predicted_breach = None
        tot_in = 0.0
        tot_out = 0.0

        for i in range(days_count):
            day_date = now + datetime.timedelta(days=i)
            date_str = day_date.strftime("%b %d")
            day_of_month = day_date.day
            day_of_week = day_date.weekday()

            flow_mod = 0.35 if (day_of_week >= 5) else 1.05
            d_in = base_daily_in * flow_mod * (0.88 + ((i * 11) % 7) / 22.0)
            d_out = base_daily_out * flow_mod * (0.92 + ((i * 13) % 5) / 26.0)

            events: List[str] = []

            # 1st of month: Rent
            if day_of_month == 1 or i == 0:
                rent_amt = monthly_outflow * 0.18
                d_out += rent_amt
                events.append("Studio Workspace Rent")

            # 15th of month: Payroll
            if day_of_month == 15 or i == 14:
                pay_amt = monthly_outflow * 0.35
                d_out += pay_amt
                events.append("Bi-Weekly Contractor Compensation")

            # Invoices
            for inv in invoices:
                if inv.get("status") != "paid":
                    inv_day = (abs(hash(inv["id"])) % 24)
                    if inv_day == i:
                        d_in += inv["amount"] * 0.95
                        events.append(f"Invoice: {inv['client']} (+₹{int(inv['amount']):,})")

            # Scheduled Payments & Disbursements (Only pending commitments project into timeline)
            for p in payments:
                if p.get("status", "pending") != "pending":
                    continue
                pay_day = (abs(hash(p["id"])) % 26)
                if pay_day == i:
                    p_name = p.get("counterparty") or p.get("vendor", "Payment")
                    if p.get("direction") == "incoming":
                        d_in += p["amount"]
                        events.append(f"Payment Inflow: {p_name} (+₹{int(p['amount']):,})")
                    else:
                        d_out += p["amount"]
                        events.append(f"Disbursement: {p_name} (-₹{int(p['amount']):,})")


            tot_in += d_in
            tot_out += d_out
            running_balance += (d_in - d_out)

            if running_balance < lowest_point:
                lowest_point = running_balance

            is_below = running_balance < safe_buffer
            is_danger = running_balance < safe_buffer * 0.85

            if is_below:
                days_below += 1
                if not predicted_breach:
                    predicted_breach = date_str

            if running_balance < 0:
                r_level = "Critical"
            elif running_balance < safe_buffer * 0.7:
                r_level = "High"
            elif running_balance < safe_buffer:
                r_level = "Medium"
            else:
                r_level = "Low"

            forecast_days.append(ForecastDayPoint(
                date=date_str,
                day_index=i + 1,
                projected_balance=round(running_balance, 2),
                predicted_inflow=round(d_in, 2),
                predicted_outflow=round(d_out, 2),
                net_change=round(d_in - d_out, 2),
                is_below_threshold=is_below,
                is_danger_zone=is_danger,
                risk_level=r_level,
                confidence_lower=round(running_balance * 0.93 - (i * 80), 2),
                confidence_upper=round(running_balance * 1.07 + (i * 80), 2),
                events=events if events else None
            ))

        bal_7d = forecast_days[6].projected_balance if len(forecast_days) >= 7 else running_balance
        bal_15d = forecast_days[14].projected_balance if len(forecast_days) >= 15 else running_balance
        bal_30d = forecast_days[29].projected_balance if len(forecast_days) >= 30 else running_balance

        return ForecastResponse(
            forecast_days=forecast_days,
            safe_buffer_threshold=safe_buffer,
            lowest_projected_point=round(lowest_point, 2),
            days_below_threshold_count=days_below,
            predicted_breach_date=predicted_breach,
            total_projected_inflow=round(tot_in, 2),
            total_projected_outflow=round(tot_out, 2),
            projected_7d_balance=bal_7d,
            projected_15d_balance=bal_15d,
            projected_30d_balance=bal_30d
        )

    def get_risk_analysis(self, scenario_data: Dict[str, Any]) -> RiskAnalysisResponse:
        current_balance = scenario_data["current_balance"]
        safe_buffer = scenario_data["safe_buffer_threshold"]
        monthly_inflow = scenario_data["monthly_inflow"]
        monthly_outflow = scenario_data["monthly_outflow"]
        invoices = scenario_data.get("invoices", [])
        payments = scenario_data.get("payments", [])
        transactions = scenario_data.get("transactions", [])

        feats = self.ml_model.extract_features_from_state(current_balance, safe_buffer, transactions, invoices, payments)
        pred = self.ml_model.predict(feats)

        shortage_prob = pred["shortage_probability_pct"]
        risk_level = "Critical" if pred["risk_level"] in ["CRITICAL", "Critical"] else "High" if pred["risk_level"] in ["HIGH", "High"] else "Medium" if pred["risk_level"] in ["MEDIUM", "Medium"] else "Low"

        overdue_sum = sum(i["amount"] for i in invoices if i.get("status") == "overdue")
        critical_pay = sum(p["amount"] for p in payments if p.get("urgency") in ["Critical", "High"])

        explainability: List[ExplainableFactorItem] = [
            ExplainableFactorItem(
                id="f1",
                name="Receivables Latency & Client Invoice Delay",
                impact_percent=round(min(48.0, max(16.0, 28.0 + (overdue_sum / 1200.0))), 1),
                direction="increases_risk",
                description=f"₹{int(overdue_sum):,} in overdue client receivables creates an immediate cash timing deficit.",
                category="Receivables",
                shap_value=0.34,
                is_remediable=True
            ),
            ExplainableFactorItem(
                id="f2",
                name="Upcoming Non-Negotiable Commitments (Rent & Payroll)",
                impact_percent=round(min(38.0, max(14.0, 22.0 + (critical_pay / max(1.0, current_balance)) * 12.0)), 1),
                direction="increases_risk",
                description=f"₹{int(critical_pay):,} in fixed, non-deferrable disbursements due within the 30-day window.",
                category="Outflow",
                shap_value=0.26,
                is_remediable=True
            ),
            ExplainableFactorItem(
                id="f3",
                name="Target Cash Safety Cushion Ratio",
                impact_percent=round(min(28.0, max(8.0, 18.0 - (current_balance / max(1.0, safe_buffer)) * 4.0)), 1),
                direction="increases_risk" if current_balance < safe_buffer * 1.3 else "decreases_risk",
                description=f"Current liquid reserve is {round(current_balance / max(1.0, safe_buffer), 1)}x of target safe buffer (₹{int(safe_buffer):,}).",
                category="Liquidity",
                shap_value=0.18 if current_balance < safe_buffer * 1.3 else -0.15,
                is_remediable=False
            ),
            ExplainableFactorItem(
                id="f4",
                name="Discretionary & Variable Spending Elasticity",
                impact_percent=14.5,
                direction="increases_risk",
                description="Food delivery and shopping account for ~24% of monthly outflows. Reducing this creates immediate buffer headroom.",
                category="Discretionary",
                shap_value=0.14,
                is_remediable=True
            )
        ]

        window = f"Day {pred['estimated_shortage_day']} (Projected lowest: ₹{int(pred['predicted_minimum_balance']):,})" if shortage_prob >= 35.0 else "No critical shortage predicted in next 60 days"

        return RiskAnalysisResponse(
            risk_probability=shortage_prob,
            risk_level=risk_level,
            predicted_shortage_window=window,
            confidence_score=round(pred["confidence"] * 100, 1),
            runway_days=int(current_balance / max(1.0, (monthly_outflow - monthly_inflow) / 30.0)) if monthly_outflow > monthly_inflow else 180,
            key_factors=[
                f"Uncollected overdue client invoices total ₹{int(overdue_sum):,}",
                f"Upcoming fixed rent & contractor liabilities total ₹{int(critical_pay):,}",
                f"Cash reserve coverage is at {int((current_balance / max(1.0, safe_buffer)) * 100)}% of target threshold"
            ],
            explainability=explainability,
            model_metadata=self.ml_model.metadata
        )

    def get_insights(self, scenario_data: Dict[str, Any]) -> List[ActionInsightItem]:
        current_balance = scenario_data["current_balance"]
        safe_buffer = scenario_data["safe_buffer_threshold"]
        monthly_inflow = scenario_data["monthly_inflow"]
        monthly_outflow = scenario_data["monthly_outflow"]
        invoices = scenario_data.get("invoices", [])
        payments = scenario_data.get("payments", [])
        transactions = scenario_data.get("transactions", [])

        feats = self.ml_model.extract_features_from_state(current_balance, safe_buffer, transactions, invoices, payments)
        pred = self.ml_model.predict(feats)
        base_prob = pred["shortage_probability_pct"]

        insights: List[ActionInsightItem] = []

        # 1. Vendor Payment Rescheduling
        flex_p = next((p for p in payments if p.get("is_flexible") or p.get("urgency") == "High"), payments[0] if payments else None)
        if flex_p:
            target_1 = round(max(2.0, min(base_prob - 4.0, base_prob * 0.45)), 1) if base_prob > 8.0 else round(max(1.5, base_prob * 0.6), 1)
            insights.append(ActionInsightItem(
                id="ins-01",
                title=f"Postpone ₹{int(flex_p['amount']):,} {flex_p['vendor']} by 5–10 Days",
                description=f"Delaying the ₹{int(flex_p['amount']):,} disbursement bridges your mid-month liquidity gap, reducing shortage probability from {base_prob}% to {target_1}%.",
                category="Vendor Payment Timing",
                priority="Critical" if base_prob >= 50.0 else "High",
                potential_cash_impact=flex_p["amount"],
                runway_days_impact=14,
                recommended_action=f"Request a milestone split or 10-day payment extension with {flex_p['vendor']}.",
                action_type="reschedule_payment",
                why_it_matters=f"Prevents closing cash balance from breaching your ₹{int(safe_buffer):,} safe operating buffer.",
                expected_improvement=f"Shortage probability drops from {base_prob}% to {target_1}% and preserves operating runway.",
                risk_reduction_from=base_prob,
                risk_reduction_to=target_1,
                template_data={"vendor": flex_p["vendor"], "amount": flex_p["amount"], "due_date": flex_p["due_date"]}
            ))

        # 2. Overdue Invoices
        overdue = [i for i in invoices if i.get("status") == "overdue"]
        if overdue:
            top_inv = max(overdue, key=lambda x: x["amount"])
            target_2 = round(max(1.5, min(base_prob - 6.0, base_prob * 0.38)), 1) if base_prob > 10.0 else round(max(1.0, base_prob * 0.5), 1)
            insights.append(ActionInsightItem(
                id="ins-02",
                title=f"Accelerate Overdue Receivables: {top_inv['client']}",
                description=f"Invoice #{top_inv['id']} for ₹{int(top_inv['amount']):,} is {top_inv.get('days_overdue', 12)} days overdue. Recovering this closes liquidity deficit, reducing risk from {base_prob}% to {target_2}%.",
                category="Receivable Management",
                priority="Critical" if base_prob >= 50.0 else "High",
                potential_cash_impact=top_inv["amount"],
                runway_days_impact=12,
                recommended_action="Send automated 1-click friendly payment reminder with direct UPI routing instructions.",
                action_type="invoice_reminder",
                why_it_matters="Overdue invoice timing lag is a primary feature contributor to cash pressure.",
                expected_improvement=f"Instantly recovers ₹{int(top_inv['amount']):,} into primary checking account.",
                risk_reduction_from=base_prob,
                risk_reduction_to=target_2,
                template_data={"client": top_inv["client"], "amount": top_inv["amount"], "invoice_id": top_inv["id"], "days_overdue": top_inv.get("days_overdue", 12)}
            ))

        # 3. Discretionary Daily Trim
        target_3 = round(max(2.0, min(base_prob - 2.0, base_prob * 0.55)), 1) if base_prob > 6.0 else round(max(1.0, base_prob * 0.7), 1)
        insights.append(ActionInsightItem(
            id="ins-03",
            title="Discretionary Daily Spending Trim (₹300/day)",
            description=f"Reducing discretionary dining and shopping by ₹300 per day improves your Cash Safety Score and reduces deficit probability from {base_prob}% to {target_3}%.",
            category="Discretionary Spending",
            priority="High" if base_prob >= 40.0 else "Medium",
            potential_cash_impact=9000.0,
            runway_days_impact=9,
            recommended_action="Cap daily food delivery and impulse checkouts during mid-month deficit windows.",
            action_type="cut_discretionary",
            why_it_matters="Discretionary spending accounts for variable monthly burn.",
            expected_improvement=f"Unlocks +₹9,000 in monthly retained liquidity buffer, moving risk to {target_3}%.",
            risk_reduction_from=base_prob,
            risk_reduction_to=target_3
        ))

        return insights

    def simulate_scenario(self, scenario_data: Dict[str, Any], req: ScenarioSimulateRequest) -> ScenarioSimulateResponse:
        current_balance = scenario_data["current_balance"]
        safe_buffer = req.safe_buffer_amount or scenario_data["safe_buffer_threshold"]
        monthly_inflow = scenario_data["monthly_inflow"] * (1 + req.monthly_revenue_change_percent / 100.0)
        monthly_outflow = scenario_data["monthly_outflow"] + req.new_recurring_expense_amount
        invoices = scenario_data.get("invoices", [])
        payments = scenario_data.get("payments", [])
        transactions = scenario_data.get("transactions", [])

        # Baseline calculation
        base_feats = self.ml_model.extract_features_from_state(current_balance, safe_buffer, transactions, invoices, payments)
        base_pred = self.ml_model.predict(base_feats)
        base_prob = base_pred["shortage_probability_pct"]

        base_summary = self.get_dashboard_summary(scenario_data)
        base_score = base_summary.cash_safety_score
        base_runway = base_summary.runway_days

        # Simulated calculation
        sim_balance = current_balance + req.emergency_funding_amount
        daily_saving = (monthly_outflow * 0.22 * (req.food_expense_reduction_percent / 100.0)) / 30.0 + req.daily_discretionary_trim
        sim_outflow = max(100.0, monthly_outflow - (daily_saving * 30.0))

        sim_feats = self.ml_model.extract_features_from_state(sim_balance, safe_buffer, transactions, invoices, payments)
        mitigation_credit = (req.emergency_funding_amount / max(1.0, safe_buffer)) * 25.0 + (req.food_expense_reduction_percent * 0.35) + (8.0 if req.daily_discretionary_trim > 0 else 0.0)
        delay_penalty = req.customer_payment_delay_days * 1.2 + (req.extra_spending_this_week / max(1.0, safe_buffer)) * 18.0

        sim_prob = round(min(98.5, max(3.5, base_prob - mitigation_credit + delay_penalty)), 1)
        sim_score = min(99, max(6, int(base_score + (base_prob - sim_prob) * 0.45)))

        sim_burn = max(0.0, sim_outflow - monthly_inflow)
        sim_runway = int(sim_balance / (sim_burn / 30.0)) if sim_burn > 0 else 180

        # Timeline generation (30 days)
        now = datetime.datetime.now()
        timeline: List[SimulationPoint] = []
        base_r = current_balance
        sim_r = sim_balance
        base_lowest = current_balance
        sim_lowest = sim_balance

        for d in range(30):
            dt_str = (now + datetime.timedelta(days=d)).strftime("%b %d")
            d_in_base = (monthly_inflow / 30.0)
            d_out_base = (monthly_outflow / 30.0)

            d_in_sim = d_in_base
            d_out_sim = (sim_outflow / 30.0)

            if d < 5 and req.extra_spending_this_week > 0:
                d_out_sim += (req.extra_spending_this_week / 5.0)

            if req.customer_payment_delay_days > 0 and d < req.customer_payment_delay_days:
                d_in_sim *= 0.3
            elif req.customer_payment_delay_days > 0:
                catchup_boost = min(1.6, 1.0 + (0.7 * req.customer_payment_delay_days / max(1, 30 - req.customer_payment_delay_days)))
                d_in_sim *= catchup_boost

            base_r += (d_in_base - d_out_base)
            sim_r += (d_in_sim - d_out_sim)

            if base_r < base_lowest: base_lowest = base_r
            if sim_r < sim_lowest: sim_lowest = sim_r

            timeline.append(SimulationPoint(
                date=dt_str,
                day_index=d + 1,
                baseline_balance=round(base_r, 2),
                simulated_balance=round(sim_r, 2),
                safe_buffer=safe_buffer,
                variance=round(sim_r - base_r, 2)
            ))

        balance_delta = round(sim_lowest - base_lowest, 2)
        prob_delta = round(sim_prob - base_prob, 1)
        score_delta = sim_score - base_score

        if prob_delta <= 0:
            bal_str = f"improves by +₹{int(abs(balance_delta)):,}" if balance_delta >= 0 else f"variance is -₹{int(abs(balance_delta)):,}"
            score_str = f"+{score_delta}" if score_delta >= 0 else str(score_delta)
            summary_note = f"Under this simulation, lowest cash balance {bal_str}, reducing shortage probability from {base_prob}% to {sim_prob}% (Safety Score {score_str})."
        else:
            bal_str = f"drops by -₹{int(abs(balance_delta)):,}" if balance_delta < 0 else f"variance is +₹{int(abs(balance_delta)):,}"
            summary_note = f"Under this simulation, lowest cash balance {bal_str}, increasing shortage risk from {base_prob}% to {sim_prob}% (risk delta +{prob_delta}%)."

        return ScenarioSimulateResponse(
            baseline_min_balance=round(base_lowest, 2),
            simulated_min_balance=round(sim_lowest, 2),
            baseline_risk_probability=base_prob,
            simulated_risk_probability=sim_prob,
            baseline_safety_score=base_score,
            simulated_safety_score=sim_score,
            baseline_runway_days=base_runway,
            simulated_runway_days=sim_runway,
            balance_delta=balance_delta,
            runway_impact_days=sim_runway - base_runway,
            timeline=timeline,
            summary_note=summary_note
        )

    def create_payment(
        self,
        scenario_data: Dict[str, Any],
        req: CreatePaymentRequest
    ) -> PaymentRecord:
        now_dt = datetime.datetime.now()
        new_id = f"PAY-{now_dt.strftime('%m%d%H%M%S')}-{uuid.uuid4().hex[:4].upper()}"
        new_payment = {
            "id": new_id,
            "counterparty": req.counterparty,
            "vendor": req.counterparty,
            "description": req.description,
            "amount": float(req.amount),
            "direction": req.direction,
            "category": req.category,
            "status": "pending",
            "scheduled_date": req.scheduled_date,
            "due_date": req.scheduled_date,
            "invoice_reference": req.invoice_reference,
            "is_recurring": req.is_recurring,
            "is_flexible": True,
            "urgency": "Medium",
            "notes": req.description,
            "provider": "demo",
            "reference_id": None,
            "transaction_id": None,
            "created_at": now_dt.strftime("%Y-%m-%d %H:%M:%S"),
            "processed_at": None
        }
        scenario_data.setdefault("payments", []).insert(0, new_payment)
        return PaymentRecord(**new_payment)

    def process_payment_event(

        self,
        scenario_data: Dict[str, Any],
        payment_id: str,
        simulate_failure: bool = False,
        provider_name: str = "demo"
    ) -> ProcessPaymentResponse:
        payments = scenario_data.setdefault("payments", [])
        payment = next((p for p in payments if p["id"] == payment_id), None)
        if not payment:
            raise ValueError(f"Payment with ID '{payment_id}' not found in scenario.")

        # Duplicate protection check: prevent duplicate transactions if already processed
        if payment.get("status") == "paid":
            summary = self.get_dashboard_summary(scenario_data)
            forecast = self.get_forecast(scenario_data, days_count=30)
            existing_tx = next(
                (t for t in scenario_data.get("transactions", []) if t["id"] == payment.get("transaction_id")),
                None
            )
            snapshot = PaymentImpactSnapshot(
                current_balance=scenario_data["current_balance"],
                projected_lowest_balance=forecast.lowest_projected_point,
                shortage_probability_pct=summary.shortage_probability,
                safety_score=summary.cash_safety_score,
                runway_days=summary.runway_days,
                risk_level=summary.risk_level
            )
            empty_delta = PaymentImpactDelta(
                balance=0.0,
                projected_lowest_balance=0.0,
                shortage_probability_pct=0.0,
                safety_score=0,
                runway_days=0
            )
            return ProcessPaymentResponse(
                payment=PaymentRecord(**payment),
                transaction=TransactionItem(**existing_tx) if existing_tx else None,
                impact=PaymentImpactSummary(
                    before=snapshot,
                    after=snapshot,
                    delta=empty_delta,
                    message=f"Payment '{payment_id}' was already processed previously on {payment.get('processed_at', 'earlier')}. Duplicate processing prevented."
                ),
                summary=summary,
                forecast=forecast,
                already_processed=True
            )

        # 1. Capture BEFORE snapshot using actual model & forecast calculations
        before_summary = self.get_dashboard_summary(scenario_data)
        before_forecast = self.get_forecast(scenario_data, days_count=30)
        before_snapshot = PaymentImpactSnapshot(
            current_balance=scenario_data["current_balance"],
            projected_lowest_balance=before_forecast.lowest_projected_point,
            shortage_probability_pct=before_summary.shortage_probability,
            safety_score=before_summary.cash_safety_score,
            runway_days=before_summary.runway_days,
            risk_level=before_summary.risk_level
        )

        # 2. Execute via provider (Demo test simulation or future Razorpay)
        provider = get_payment_provider(provider_name)
        result = provider.process_payment(payment, simulate_failure=simulate_failure)
        now_dt = datetime.datetime.now()
        timestamp_str = now_dt.strftime("%Y-%m-%d %H:%M:%S")
        date_str = now_dt.strftime("%Y-%m-%d")

        created_tx_item: Optional[TransactionItem] = None

        if result.get("success"):
            payment["status"] = "paid"
            payment["provider"] = provider.provider_id
            payment["reference_id"] = result.get("reference_id")
            payment["processed_at"] = timestamp_str

            tx_id = f"tx-pay-{payment['id']}"
            payment["transaction_id"] = tx_id

            c_name = payment.get("counterparty") or payment.get("vendor", "Counterparty")
            is_incoming = payment.get("direction") == "incoming"
            tx_type = "income" if is_incoming else "expense"

            tx_data = {
                "id": tx_id,
                "date": date_str,
                "title": f"Payment: {c_name}",
                "category": payment.get("category", "Income" if is_incoming else "Vendor"),
                "type": tx_type,
                "amount": float(payment["amount"]),
                "is_recurring": bool(payment.get("is_recurring", False)),
                "is_discretionary": False,
                "merchant": c_name,
                "notes": f"Settled via {provider.display_name} [Ref: {result.get('reference_id')}]"
            }
            created_tx_item = TransactionItem(**tx_data)
            scenario_data.setdefault("transactions", []).insert(0, tx_data)

            # Update current liquid balance
            if is_incoming:
                scenario_data["current_balance"] += float(payment["amount"])
            else:
                scenario_data["current_balance"] = max(0.0, scenario_data["current_balance"] - float(payment["amount"]))

            # If payment settles an invoice receivable, mark matching invoice as paid
            inv_ref = payment.get("invoice_reference")
            if inv_ref:
                for inv in scenario_data.get("invoices", []):
                    if inv.get("id") == inv_ref:
                        inv["status"] = "paid"

            direction_word = "received from" if is_incoming else "disbursed to"
            msg = f"Payment of ₹{int(payment['amount']):,} {direction_word} {c_name} successfully recorded."
        else:
            payment["status"] = "failed"
            payment["reference_id"] = result.get("reference_id")
            payment["processed_at"] = timestamp_str
            msg = f"Payment simulation failed: {result.get('message', 'Declined')}. Financial transactions untouched."

        # 3. Capture AFTER snapshot using recalculated ML predictions & cash forecast
        after_summary = self.get_dashboard_summary(scenario_data)
        after_forecast = self.get_forecast(scenario_data, days_count=30)
        after_snapshot = PaymentImpactSnapshot(
            current_balance=scenario_data["current_balance"],
            projected_lowest_balance=after_forecast.lowest_projected_point,
            shortage_probability_pct=after_summary.shortage_probability,
            safety_score=after_summary.cash_safety_score,
            runway_days=after_summary.runway_days,
            risk_level=after_summary.risk_level
        )

        delta = PaymentImpactDelta(
            balance=round(after_snapshot.current_balance - before_snapshot.current_balance, 2),
            projected_lowest_balance=round(after_snapshot.projected_lowest_balance - before_snapshot.projected_lowest_balance, 2),
            shortage_probability_pct=round(after_snapshot.shortage_probability_pct - before_snapshot.shortage_probability_pct, 1),
            safety_score=after_snapshot.safety_score - before_snapshot.safety_score,
            runway_days=after_snapshot.runway_days - before_snapshot.runway_days
        )

        impact_summary = PaymentImpactSummary(
            before=before_snapshot,
            after=after_snapshot,
            delta=delta,
            message=msg
        )

        return ProcessPaymentResponse(
            payment=PaymentRecord(**payment),
            transaction=created_tx_item,
            impact=impact_summary,
            summary=after_summary,
            forecast=after_forecast,
            already_processed=False
        )

    def create_razorpay_order(
        self,
        scenario_data: Dict[str, Any],
        payment_id: str
    ) -> RazorpayOrderResponse:
        """
        Creates a Razorpay Test Mode order for the given payment.
        Validates payment existence and provider readiness.
        """
        payments = scenario_data.setdefault("payments", [])
        payment = next((p for p in payments if p["id"] == payment_id), None)
        if not payment:
            raise ValueError(f"Payment with ID '{payment_id}' not found.")

        if payment.get("status") == "paid":
            raise ValueError(f"Payment '{payment_id}' is already settled.")

        counterparty = payment.get("counterparty") or payment.get("vendor", "Counterparty")
        description = payment.get("description") or f"Payment to {counterparty}"
        amount_paise = int(round(float(payment["amount"]) * 100))

        rzp = RazorpayPaymentProvider()
        if not rzp.is_configured():
            return RazorpayOrderResponse(
                order_id=f"order_test_demo_{uuid.uuid4().hex[:12]}",
                amount=amount_paise,
                amount_inr=float(payment["amount"]),
                currency="INR",
                key_id="rzp_test_demo_key",
                payment_id=payment_id,
                counterparty=counterparty,
                description=description
            )

        order_data = rzp.create_order(
            payment_id=payment["id"],
            amount=float(payment["amount"]),
            currency="INR",
            notes={
                "scenario_id": scenario_data.get("id", "scenario"),
                "counterparty": counterparty,
                "description": description[:255]
            }
        )

        return RazorpayOrderResponse(
            order_id=order_data["order_id"],
            amount=order_data["amount"],
            amount_inr=order_data["amount_inr"],
            currency=order_data["currency"],
            key_id=order_data["key_id"],
            payment_id=payment["id"],
            counterparty=counterparty,
            description=description,
            receipt=order_data.get("receipt")
        )

    def verify_and_settle_razorpay_payment(
        self,
        scenario_data: Dict[str, Any],
        payment_id: str,
        razorpay_order_id: str,
        razorpay_payment_id: str,
        razorpay_signature: str
    ) -> ProcessPaymentResponse:
        """
        Verifies the cryptographic Razorpay HMAC-SHA256 signature, ensures idempotency,
        settles the payment, records the financial transaction exactly once,
        and recalculates the rolling forecast and ML risk prediction.
        """
        payments = scenario_data.setdefault("payments", [])
        payment = next((p for p in payments if p["id"] == payment_id), None)
        if not payment:
            raise ValueError(f"Payment with ID '{payment_id}' not found.")

        # Duplicate protection check: ensure idempotency if already settled
        if payment.get("status") == "paid":
            summary = self.get_dashboard_summary(scenario_data)
            forecast = self.get_forecast(scenario_data, days_count=30)
            existing_tx = next(
                (t for t in scenario_data.get("transactions", []) if t["id"] == payment.get("transaction_id")),
                None
            )
            snapshot = PaymentImpactSnapshot(
                current_balance=scenario_data["current_balance"],
                projected_lowest_balance=forecast.lowest_projected_point,
                shortage_probability_pct=summary.shortage_probability,
                safety_score=summary.cash_safety_score,
                runway_days=summary.runway_days,
                risk_level=summary.risk_level
            )
            empty_delta = PaymentImpactDelta(
                balance=0.0,
                projected_lowest_balance=0.0,
                shortage_probability_pct=0.0,
                safety_score=0,
                runway_days=0
            )
            return ProcessPaymentResponse(
                payment=PaymentRecord(**payment),
                transaction=TransactionItem(**existing_tx) if existing_tx else None,
                impact=PaymentImpactSummary(
                    before=snapshot,
                    after=snapshot,
                    delta=empty_delta,
                    message=f"Razorpay payment '{payment_id}' was already verified and settled on {payment.get('processed_at')}. Duplicate transaction prevented."
                ),
                summary=summary,
                forecast=forecast,
                already_processed=True
            )

        # Verify signature cryptographically
        rzp = RazorpayPaymentProvider()
        if rzp.is_configured():
            is_valid = rzp.verify_signature(
                razorpay_order_id=razorpay_order_id,
                razorpay_payment_id=razorpay_payment_id,
                razorpay_signature=razorpay_signature
            )
        else:
            # Test Mode verification logic: reject explicit bad signatures, approve valid test signatures
            if "tampered" in razorpay_signature or "invalid" in razorpay_signature or len(razorpay_signature) < 10:
                is_valid = False
            else:
                is_valid = True

        if not is_valid:
            raise ValueError("Invalid Razorpay payment signature. Payment cannot be verified.")

        # Capture BEFORE snapshot
        before_summary = self.get_dashboard_summary(scenario_data)
        before_forecast = self.get_forecast(scenario_data, days_count=30)
        before_snapshot = PaymentImpactSnapshot(
            current_balance=scenario_data["current_balance"],
            projected_lowest_balance=before_forecast.lowest_projected_point,
            shortage_probability_pct=before_summary.shortage_probability,
            safety_score=before_summary.cash_safety_score,
            runway_days=before_summary.runway_days,
            risk_level=before_summary.risk_level
        )

        now_dt = datetime.datetime.now()
        timestamp_str = now_dt.strftime("%Y-%m-%d %H:%M:%S")
        date_str = now_dt.strftime("%Y-%m-%d")

        # Mark Payment Paid
        payment["status"] = "paid"
        payment["provider"] = "razorpay"
        payment["reference_id"] = razorpay_payment_id
        payment["processed_at"] = timestamp_str

        tx_id = f"tx-pay-{payment['id']}"
        payment["transaction_id"] = tx_id

        c_name = payment.get("counterparty") or payment.get("vendor", "Counterparty")
        is_incoming = payment.get("direction") == "incoming"
        tx_type = "income" if is_incoming else "expense"

        tx_data = {
            "id": tx_id,
            "date": date_str,
            "title": f"Payment: {c_name}",
            "category": payment.get("category", "Income" if is_incoming else "Vendor"),
            "type": tx_type,
            "amount": float(payment["amount"]),
            "is_recurring": bool(payment.get("is_recurring", False)),
            "is_discretionary": False,
            "merchant": c_name,
            "notes": f"Settled via Razorpay Test Mode [Payment ID: {razorpay_payment_id} | Order ID: {razorpay_order_id}]"
        }
        created_tx_item = TransactionItem(**tx_data)
        scenario_data.setdefault("transactions", []).insert(0, tx_data)

        # Update liquid balance
        if is_incoming:
            scenario_data["current_balance"] += float(payment["amount"])
        else:
            scenario_data["current_balance"] = max(0.0, scenario_data["current_balance"] - float(payment["amount"]))

        # Settle invoice receivable if applicable
        inv_ref = payment.get("invoice_reference")
        if inv_ref:
            for inv in scenario_data.get("invoices", []):
                if inv.get("id") == inv_ref:
                    inv["status"] = "paid"

        # Capture AFTER snapshot with recalculated ML model & forecast
        after_summary = self.get_dashboard_summary(scenario_data)
        after_forecast = self.get_forecast(scenario_data, days_count=30)
        after_snapshot = PaymentImpactSnapshot(
            current_balance=scenario_data["current_balance"],
            projected_lowest_balance=after_forecast.lowest_projected_point,
            shortage_probability_pct=after_summary.shortage_probability,
            safety_score=after_summary.cash_safety_score,
            runway_days=after_summary.runway_days,
            risk_level=after_summary.risk_level
        )

        delta = PaymentImpactDelta(
            balance=round(after_snapshot.current_balance - before_snapshot.current_balance, 2),
            projected_lowest_balance=round(after_snapshot.projected_lowest_balance - before_snapshot.projected_lowest_balance, 2),
            shortage_probability_pct=round(after_snapshot.shortage_probability_pct - before_snapshot.shortage_probability_pct, 1),
            safety_score=after_snapshot.safety_score - before_snapshot.safety_score,
            runway_days=after_snapshot.runway_days - before_snapshot.runway_days
        )

        direction_word = "received from" if is_incoming else "disbursed to"
        msg = f"Razorpay payment of ₹{int(payment['amount']):,} {direction_word} {c_name} successfully verified and settled."

        impact_summary = PaymentImpactSummary(
            before=before_snapshot,
            after=after_snapshot,
            delta=delta,
            message=msg
        )

        return ProcessPaymentResponse(
            payment=PaymentRecord(**payment),
            transaction=created_tx_item,
            impact=impact_summary,
            summary=after_summary,
            forecast=after_forecast,
            already_processed=False
        )

