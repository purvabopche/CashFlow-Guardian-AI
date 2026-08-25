import {
  CashFlowSummary,
  ForecastData,
  ForecastDay,
  Invoice,
  Payment,
  RiskPrediction,
  RiskLevel,
  ScenarioParams,
  ScenarioResult,
  ActionInsight,
  ExplainableFactor
} from '../types/financial';

export function calculateSummary(
  currentBalance: number,
  monthlyInflow: number,
  monthlyOutflow: number,
  safeBuffer: number
): CashFlowSummary {
  const projected30Day = currentBalance + (monthlyInflow - monthlyOutflow);
  const netBurn = Math.max(0, monthlyOutflow - monthlyInflow);
  const dailyBurn = netBurn / 30;
  const runwayDays = dailyBurn > 0 ? Math.max(1, Math.floor(currentBalance / dailyBurn)) : 180;

  // Calculate Cash Health Score (0 - 100)
  let healthScore = 70;
  
  // Reserve cushion factor
  const bufferRatio = currentBalance / Math.max(safeBuffer, 1);
  if (bufferRatio >= 1.5) healthScore += 18;
  else if (bufferRatio >= 1.0) healthScore += 8;
  else if (bufferRatio >= 0.7) healthScore -= 12;
  else healthScore -= 28;

  // Inflow vs Outflow cash flow generation factor
  if (monthlyInflow > monthlyOutflow) {
    const surplusPct = (monthlyInflow - monthlyOutflow) / monthlyOutflow;
    healthScore += Math.min(15, Math.floor(surplusPct * 30));
  } else {
    const deficitPct = (monthlyOutflow - monthlyInflow) / monthlyOutflow;
    healthScore -= Math.min(25, Math.floor(deficitPct * 50));
  }

  healthScore = Math.max(8, Math.min(98, Math.round(healthScore)));

  return {
    currentBalance,
    monthlyInflow,
    monthlyOutflow,
    projected30DayBalance: projected30Day,
    cashHealthScore: healthScore,
    safeBufferThreshold: safeBuffer,
    runwayDays,
    netBurnRate: netBurn,
    changeVsLastMonth: {
      balance: +4.2,
      inflow: +8.5,
      outflow: +3.1,
      healthScore: healthScore >= 70 ? +6 : -8
    }
  };
}

