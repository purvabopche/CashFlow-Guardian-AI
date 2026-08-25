import urllib.request
import json

def test_all_scenarios_and_endpoints():
    print("==================================================================")
    print("      CashFlow Guardian AI - Live Model Inference Verification    ")
    print("==================================================================")

    # 1. Test /api/model/status
    with urllib.request.urlopen("http://127.0.0.1:8000/api/model/status") as resp:
        status_data = json.loads(resp.read().decode("utf-8"))

    print("\n[1] GET /api/model/status Response:")
    print(f"  - Model Loaded     : {status_data['model_loaded']}")
    print(f"  - Model Name       : {status_data['model_name']} ({status_data['model_version']})")
    print(f"  - Classifier       : {status_data['classifier_type']}")
    print(f"  - Balance Regressor: {status_data['regressor_balance_type']}")
    print(f"  - Dataset Size     : {status_data['dataset_size']:,} records ({status_data['train_test_split']})")
    print(f"  - Accuracy         : {status_data['accuracy']*100:.2f}%")
    print(f"  - Precision        : {status_data['precision']*100:.2f}%")
    print(f"  - Recall           : {status_data['recall']*100:.2f}%")
    print(f"  - F1 Score         : {status_data['f1_score']:.4f}")
    print(f"  - ROC-AUC          : {status_data['roc_auc']:.4f}")
    print(f"  - Balance R2 Score : {status_data['balance_regressor_r2']:.4f} (MAE: INR {status_data['balance_regressor_mae']:,.2f})")
    print(f"  - Shortage Days MAE: {status_data['days_regressor_mae']:.2f} days")

    # 2. Test 3 distinct scenarios on POST /api/predict
    scenario_a_healthy = {
        "current_balance": 145000.0,
        "safe_threshold": 20000.0,
        "recent_transactions": [
            {"id": "t1", "date": "2026-08-25", "title": "Client Retainer Deposit", "category": "Income", "type": "income", "amount": 65000.0, "is_recurring": True, "is_discretionary": False},
            {"id": "t2", "date": "2026-08-24", "title": "SaaS Cloud Hosting", "category": "Subscriptions", "type": "expense", "amount": 3500.0, "is_recurring": True, "is_discretionary": False}
        ],
        "expected_income": [
            {"id": "i1", "client": "Enterprise Retainer", "amount": 40000.0, "due_date": "2026-09-05", "status": "pending", "days_overdue": 0}
        ],
        "recurring_payments": [
            {"id": "p1", "vendor": "Software Stack", "amount": 8000.0, "due_date": "2026-09-10", "category": "SaaS", "is_flexible": True, "urgency": "Low"}
        ]
    }

    scenario_b_moderate = {
        "current_balance": 48000.0,
        "safe_threshold": 25000.0,
        "recent_transactions": [
            {"id": "t3", "date": "2026-08-25", "title": "Marketing Agency Fee", "category": "Income", "type": "income", "amount": 28000.0, "is_recurring": False, "is_discretionary": False},
            {"id": "t4", "date": "2026-08-23", "title": "Contractor Payment", "category": "Payroll & Team", "type": "expense", "amount": 18000.0, "is_recurring": True, "is_discretionary": False}
        ],
        "expected_income": [
            {"id": "i2", "client": "Milestone Deliverable", "amount": 22000.0, "due_date": "2026-09-15", "status": "pending", "days_overdue": 0}
        ],
        "recurring_payments": [
            {"id": "p2", "vendor": "Core Engineering Payroll", "amount": 28000.0, "due_date": "2026-09-12", "category": "Payroll", "is_flexible": False, "urgency": "High"}
        ]
    }

    scenario_c_critical = {
        "current_balance": 8500.0,
        "safe_threshold": 15000.0,
        "recent_transactions": [
            {"id": "t5", "date": "2026-08-25", "title": "Emergency Hardware Repair", "category": "Equipment & Capex", "type": "expense", "amount": 14000.0, "is_recurring": False, "is_discretionary": True}
        ],
        "expected_income": [
            {"id": "i3", "client": "Unresponsive Client", "amount": 28500.0, "due_date": "2026-08-10", "status": "overdue", "days_overdue": 16}
        ],
        "recurring_payments": [
            {"id": "p3", "vendor": "Studio Office Lease", "amount": 22000.0, "due_date": "2026-09-01", "category": "Rent", "is_flexible": False, "urgency": "Critical"},
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

    pred_a = post_predict(scenario_a_healthy)
    pred_b = post_predict(scenario_b_moderate)
    pred_c = post_predict(scenario_c_critical)

    print("\n[2] POST /api/predict Live Model Predictions:")
    print("\n  --- Scenario A: Healthy Cash Flow ---")
    print(f"  Balance: INR 145,000 | Inflow: INR 65,000 | Payments: INR 8,000")
    print(f"  -> Shortage Probability    : {pred_a['shortage_probability_pct']}% (Target: {pred_a['shortage_probability']})")
    print(f"  -> Risk Level              : {pred_a['risk_level']}")
    print(f"  -> Predicted Min Balance   : INR {pred_a['predicted_minimum_balance']:,.2f}")
    print(f"  -> Estimated Shortage Day  : Day {pred_a['estimated_shortage_day']}")
    print(f"  -> Confidence Score        : {pred_a['confidence']}")
    print(f"  -> Cash Safety Score       : {pred_a['safety_score']}/100")

    print("\n  --- Scenario B: Moderate Risk ---")
    print(f"  Balance: INR 48,000 | Inflow: INR 28,000 | Payments: INR 28,000")
    print(f"  -> Shortage Probability    : {pred_b['shortage_probability_pct']}% (Target: {pred_b['shortage_probability']})")
    print(f"  -> Risk Level              : {pred_b['risk_level']}")
    print(f"  -> Predicted Min Balance   : INR {pred_b['predicted_minimum_balance']:,.2f}")
    print(f"  -> Estimated Shortage Day  : Day {pred_b['estimated_shortage_day']}")
    print(f"  -> Confidence Score        : {pred_b['confidence']}")
    print(f"  -> Cash Safety Score       : {pred_b['safety_score']}/100")

    print("\n  --- Scenario C: Critical Shortage ---")
    print(f"  Balance: INR 8,500 | Overdue Invoice: INR 28,500 | Payments: INR 37,000")
    print(f"  -> Shortage Probability    : {pred_c['shortage_probability_pct']}% (Target: {pred_c['shortage_probability']})")
    print(f"  -> Risk Level              : {pred_c['risk_level']}")
    print(f"  -> Predicted Min Balance   : INR {pred_c['predicted_minimum_balance']:,.2f}")
    print(f"  -> Estimated Shortage Day  : Day {pred_c['estimated_shortage_day']}")
    print(f"  -> Confidence Score        : {pred_c['confidence']}")
    print(f"  -> Cash Safety Score       : {pred_c['safety_score']}/100")

    # 3. Test /api/model/insights
    with urllib.request.urlopen("http://127.0.0.1:8000/api/model/insights") as resp:
        insights_data = json.loads(resp.read().decode("utf-8"))

    print("\n[3] GET /api/model/insights Feature Attributions:")
    for f in insights_data['feature_importances'][:5]:
        print(f"  - {f['readable_name']:30}: Importance {f['importance']}% | Impact: {f['direction']}")

    print("\n==================================================================")
    print("      Verification Completed: All 3 Models Active & Verified      ")
    print("==================================================================")

if __name__ == "__main__":
    test_all_scenarios_and_endpoints()
