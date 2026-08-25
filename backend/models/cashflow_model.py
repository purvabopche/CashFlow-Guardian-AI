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
    - RandomForestClassifier (Shortage probability & risk class)
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

        avg_daily_in = float(np.mean(inflows)) if inflows else max(100.0, current_balance * 0.04)
        avg_daily_out = float(np.mean(outflows)) if outflows else max(100.0, current_balance * 0.045)

        in_vol = float(np.std(inflows) / (avg_daily_in + 1e-5)) if len(inflows) > 2 else 0.25
        out_vol = float(np.std(outflows) / (avg_daily_out + 1e-5)) if len(outflows) > 2 else 0.20

        upcoming_pay_amt = float(sum(p.get('amount', 0.0) for p in payments))
        upcoming_pay_cnt = len(payments)
        days_to_pay = 12

        exp_rec = float(sum(i.get('amount', 0.0) for i in invoices if i.get('status') == 'pending'))
        overdue_rec = float(sum(i.get('amount', 0.0) for i in invoices if i.get('status') == 'overdue'))

        rec_exp = sum(t['amount'] for t in transactions if t.get('type') == 'expense' and t.get('is_recurring'))
        tot_exp = sum(outflows) if outflows else 1.0
        rec_ratio = float(rec_exp / max(tot_exp, 1.0))

        disc_spend = float(sum(t['amount'] for t in transactions if t.get('type') == 'expense' and t.get('is_discretionary')))
        recent_burn = float(max(0.0, avg_daily_out * 30 - avg_daily_in * 30))
        hist_min = float(max(0.0, current_balance * 0.65))
        tx_freq = float(len(transactions) / 30.0) if len(transactions) > 0 else 3.0
        month_day = 15

        vec = [
            current_balance,
            avg_daily_in,
            avg_daily_out,
            in_vol,
            out_vol,
            upcoming_pay_amt,
            upcoming_pay_cnt,
            exp_rec,
            overdue_rec,
            rec_ratio,
            disc_spend,
            recent_burn,
            days_to_pay,
            hist_min,
            tx_freq,
            month_day
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
            risk_level = "CRITICAL" if shortage_prob_pct >= 80.0 else "HIGH"
        elif shortage_prob_pct >= 35.0:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

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
            "model_version": self.metadata.get("model_version", "2.2.0"),
            "model_type": self.metadata.get("classifier_type", "RandomForestClassifier"),
            "feature_importance": feature_importance_list[:6]
        }
