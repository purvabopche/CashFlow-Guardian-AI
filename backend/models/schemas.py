from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field

# Base primitives
RiskLevel = Literal['Low', 'Medium', 'High', 'Critical']
PriorityLevel = Literal['Low', 'Medium', 'High', 'Critical']
TransactionType = Literal['income', 'expense']

class TransactionItem(BaseModel):
    id: str
    date: str
    title: str
    category: str
    type: TransactionType
    amount: float
    is_recurring: bool = False
    is_discretionary: bool = False
    merchant: Optional[str] = None
    notes: Optional[str] = None

class InvoiceItem(BaseModel):
    id: str
    client: str
    amount: float
    due_date: str
    status: Literal['paid', 'pending', 'overdue']
    days_overdue: int = 0
    probability_of_delay: float = 0.0
    expected_delay_days: int = 0
    description: Optional[str] = None

class PaymentItem(BaseModel):
    id: str
    vendor: str
    amount: float
    due_date: str
    category: str
    is_flexible: bool = False
    urgency: RiskLevel = 'Medium'
    notes: Optional[str] = None

class SafetyScoreBreakdown(BaseModel):
    total_score: int = Field(..., ge=0, le=100, description="Composite Cash Safety Score from 0 to 100")
    liquidity_health: int = Field(..., description="Out of 30 pts: reserve buffer coverage")
    income_stability: int = Field(..., description="Out of 25 pts: recurring vs volatile inflow ratio")
    expense_pressure: int = Field(..., description="Out of 20 pts: fixed commitment concentration")
    receivables_health: int = Field(..., description="Out of 15 pts: overdue invoice collection rate")
    shortage_risk_score: int = Field(..., description="Out of 10 pts: predictive survival safety margin")

class DashboardSummaryResponse(BaseModel):
    current_balance: float
    monthly_inflow: float
    monthly_outflow: float
    net_cash_flow: float
    projected_30d_balance: float
    cash_safety_score: int
    safety_score_breakdown: SafetyScoreBreakdown
    safe_buffer_threshold: float
    runway_days: int
    net_burn_rate: float
    danger_day_count: int
    danger_date: Optional[str] = None
    danger_days_from_now: int
    shortage_probability: float
    risk_level: RiskLevel

class ForecastDayPoint(BaseModel):
    date: str
    day_index: int
    projected_balance: float
    predicted_inflow: float
    predicted_outflow: float
    net_change: float
    is_below_threshold: bool
    is_danger_zone: bool
    risk_level: RiskLevel
    confidence_lower: float
    confidence_upper: float
    events: Optional[List[str]] = None

class ForecastResponse(BaseModel):
    forecast_days: List[ForecastDayPoint]
    safe_buffer_threshold: float
    lowest_projected_point: float
    days_below_threshold_count: int
    predicted_breach_date: Optional[str] = None
    total_projected_inflow: float
    total_projected_outflow: float
    projected_7d_balance: float
    projected_15d_balance: float
    projected_30d_balance: float

class ExplainableFactorItem(BaseModel):
    id: str
    name: str
    impact_percent: float
    direction: Literal['increases_risk', 'decreases_risk']
    description: str
    category: Literal['Receivables', 'Outflow', 'Liquidity', 'Revenue', 'Discretionary', 'Macro']
    shap_value: float
    is_remediable: bool = True

class RiskAnalysisResponse(BaseModel):
    risk_probability: float
    risk_level: RiskLevel
    predicted_shortage_window: str
    confidence_score: float
    runway_days: int
    key_factors: List[str]
    explainability: List[ExplainableFactorItem]
    model_metadata: Dict[str, Any]

class ActionInsightItem(BaseModel):
    id: str
    title: str
    description: str
    category: str
    priority: PriorityLevel
    potential_cash_impact: float
    runway_days_impact: int
    recommended_action: str
    status: Literal['open', 'applied', 'dismissed'] = 'open'
    action_type: str
    why_it_matters: str
    expected_improvement: str
    risk_reduction_from: Optional[float] = None
    risk_reduction_to: Optional[float] = None
    template_data: Optional[Dict[str, Any]] = None