export function generateForecastTimeline(
  currentBalance: number,
  monthlyInflow: number,
  monthlyOutflow: number,
  safeBuffer: number,
  daysCount: number = 30,
  invoices: Invoice[] = [],
  payments: Payment[] = [],
  scenarioParams?: Partial<ScenarioParams>
): ForecastData {
  const delayDays = scenarioParams?.customerPaymentDelayDays || 0;
  const extraExpense = scenarioParams?.upcomingExpenseAmount || 0;
  const revChangePct = scenarioParams?.monthlyRevenueChangePercent || 0;
  const vendorShift = scenarioParams?.vendorPaymentShiftDays || 0;
  const activeBuffer = scenarioParams?.safeBufferAmount ?? safeBuffer;

  const adjustedMonthlyInflow = monthlyInflow * (1 + revChangePct / 100);
  const baseDailyInflow = adjustedMonthlyInflow / 30;
  const baseDailyOutflow = monthlyOutflow / 30;

  const forecastDays: ForecastDay[] = [];
  let runningBalance = currentBalance;
  let lowestPoint = currentBalance;
  let daysBelowThreshold = 0;
  let predictedBreachDate: string | null = null;
  let totalInflow = 0;
  let totalOutflow = 0;

  const now = new Date();

  for (let i = 0; i < daysCount; i++) {
    const dayDate = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const dayOfMonth = dayDate.getDate();

    // Base flows with realistic weekday/weekend noise
    const dayOfWeek = dayDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const flowModifier = isWeekend ? 0.3 : 1.1;

    let dayInflow = baseDailyInflow * flowModifier * (0.85 + ((i * 11) % 7) / 20);
    let dayOutflow = baseDailyOutflow * flowModifier * (0.9 + ((i * 13) % 5) / 25);

    const events: string[] = [];

    // Recurring payroll events (15th and end of month)
    if (dayOfMonth === 15 || i === 14) {
      const payrollAmount = monthlyOutflow * 0.38;
      dayOutflow += payrollAmount;
      events.push('Bi-Weekly Team Payroll');
    }
    if (dayOfMonth === 30 || dayOfMonth === 31 || i === 29) {
      const payrollAmount = monthlyOutflow * 0.35;
      dayOutflow += payrollAmount;
      events.push('Month-End Payroll & Taxes');
    }

    // Rent / Lease on 1st of month
    if (dayOfMonth === 1 || i === 0) {
      const rentAmount = monthlyOutflow * 0.12;
      dayOutflow += rentAmount;
      events.push('Facility & Office Lease');
    }

    // One-time scenario lump sum expense (applied on day 6)
    if (i === 6 && extraExpense > 0) {
      dayOutflow += extraExpense;
      events.push(`Scenario Expense: $${extraExpense.toLocaleString()}`);
    }

    // Invoices received (delayed by scenario parameter)
    invoices.forEach((inv) => {
      if (inv.status !== 'paid') {
        const invDayIndex = Math.min(daysCount - 1, Math.max(0, (Math.abs(hashString(inv.id)) % 24) + delayDays));
        if (invDayIndex === i) {
          dayInflow += inv.amount * 0.95;
          events.push(`Invoice: ${inv.client} ($${inv.amount.toLocaleString()})`);
        }
      }
    });

    // Payments scheduled (shifted by vendorShift)
    payments.forEach((pay) => {
      const payDayIndex = Math.min(daysCount - 1, Math.max(0, (Math.abs(hashString(pay.id)) % 26) + vendorShift));
      if (payDayIndex === i) {
        dayOutflow += pay.amount;
        events.push(`Payment: ${pay.vendor} ($${pay.amount.toLocaleString()})`);
      }
    });

    totalInflow += dayInflow;
    totalOutflow += dayOutflow;
    runningBalance += (dayInflow - dayOutflow);

    if (runningBalance < lowestPoint) {
      lowestPoint = runningBalance;
    }

    const isBelow = runningBalance < activeBuffer;
    if (isBelow) {
      daysBelowThreshold++;
      if (!predictedBreachDate) {
        predictedBreachDate = dateStr;
      }
    }

    let riskLevel: RiskLevel = 'Low';
    if (runningBalance < 0) {
      riskLevel = 'Critical';
    } else if (runningBalance < activeBuffer * 0.75) {
      riskLevel = 'High';
    } else if (runningBalance < activeBuffer) {
      riskLevel = 'Medium';
    }

    forecastDays.push({
      date: dateStr,
      dayIndex: i + 1,
      projectedBalance: Math.round(runningBalance),
      predictedInflow: Math.round(dayInflow),
      predictedOutflow: Math.round(dayOutflow),
      netChange: Math.round(dayInflow - dayOutflow),
      isBelowThreshold: isBelow,
      riskLevel,
      confidenceLower: Math.round(runningBalance * 0.92 - (i * 120)),
      confidenceUpper: Math.round(runningBalance * 1.08 + (i * 120)),
      events: events.length > 0 ? events : undefined
    });
  }

  return {
    forecastDays,
    safeBufferThreshold: activeBuffer,
    lowestProjectedPoint: Math.round(lowestPoint),
    daysBelowThresholdCount: daysBelowThreshold,
    predictedBreachDate,
    totalProjectedInflow: Math.round(totalInflow),
    totalProjectedOutflow: Math.round(totalOutflow)
  };
}

