"""
Demo Baseline Reset Script for CashFlow Guardian AI
Clears test/integration artifacts and restores baseline scenario profiles in SQLite database.
"""
import urllib.request
import json
from backend.database import db_reset_demo_baseline
from backend.services.cashflow_service import CashFlowService

def run_reset():
    print("=" * 70)
    print("RESETTING CASHFLOW GUARDIAN DEMO DATA TO CLEAN BASELINE PROFILES")
    print("=" * 70)

    # 1. Reset SQLite Database Tables to Baseline
    restored_dict = db_reset_demo_baseline(None)
    print("\n[OK] SQLite Database tables cleared of test artifacts and re-seeded.")

    # 2. Recalculate baseline metrics via CashFlowService
    service = CashFlowService()
    summary = service.get_dashboard_summary(restored_dict)
    forecast = service.get_forecast(restored_dict, days_count=30)
    risk = service.get_risk_analysis(restored_dict)

    pmt_cnt = len(restored_dict.get("payments", []))
    tx_cnt = len(restored_dict.get("transactions", []))
    pending_cnt = len([p for p in restored_dict.get("payments", []) if p.get("status") == "pending"])
    paid_cnt = len([p for p in restored_dict.get("payments", []) if p.get("status") == "paid"])

    print("\nRESTORED BASELINE DEMO STATE (Critical Shortage Profile):")
    print(f"  Current Cash Balance   : INR {summary.current_balance:,.2f}")
    print(f"  Monthly Inflow         : INR {summary.monthly_inflow:,.2f}")
    print(f"  Monthly Outflow        : INR {summary.monthly_outflow:,.2f}")
    print(f"  Net Cash Flow          : INR {summary.net_cash_flow:,.2f}")
    print(f"  Total Transactions     : {tx_cnt}")
    print(f"  Total Payments         : {pmt_cnt} (Pending: {pending_cnt}, Paid: {paid_cnt})")
    print(f"  Shortage Risk %        : {risk.risk_probability}% ({risk.risk_level})")
    print(f"  Safety Score           : {summary.cash_safety_score}/100")
    print(f"  30-Day Lowest Point    : INR {forecast.lowest_projected_point:,.2f}")

    print("\n" + "=" * 70)
    print("SUCCESS: DATABASE RESTORED TO CLEAN DEMO BASELINE STATE")
    print("=" * 70)

if __name__ == "__main__":
    run_reset()
