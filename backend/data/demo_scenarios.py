from typing import Dict, Any
from .synthetic_generator import generate_synthetic_historical_stream

def get_demo_scenarios() -> Dict[str, Dict[str, Any]]:
    # Generate 60 days of synthetic historical transactions for each profile
    crit_txs, _ = generate_synthetic_historical_stream(days=60, base_daily_inflow=2200, base_daily_outflow=2450, initial_balance=42000, scenario_type="critical")
    med_txs, _ = generate_synthetic_historical_stream(days=60, base_daily_inflow=2600, base_daily_outflow=2400, initial_balance=58000, scenario_type="medium")
    safe_txs, _ = generate_synthetic_historical_stream(days=60, base_daily_inflow=4500, base_daily_outflow=2900, initial_balance=105000, scenario_type="safe")

    return {
        "critical_shortage": {
            "id": "critical_shortage",
            "name": "🔴 Critical Cash Shortage (Deficit in 12 Days)",
            "industry": "Independent Consulting / SME",
            "description": "Imminent mid-month liquidity crisis: ₹28,500 overdue client invoice collides with ₹22,000 fixed rent and ₹15,000 contractor payroll.",
            "current_balance": 34500.0,
            "monthly_inflow": 68000.0,
            "monthly_outflow": 74000.0,
            "safe_buffer_threshold": 15000.0,
            "transactions": crit_txs,
            "invoices": [
                {
                    "id": "INV-CRIT-01",
                    "client": "FinTech Startup Design System Sprint",
                    "amount": 28500.0,
                    "due_date": "2026-09-04",
                    "status": "overdue",
                    "days_overdue": 14,
                    "probability_of_delay": 0.88,
                    "expected_delay_days": 18,
                    "description": "Complete UI design token library & mobile design sprint"
                },
                {
                    "id": "INV-CRIT-02",
                    "client": "HealthTech Platform Q3 Retainer",
                    "amount": 16000.0,
                    "due_date": "2026-09-18",
                    "status": "pending",
                    "days_overdue": 0,
                    "probability_of_delay": 0.25,
                    "expected_delay_days": 3,
                    "description": "Monthly UX Research & Design Sprint"
                }
            ],
            "payments": [
                {
                    "id": "PAY-CRIT-01",
                    "vendor": "Studio Workspace Lease",
                    "amount": 22000.0,
                    "due_date": "2026-09-01",
                    "category": "Rent",
                    "is_flexible": False,
                    "urgency": "Critical",
                    "notes": "Monthly fixed lease commitment"
                },
                {
                    "id": "PAY-CRIT-02",
                    "vendor": "Subcontracted 3D Motion Specialist",
                    "amount": 15000.0,
                    "due_date": "2026-09-15",
                    "category": "Payroll",
                    "is_flexible": True,
                    "urgency": "High",
                    "notes": "Can negotiate 10-day milestone payment extension"
                },
                {
                    "id": "PAY-CRIT-03",
                    "vendor": "MacBook Pro Hardware EMI",
                    "amount": 8500.0,
                    "due_date": "2026-09-10",
                    "category": "Vendor",
                    "is_flexible": False,
                    "urgency": "High",
                    "notes": "Auto-debit from primary bank"
                },
                {
                    "id": "PAY-CRIT-04",
                    "vendor": "Quarterly Advance Tax Installment",
                    "amount": 12500.0,
                    "due_date": "2026-09-22",
                    "category": "Tax",
                    "is_flexible": False,
                    "urgency": "Critical",
                    "notes": "Statutory deadline to avoid penalty interest"
                }
            ]
        },

        "medium_risk": {
            "id": "medium_risk",
            "name": "🟡 Moderate Risk (Runway ~24 Days)",
            "industry": "Growth B2B SaaS",
            "description": "Operating near safe buffer boundary: revenue covers payroll but receivables delay creates end-of-month pressure.",
            "current_balance": 52000.0,
            "monthly_inflow": 78000.0,
            "monthly_outflow": 72000.0,
            "safe_buffer_threshold": 25000.0,
            "transactions": med_txs,
            "invoices": [
                {
                    "id": "INV-MED-01",
                    "client": "Enterprise Tier-1 License Payout",
                    "amount": 24000.0,
                    "due_date": "2026-09-12",
                    "status": "pending",
                    "days_overdue": 0,
                    "probability_of_delay": 0.35,
                    "expected_delay_days": 6,
                    "description": "Quarterly enterprise contract renewal"
                },
                {
                    "id": "INV-MED-02",
                    "client": "Custom Integration Retainer",
                    "amount": 19000.0,
                    "due_date": "2026-09-25",
                    "status": "pending",
                    "days_overdue": 0,
                    "probability_of_delay": 0.15,
                    "expected_delay_days": 0,
                    "description": "API integration milestone deliverable"
                }
            ],
            "payments": [
                {
                    "id": "PAY-MED-01",
                    "vendor": "Core Engineering Payroll",
                    "amount": 28000.0,
                    "due_date": "2026-09-15",
                    "category": "Payroll",
                    "is_flexible": False,
                    "urgency": "Critical",
                    "notes": "Monthly engineering compensation"
                },
                {
                    "id": "PAY-MED-02",
                    "vendor": "AWS Cloud Infrastructure Cluster",
                    "amount": 8500.0,
                    "due_date": "2026-09-08",
                    "category": "SaaS",
                    "is_flexible": True,
                    "urgency": "Medium",
                    "notes": "Flexible 30-day billing cycle"
                },
                {
                    "id": "PAY-MED-03",
                    "vendor": "Growth Marketing Agency Retainer",
                    "amount": 11000.0,
                    "due_date": "2026-09-19",
                    "category": "Vendor",
                    "is_flexible": True,
                    "urgency": "Medium",
                    "notes": "Paid marketing agency"
                }
            ]
        },

        "healthy_safe": {
            "id": "healthy_safe",
            "name": "🟢 Stable Business (Strong Cash Buffer)",
            "industry": "Profitable E-Commerce & Retail",
            "description": "Robust liquidity resilience: >3.5x buffer coverage, strong recurring monthly surplus, and prompt customer settlement cycles.",
            "current_balance": 98000.0,
            "monthly_inflow": 135000.0,
            "monthly_outflow": 88000.0,
            "safe_buffer_threshold": 20000.0,
            "transactions": safe_txs,
            "invoices": [
                {
                    "id": "INV-SAFE-01",
                    "client": "Wholesale Retailer Purchase Order",
                    "amount": 35000.0,
                    "due_date": "2026-09-08",
                    "status": "pending",
                    "days_overdue": 0,
                    "probability_of_delay": 0.05,
                    "expected_delay_days": 0,
                    "description": "Autumn wholesale shipment deposit"
                }
            ],
            "payments": [
                {
                    "id": "PAY-SAFE-01",
                    "vendor": "Inventory Factory Production Batch",
                    "amount": 32000.0,
                    "due_date": "2026-09-16",
                    "category": "Inventory",
                    "is_flexible": True,
                    "urgency": "Medium",
                    "notes": "Seasonal replenishment batch"
                },
                {
                    "id": "PAY-SAFE-02",
                    "vendor": "Staff Operations Payroll",
                    "amount": 26000.0,
                    "due_date": "2026-09-15",
                    "category": "Payroll",
                    "is_flexible": False,
                    "urgency": "Critical",
                    "notes": "Full-time support operations"
                }
            ]
        }
    }