class ScenarioSimulateRequest(BaseModel):
    scenario_id: Optional[str] = None
    extra_spending_this_week: float = 0.0
    emergency_funding_amount: float = 0.0
    new_recurring_expense_amount: float = 0.0
    customer_payment_delay_days: int = 0
    food_expense_reduction_percent: float = 0.0
    daily_discretionary_trim: float = 0.0
    monthly_revenue_change_percent: float = 0.0
    vendor_payment_shift_days: int = 0
    safe_buffer_amount: float = 15000.0

class SimulationPoint(BaseModel):
    date: str
    day_index: int
    baseline_balance: float
    simulated_balance: float
    safe_buffer: float
    variance: float

class ScenarioSimulateResponse(BaseModel):
    baseline_min_balance: float
    simulated_min_balance: float
    baseline_risk_probability: float
    simulated_risk_probability: float
    baseline_safety_score: int
    simulated_safety_score: int
    baseline_runway_days: int
    simulated_runway_days: int
    balance_delta: float
    runway_impact_days: int
    timeline: List[SimulationPoint]
    summary_note: str

class CustomPredictRequest(BaseModel):
    current_balance: float
    safe_threshold: float = 15000.0
    recent_transactions: List[TransactionItem] = []
    recurring_payments: List[PaymentItem] = []
    expected_income: List[InvoiceItem] = []

class CustomPredictResponse(BaseModel):
    predicted_balance_7d: float
    predicted_balance_15d: float
    predicted_balance_30d: float
    shortage_probability: float
    risk_level: RiskLevel
    estimated_shortage_date: Optional[str] = None
    estimated_runway_days: int
    explanation: str
    feature_importance: List[Dict[str, Any]]
    safety_score: int
    safety_score_breakdown: SafetyScoreBreakdown

PaymentDirection = Literal['incoming', 'outgoing']
PaymentStatus = Literal['pending', 'processing', 'paid', 'failed']

class PaymentRecord(BaseModel):
    id: str
    counterparty: str
    description: str
    amount: float = Field(..., gt=0, description="Amount must be positive")
    direction: PaymentDirection
    category: str
    status: PaymentStatus = 'pending'
    scheduled_date: str
    invoice_reference: Optional[str] = None
    is_recurring: bool = False
    provider: str = 'demo'
    reference_id: Optional[str] = None
    transaction_id: Optional[str] = None
    created_at: Optional[str] = None
    processed_at: Optional[str] = None

class CreatePaymentRequest(BaseModel):
    counterparty: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)
    amount: float = Field(..., gt=0)
    direction: PaymentDirection
    category: str = Field(..., min_length=1)
    scheduled_date: str = Field(..., min_length=1)
    invoice_reference: Optional[str] = None
    is_recurring: bool = False

class ProcessPaymentRequest(BaseModel):
    simulate_failure: bool = False
    provider: str = 'demo'

class PaymentImpactSnapshot(BaseModel):
    current_balance: float
    projected_lowest_balance: float
    shortage_probability_pct: float
    safety_score: int
    runway_days: int
    risk_level: RiskLevel

class PaymentImpactDelta(BaseModel):
    balance: float
    projected_lowest_balance: float
    shortage_probability_pct: float
    safety_score: int
    runway_days: int

class PaymentImpactSummary(BaseModel):
    before: PaymentImpactSnapshot
    after: PaymentImpactSnapshot
    delta: PaymentImpactDelta
    message: str

class ProcessPaymentResponse(BaseModel):
    payment: PaymentRecord
    transaction: Optional[TransactionItem] = None
    impact: PaymentImpactSummary
    summary: DashboardSummaryResponse
    forecast: ForecastResponse
    already_processed: bool = False

class PaymentConfigResponse(BaseModel):
    active_provider: str
    provider_name: str
    is_configured: bool
    key_id: Optional[str] = None
    demo_available: bool = True
    message: str

class RazorpayOrderResponse(BaseModel):
    order_id: str
    amount: int  # in paise
    amount_inr: float
    currency: str = "INR"
    key_id: str
    payment_id: str
    counterparty: str
    description: str
    receipt: Optional[str] = None

class RazorpayVerifyRequest(BaseModel):
    razorpay_order_id: str = Field(..., min_length=1)
    razorpay_payment_id: str = Field(..., min_length=1)
    razorpay_signature: str = Field(..., min_length=1)

