export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type InsightCategory = 
  | 'Receivable Management' 
  | 'Expense Optimization' 
  | 'Liquidity & Reserves' 
  | 'Vendor Payment Timing' 
  | 'Strategic Financing';

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
  projected30DayBalance: number;
  cashHealthScore: number; // 0 to 100
  safeBufferThreshold: number;
  runwayDays: number;
  netBurnRate: number;
  changeVsLastMonth: {
    balance: number;
    inflow: number;
    outflow: number;
    healthScore: number;
  };
}

export interface ForecastDay {
  date: string;
  dayIndex: number;
  projectedBalance: number;
  predictedInflow: number;
  predictedOutflow: number;
  netChange: number;
  isBelowThreshold: boolean;
  riskLevel: RiskLevel;
  confidenceLower?: number;
  confidenceUpper?: number;
  events?: string[];
}

export interface ForecastData {
  forecastDays: ForecastDay[];
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
  category: 'Receivables' | 'Outflow' | 'Liquidity' | 'Revenue' | 'Macro';
  shapValue: number;
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
  customerPaymentDelayDays: number; // 0 to 60
  upcomingExpenseAmount: number; // 0 to 100000
  monthlyRevenueChangePercent: number; // -50% to +50%
  vendorPaymentShiftDays: number; // -30 to +45
  safeBufferAmount: number; // min safe cash buffer
}

export interface ScenarioResult {
  params: ScenarioParams;
  baselineMinBalance: number;
  simulatedMinBalance: number;
  baselineRiskProbability: number;
  simulatedRiskProbability: number;
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
  potentialCashImpact: number; // dollar impact
  runwayDaysImpact: number; // days saved
  recommendedAction: string;
  status: 'open' | 'applied' | 'dismissed';
  actionType: 'invoice_reminder' | 'reschedule_payment' | 'cut_expense' | 'credit_line' | 'early_discount';
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
  invoices: Invoice[];
  payments: Payment[];
}