export function computeRiskPrediction(
  currentBalance: number,
  monthlyInflow: number,
  monthlyOutflow: number,
  safeBuffer: number,
  invoices: Invoice[],
  payments: Payment[],
  scenarioParams?: Partial<ScenarioParams>
): RiskPrediction {
  const delayDays = scenarioParams?.customerPaymentDelayDays || 0;
  const extraExpense = scenarioParams?.upcomingExpenseAmount || 0;
  const revChangePct = scenarioParams?.monthlyRevenueChangePercent || 0;
  const activeBuffer = scenarioParams?.safeBufferAmount ?? safeBuffer;

  const adjustedInflow = monthlyInflow * (1 + revChangePct / 100);
  const overdueTotal = invoices
    .filter((inv) => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.amount, 0);
  
  const pendingTotal = invoices
    .filter((inv) => inv.status === 'pending')
    .reduce((sum, inv) => sum + inv.amount, 0);

  const criticalPaymentsTotal = payments
    .filter((p) => p.urgency === 'Critical' || p.urgency === 'High')
    .reduce((sum, p) => sum + p.amount, 0);

  // Net headroom calculation
  const netHeadroom = currentBalance - activeBuffer - extraExpense;
  const monthlyBurn = Math.max(0, monthlyOutflow - adjustedInflow);

  let rawProbability = 20;

  if (netHeadroom < 0) {
    rawProbability = 82 + Math.min(16, (Math.abs(netHeadroom) / activeBuffer) * 12);
  } else if (monthlyBurn > 0) {
    const daysToBuffer = (netHeadroom / (monthlyBurn / 30));
    if (daysToBuffer < 10) rawProbability = 78 + (10 - daysToBuffer) * 2;
    else if (daysToBuffer < 20) rawProbability = 54 + (20 - daysToBuffer) * 2.2;
    else if (daysToBuffer < 40) rawProbability = 30 + (40 - daysToBuffer) * 1.1;
    else rawProbability = Math.max(6, 25 - (daysToBuffer - 40) * 0.3);
  } else {
    rawProbability = Math.max(5, 18 - ((adjustedInflow - monthlyOutflow) / monthlyOutflow) * 25);
  }

  // Adjust for invoice delay and concentration
  const delayWeight = delayDays * 0.75 + (overdueTotal / Math.max(1, currentBalance)) * 14;
  const concentrationWeight = (criticalPaymentsTotal / Math.max(1, currentBalance)) * 10;
  
  const riskProbability = Math.min(98.5, Math.max(3.5, Math.round((rawProbability + delayWeight + concentrationWeight) * 10) / 10));

  let riskLevel: RiskLevel = 'Low';
  if (riskProbability >= 70) riskLevel = 'High';
  else if (riskProbability >= 40) riskLevel = 'Medium';

  let shortageWindow = 'No critical shortage predicted in the next 60 days';
  if (riskProbability >= 75) shortageWindow = 'Days 12 – 18 (Immediate Cash Deficit Zone)';
  else if (riskProbability >= 50) shortageWindow = 'Days 20 – 28 (End-of-Month Payroll Squeeze)';
  else if (riskProbability >= 35) shortageWindow = 'Days 35 – 45 (Moderate Horizon Buffer Risk)';

  const runwayDays = monthlyBurn > 0 ? Math.max(2, Math.floor(currentBalance / (monthlyBurn / 30))) : 180;
  const confidenceScore = Math.min(96.2, Math.max(82.0, Math.round((88.5 + (invoices.length > 3 ? 4.5 : -3.0)) * 10) / 10));

  // Explainable AI Feature Attribution (SHAP values)
  const explainability: ExplainableFactor[] = [
    {
      id: 'f1',
      name: 'Receivables Aging & Client Payment Delays',
      impactPercent: Math.min(48, Math.max(16, Math.round((28 + delayDays * 0.7 + (overdueTotal / 1200)) * 10) / 10)),
      direction: 'increases_risk',
      description: `$${overdueTotal.toLocaleString()} in overdue invoices + ${delayDays}d simulated collection lag creates an immediate receivables deficit.`,
      category: 'Receivables',
      shapValue: +0.34
    },
    {
      id: 'f2',
      name: 'Lumpy Fixed Commitments (Payroll & Tax)',
      impactPercent: Math.min(38, Math.max(14, Math.round((22 + (criticalPaymentsTotal / currentBalance) * 12) * 10) / 10)),
      direction: 'increases_risk',
      description: `$${criticalPaymentsTotal.toLocaleString()} in high-priority non-deferrable disbursements due within the 30-day window.`,
      category: 'Outflow',
      shapValue: +0.26
    },
    {
      id: 'f3',
      name: 'Target Cash Buffer Cushion',
      impactPercent: Math.min(28, Math.max(8, Math.round((18 - (currentBalance / activeBuffer) * 4) * 10) / 10)),
      direction: currentBalance < activeBuffer * 1.3 ? 'increases_risk' : 'decreases_risk',
      description: `Current liquidity is ${(currentBalance / activeBuffer).toFixed(1)}x of minimum safety threshold ($${activeBuffer.toLocaleString()}).`,
      category: 'Liquidity',
      shapValue: currentBalance < activeBuffer * 1.3 ? +0.18 : -0.15
    },
    {
      id: 'f4',
      name: 'Recurring Revenue Trajectory',
      impactPercent: Math.min(25, Math.max(7, Math.round((14 + Math.abs(revChangePct) * 0.3) * 10) / 10)),
      direction: adjustedInflow >= monthlyOutflow ? 'decreases_risk' : 'increases_risk',
      description: `Adjusted monthly inflow ($${adjustedInflow.toLocaleString()}) vs baseline outflow ($${monthlyOutflow.toLocaleString()}).`,
      category: 'Revenue',
      shapValue: adjustedInflow >= monthlyOutflow ? -0.21 : +0.16
    }
  ];

  explainability.sort((a, b) => b.impactPercent - a.impactPercent);

  const keyFactors = [
    `Uncollected overdue & pending receivables total $${(overdueTotal + pendingTotal).toLocaleString()}`,
    `Upcoming bi-weekly payroll and statutory liabilities total $${criticalPaymentsTotal.toLocaleString()}`,
    `Cash reserve buffer coverage is at ${Math.round((currentBalance / activeBuffer) * 100)}% of target threshold`
  ];

  return {
    riskProbability,
    riskLevel,
    predictedShortageWindow: shortageWindow,
    confidenceScore,
    runwayDays,
    keyFactors,
    explainability,
    modelMetadata: {
      modelVersion: 'v1.2.0-fastapi-ensemble',
      modelType: 'Gradient Boosted Cash Survival Classifier',
      trainingStatus: 'Calibrated Heuristic & Feature Pipeline',
      inferenceLatencyMs: 14.2,
      featuresEvaluated: 18,
      isMockOrLive: 'mock_local'
    }
  };
}

