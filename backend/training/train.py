import os
import joblib
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier, GradientBoostingRegressor
from sklearn.linear_model import Ridge
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, mean_absolute_error, r2_score

def train_and_export_models():
    print("=======================================================")
    print("  CashFlow Guardian AI - ML Training Pipeline")
    print("=======================================================")

    np.random.seed(42)
    n_samples = 3000
    print(f"[*] Generating {n_samples} high-fidelity financial flow vectors...")

    X = []
    y_class = []
    y_7d = []
    y_15d = []
    y_30d = []

    for _ in range(n_samples):
        curr_bal = np.random.uniform(4000, 180000)
        buffer = np.random.choice([10000, 15000, 20000, 25000, 30000])
        buf_ratio = curr_bal / buffer
        daily_in = np.random.uniform(1000, 6000)
        daily_out = np.random.uniform(1200, 6500)
        burn = max(0.0, (daily_out - daily_in) * 30)

        rec_ratio = np.random.uniform(0.1, 0.65)
        disc_ratio = np.random.uniform(0.1, 0.45)
        overdue = np.random.choice([0.0, 5000.0, 15000.0, 28500.0, 45000.0])
        pending = np.random.uniform(0, 40000)
        critical_pay = np.random.uniform(5000, 50000)

        comm_7d = critical_pay * np.random.uniform(0.2, 0.5)
        comm_15d = critical_pay * np.random.uniform(0.5, 0.9)
        in_7d = (daily_in * 7) + (pending * 0.3)
        in_15d = (daily_in * 15) + (pending * 0.6)

        vec = [
            curr_bal, buffer, buf_ratio, daily_in, daily_out, burn,
            rec_ratio, disc_ratio, overdue, pending, critical_pay,
            comm_7d, comm_15d, in_7d, in_15d
        ]

        # Target calculations
        projected_min = curr_bal + (in_15d - comm_15d) - (daily_out * 15)
        is_shortage = 1 if (projected_min < buffer or curr_bal < buffer * 1.1) else 0

        b7 = curr_bal + (in_7d - comm_7d) - (daily_out * 7)
        b15 = curr_bal + (in_15d - comm_15d) - (daily_out * 15)
        b30 = curr_bal + (daily_in * 30) - (daily_out * 30) - critical_pay + pending - overdue * 0.5

        X.append(vec)
        y_class.append(is_shortage)
        y_7d.append(b7)
        y_15d.append(b15)
        y_30d.append(b30)

    X = np.array(X)
    y_class = np.array(y_class)
    y_7d = np.array(y_7d)
    y_15d = np.array(y_15d)
    y_30d = np.array(y_30d)

    # Train/Test Split
    X_train, X_test, y_c_train, y_c_test = train_test_split(X, y_class, test_size=0.2, random_state=42)
    _, _, y_7_train, y_7_test = train_test_split(X, y_7d, test_size=0.2, random_state=42)
    _, _, y_15_train, y_15_test = train_test_split(X, y_15d, test_size=0.2, random_state=42)
    _, _, y_30_train, y_30_test = train_test_split(X, y_30d, test_size=0.2, random_state=42)

    print("[*] Training GradientBoostingClassifier for shortage risk...")
    clf = GradientBoostingClassifier(n_estimators=80, learning_rate=0.08, max_depth=3, random_state=42)
    clf.fit(X_train, y_c_train)
    c_pred = clf.predict(X_test)
    acc = accuracy_score(y_c_test, c_pred)
    f1 = f1_score(y_c_test, c_pred)
    print(f"    -> Classifier Accuracy: {acc*100:.2f}% | F1 Score: {f1:.4f}")

    print("[*] Training Multi-Horizon Balance Regressors (7d, 15d, 30d)...")
    reg7 = Ridge(alpha=1.0)
    reg7.fit(X_train, y_7_train)
    mae7 = mean_absolute_error(y_7_test, reg7.predict(X_test))

    reg15 = Ridge(alpha=1.0)
    reg15.fit(X_train, y_15_train)
    mae15 = mean_absolute_error(y_15_test, reg15.predict(X_test))

    reg30 = GradientBoostingRegressor(n_estimators=70, learning_rate=0.09, max_depth=3, random_state=42)
    reg30.fit(X_train, y_30_train)
    mae30 = mean_absolute_error(y_30_test, reg30.predict(X_test))
    r2_30 = r2_score(y_30_test, reg30.predict(X_test))

    print(f"    -> 7-Day Balance MAE: INR {mae7:.2f}")
    print(f"    -> 15-Day Balance MAE: INR {mae15:.2f}")
    print(f"    -> 30-Day Balance MAE: INR {mae30:.2f} (R2 = {r2_30:.4f})")

    # Serialize bundle
    output_dir = os.path.join(os.path.dirname(__file__), "..", "models")
    os.makedirs(output_dir, exist_ok=True)
    out_path = os.path.join(output_dir, "trained_model.joblib")

    feature_names = [
        "current_balance", "safe_buffer_threshold", "buffer_coverage_ratio",
        "daily_inflow_mean", "daily_outflow_mean", "net_burn_rate",
        "recurring_expense_ratio", "discretionary_ratio",
        "overdue_receivables_total", "pending_receivables_total",
        "critical_commitments_total", "commitments_due_7d",
        "commitments_due_15d", "inflows_expected_7d", "inflows_expected_15d"
    ]

    bundle = {
        "classifier": clf,
        "regressor_7d": reg7,
        "regressor_15d": reg15,
        "regressor_30d": reg30,
        "feature_names": feature_names,
        "metrics": {
            "accuracy": acc,
            "f1": f1,
            "mae_30d": mae30,
            "r2_30d": r2_30
        }
    }
    joblib.dump(bundle, out_path)
    print(f"[OK] Model pipeline successfully serialized to: {out_path}")
    print("=======================================================")

if __name__ == "__main__":
    train_and_export_models()
