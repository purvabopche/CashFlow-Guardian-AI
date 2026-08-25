# CashFlow Guardian AI - Python FastAPI Backend & ML Engine

This backend service provides machine-learning-ready cash flow forecasting, shortage probability estimation, Explainable AI (XAI) feature attribution, and dynamic what-if simulation for SMEs.

## Architecture

- **Framework**: FastAPI (Async Python 3.10+)
- **Validation**: Pydantic v2
- **ML & Analysis**: NumPy, Scikit-learn, Cash Survival Curve Decision Classifier
- **Explainability**: SHAP-inspired feature attribution breakdown

## Quickstart

### 1. Create a Python Virtual Environment
```bash
python -m venv venv

# Windows PowerShell:
.\venv\Scripts\Activate.ps1

# Linux / macOS:
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run the Development Server
```bash
uvicorn backend.main:app --reload --port 8000
```

### 4. Explore Interactive API Docs
Open your browser to:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

- `GET /api/health` - Health check & ML model readiness status
- `GET /api/datasets` - Available business profile datasets
- `GET /api/financial-summary` - Summary KPIs, runway, and cash health score
- `GET /api/forecast` - 30/60/90-day time-series projected balance & inflows/outflows
- `GET /api/risk-prediction` - Shortage probability, confidence score, XAI feature impacts
- `POST /api/simulate` - Dynamic scenario simulation (payment delay, revenue shift, lump expense)
- `GET /api/insights` - Prioritized recommendations with quantified dollar impact
