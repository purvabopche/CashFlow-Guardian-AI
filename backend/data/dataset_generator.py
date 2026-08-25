import os
import random
import numpy as np
import pandas as pd

FEATURE_COLUMNS = [
    "current_balance",
    "average_daily_income",
    "average_daily_expense",
    "income_volatility",
    "expense_volatility",
    "upcoming_payment_amount",
    "upcoming_payment_count",
    "expected_receivables",
    "overdue_receivables",
    "recurring_expense_ratio",
    "discretionary_spending",
    "recent_cash_burn_rate",
    "days_until_next_major_payment",
    "historical_min_balance",
    "transaction_frequency",
    "month_day"
]

def generate_cashflow_dataset(n_samples: int = 5000, random_seed: int = 42) -> pd.DataFrame:
    """
    Generates a realistic tabular cash-flow dataset with consistent mathematical relationships
    between financial features, minimum projected balances, shortage timing, and shortage classification.
    """
    np.random.seed(random_seed)
    random.seed(random_seed)

    records = []

    for _ in range(n_samples):
        # 1. Base business profile archetype
        archetype = np.random.choice([0, 1, 2], p=[0.40, 0.35, 0.25])

        if archetype == 0:  # Freelancer / Micro SME (Tighter buffer, higher volatility)
            curr_bal = np.random.uniform(5000, 65000)
            safe_buffer = 15000.0
            avg_daily_in = np.random.uniform(1200, 3200)
            avg_daily_out = np.random.uniform(1400, 3600)
            in_vol = np.random.uniform(0.20, 0.55)
            out_vol = np.random.uniform(0.15, 0.40)
            rec_ratio = np.random.uniform(0.20, 0.55)
            disc_spend = np.random.uniform(1500, 9000)
            upcoming_pay_cnt = np.random.randint(1, 5)
            upcoming_pay_amt = np.random.uniform(5000, 28000)
            days_to_pay = np.random.randint(2, 25)
            exp_rec = np.random.uniform(2000, 25000)
            overdue_rec = np.random.choice([0.0, 0.0, 5000.0, 14000.0, 28500.0])
            tx_freq = np.random.uniform(1.5, 4.5)

        elif archetype == 1:  # Growth Tech SME / Agency (High velocity, payroll burden)
            curr_bal = np.random.uniform(30000, 180000)
            safe_buffer = 25000.0
            avg_daily_in = np.random.uniform(2800, 7500)
            avg_daily_out = np.random.uniform(3200, 8500)
            in_vol = np.random.uniform(0.15, 0.45)
            out_vol = np.random.uniform(0.10, 0.30)
            rec_ratio = np.random.uniform(0.35, 0.70)
            disc_spend = np.random.uniform(3000, 15000)
            upcoming_pay_cnt = np.random.randint(3, 8)
            upcoming_pay_amt = np.random.uniform(15000, 65000)
            days_to_pay = np.random.randint(1, 18)
            exp_rec = np.random.uniform(8000, 55000)
            overdue_rec = np.random.choice([0.0, 8000.0, 20000.0, 40000.0])
            tx_freq = np.random.uniform(4.0, 10.0)

        else:  # Stable Cash-Rich Business (Comfortable liquidity surplus)
            curr_bal = np.random.uniform(70000, 350000)
            safe_buffer = 20000.0
            avg_daily_in = np.random.uniform(4500, 12000)
            avg_daily_out = np.random.uniform(2500, 8000)
            in_vol = np.random.uniform(0.08, 0.20)
            out_vol = np.random.uniform(0.05, 0.15)
            rec_ratio = np.random.uniform(0.25, 0.50)
            disc_spend = np.random.uniform(2000, 12000)
            upcoming_pay_cnt = np.random.randint(2, 6)
            upcoming_pay_amt = np.random.uniform(8000, 40000)
            days_to_pay = np.random.randint(4, 28)
            exp_rec = np.random.uniform(20000, 95000)
            overdue_rec = np.random.choice([0.0, 0.0, 0.0, 6000.0])
            tx_freq = np.random.uniform(3.0, 8.0)

        month_day = np.random.randint(1, 31)
        recent_burn_rate = max(0.0, (avg_daily_out * 30) - (avg_daily_in * 30))
        hist_min_bal = max(0.0, curr_bal * np.random.uniform(0.5, 0.95))

        # Ground truth mathematical formulation:
        # 1. Projected 30-day minimum balance
        min_balance = (
            curr_bal
            + (avg_daily_in * days_to_pay * 0.8)
            - (avg_daily_out * days_to_pay)
            - upcoming_pay_amt
            + (exp_rec * 0.4)
            - (overdue_rec * 0.5)
            + np.random.normal(0, 400.0)
        )

        # 2. Shortage risk binary target (1 = drops below safe buffer threshold)
        shortage_risk = 1 if (min_balance < safe_buffer or curr_bal < safe_buffer * 1.1) else 0

        # 3. Days to shortage
        daily_deficit = max(100.0, avg_daily_out - avg_daily_in + (upcoming_pay_amt / max(1.0, float(days_to_pay))))
        if min_balance < safe_buffer:
            est_days = float(max(1.0, (curr_bal - safe_buffer) / daily_deficit))
            days_to_shortage = min(30.0, max(1.0, est_days + np.random.normal(0, 0.5)))
        else:
            days_to_shortage = 30.0

        record = {
            "current_balance": round(curr_bal, 2),
            "average_daily_income": round(avg_daily_in, 2),
            "average_daily_expense": round(avg_daily_out, 2),
            "income_volatility": round(in_vol, 4),
            "expense_volatility": round(out_vol, 4),
            "upcoming_payment_amount": round(upcoming_pay_amt, 2),
            "upcoming_payment_count": int(upcoming_pay_cnt),
            "expected_receivables": round(exp_rec, 2),
            "overdue_receivables": round(overdue_rec, 2),
            "recurring_expense_ratio": round(rec_ratio, 4),
            "discretionary_spending": round(disc_spend, 2),
            "recent_cash_burn_rate": round(recent_burn_rate, 2),
            "days_until_next_major_payment": int(days_to_pay),
            "historical_min_balance": round(hist_min_bal, 2),
            "transaction_frequency": round(tx_freq, 2),
            "month_day": int(month_day),
            # Targets
            "shortage_risk": int(shortage_risk),
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
