"""
Synthetic Transaction and Cash Flow Data Generator for CashFlow Guardian AI.
Generates realistic financial streams with recurring expenses, variable spending,
and income patterns for training and testing ML shortage models.
"""

import random
from datetime import datetime, timedelta
from typing import List, Dict, Any

def generate_synthetic_transactions(
    days: int = 60,
    starting_balance: float = 45000.0,
    monthly_income: float = 65000.0,
    income_frequency: str = "monthly", # "monthly" | "biweekly" | "freelance"
    discretionary_daily_avg: float = 600.0,
    seed: int = 42
) -> Dict[str, Any]:
    random.seed(seed)
    
    transactions: List[Dict[str, Any]] = []
    daily_balances: List[Dict[str, Any]] = []
    
    current_balance = starting_balance
    start_date = datetime.now() - timedelta(days=days)
    
    # Standard recurring definitions
    recurring_templates = [
        {"title": "House Rent & Maintenance", "category": "Rent & Living", "amount": 18000.0, "day": 1},
        {"title": "High-Speed Fiber Internet", "category": "Utilities", "amount": 1200.0, "day": 5},
        {"title": "Electricity & Power Bill", "category": "Utilities", "amount": 2800.0, "day": 10},
        {"title": "Cloud Services & SaaS Subscriptions", "category": "Subscriptions", "amount": 3500.0, "day": 12},
        {"title": "Health & Term Insurance Premium", "category": "Insurance", "amount": 4200.0, "day": 20},
        {"title": "Vehicle Fuel & Commute Pass", "category": "Travel", "amount": 2500.0, "day": 15},
    ]
    
    for d in range(days):
        current_date = start_date + timedelta(days=d)
        day_of_month = current_date.day
        day_of_week = current_date.weekday() # 0 = Monday, 6 = Sunday
        date_str = current_date.strftime("%Y-%m-%d")
        
        # 1. Income Events
        day_income = 0.0
        if income_frequency == "monthly" and day_of_month == 1:
            day_income = monthly_income
            transactions.append({
                "id": f"tx-inc-{d}",
                "date": date_str,
                "title": "Primary Salary / Client Retainer",
                "category": "Income",
                "type": "income",
                "amount": day_income,
                "isRecurring": True,
                "isDiscretionary": False
            })
        elif income_frequency == "biweekly" and day_of_month in [1, 15]:
            day_income = monthly_income / 2.0
            transactions.append({
                "id": f"tx-inc-{d}",
                "date": date_str,
                "title": "Bi-Weekly Disbursement",
                "category": "Income",
                "type": "income",
                "amount": day_income,
                "isRecurring": True,
                "isDiscretionary": False
            })
        elif income_frequency == "freelance" and random.random() < 0.12:
            day_income = random.choice([8000.0, 15000.0, 22000.0])
            transactions.append({
                "id": f"tx-inc-{d}",
                "date": date_str,
                "title": f"Freelance Client Milestone #{random.randint(101, 999)}",
                "category": "Income",
                "type": "income",
                "amount": day_income,
                "isRecurring": False,
                "isDiscretionary": False
            })
            
        current_balance += day_income
        
        # 2. Fixed Recurring Payments
        day_recurring = 0.0
        for rec in recurring_templates:
            if day_of_month == rec["day"]:
                amt = rec["amount"] * random.uniform(0.95, 1.05)
                day_recurring += amt
                transactions.append({
                    "id": f"tx-rec-{d}-{rec['day']}",
                    "date": date_str,
                    "title": rec["title"],
                    "category": rec["category"],
                    "type": "expense",
                    "amount": round(amt, 2),
                    "isRecurring": True,
                    "isDiscretionary": False
                })
                
        current_balance -= day_recurring
        
        # 3. Discretionary Daily Spending (Groceries, Food Delivery, Dining, Shopping)
        # Weekends have higher discretionary spend
        weekend_multiplier = 1.6 if day_of_week in [4, 5, 6] else 0.85
        daily_spend = discretionary_daily_avg * weekend_multiplier * random.uniform(0.6, 1.4)
        
        if daily_spend > 100:
            categories_pool = ["Food & Dining", "Groceries", "Shopping & Discretionary", "Entertainment"]
            chosen_cat = random.choice(categories_pool)
            transactions.append({
                "id": f"tx-disc-{d}",
                "date": date_str,
                "title": f"{chosen_cat} Spending",
                "category": chosen_cat,
                "type": "expense",
                "amount": round(daily_spend, 2),
                "isRecurring": False,
                "isDiscretionary": True
            })
            current_balance -= daily_spend
            
        daily_balances.append({
            "date": date_str,
            "dayIndex": d + 1,
            "closingBalance": round(current_balance, 2)
        })
        
    return {
        "startingBalance": starting_balance,
        "endingBalance": round(current_balance, 2),
        "transactions": transactions,
        "dailyBalances": daily_balances
    }

if __name__ == "__main__":
    sample = generate_synthetic_transactions(days=30)
    print(f"Generated {len(sample['transactions'])} transactions. Ending balance: ₹{sample['endingBalance']:,.2f}")
