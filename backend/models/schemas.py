from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from enum import Enum

class RiskLevel(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

class PriorityLevel(str, Enum):
    LOW = "Low"
    MEDIUM = "Medium"
    HIGH = "High"
    CRITICAL = "Critical"

class InsightCategory(str, Enum):
    RECEIVABLE = "Receivable Management"
    EXPENSE = "Expense Optimization"
    LIQUIDITY = "Liquidity & Reserves"
    PAYMENT_TIMING = "Vendor Payment Timing"
    STRATEGIC = "Strategic Financing"

class Invoice(BaseModel):
    id: str
    client: str
    amount: float
    dueDate: str
    status: str # 'paid' | 'pending' | 'overdue'
    daysOverdue: int = 0
    probabilityOfDelay: float = 0.0 # 0.0 to 1.0
    expectedDelayDays: int = 0

class Payment(BaseModel):
    id: str
    vendor: str
    amount: float
    dueDate: str
    category: str # 'Payroll' | 'Rent' | 'SaaS' | 'Inventory' | 'Tax' | 'Vendor'
    isFlexible: bool = False
    urgency: str # 'Critical' | 'High' | 'Medium' | 'Low'

class CashFlowSummary(BaseModel):
    currentBalance: float
    monthlyInflow: float
    monthlyOutflow: float
    projected30DayBalance: float
    cashHealthScore: int # 0 - 100
    safeBufferThreshold: float
    runwayDays: int
    netBurnRate: float

class ForecastDay(BaseModel):
    date: str
    dayIndex: int
    projectedBalance: float
    predictedInflow: float
    predictedOutflow: float
    netChange: float
    isBelowThreshold: bool
    riskLevel: RiskLevel

class ForecastResponse(BaseModel):
    forecastDays: List[ForecastDay]
    safeBufferThreshold: float
    lowestProjectedPoint: float
    daysBelowThresholdCount: int
    predictedBreachDate: Optional[str] = None

class ExplainableFactor(BaseModel):
    id: str
    name: str
    impactPercent: float # e.g. 32.5
    direction: str # 'increases_risk' | 'decreases_risk'
    description: str
    category: str
    shapValue: float

class RiskPrediction(BaseModel):
    riskProbability: float # 0 to 100
    riskLevel: RiskLevel
    predictedShortageWindow: str # e.g. "Days 14 - 21"
    confidenceScore: float # e.g. 88.5%
    runwayDays: int
    keyFactors: List[str]
    explainability: List[ExplainableFactor]
    modelMetadata: Dict[str, Any]

class ScenarioParams(BaseModel):
    customerPaymentDelayDays: int = Field(default=0, ge=0, le=90)
    upcomingExpenseAmount: float = Field(default=0.0, ge=0)
    monthlyRevenueChangePercent: float = Field(default=0.0, ge=-100, le=200)
    vendorPaymentShiftDays: int = Field(default=0, ge=-30, le=60)
    safeBufferAmount: float = Field(default=25000.0, ge=1000)

class ScenarioResult(BaseModel):
    params: ScenarioParams
    baselineMinBalance: float
    simulatedMinBalance: float
    baselineRiskProbability: float
    simulatedRiskProbability: float
    balanceDelta: float
    runwayImpactDays: int
    timeline: List[Dict[str, Any]]
    summaryNote: str

class ActionInsight(BaseModel):
    id: str
    title: str
    description: str
    category: InsightCategory
    priority: PriorityLevel
    potentialCashImpact: float # in USD
    runwayDaysImpact: int
    recommendedAction: str
    status: str = "open" # 'open' | 'applied' | 'dismissed'
    actionType: str # 'invoice_reminder' | 'reschedule_payment' | 'cut_expense' | 'credit_line'
    templateData: Optional[Dict[str, Any]] = None
