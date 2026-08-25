import os
import json
import joblib
import datetime
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, RandomForestRegressor, GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, roc_auc_score,
    mean_absolute_error, mean_squared_error, r2_score
)

from data.dataset_generator import generate_cashflow_dataset, FEATURE_COLUMNS, save_dataset_csv

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, "data", "cashflow_dataset.csv")
MODELS_DIR = os.path.join(BASE_DIR, "models")
METADATA_PATH = os.path.join(MODELS_DIR, "model_metadata.json")

def train_and_evaluate_all():
    print("==================================================================")
    print("      CashFlow Guardian AI - Machine Learning Training Pipeline   ")
    print("==================================================================")

    # 1. Regenerate realistic dataset
    print(f"[*] Generating realistic financial cash-flow dataset (5,000 records)...")
    df = generate_cashflow_dataset(n_samples=5000, random_seed=42)
    save_dataset_csv(df, DATA_PATH)

    print(f"[+] Dataset shape: {df.shape} | Columns: {len(df.columns)}")

    # 2. Unified Train / Test Split (80% Train, 20% Test)
    train_df, test_df = train_test_split(df, test_size=0.2, random_state=42, stratify=df["shortage_risk"])
    X_train = train_df[FEATURE_COLUMNS]
    X_test = test_df[FEATURE_COLUMNS]
    y_c_train = train_df["shortage_risk"]
    y_c_test = test_df["shortage_risk"]
    y_b_train = train_df["predicted_minimum_balance"]
    y_b_test = test_df["predicted_minimum_balance"]
    y_d_train = train_df["days_to_cash_shortage"]
    y_d_test = test_df["days_to_cash_shortage"]

    print(f"[+] Train samples: {len(X_train)} | Test samples: {len(X_test)}")

    # 3. Train Classification Model (Cash Shortage Risk)
    print("\n[*] Training Shortage Risk Classification Model (RandomForestClassifier)...")
    clf = RandomForestClassifier(
        n_estimators=140,
        max_depth=9,
        min_samples_split=3,
        random_state=42,
        class_weight="balanced"
    )
    clf.fit(X_train, y_c_train)

    y_c_pred = clf.predict(X_test)
    y_c_proba = clf.predict_proba(X_test)[:, 1]

    acc = float(accuracy_score(y_c_test, y_c_pred))
    prec = float(precision_score(y_c_test, y_c_pred))
    rec = float(recall_score(y_c_test, y_c_pred))
    f1 = float(f1_score(y_c_test, y_c_pred))
    roc_auc = float(roc_auc_score(y_c_test, y_c_proba))

    print(f"    -> Accuracy  : {acc*100:.2f}%")
    print(f"    -> Precision : {prec*100:.2f}%")
    print(f"    -> Recall    : {rec*100:.2f}%")
    print(f"    -> F1 Score  : {f1:.4f}")
    print(f"    -> ROC-AUC   : {roc_auc:.4f}")

    # 4. Train Regression Model 1 (Predicted Minimum Balance in 30 Days)
    print("\n[*] Training Minimum Balance Regressor (GradientBoostingRegressor)...")
    reg_bal = GradientBoostingRegressor(
        n_estimators=120,
        learning_rate=0.08,
        max_depth=5,
        random_state=42
    )
    reg_bal.fit(X_train, y_b_train)

    y_b_pred = reg_bal.predict(X_test)
    mae_bal = float(mean_absolute_error(y_b_test, y_b_pred))
    rmse_bal = float(np.sqrt(mean_squared_error(y_b_test, y_b_pred)))
    r2_bal = float(r2_score(y_b_test, y_b_pred))

    print(f"    -> MAE       : INR {mae_bal:,.2f}")
    print(f"    -> RMSE      : INR {rmse_bal:,.2f}")
    print(f"    -> R2 Score  : {r2_bal:.4f}")

    # 5. Train Regression Model 2 (Days Until Cash Shortage)
    print("\n[*] Training Days to Shortage Regressor (GradientBoostingRegressor)...")
    reg_days = GradientBoostingRegressor(
        n_estimators=100,
        learning_rate=0.08,
        max_depth=4,
        random_state=42
    )
    reg_days.fit(X_train, y_d_train)

    y_d_pred = reg_days.predict(X_test)
    mae_days = float(mean_absolute_error(y_d_test, y_d_pred))
    rmse_days = float(np.sqrt(mean_squared_error(y_d_test, y_d_pred)))
    r2_days = float(r2_score(y_d_test, y_d_pred))

    print(f"    -> MAE       : {mae_days:.2f} days")
    print(f"    -> RMSE      : {rmse_days:.2f} days")
    print(f"    -> R2 Score  : {r2_days:.4f}")

    # 6. Extract Feature Importances & Directional Impacts
    importances = clf.feature_importances_
    corr_matrix = df.corr(numeric_only=True)
    feature_insights = []

    for name, imp in zip(FEATURE_COLUMNS, importances):
        corr = corr_matrix["shortage_risk"].get(name, 0.0)
        direction = "increases_risk" if corr > 0 else "decreases_risk"
        feature_insights.append({
            "feature": name,
            "importance": round(float(imp) * 100, 2),
            "correlation_with_risk": round(float(corr), 4),
            "direction": direction,
            "readable_name": name.replace("_", " ").title()
        })

    feature_insights.sort(key=lambda x: x["importance"], reverse=True)

    # 7. Save Model Artifacts
    os.makedirs(MODELS_DIR, exist_ok=True)
    clf_path = os.path.join(MODELS_DIR, "shortage_classifier.joblib")
    reg_bal_path = os.path.join(MODELS_DIR, "balance_regressor.joblib")
    reg_days_path = os.path.join(MODELS_DIR, "days_to_shortage_regressor.joblib")

    joblib.dump(clf, clf_path)
    joblib.dump(reg_bal, reg_bal_path)
    joblib.dump(reg_days, reg_days_path)

    print(f"\n[+] Saved classifier to: {clf_path}")
    print(f"[+] Saved balance regressor to: {reg_bal_path}")
    print(f"[+] Saved days-to-shortage regressor to: {reg_days_path}")

    # 8. Save Metadata JSON
    metadata = {
        "model_name": "CashFlow Guardian Multi-Horizon ML Ensemble",
        "model_version": "2.2.0",
        "classifier_type": "RandomForestClassifier (140 Trees, Max Depth 9)",
        "regressor_balance_type": "GradientBoostingRegressor (120 Estimators, Depth 5)",
        "regressor_days_type": "GradientBoostingRegressor (100 Estimators, Depth 4)",
        "training_date": datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "dataset_size": len(df),
        "number_of_features": len(FEATURE_COLUMNS),
        "train_test_split": "80/20 Stratified",
        "features": FEATURE_COLUMNS,
        "metrics": {
            "classification": {
                "accuracy": round(acc, 4),
                "precision": round(prec, 4),
                "recall": round(rec, 4),
                "f1_score": round(f1, 4),
                "roc_auc": round(roc_auc, 4)
            },
            "regression_balance": {
                "mae": round(mae_bal, 2),
                "rmse": round(rmse_bal, 2),
                "r2": round(r2_bal, 4)
            },
            "regression_days": {
                "mae": round(mae_days, 2),
                "rmse": round(rmse_days, 2),
                "r2": round(r2_days, 4)
            }
        },
        "feature_importances": feature_insights
    }

    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    print(f"[+] Saved model metadata to: {METADATA_PATH}")
    print("==================================================================")
    print("       Model Training Pipeline Completed Successfully [OK]       ")
    print("==================================================================")

if __name__ == "__main__":
    train_and_evaluate_all()
