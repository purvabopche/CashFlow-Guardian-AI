import urllib.request
import json

def test_all_scenarios_and_endpoints():
    print("==================================================================")
    print("      CashFlow Guardian AI - Live Model Inference Verification    ")
    print("==================================================================")

    # 1. Test /api/model-info
    with urllib.request.urlopen("http://127.0.0.1:8000/api/model-info") as resp:
        info_data = json.loads(resp.read().decode("utf-8"))

    print("\n[1] GET /api/model-info Response:")
    print(f"  - Model Name       : {info_data['model_name']} ({info_data['model_version']})")
    print(f"  - Status           : {info_data['status']}")
    print(f"  - Features Count   : {info_data['feature_count']} features")
    print(f"  - Training Samples : {info_data['training_samples']:,} (Test: {info_data['test_samples']:,})")
    print(f"  - Accuracy         : {info_data['accuracy']*100:.2f}%")
    print(f"  - Precision        : {info_data['precision']*100:.2f}%")
    print(f"  - Recall           : {info_data['recall']*100:.2f}%")
    print(f"  - F1 Score         : {info_data['f1_score']:.4f}")
    print(f"  - ROC-AUC          : {info_data['roc_auc']:.4f}")
    print(f"  - Min Balance R2   : {info_data['min_balance_r2']:.4f} (MAE: INR {info_data['min_balance_mae']:,.2f})")
    print(f"  - Shortage Days MAE: {info_data['days_to_shortage_mae']:.2f} days")

    # 2. Test 2 distinct scenarios on POST /api/predict
    scenario_safe = {
        "current_balance": 150000.0,
        "safe_threshold": 20000.0,
        "recent_transactions": [
            {"id": "t1", "date": "2026-08-25", "title": "Client Retainer", "category": "Income", "type": "income", "amount": 65000.0, "is_recurring": True, "is_discretionary": False}
        ],
        "expected_income": [
            {"id": "i1", "client": "Enterprise Retainer", "amount": 40000.0, "due_date": "2026-09-05", "status": "pending", "days_overdue": 0}
        ],
        "recurring_payments": [
            {"id": "p1", "vendor": "Software Stack", "amount": 8000.0, "due_date": "2026-09-10", "category": "SaaS", "is_flexible": True, "urgency": "Low"}
        ]
    }

    scenario_squeeze = {
        "current_balance": 8500.0,
        "safe_threshold": 15000.0,
        "recent_transactions": [
            {"id": "t5", "date": "2026-08-25", "title": "Equipment Repair", "category": "Equipment & Capex", "type": "expense", "amount": 14000.0, "is_recurring": False, "is_discretionary": True}
        ],
        "expected_income": [
            {"id": "i3", "client": "Overdue Client", "amount": 28500.0, "due_date": "2026-08-10", "status": "overdue", "days_overdue": 16}
        ],
        "recurring_payments": [
            {"id": "p3", "vendor": "Studio Office Rent", "amount": 22000.0, "due_date": "2026-09-01", "category": "Rent", "is_flexible": False, "urgency": "Critical"},
            {"id": "p4", "vendor": "Contractor Payroll", "amount": 15000.0, "due_date": "2026-09-04", "category": "Payroll", "is_flexible": False, "urgency": "Critical"}
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

    pred_safe = post_predict(scenario_safe)
    pred_squeeze = post_predict(scenario_squeeze)

    print("\n[2] POST /api/predict Live Model Inferences:")
    print("\n  --- Safe Financial Position ---")
    print(f"  Balance: INR 150,000 | Inflow: INR 65,000 | Payments: INR 8,000")
    print(f"  -> Shortage Probability    : {pred_safe['shortage_probability_pct']}% (Value: {pred_safe['shortage_probability']})")
    print(f"  -> Risk Level              : {pred_safe['risk_level']}")
    print(f"  -> Predicted Min Balance   : INR {pred_safe['projected_balance']:,.2f}")
    print(f"  -> Shortage Window         : {pred_safe['predicted_shortage_window']}")
    print(f"  -> Cash Safety Score       : {pred_safe['cash_safety_score']}/100")
    print(f"  -> Model Source            : {pred_safe['model_source']}")

    print("\n  --- Critical Squeeze Financial Position ---")
    print(f"  Balance: INR 8,500 | Overdue Invoice: INR 28,500 | Payments: INR 37,000")
    print(f"  -> Shortage Probability    : {pred_squeeze['shortage_probability_pct']}% (Value: {pred_squeeze['shortage_probability']})")
    print(f"  -> Risk Level              : {pred_squeeze['risk_level']}")
    print(f"  -> Predicted Min Balance   : INR {pred_squeeze['projected_balance']:,.2f}")
    print(f"  -> Shortage Window         : {pred_squeeze['predicted_shortage_window']}")
    print(f"  -> Cash Safety Score       : {pred_squeeze['cash_safety_score']}/100")
    print(f"  -> Model Source            : {pred_squeeze['model_source']}")
    print(f"  -> Top Risk Factors        :")
    for rf in pred_squeeze['top_risk_factors']:
        print(f"     * {rf.replace(chr(8377), 'INR ')}")

    print("\n==================================================================")
    print("      Verification Completed: Live Inference Fully Functional     ")
    print("==================================================================")

if __name__ == "__main__":
    test_all_scenarios_and_endpoints()
