export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type CurrencyCode = 'INR' | 'USD';

export type InsightCategory = 
  | 'Receivable Management' 
  | 'Expense Optimization' 
  | 'Liquidity & Reserves' 
  | 'Vendor Payment Timing' 
  | 'Strategic Financing'
  | 'Discretionary Spending'
  | 'Recurring Subscriptions';

export type TransactionCategory =
  | 'Income'
  | 'Rent & Living'
  | 'Utilities'
  | 'Subscriptions'
  | 'Food & Dining'
  | 'Groceries'
  | 'Payroll & Team'
  | 'Shopping'
  | 'Travel & Commute'
  | 'Taxes & Insurance'
  | 'Equipment & Capex'
  | 'Other';

export interface Transaction {
  id: string;
  date: string;
  title: string;
  category: TransactionCategory;
  type: 'income' | 'expense';
  amount: number;
  isRecurring: boolean;
  isDiscretionary: boolean;
  merchant?: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  client: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  daysOverdue?: number;
  probabilityOfDelay?: number; // 0.0 to 1.0
  expectedDelayDays?: number;
  description?: string;
}

export interface Payment {
  id: string;
  vendor: string;
  amount: number;
  dueDate: string;
  category: 'Payroll' | 'Rent' | 'SaaS' | 'Inventory' | 'Tax' | 'Vendor' | 'Utilities' | 'Other';
  isFlexible: boolean;
  urgency: 'Critical' | 'High' | 'Medium' | 'Low';
  notes?: string;
}

export interface CashFlowSummary {
  currentBalance: number;
  monthlyInflow: number;
  monthlyOutflow: number;
  netCashFlow: number;
  projected30DayBalance: number;
  cashHealthScore: number; // 0 to 100 Cash Safety Score
  safeBufferThreshold: number;
  runwayDays: number;
  netBurnRate: number;
  dangerDayCount: number;
  dangerDate: string | null;
  dangerDaysFromNow: number;
  changeVsLastMonth: {
    balance: number;
    inflow: number;
    outflow: number;
    healthScore: number;
  };
}

export interface HistoricalPoint {
  date: string;
  dayIndex: number;
  balance: number;
  inflow: number;
  outflow: number;
}

export interface ForecastDay {
  date: string;
  dayIndex: number;
  projectedBalance: number;
  predictedInflow: number;
  predictedOutflow: number;
  netChange: number;
  isBelowThreshold: boolean;
  isDangerZone: boolean;
  riskLevel: RiskLevel;
  confidenceLower?: number;
  confidenceUpper?: number;
  events?: string[];
  isHistorical?: boolean;
}

export interface ForecastData {
  historicalDays: HistoricalPoint[];
  forecastDays: ForecastDay[];
  combinedTimeline: (ForecastDay & { isHistorical?: boolean })[];
  safeBufferThreshold: number;
  lowestProjectedPoint: number;
  daysBelowThresholdCount: number;
  predictedBreachDate: string | null;
  totalProjectedInflow: number;
  totalProjectedOutflow: number;
}

export interface ExplainableFactor {
  id: string;
  name: string;
  impactPercent: number;
  direction: 'increases_risk' | 'decreases_risk';
  description: string;
  category: 'Receivables' | 'Outflow' | 'Liquidity' | 'Revenue' | 'Discretionary' | 'Macro';
  shapValue: number;
  isRemediable?: boolean;
}

export interface RiskPrediction {
  riskProbability: number; // 0 - 100%
  riskLevel: RiskLevel;
  predictedShortageWindow: string;
  confidenceScore: number; // 0 - 100%
  runwayDays: number;
  keyFactors: string[];
  explainability: ExplainableFactor[];
  modelMetadata: {
    modelVersion: string;
    modelType: string;
    trainingStatus: string;
    inferenceLatencyMs: number;
    featuresEvaluated: number;
    isMockOrLive: 'mock_local' | 'live_fastapi';
  };
}

export interface ScenarioParams {
  extraSpendingThisWeek: number; // e.g. ₹5,000 / $500
  emergencyFundingAmount: number; // e.g. +₹10,000 emergency capital injection
  newRecurringExpenseAmount: number; // e.g. +₹3,000/mo new tool
  customerPaymentDelayDays: number; // e.g. 5, 7, 14, 30 days
  foodExpenseReductionPercent: number; // e.g. 20%
  dailyDiscretionaryTrim: number; // e.g. ₹300/day
  monthlyRevenueChangePercent: number; // -50% to +50%
  vendorPaymentShiftDays: number; // -15 to +30
  safeBufferAmount: number; // target cushion
}

export interface ScenarioResult {
  params: ScenarioParams;
  baselineMinBalance: number;
  simulatedMinBalance: number;
  baselineRiskProbability: number;
  simulatedRiskProbability: number;
  baselineSafetyScore: number;
  simulatedSafetyScore: number;
  balanceDelta: number;
  runwayImpactDays: number;
  timeline: {
    date: string;
    dayIndex: number;
    baselineBalance: number;
    simulatedBalance: number;
    safeBuffer: number;
    variance: number;
  }[];
  summaryNote: string;
}

export interface ActionInsight {
  id: string;
  title: string;
  description: string;
  category: InsightCategory;
  priority: PriorityLevel;
  potentialCashImpact: number;
  runwayDaysImpact: number;
  recommendedAction: string;
  status: 'open' | 'applied' | 'dismissed';
  actionType: 'invoice_reminder' | 'reschedule_payment' | 'cut_expense' | 'credit_line' | 'cut_discretionary' | 'early_discount';
  riskReductionEstimate?: {
    fromRisk: number;
    toRisk: number;
  };
  templateData?: {
    client?: string;
    amount?: number;
    invoiceId?: string;
    daysOverdue?: number;
    vendor?: string;
    dueDate?: string;
    suggestedDate?: string;
    suggestedEmail?: string;
    categories?: string[];
    estimatedSavings?: number;
    targetBuffer?: number;
    currentReserve?: number;
    deficit?: number;
  };
}

export interface FinancialDataset {
  id: string;
  name: string;
  industry: string;
  description: string;
  currentBalance: number;
  monthlyInflow: number;
  monthlyOutflow: number;
  safeBufferThreshold: number;
  transactions: Transaction[];
  invoices: Invoice[];
  payments: Payment[];
}
