import os
import json
import joblib
import numpy as np
from typing import Dict, Any, List, Optional
from ..data.dataset_generator import FEATURE_COLUMNS

MODELS_DIR = os.path.dirname(os.path.abspath(__file__))
CLF_PATH = os.path.join(MODELS_DIR, "shortage_classifier.joblib")
REG_BAL_PATH = os.path.join(MODELS_DIR, "balance_regressor.joblib")
REG_DAYS_PATH = os.path.join(MODELS_DIR, "days_to_shortage_regressor.joblib")
METADATA_PATH = os.path.join(MODELS_DIR, "model_metadata.json")

class CashFlowRiskEnsemble:
    """
    Trained Production Ensemble:
    - RandomForestClassifier (Shortage risk classification & probability)
    - GradientBoostingRegressor (30-day minimum balance)
    - GradientBoostingRegressor (Days until shortage)
    """
    def __init__(self):
        self.classifier = None
        self.regressor_balance = None
        self.regressor_days = None
        self.metadata: Dict[str, Any] = {}
        self.feature_names = FEATURE_COLUMNS
        self.load_models()

    def load_models(self):
        if os.path.exists(CLF_PATH):
            self.classifier = joblib.load(CLF_PATH)
        if os.path.exists(REG_BAL_PATH):
            self.regressor_balance = joblib.load(REG_BAL_PATH)
        if os.path.exists(REG_DAYS_PATH):
            self.regressor_days = joblib.load(REG_DAYS_PATH)
        if os.path.exists(METADATA_PATH):
            with open(METADATA_PATH, "r", encoding="utf-8") as f:
                self.metadata = json.load(f)

    def extract_features_from_state(
        self,
        current_balance: float,
        safe_buffer: float,
        transactions: List[Dict[str, Any]],
        invoices: List[Dict[str, Any]],
        payments: List[Dict[str, Any]]
    ) -> np.ndarray:
        inflows = [t['amount'] for t in transactions if t.get('type') == 'income']
        outflows = [t['amount'] for t in transactions if t.get('type') == 'expense']

        daily_in = float(np.mean(inflows)) if inflows else max(100.0, current_balance * 0.04)
        daily_out = float(np.mean(outflows)) if outflows else max(100.0, current_balance * 0.045)

        rec_pay_amt = float(sum(p.get('amount', 0.0) for p in payments if not p.get('is_flexible')))
        upcoming_pay_amt = float(sum(p.get('amount', 0.0) for p in payments))

        exp_inv_amt = float(sum(i.get('amount', 0.0) for i in invoices if i.get('status') == 'pending'))
        overdue_inv_amt = float(sum(i.get('amount', 0.0) for i in invoices if i.get('status') == 'overdue'))

        disc_spend = float(sum(t['amount'] for t in transactions if t.get('type') == 'expense' and t.get('is_discretionary')))
        day_of_month = 15

        cf_7d = (daily_in * 7) - (daily_out * 7) - (upcoming_pay_amt * 0.4) + (exp_inv_amt * 0.2)
        cf_30d = (daily_in * 30) - (daily_out * 30) - rec_pay_amt - upcoming_pay_amt + exp_inv_amt - (overdue_inv_amt * 0.4)

        vec = [
            current_balance,
            daily_in,
            daily_out,
            rec_pay_amt,
            upcoming_pay_amt,
            exp_inv_amt,
            overdue_inv_amt,
            disc_spend,
            day_of_month,
            cf_7d,
            cf_30d,
            safe_buffer
        ]
        return np.array(vec, dtype=float).reshape(1, -1)

    def predict(self, feature_vector: np.ndarray) -> Dict[str, Any]:
        """Runs inference across classifier, balance regressor, and days regressor."""
        if self.classifier is None or self.regressor_balance is None:
            self.load_models()

        # Classification
        prob_matrix = self.classifier.predict_proba(feature_vector)[0]
        shortage_prob = float(prob_matrix[1]) if len(prob_matrix) > 1 else float(prob_matrix[0])
        shortage_prob_pct = round(min(98.5, max(3.5, shortage_prob * 100.0)), 1)

        # Regressions
        pred_min_bal = float(self.regressor_balance.predict(feature_vector)[0])
        est_days = float(self.regressor_days.predict(feature_vector)[0]) if self.regressor_days else 14.0
        est_days_int = int(min(30, max(1, round(est_days))))

        # Risk Classification
        if shortage_prob_pct >= 65.0:
            risk_level = "Critical" if shortage_prob_pct >= 80.0 else "High"
        elif shortage_prob_pct >= 35.0:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        confidence = round(float(np.max(prob_matrix)), 2)

        # Explainability top factors
        importances = self.classifier.feature_importances_
        feature_importance_list = []
        for name, imp in zip(self.feature_names, importances):
            feature_importance_list.append({
                "feature": name,
                "importance": round(float(imp) * 100, 2),
                "readable_name": name.replace("_", " ").title()
            })
        feature_importance_list.sort(key=lambda x: x["importance"], reverse=True)

        return {
            "shortage_probability": shortage_prob_pct / 100.0,
            "shortage_probability_pct": shortage_prob_pct,
            "risk_level": risk_level,
            "predicted_minimum_balance": round(pred_min_bal, 2),
            "estimated_shortage_day": est_days_int,
            "confidence": confidence,
            "model_version": self.metadata.get("model_version", "2.3.0"),
            "model_type": self.metadata.get("model_name", "Random Forest Cash Shortage Classifier"),
            "feature_importance": feature_importance_list[:5]
        }