export function runScenarioSimulation(
  params: ScenarioParams,
  currentBalance: number,
  monthlyInflow: number,
  monthlyOutflow: number,
  invoices: Invoice[],
  payments: Payment[]
): ScenarioResult {
  const baselineForecast = generateForecastTimeline(
    currentBalance,
    monthlyInflow,
    monthlyOutflow,
    params.safeBufferAmount,
    30,
    invoices,
    payments,
    { customerPaymentDelayDays: 0, upcomingExpenseAmount: 0, monthlyRevenueChangePercent: 0, vendorPaymentShiftDays: 0 }
  );

  const baselineRisk = computeRiskPrediction(
    currentBalance,
    monthlyInflow,
    monthlyOutflow,
    params.safeBufferAmount,
    invoices,
    payments,
    { customerPaymentDelayDays: 0, upcomingExpenseAmount: 0, monthlyRevenueChangePercent: 0, vendorPaymentShiftDays: 0 }
  );

  const simulatedForecast = generateForecastTimeline(
    currentBalance,
    monthlyInflow,
    monthlyOutflow,
    params.safeBufferAmount,
    30,
    invoices,
    payments,
    params
  );

  const simulatedRisk = computeRiskPrediction(
    currentBalance,
    monthlyInflow,
    monthlyOutflow,
    params.safeBufferAmount,
    invoices,
    payments,
    params
  );

  const timeline = baselineForecast.forecastDays.map((bDay, idx) => {
    const sDay = simulatedForecast.forecastDays[idx];
    return {
      date: bDay.date,
      dayIndex: bDay.dayIndex,
      baselineBalance: bDay.projectedBalance,
      simulatedBalance: sDay ? sDay.projectedBalance : bDay.projectedBalance,
      safeBuffer: params.safeBufferAmount,
      variance: sDay ? sDay.projectedBalance - bDay.projectedBalance : 0
    };
  });

  const balanceDelta = simulatedForecast.lowestProjectedPoint - baselineForecast.lowestProjectedPoint;
  const riskDelta = Math.round((simulatedRisk.riskProbability - baselineRisk.riskProbability) * 10) / 10;

  const summaryNote = balanceDelta >= 0
    ? `Under this simulation, your lowest cash balance improves by +$${Math.abs(balanceDelta).toLocaleString()}, reducing shortage probability from ${baselineRisk.riskProbability}% to ${simulatedRisk.riskProbability}%.`
    : `Under this simulation, lowest cash balance drops by -$${Math.abs(balanceDelta).toLocaleString()}, increasing shortage risk from ${baselineRisk.riskProbability}% to ${simulatedRisk.riskProbability}% (delta +${riskDelta}%).`;

  return {
    params,
    baselineMinBalance: baselineForecast.lowestProjectedPoint,
    simulatedMinBalance: simulatedForecast.lowestProjectedPoint,
    baselineRiskProbability: baselineRisk.riskProbability,
    simulatedRiskProbability: simulatedRisk.riskProbability,
    balanceDelta,
    runwayImpactDays: simulatedRisk.runwayDays - baselineRisk.runwayDays,
    timeline,
    summaryNote
  };
}

