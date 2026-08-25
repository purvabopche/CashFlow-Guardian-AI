# CashFlow Guardian AI 🛡️

> **Predict cash shortages before they become financial emergencies.**  
> An intelligent, production-grade fintech liquidity intelligence platform engineered for small businesses, startups, and freelancers. Powered by a multi-horizon Machine Learning ensemble (`RandomForestClassifier` + `GradientBoostingRegressor`), 30-day continuous cash flow simulation, transparent Cash Safety Scoring (0–100), Explainable AI (XAI) feature attribution, and interactive What-If stress testing.

[![GitHub Repository](https://img.shields.io/badge/GitHub-CashFlow--Guardian--AI-10B981?style=for-the-badge&logo=github)](https://github.com/purvabopche/CashFlow-Guardian-AI)
[![Frontend](https://img.shields.io/badge/React_18-TypeScript-2563EB?style=for-the-badge&logo=react)](https://react.dev/)
[![Backend](https://img.shields.io/badge/FastAPI_2.1-Python_3.12-059669?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![ML Pipeline](https://img.shields.io/badge/Scikit--Learn-Random_Forest_98.1%25_Acc-8B5CF6?style=for-the-badge)](https://scikit-learn.org/)
[![Styling](https://img.shields.io/badge/Tailwind_CSS-Stripe_Fintech_SaaS-06B6D4?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)

---

## 1. Problem Statement

Over **82% of small businesses, freelancers, and growth startups fail due to cash flow timing mismatches rather than lack of profitability**:
- **Backward-Looking Accounting**: Traditional tools (Tally, QuickBooks) only record money *after* it leaves the bank account.
- **Receivables & Timing Lag**: Uncollected client invoices collide with non-negotiable liabilities like rent, salaries, EMIs, and advance taxes.
- **No Early Warning System**: Founders and operators discover liquidity squeezes 48 hours before an overdraft.
- **Zero Stress-Testing Capability**: Operators cannot easily evaluate *"What if my customer invoice is delayed by 14 days?"* or *"What if I cut discretionary spend by ₹300/day?"*.

---

## 2. Solution

**CashFlow Guardian AI** shifts liquidity management from retroactive accounting to proactive intelligence:
1. **Machine Learning Risk Engine**: Predicts the exact probability and timing of cash shortages 7–30 days in advance.
2. **30-Day Forward Forecast**: Computes daily projected balances incorporating historical volatility, expected receipts, and scheduled outflows.
3. **Explainable AI (XAI)**: Demystifies predictions by displaying exact positive and negative factor attributions.
4. **Interactive What-If Stress Simulator**: Recalculates liquidity trajectories and safety scores in real-time as users adjust spending, delays, and capital injections.
5. **Actionable AI Recommendations**: Prescribes 1-click remedies (e.g. automated payment reminders, payment delay negotiations, discretionary trim) to restore safety buffers.

---

## 3. Key Features

- 📊 **Financial Operations Dashboard**: Real-time overview answering current balance, runway, shortage window, and safety score.
- 🔮 **Cash Shortage Prediction**: ML classification and regression predicting whether the account will breach the configured safety cushion.
- 📈 **30-Day Liquidity Forecast**: Visual trajectory chart comparing daily balances against minimum safe reserves.
- 🧠 **Explainable AI (XAI) & Factor Attribution**: Transparent SHAP-inspired impact weights explaining why a risk score was assigned.
- ⚡ **What-If Scenario Simulator**: Multi-variable stress testing with instant Before vs. After comparison cards.
- 💡 **AI Action Engine & 1-Click Remediation**: Prescriptive financial interventions with calculated recovery amounts and runway extensions.
- 🔬 **Model Transparency Panel**: In-app modal detailing evaluation metrics, hyperparameters, dataset size, and feature weights.

---

## 4. Machine Learning Implementation

### 1. Dataset Generation & Schema
The training pipeline (`backend/data/dataset_generator.py`) generates a realistic **5,000-record synthetic cash-flow dataset** (`backend/data/cashflow_dataset.csv`) across diverse business archetypes (Freelancer, Growth Agency, Stable E-commerce).

### 2. 12 Financial Feature Vectors
1. `opening_balance`: Available liquid balance in primary operating checking accounts
2. `daily_income`: 30-day rolling daily cash receipts and settlements
3. `daily_expense`: 30-day rolling daily cash disbursements
4. `recurring_payment_amount`: Non-negotiable fixed obligations (rent, payroll, subscriptions)
5. `upcoming_payment_amount`: Total scheduled disbursements due in 30 days
6. `expected_invoice_amount`: Pending milestone invoices scheduled within 30 days
7. `overdue_invoice_amount`: Uncollected receivables past customer due date
8. `discretionary_spending`: Variable non-essential outflows (dining, travel, impulse spend)
9. `day_of_month`: Calendar cycle day (1–30) capturing payroll and billing cycles
10. `cash_flow_7d`: Net forward 7-day liquidity pressure indicator
11. `cash_flow_30d`: Net forward 30-day projected liquidity delta
12. `minimum_safe_balance`: Target emergency buffer threshold configured by operator

### 3. Target Variables
- **Classification Target**: `cash_shortage_risk` (1 = Projected balance breaches safe buffer, 0 = Safe liquidity margin).
- **Regression Target 1**: `predicted_minimum_balance` (Projected lowest balance in the 30-day forecast horizon).
- **Regression Target 2**: `days_to_cash_shortage` (Estimated days remaining before account drops below buffer).

### 4. Verified Evaluation Metrics (80/20 Stratified Split)

| Model Component | Algorithm | Metric | Value |
| :--- | :--- | :--- | :--- |
| **Shortage Risk Classifier** | `RandomForestClassifier` (150 Trees, Depth 9) | **Accuracy** | **98.10%** |
| | | **Precision** | **97.77%** |
| | | **Recall** | **97.52%** |
| | | **F1 Score** | **0.9765** |
| | | **ROC-AUC** | **0.9987** |
| **Minimum Balance Regressor** | `GradientBoostingRegressor` (120 Estimators) | **R² Score** | **0.9992** |
| | | **MAE** | **INR 2,314.43** |
| **Days to Deficit Regressor** | `GradientBoostingRegressor` (100 Estimators) | **R² Score** | **0.9582** |
| | | **MAE** | **1.02 Days** |

### 5. Serialized Artifacts
- `backend/models/shortage_classifier.joblib`
- `backend/models/balance_regressor.joblib`
- `backend/models/days_to_shortage_regressor.joblib`
- `backend/models/model_metadata.json`
- `backend/models/model_metrics.json`

---

## 5. System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│              Frontend (React 18 + TypeScript + Vite + Tailwind)         │
│  - Financial Dashboard  - What-If Stress Simulator  - AI Action Engine  │
│  - Rolling Forecast     - Risk Explainability (XAI) - Model Evidence    │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTP / REST (apiClient.ts)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    Python FastAPI Backend (Port 8000)                   │
│  - GET /api/model-info    - POST /api/predict     - POST /api/simulate  │
│  - GET /api/dashboard     - GET /api/forecast     - GET /api/scenarios  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Feature Vector Extraction (12 Features)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                Trained Machine Learning Inference Ensemble              │
│  - RandomForestClassifier (Shortage Risk & Probability, Acc: 98.1%)     │
│  - GradientBoostingRegressor (30-Day Minimum Balance, R²: 0.999)        │
│  - GradientBoostingRegressor (Days to Deficit, MAE: 1.02 Days)          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas Confetti
- **Visualizations**: Recharts (Composed Area, Dual-Line Comparison, Horizontal Bar Charts)
- **Backend API**: Python 3.12, FastAPI, Uvicorn, Pydantic v2
- **Machine Learning**: Scikit-Learn (`RandomForestClassifier`, `GradientBoostingRegressor`), NumPy, Pandas, Joblib
- **State Management**: React Context (`FinancialContext.tsx`) with asynchronous API sync and client fallback

---

## 7. API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status and live model latency (~11.2ms) |
| `GET` | `/api/model-info` | Verified model metrics, training sample count, and architecture metadata |
| `POST` | `/api/predict` | Live ML inference on custom financial inputs (probability, risk, window, safety score) |
| `POST` | `/api/simulate` | Evaluates What-If parameters (delays, trims, emergency capital) against baseline |
| `GET` | `/api/scenarios` | Lists available demo financial profiles |
| `GET` | `/api/dashboard` | Aggregated KPIs, safety score breakdown, and top risk factors |
| `GET` | `/api/forecast` | 30-day projected daily closing balance series |
| `GET` | `/api/insights` | Actionable recommendations with calculated cash recovery impact |

---

## 8. Running Locally

### Prerequisites
- Node.js 18+ & npm
- Python 3.10+ & pip

### 1. Backend Setup & Model Training
```bash
# Navigate to project root
cd "CashFlow Guardian AI"

# Install Python dependencies
pip install fastapi uvicorn scikit-learn numpy pandas joblib pydantic

# (Optional) Retrain ML models from scratch
python backend/train_model.py

# Verify live model inference
python backend/verify_model.py

# Start FastAPI server on port 8000
python -m uvicorn backend.main:app --port 8000 --host 127.0.0.1
```

### 2. Frontend Setup
```bash
# In a separate terminal
cd "CashFlow Guardian AI"

# Install dependencies
npm install

# Start Vite development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 9. Demo Scenarios

The platform includes 3 distinct operational business profiles:

1. **Stable Growth (Profitable E-Commerce & Retail)**:
   - *Opening Balance*: ₹150,000 | *Monthly Inflow*: ₹135,000 | *Outflow*: ₹88,000
   - *Shortage Risk*: **3.5% (Low)** | *Safety Score*: **99/100** | *Runway*: **~180 Days**
   - *Profile*: Healthy liquidity margin with surplus cash generation.

2. **Payment Pressure (Growth B2B SaaS)**:
   - *Opening Balance*: ₹48,000 | *Upcoming Payroll*: ₹28,000 | *Safe Cushion*: ₹25,000
   - *Shortage Risk*: **21.6% (Moderate)** | *Safety Score*: **64/100** | *Runway*: **~24 Days**
   - *Profile*: Operating near buffer threshold; requires invoice collection discipline.

3. **Critical Shortage (Independent Consulting / SME)**:
   - *Opening Balance*: ₹8,500 | *Overdue Invoice*: ₹28,500 | *Fixed Liabilities*: ₹37,000
   - *Shortage Risk*: **97.5% (Critical)** | *Safety Score*: **22/100** | *Deficit Date*: **Day 12**
   - *Profile*: Severe liquidity crisis; 1-click reminders and payment delays restore stability.

---

## 10. Future Scope

- 🏦 **Account Aggregator (AA) Integration**: Direct live bank feed sync via RBI-regulated Account Aggregators (Setu, Anumati).
- 💳 **Payment Gateway Webhooks**: Real-time event webhooks from Razorpay, Stripe, and Cashfree for instant receivable tracking.
- 🤖 **Automated Invoice Factoring**: 1-click bridge financing integration for verified overdue B2B invoices.
- 📱 **WhatsApp & SMS Push Alerts**: Autonomous proactive warning messages triggered 7 days before projected deficit dates.

---

## 11. Authors & License

- Built for fintech innovation and hackathon excellence by **Purva Bopche**.
- Repository: [github.com/purvabopche/CashFlow-Guardian-AI](https://github.com/purvabopche/CashFlow-Guardian-AI)
- License: MIT
