import os
import random
import numpy as np
import pandas as pd

FEATURE_COLUMNS = [
    "opening_balance",
    "daily_income",
    "daily_expense",
    "recurring_payment_amount",
    "upcoming_payment_amount",
    "expected_invoice_amount",
    "overdue_invoice_amount",
    "discretionary_spending",
    "day_of_month",
    "cash_flow_7d",
    "cash_flow_30d",
    "minimum_safe_balance"
]

def generate_cashflow_dataset(n_samples: int = 5000, random_seed: int = 42) -> pd.DataFrame:
    """
    Generates a realistic cash-flow dataset with 12 domain features and ground-truth
    cash shortage risk labels based on continuous forward liquidity simulation.
    """
    np.random.seed(random_seed)
    random.seed(random_seed)

    records = []

    for _ in range(n_samples):
        # Business liquidity archetype
        archetype = np.random.choice([0, 1, 2], p=[0.40, 0.35, 0.25])

        if archetype == 0:  # Freelancer / Micro SME (Tighter buffer, higher volatility)
            opening_bal = np.random.uniform(5000, 65000)
            safe_buffer = 15000.0
            daily_in = np.random.uniform(1200, 3200)
            daily_out = np.random.uniform(1400, 3600)
            rec_pay_amt = np.random.uniform(5000, 22000)
            upcoming_pay_amt = np.random.uniform(4000, 25000)
            exp_inv_amt = np.random.uniform(2000, 25000)
            overdue_inv_amt = np.random.choice([0.0, 0.0, 5000.0, 14000.0, 28500.0])
            disc_spend = np.random.uniform(1500, 9000)
            day_of_month = np.random.randint(1, 31)

        elif archetype == 1:  # Growth Tech SME / Agency (High velocity, payroll burden)
            opening_bal = np.random.uniform(30000, 180000)
            safe_buffer = 25000.0
            daily_in = np.random.uniform(2800, 7500)
            daily_out = np.random.uniform(3200, 8500)
            rec_pay_amt = np.random.uniform(18000, 55000)
            upcoming_pay_amt = np.random.uniform(12000, 48000)
            exp_inv_amt = np.random.uniform(8000, 55000)
            overdue_inv_amt = np.random.choice([0.0, 8000.0, 20000.0, 40000.0])
            disc_spend = np.random.uniform(3000, 15000)
            day_of_month = np.random.randint(1, 31)

        else:  # Stable Cash-Rich Business (Comfortable liquidity surplus)
            opening_bal = np.random.uniform(70000, 350000)
            safe_buffer = 20000.0
            daily_in = np.random.uniform(4500, 12000)
            daily_out = np.random.uniform(2500, 8000)
            rec_pay_amt = np.random.uniform(12000, 45000)
            upcoming_pay_amt = np.random.uniform(6000, 30000)
            exp_inv_amt = np.random.uniform(20000, 95000)
            overdue_inv_amt = np.random.choice([0.0, 0.0, 0.0, 6000.0])
            disc_spend = np.random.uniform(2000, 12000)
            day_of_month = np.random.randint(1, 31)

        # Multi-horizon cash flow projections
        cf_7d = (daily_in * 7) - (daily_out * 7) - (upcoming_pay_amt * 0.4) + (exp_inv_amt * 0.2)
        cf_30d = (daily_in * 30) - (daily_out * 30) - rec_pay_amt - upcoming_pay_amt + exp_inv_amt - (overdue_inv_amt * 0.4)

        # Ground truth mathematical minimum balance in 30 days
        min_balance = opening_bal + min(cf_7d, cf_30d) + np.random.normal(0, 300.0)

        # Target: cash_shortage_risk (1 if projected balance crosses below minimum_safe_balance or deficit)
        cash_shortage_risk = 1 if (min_balance < safe_buffer or opening_bal < safe_buffer * 1.08) else 0

        # Estimated days to shortage
        daily_deficit = max(120.0, daily_out - daily_in + ((rec_pay_amt + upcoming_pay_amt) / 30.0))
        if min_balance < safe_buffer:
            est_days = float(max(1.0, (opening_bal - safe_buffer) / daily_deficit))
            days_to_shortage = min(30.0, max(1.0, est_days + np.random.normal(0, 0.4)))
        else:
            days_to_shortage = 30.0

        record = {
            "opening_balance": round(opening_bal, 2),
            "daily_income": round(daily_in, 2),
            "daily_expense": round(daily_out, 2),
            "recurring_payment_amount": round(rec_pay_amt, 2),
            "upcoming_payment_amount": round(upcoming_pay_amt, 2),
            "expected_invoice_amount": round(exp_inv_amt, 2),
            "overdue_invoice_amount": round(overdue_inv_amt, 2),
            "discretionary_spending": round(disc_spend, 2),
            "day_of_month": int(day_of_month),
            "cash_flow_7d": round(cf_7d, 2),
            "cash_flow_30d": round(cf_30d, 2),
            "minimum_safe_balance": round(safe_buffer, 2),
            # Targets
            "cash_shortage_risk": int(cash_shortage_risk),
            "predicted_minimum_balance": round(min_balance, 2),
            "days_to_cash_shortage": round(days_to_shortage, 1)
        }
        records.append(record)

    return pd.DataFrame(records)

def save_dataset_csv(df: pd.DataFrame, output_path: str):
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"[OK] Cash flow dataset ({len(df)} records) saved to: {output_path}")

if __name__ == "__main__":
    out_csv = os.path.join(os.path.dirname(__file__), "cashflow_dataset.csv")
    df = generate_cashflow_dataset(n_samples=5000)
    save_dataset_csv(df, out_csv)
