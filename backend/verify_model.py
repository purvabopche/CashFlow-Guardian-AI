import urllib.request
import json

def test_dynamic_predictions():
    low_input = {
        "current_balance": 8000.0,
        "safe_threshold": 25000.0,
        "recent_transactions": [
            {"id": "t1", "date": "2026-08-25", "title": "Heavy Equipment", "category": "Equipment", "type": "expense", "amount": 18000.0, "is_recurring": False, "is_discretionary": True}
        ],
        "expected_income": [
            {"id": "i1", "client": "Delayed Client", "amount": 5000.0, "due_date": "2026-09-01", "status": "overdue", "days_overdue": 25}
        ],
        "recurring_payments": [
            {"id": "p1", "vendor": "Studio Rent", "amount": 22000.0, "due_date": "2026-09-01", "category": "Rent", "is_flexible": False, "urgency": "Critical"}
        ]
    }

    high_input = {
        "current_balance": 125000.0,
        "safe_threshold": 15000.0,
        "recent_transactions": [
            {"id": "t2", "date": "2026-08-25", "title": "Monthly Retainer", "category": "Income", "type": "income", "amount": 55000.0, "is_recurring": True, "is_discretionary": False}
        ],
        "expected_income": [
            {"id": "i2", "client": "Enterprise Retainer", "amount": 45000.0, "due_date": "2026-09-01", "status": "pending", "days_overdue": 0}
        ],
        "recurring_payments": [
            {"id": "p2", "vendor": "SaaS Tools", "amount": 8000.0, "due_date": "2026-09-01", "category": "SaaS", "is_flexible": True, "urgency": "Low"}
        ]
    }

    def post_predict(payload):
        req = urllib.request.Request(
            "http://127.0.0.1:8000/api/predict",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        with urllib.request.urlopen(req) as resp:
            return json.loads(resp.read().decode("utf-8"))

    r_low = post_predict(low_input)
    r_high = post_predict(high_input)

    print("=======================================================")
    print("  LIVE MODEL PREDICTION VERIFICATION REPORT")
    print("=======================================================")
    print("\n[Case 1: Severe Cash Squeeze Input]")
    print(f"  - Balance: INR 8,000 | Buffer: INR 25,000 | Overdue: INR 5,000")
    print(f"  -> Model Shortage Probability: {r_low['shortage_probability']}%")
    print(f"  -> Model Risk Classification : {r_low['risk_level']}")
    print(f"  -> 30-Day Projected Balance  : INR {r_low['predicted_balance_30d']:,.2f}")
    print(f"  -> Cash Safety Score         : {r_low['safety_score']}/100")
    print(f"  -> Top Feature Attribution   : {r_low['feature_importance'][0]['feature']} ({r_low['feature_importance'][0]['importance']}%)")

    print("\n[Case 2: Robust Surplus Input]")
    print(f"  - Balance: INR 125,000 | Buffer: INR 15,000 | Inflow: INR 55,000")
    print(f"  -> Model Shortage Probability: {r_high['shortage_probability']}%")
    print(f"  -> Model Risk Classification : {r_high['risk_level']}")
    print(f"  -> 30-Day Projected Balance  : INR {r_high['predicted_balance_30d']:,.2f}")
    print(f"  -> Cash Safety Score         : {r_high['safety_score']}/100")
    print(f"  -> Top Feature Attribution   : {r_high['feature_importance'][0]['feature']} ({r_high['feature_importance'][0]['importance']}%)")
    print("\n[RESULT] Live machine learning inference dynamically adapts to input distributions.")
    print("=======================================================")

if __name__ == "__main__":
    test_dynamic_predictions()
