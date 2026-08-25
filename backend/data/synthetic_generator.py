import random
import datetime
from typing import List, Dict, Any, Tuple
import numpy as np

def generate_synthetic_historical_stream(
    days: int = 90,
    base_daily_inflow: float = 2400.0,
    base_daily_outflow: float = 2100.0,
    initial_balance: float = 35000.0,
    volatility: float = 0.25,
    scenario_type: str = "critical"
) -> Tuple[List[Dict[str, Any]], float]:
    """
    Generates 60-90 days of high-fidelity synthetic financial transactions.
    Returns: (list_of_transactions, final_current_balance)
    """
    random.seed(42)
    np.random.seed(42)

    now = datetime.datetime.now()
    transactions: List[Dict[str, Any]] = []
    balance = initial_balance

    categories_expense = [
        ('Food & Dining', 0.22, True),
        ('Groceries', 0.14, False),
        ('Utilities', 0.08, False),
        ('Subscriptions', 0.12, False),
        ('Travel & Commute', 0.10, True),
        ('Rent & Living', 0.20, False),
        ('Shopping', 0.14, True)
    ]

    for d in range(days, 0, -1):
        day_date = now - datetime.timedelta(days=d)
        date_str = day_date.strftime("%Y-%m-%d")
        day_of_week = day_date.weekday()
        day_of_month = day_date.day

        # Inflow events
        # 1st of month: primary client retainer or monthly salary
        if day_of_month == 1:
            inflow_amt = round(base_daily_inflow * 15 * (1 + random.uniform(-0.05, 0.08)), 2)
            balance += inflow_amt
            transactions.append({
                "id": f"tx-syn-in-{d}-1",
                "date": date_str,
                "title": "Primary Client Retainer Milestone",
                "category": "Income",
                "type": "income",
                "amount": inflow_amt,
                "is_recurring": True,
                "is_discretionary": False,
                "merchant": "Global Retainer Bank Transfer"
            })
        
        # 15th of month: secondary milestone / marketplace payout
        if day_of_month == 15:
            inflow_amt = round(base_daily_inflow * 12 * (1 + random.uniform(-0.1, 0.15)), 2)
            balance += inflow_amt
            transactions.append({
                "id": f"tx-syn-in-{d}-15",
                "date": date_str,
                "title": "Consulting Sprint Completion Payout",
                "category": "Income",
                "type": "income",
                "amount": inflow_amt,
                "is_recurring": True,
                "is_discretionary": False,
                "merchant": "Direct Deposit"
            })

        # Daily variable small inflow (freelance micro-gigs or digital sales)
        if random.random() < 0.18:
            var_in = round(random.uniform(1500, 4500), 2)
            balance += var_in
            transactions.append({
                "id": f"tx-syn-in-v-{d}",
                "date": date_str,
                "title": "Ad-hoc Advisory / Workshop Fee",
                "category": "Income",
                "type": "income",
                "amount": var_in,
                "is_recurring": False,
                "is_discretionary": False,
                "merchant": "Razorpay UPI"
            })

        # Recurring fixed expense events
        # 1st: Rent / Studio lease
        if day_of_month == 1:
            rent_amt = round(base_daily_outflow * 10, 2)
            balance -= rent_amt
            transactions.append({
                "id": f"tx-syn-out-rent-{d}",
                "date": date_str,
                "title": "Studio Office & Living Lease",
                "category": "Rent & Living",
                "type": "expense",
                "amount": rent_amt,
                "is_recurring": True,
                "is_discretionary": False,
                "merchant": "Real Estate Direct Debit"
            })

        # 15th: Subcontractors / Payroll
        if day_of_month == 15:
            payroll_amt = round(base_daily_outflow * 8, 2)
            balance -= payroll_amt
            transactions.append({
                "id": f"tx-syn-out-pay-{d}",
                "date": date_str,
                "title": "Specialist Contractor Compensation",
                "category": "Payroll & Team",
                "type": "expense",
                "amount": payroll_amt,
                "is_recurring": True,
                "is_discretionary": False,
                "merchant": "Bank Transfer"
            })

        # Daily normal expenses (1 to 3 items per day)
        num_expenses = random.choice([1, 2, 2, 3])
        for exp_idx in range(num_expenses):
            cat_name, weight, is_disc = random.choices(
                categories_expense, weights=[w[1] for w in categories_expense]
            )[0]
            
            # Weekend discretionary surge
            weekend_mult = 1.6 if (day_of_week >= 5 and is_disc) else 1.0
            base_exp = (base_daily_outflow / 2.5) * weekend_mult * (1 + random.uniform(-volatility, volatility))
            exp_amt = round(max(150.0, base_exp), 2)
            
            balance -= exp_amt
            transactions.append({
                "id": f"tx-syn-exp-{d}-{exp_idx}",
                "date": date_str,
                "title": f"{cat_name} Payment",
                "category": cat_name,
                "type": "expense",
                "amount": exp_amt,
                "is_recurring": cat_name in ['Subscriptions', 'Utilities'],
                "is_discretionary": is_disc,
                "merchant": "Swiggy / Amazon / Local Merchant"
            })

    # Sort descending by date
    transactions.sort(key=lambda t: t['date'], reverse=True)
    return transactions, round(balance, 2)