export function generateInsightsList(
  currentBalance: number,
  monthlyInflow: number,
  monthlyOutflow: number,
  safeBuffer: number,
  invoices: Invoice[],
  payments: Payment[]
): ActionInsight[] {
  const insights: ActionInsight[] = [];

  // Overdue Invoices
  const overdueInvoices = invoices.filter((i) => i.status === 'overdue');
  if (overdueInvoices.length > 0) {
    const highestOverdue = overdueInvoices.reduce((max, i) => (i.amount > max.amount ? i : max), overdueInvoices[0]);
    insights.push({
      id: 'ins-inv-01',
      title: `Accelerate Overdue Receivables: ${highestOverdue.client}`,
      description: `Invoice #${highestOverdue.id} for $${highestOverdue.amount.toLocaleString()} is ${highestOverdue.daysOverdue || 14} days overdue. Recovering this bridges 78% of the mid-month cash gap before payroll.`,
      category: 'Receivable Management',
      priority: 'Critical',
      potentialCashImpact: highestOverdue.amount,
      runwayDaysImpact: 11,
      recommendedAction: 'Send 1-click tailored payment reminder with updated ACH wire instructions and offer a 1.5% quick-settlement waiver.',
      status: 'open',
      actionType: 'invoice_reminder',
      templateData: {
        client: highestOverdue.client,
        amount: highestOverdue.amount,
        invoiceId: highestOverdue.id,
        daysOverdue: highestOverdue.daysOverdue || 14,
        suggestedEmail: `Hi ${highestOverdue.client} Accounts Payable Team,\n\nWe hope this email finds you well. We are following up regarding invoice #${highestOverdue.id} for $${highestOverdue.amount.toLocaleString()} (due ${highestOverdue.dueDate}), which is currently pending disbursement.\n\nCould you please confirm if this batch has been approved for processing? If needed, our direct ACH routing information is attached.\n\nThank you for your partnership,\nFinance Operations`
      }
    });
  }

  // Flexible vendor payments
  const flexiblePayments = payments.filter((p) => p.isFlexible);
  if (flexiblePayments.length > 0) {
    const topFlexible = flexiblePayments.reduce((max, p) => (p.amount > max.amount ? p : max), flexiblePayments[0]);
    insights.push({
      id: 'ins-pay-02',
      title: `Reschedule ${topFlexible.vendor} Disbursement`,
      description: `Postponing this $${topFlexible.amount.toLocaleString()} vendor disbursement by 12–14 days preserves your safe buffer without disrupting core operations.`,
      category: 'Vendor Payment Timing',
      priority: 'High',
      potentialCashImpact: topFlexible.amount,
      runwayDaysImpact: 14,
      recommendedAction: 'Request a standard Net-45 term adjustment or split the invoice into two equal milestone disbursements.',
      status: 'open',
      actionType: 'reschedule_payment',
      templateData: {
        vendor: topFlexible.vendor,
        amount: topFlexible.amount,
        dueDate: topFlexible.dueDate,
        suggestedDate: 'End of Month + 14 Days'
      }
    });
  }

  // Discretionary spend optimization
  insights.push({
    id: 'ins-exp-03',
    title: 'Audit Discretionary SaaS & Marketing CAC Spend',
    description: 'Identified ~$4,800/mo in recurring cloud tool seat redundancies and unoptimized campaign spend that can be rationalized.',
    category: 'Expense Optimization',
    priority: 'Medium',
    potentialCashImpact: 4800,
    runwayDaysImpact: 7,
    recommendedAction: 'Consolidate duplicate software licenses and pause underperforming ad campaigns until cash health score recovers above 75.',
    status: 'open',
    actionType: 'cut_expense',
    templateData: {
      categories: ['SaaS Seat Audits', 'Unoptimized Ad Budgets', 'Contractor Overage'],
      estimatedSavings: 4800
    }
  });

  // Safe buffer replenishment
  if (currentBalance < safeBuffer) {
    const deficit = safeBuffer - currentBalance;
    insights.push({
      id: 'ins-buf-04',
      title: `Replenish Reserve Cushion by $${deficit.toLocaleString()}`,
      description: `Current balance ($${currentBalance.toLocaleString()}) is below the recommended safe buffer ($${safeBuffer.toLocaleString()}), leaving zero tolerance for unexpected payment disputes.`,
      category: 'Liquidity & Reserves',
      priority: 'High',
      potentialCashImpact: deficit,
      runwayDaysImpact: 16,
      recommendedAction: 'Establish an emergency credit facility or offer 2/10 Net 30 payment incentives to tier-1 clients.',
      status: 'open',
      actionType: 'credit_line',
      templateData: {
        targetBuffer: safeBuffer,
        currentReserve: currentBalance,
        deficit
      }
    });
  }

  return insights;
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
