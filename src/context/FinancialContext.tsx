import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  FinancialDataset,
  CashFlowSummary,
  ForecastData,
  RiskPrediction,
  ScenarioParams,
  ScenarioResult,
  ActionInsight,
  Invoice,
  Payment,
  PaymentRecord,
  CreatePaymentInput,
  PaymentImpactMetrics,
  Transaction,
  CurrencyCode
} from '../types/financial';
import { BUSINESS_DATASETS } from '../data/mockFinancialData';
import { apiClient, BackendStatus } from '../services/apiClient';
import { getClientPaymentProvider, loadRazorpayCheckoutScript } from '../services/paymentProvider';
import { calculateSummary, generateForecastTimeline, computeRiskPrediction, runScenarioSimulation, generateInsightsList } from '../utils/financialCalculations';

export type ActivePage = 'dashboard' | 'transactions' | 'payments' | 'forecast' | 'insights' | 'risk' | 'simulator';

export interface PaymentConfig {
  active_provider: string;
  provider_name: string;
  is_configured: boolean;
  key_id: string | null;
  demo_available: boolean;
  message: string;
}

interface FinancialContextType {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  currentDatasetKey: string;
  setDatasetKey: (key: string) => void;
  dataset: FinancialDataset;
  allDatasets: Record<string, FinancialDataset>;
  
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  formatCurrency: (val: number, compact?: boolean) => string;
  
  summary: CashFlowSummary;
  forecast: ForecastData;
  forecastRangeDays: number;
  setForecastRangeDays: (days: number) => void;
  riskPrediction: RiskPrediction;
  insights: ActionInsight[];
  
  scenarioParams: ScenarioParams;
  setScenarioParams: React.Dispatch<React.SetStateAction<ScenarioParams>>;
  scenarioResult: ScenarioResult;
  resetScenarioParams: () => void;
  
  // Backend & ML Status
  backendStatus: BackendStatus;
  refreshBackendStatus: () => Promise<void>;
  
  // Payment Intelligence
  payments: PaymentRecord[];
  createPayment: (payment: CreatePaymentInput) => Promise<void>;
  processPayment: (paymentId: string, simulateFailure?: boolean, provider?: string) => Promise<void>;
  processRazorpayPayment: (paymentId: string) => Promise<void>;
  paymentConfig: PaymentConfig | null;
  activePaymentMode: 'demo' | 'razorpay';
  setActivePaymentMode: (mode: 'demo' | 'razorpay') => void;
  refreshPaymentConfig: () => Promise<void>;
  activePaymentImpact: PaymentImpactMetrics | null;

  setActivePaymentImpact: (impact: PaymentImpactMetrics | null) => void;
  isCreatePaymentModalOpen: boolean;
  setIsCreatePaymentModalOpen: (open: boolean) => void;
  isPaymentImpactModalOpen: boolean;
  setIsPaymentImpactModalOpen: (open: boolean) => void;

  // Modals & Actions
  isAddModalOpen: boolean;
  setIsAddModalOpen: (open: boolean) => void;
  isInvoiceModalOpen: boolean;
  setIsInvoiceModalOpen: (open: boolean) => void;
  activeInvoiceForModal: Invoice | null;
  openInvoiceReminderModal: (invoice: Invoice) => void;
  isExportModalOpen: boolean;
  setIsExportModalOpen: (open: boolean) => void;
  
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addInvoice: (invoice: Omit<Invoice, 'id'>) => void;
  addPayment: (payment: Partial<PaymentRecord> & { amount: number }) => void;
  updateSafeBuffer: (newBuffer: number) => void;
  updateInvoiceStatus: (id: string, status: 'paid' | 'pending' | 'overdue') => void;
  applyInsightAction: (insightId: string) => void;
  dismissInsightAction: (insightId: string) => void;
  
  isLoading: boolean;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}


const DEFAULT_SCENARIO_PARAMS: ScenarioParams = {
  extraSpendingThisWeek: 0,
  emergencyFundingAmount: 0,
  newRecurringExpenseAmount: 0,
  customerPaymentDelayDays: 0,
  foodExpenseReductionPercent: 0,
  dailyDiscretionaryTrim: 0,
  monthlyRevenueChangePercent: 0,
  vendorPaymentShiftDays: 0,
  safeBufferAmount: 15000
};

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<ActivePage>('dashboard');
  const [currentDatasetKey, setCurrentDatasetKey] = useState<string>('critical_shortage');
  const [datasets, setDatasets] = useState<Record<string, FinancialDataset>>(BUSINESS_DATASETS);
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [forecastRangeDays, setForecastRangeDays] = useState<number>(30);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [backendStatus, setBackendStatus] = useState<BackendStatus>(apiClient.getStatus());
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [activeInvoiceForModal, setActiveInvoiceForModal] = useState<Invoice | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCreatePaymentModalOpen, setIsCreatePaymentModalOpen] = useState(false);
  const [isPaymentImpactModalOpen, setIsPaymentImpactModalOpen] = useState(false);
  const [activePaymentImpact, setActivePaymentImpact] = useState<PaymentImpactMetrics | null>(null);


  const currentDataset = datasets[currentDatasetKey] || datasets.critical_shortage;

  const [scenarioParams, setScenarioParams] = useState<ScenarioParams>({
    ...DEFAULT_SCENARIO_PARAMS,
    safeBufferAmount: currentDataset.safeBufferThreshold
  });

  // When dataset changes, sync safe buffer default
  useEffect(() => {
    setScenarioParams(prev => ({
      ...prev,
      safeBufferAmount: currentDataset.safeBufferThreshold
    }));
  }, [currentDatasetKey, currentDataset.safeBufferThreshold]);

  // Insights status management
  const [insightsState, setInsightsState] = useState<Record<string, 'open' | 'applied' | 'dismissed'>>({});

  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig | null>(null);
  const [activePaymentMode, setActivePaymentMode] = useState<'demo' | 'razorpay'>('demo');

  const refreshBackendStatus = async () => {
    const status = await apiClient.checkBackendHealth();
    setBackendStatus(status);
  };

  const refreshPaymentConfig = async () => {
    const cfg = await apiClient.getPaymentConfig();
    if (cfg) {
      setPaymentConfig(cfg);
      if (cfg.active_provider === 'razorpay' && cfg.is_configured) {
        setActivePaymentMode('razorpay');
      }
    }
  };

  useEffect(() => {
    refreshBackendStatus();
    refreshPaymentConfig();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const formatCurrency = (val: number, compact: boolean = false): string => {
    const symbol = currency === 'INR' ? '₹' : '$';
    const rate = currency === 'INR' ? 1.0 : 0.012; // conversion multiplier
    const converted = val * rate;

    if (compact) {
      if (Math.abs(converted) >= 10000000 && currency === 'INR') {
        return `${symbol}${(converted / 10000000).toFixed(1)}Cr`;
      }
      if (Math.abs(converted) >= 100000 && currency === 'INR') {
        return `${symbol}${(converted / 100000).toFixed(1)}L`;
      }
      if (Math.abs(converted) >= 1000) {
        return `${symbol}${(converted / 1000).toFixed(0)}k`;
      }
    }

    return `${symbol}${Math.round(converted).toLocaleString()}`;
  };

  // Calculations synced to current dataset and active forecast range
  const [summary, setSummary] = useState<CashFlowSummary>(() =>
    calculateSummary(
      currentDataset.currentBalance,
      currentDataset.monthlyInflow,
      currentDataset.monthlyOutflow,
      currentDataset.safeBufferThreshold,
      currentDataset.transactions
    )
  );

  const [forecast, setForecast] = useState<ForecastData>(() =>
    generateForecastTimeline(
      currentDataset.currentBalance,
      currentDataset.monthlyInflow,
      currentDataset.monthlyOutflow,
      currentDataset.safeBufferThreshold,
      30,
      currentDataset.invoices,
      currentDataset.payments
    )
  );

  const [riskPrediction, setRiskPrediction] = useState<RiskPrediction>(() =>
    computeRiskPrediction(
      currentDataset.currentBalance,
      currentDataset.monthlyInflow,
      currentDataset.monthlyOutflow,
      currentDataset.safeBufferThreshold,
      currentDataset.invoices,
      currentDataset.payments
    )
  );

  const [scenarioResult, setScenarioResult] = useState<ScenarioResult>(() =>
    runScenarioSimulation(
      scenarioParams,
      currentDataset.currentBalance,
      currentDataset.monthlyInflow,
      currentDataset.monthlyOutflow,
      currentDataset.invoices,
      currentDataset.payments,
      currentDataset.transactions
    )
  );

  const [rawInsights, setRawInsights] = useState<ActionInsight[]>(() =>
    generateInsightsList(
      currentDataset.currentBalance,
      currentDataset.monthlyInflow,
      currentDataset.monthlyOutflow,
      currentDataset.safeBufferThreshold,
      currentDataset.invoices,
      currentDataset.payments,
      currentDataset.transactions
    )
  );

  // Recalculate everything whenever dataset, scenarioParams, or forecast range changes
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);

    const fetchData = async () => {
      try {
        const health = await apiClient.checkBackendHealth();
        setBackendStatus(health);

        let activeDataset = currentDataset;
        if (health.connected) {
          const backendDataset = await apiClient.fetchBackendScenarioData(currentDatasetKey);
          if (backendDataset) {
            activeDataset = backendDataset;
            if (!isCancelled) {
              setDatasets(prev => ({
                ...prev,
                [currentDatasetKey]: backendDataset
              }));
            }
          }
        }

        const [newSummary, newForecast, newRisk, newSim, newIns] = await Promise.all([
          apiClient.getSummary(activeDataset),
          apiClient.getForecast(activeDataset, forecastRangeDays, scenarioParams),
          apiClient.getRiskPrediction(activeDataset, scenarioParams),
          apiClient.simulateScenario(scenarioParams, activeDataset),
          apiClient.getInsights(activeDataset)
        ]);

        if (!isCancelled) {
          setSummary(newSummary);
          setForecast(newForecast);
          setRiskPrediction(newRisk);
          setScenarioResult(newSim);
          setRawInsights(newIns);
          setIsLoading(false);
        }
      } catch (err) {
        console.warn('API error, executing synchronous calculation fallback:', err);
        if (!isCancelled) {
          setSummary(calculateSummary(currentDataset.currentBalance, currentDataset.monthlyInflow, currentDataset.monthlyOutflow, currentDataset.safeBufferThreshold, currentDataset.transactions));
          setForecast(generateForecastTimeline(currentDataset.currentBalance, currentDataset.monthlyInflow, currentDataset.monthlyOutflow, currentDataset.safeBufferThreshold, forecastRangeDays, currentDataset.invoices, currentDataset.payments, scenarioParams));
          setRiskPrediction(computeRiskPrediction(currentDataset.currentBalance, currentDataset.monthlyInflow, currentDataset.monthlyOutflow, currentDataset.safeBufferThreshold, currentDataset.invoices, currentDataset.payments, scenarioParams));
          setScenarioResult(runScenarioSimulation(scenarioParams, currentDataset.currentBalance, currentDataset.monthlyInflow, currentDataset.monthlyOutflow, currentDataset.invoices, currentDataset.payments, currentDataset.transactions));
          setRawInsights(generateInsightsList(currentDataset.currentBalance, currentDataset.monthlyInflow, currentDataset.monthlyOutflow, currentDataset.safeBufferThreshold, currentDataset.invoices, currentDataset.payments, currentDataset.transactions));
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [currentDatasetKey, forecastRangeDays, scenarioParams]);

  // Merged insights with applied status
  const insights = useMemo(() => {
    return rawInsights.map(item => ({
      ...item,
      status: insightsState[item.id] || item.status
    }));
  }, [rawInsights, insightsState]);

  const addTransaction = async (txData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now().toString().slice(-4)}`
    };

    if (backendStatus.connected) {
      try {
        await apiClient.recordTransaction(txData, currentDatasetKey);
      } catch (err) {
        console.warn('Backend sync failed, continuing locally:', err);
      }
    }

    setDatasets(prev => {
      const active = prev[currentDatasetKey];
      const newBal = txData.type === 'income' ? active.currentBalance + txData.amount : active.currentBalance - txData.amount;
      return {
        ...prev,
        [currentDatasetKey]: {
          ...active,
          currentBalance: Math.max(0, newBal),
          transactions: [newTx, ...active.transactions]
        }
      };
    });

    showToast(`Transaction recorded: ${newTx.title} • Forecast & balance updated`);
  };

  const deleteTransaction = (id: string) => {
    setDatasets(prev => {
      const active = prev[currentDatasetKey];
      return {
        ...prev,
        [currentDatasetKey]: {
          ...active,
          transactions: active.transactions.filter(t => t.id !== id)
        }
      };
    });
    showToast('Transaction removed • Ledger & cash trajectory recalculated');
  };

  const addInvoice = (invoiceData: Omit<Invoice, 'id'>) => {
    const newInvoice: Invoice = {
      ...invoiceData,
      id: `INV-${Date.now().toString().slice(-4)}`
    };

    setDatasets(prev => {
      const active = prev[currentDatasetKey];
      return {
        ...prev,
        [currentDatasetKey]: {
          ...active,
          invoices: [newInvoice, ...active.invoices]
        }
      };
    });

    showToast(`Invoice #${newInvoice.id} logged • Receivables pipeline updated`);
  };

  const addPayment = (paymentData: Partial<PaymentRecord> & { amount: number }) => {
    const counterparty = paymentData.counterparty || paymentData.vendor || 'Scheduled Payee';
    const scheduledDate = paymentData.scheduledDate || paymentData.dueDate || new Date().toISOString().split('T')[0];
    const newPayment: Payment = {
      id: `PAY-${Date.now().toString().slice(-4)}`,
      counterparty,
      vendor: counterparty,
      description: paymentData.description || paymentData.notes || `Scheduled payment for ${counterparty}`,
      amount: paymentData.amount,
      direction: paymentData.direction || 'outgoing',
      category: paymentData.category || 'Vendor',
      status: paymentData.status || 'pending',
      scheduledDate,
      dueDate: scheduledDate,
      isRecurring: paymentData.isRecurring ?? true,
      isFlexible: paymentData.isFlexible ?? false,
      urgency: paymentData.urgency || 'Medium',
      notes: paymentData.notes,
      provider: paymentData.provider || 'demo',
      referenceId: paymentData.referenceId || null,
      transactionId: paymentData.transactionId || null,
      createdAt: paymentData.createdAt || new Date().toISOString().replace('T', ' ').slice(0, 19),
      processedAt: paymentData.processedAt || null
    };

    setDatasets(prev => {
      const active = prev[currentDatasetKey];
      return {
        ...prev,
        [currentDatasetKey]: {
          ...active,
          payments: [newPayment, ...(active.payments || [])]
        }
      };
    });

    showToast(`Payment scheduled for ${newPayment.counterparty}!`);
  };


  const createPayment = async (paymentData: CreatePaymentInput) => {
    let created: PaymentRecord | null = null;
    if (backendStatus.connected) {
      created = await apiClient.createPayment(paymentData, currentDatasetKey);
    }
    if (!created) {
      const now = new Date();
      const scheduledDate = paymentData.scheduledDate || paymentData.dueDate || now.toISOString().split('T')[0];
      created = {
        id: `PAY-${Date.now().toString().slice(-6)}`,
        counterparty: paymentData.counterparty,
        vendor: paymentData.vendor || paymentData.counterparty,
        description: paymentData.description,
        amount: paymentData.amount,
        direction: paymentData.direction,
        category: paymentData.category,
        status: 'pending',
        scheduledDate,
        dueDate: scheduledDate,
        invoiceReference: paymentData.invoiceReference,
        isRecurring: paymentData.isRecurring,
        isFlexible: paymentData.isFlexible ?? false,
        urgency: paymentData.urgency || 'Medium',
        notes: paymentData.notes || paymentData.description,
        provider: paymentData.provider || 'demo',
        referenceId: null,
        transactionId: null,
        createdAt: now.toISOString().replace('T', ' ').slice(0, 19),
        processedAt: null
      };
    }


    setDatasets((prev) => {
      const active = prev[currentDatasetKey];
      return {
        ...prev,
        [currentDatasetKey]: {
          ...active,
          payments: [created!, ...(active.payments || [])]
        }
      };
    });

    showToast(`Payment scheduled for ${created.counterparty} (${formatCurrency(created.amount)})`);
  };

  const processPayment = async (
    paymentId: string,
    simulateFailure: boolean = false,
    provider: string = 'demo'
  ) => {
    setIsLoading(true);

    // 1. Try Live FastAPI backend first
    if (backendStatus.connected) {
      try {
        const resp = await apiClient.processPayment(paymentId, currentDatasetKey, simulateFailure, provider);
        if (resp) {
          setDatasets((prev) => {
            const active = prev[currentDatasetKey];
            const updatedPayments = (active.payments || []).map((p) =>
              p.id === paymentId ? resp.payment : p
            );
            const updatedTransactions = resp.transaction && !resp.already_processed
              ? [resp.transaction, ...active.transactions]
              : active.transactions;
            const updatedBalance = resp.impact?.after?.current_balance ?? active.currentBalance;

            let updatedInvoices = active.invoices;
            const invRef = resp.payment?.invoiceReference || resp.payment?.invoice_reference;
            if (invRef) {
              updatedInvoices = (active.invoices || []).map((inv) =>
                inv.id === invRef ? { ...inv, status: 'paid' as const } : inv
              );
            }

            return {
              ...prev,
              [currentDatasetKey]: {
                ...active,
                currentBalance: updatedBalance,
                payments: updatedPayments,
                transactions: updatedTransactions,
                invoices: updatedInvoices
              }
            };
          });


          if (resp.impact) {
            setActivePaymentImpact({
              before: {
                currentBalance: resp.impact.before.current_balance,
                projectedLowestBalance: resp.impact.before.projected_lowest_balance,
                shortageProbabilityPct: resp.impact.before.shortage_probability_pct,
                safetyScore: resp.impact.before.safety_score,
                runwayDays: resp.impact.before.runway_days,
                riskLevel: resp.impact.before.risk_level
              },
              after: {
                currentBalance: resp.impact.after.current_balance,
                projectedLowestBalance: resp.impact.after.projected_lowest_balance,
                shortageProbabilityPct: resp.impact.after.shortage_probability_pct,
                safetyScore: resp.impact.after.safety_score,
                runwayDays: resp.impact.after.runway_days,
                riskLevel: resp.impact.after.risk_level
              },
              delta: {
                balance: resp.impact.delta.balance,
                projectedLowestBalance: resp.impact.delta.projected_lowest_balance,
                shortageProbabilityPct: resp.impact.delta.shortage_probability_pct,
                safetyScore: resp.impact.delta.safety_score,
                runwayDays: resp.impact.delta.runway_days
              },
              message: resp.impact.message,
              payment: resp.payment
            });
            setIsPaymentImpactModalOpen(true);
          }

          setIsLoading(false);
          showToast(resp.impact?.message || 'Payment processed successfully.');
          return;
        }
      } catch (err) {
        console.warn('Backend process payment error, continuing with local engine:', err);
      }
    }

    // 2. Standalone / Local fallback execution
    const active = currentDataset;
    const payment = (active.payments || []).find((p) => p.id === paymentId);
    if (!payment) {
      setIsLoading(false);
      showToast('Payment not found.');
      return;
    }

    // Idempotency / Duplicate protection check
    if (payment.status === 'paid') {
      setIsLoading(false);
      showToast(`Payment ${paymentId} was already processed. Duplicate processing prevented.`);
      return;
    }

    // Before snapshot
    const beforeSum = summary;
    const beforeFore = forecast;
    const beforeRisk = riskPrediction;
    const beforeSnapshot = {
      currentBalance: active.currentBalance,
      projectedLowestBalance: beforeFore.lowestProjectedPoint,
      shortageProbabilityPct: beforeRisk.riskProbability,
      safetyScore: beforeSum.cashHealthScore,
      runwayDays: beforeSum.runwayDays,
      riskLevel: beforeRisk.riskLevel
    };

    const clientProvider = getClientPaymentProvider(provider);
    const result = await clientProvider.processPayment(payment, simulateFailure);
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timestampStr = now.toISOString().replace('T', ' ').slice(0, 19);

    let updatedTx: Transaction | null = null;
    let newBal = active.currentBalance;

    const updatedPayment: PaymentRecord = {
      ...payment,
      status: result.status as any,
      referenceId: result.referenceId,
      processedAt: timestampStr,
      provider: clientProvider.providerId
    };

    if (result.success) {
      const txId = `tx-pay-${payment.id}`;
      updatedPayment.transactionId = txId;
      const isIncoming = payment.direction === 'incoming';

      updatedTx = {
        id: txId,
        date: dateStr,
        title: `Payment: ${payment.counterparty}`,
        category: (payment.category as any) || (isIncoming ? 'Income' : 'Equipment & Capex'),
        type: isIncoming ? 'income' : 'expense',
        amount: payment.amount,
        isRecurring: payment.isRecurring,
        isDiscretionary: false,
        merchant: payment.counterparty,
        notes: `Settled via ${clientProvider.displayName} [Ref: ${result.referenceId}]`
      };

      newBal = isIncoming
        ? active.currentBalance + payment.amount
        : Math.max(0, active.currentBalance - payment.amount);
    }

    // Update datasets
    const newPayments = (active.payments || []).map((p) => (p.id === paymentId ? updatedPayment : p));
    const newTransactions = updatedTx ? [updatedTx, ...active.transactions] : active.transactions;
    let newInvoices = active.invoices;
    if (result.success && payment.invoiceReference) {
      newInvoices = (active.invoices || []).map((inv) =>
        inv.id === payment.invoiceReference ? { ...inv, status: 'paid' as const } : inv
      );
    }

    setDatasets((prev) => ({
      ...prev,
      [currentDatasetKey]: {
        ...active,
        currentBalance: newBal,
        payments: newPayments,
        transactions: newTransactions,
        invoices: newInvoices
      }
    }));

    // Calculate after metrics synchronously
    const afterSum = calculateSummary(newBal, active.monthlyInflow, active.monthlyOutflow, active.safeBufferThreshold, newTransactions);
    const afterFore = generateForecastTimeline(newBal, active.monthlyInflow, active.monthlyOutflow, active.safeBufferThreshold, forecastRangeDays, newInvoices, newPayments);
    const afterRisk = computeRiskPrediction(newBal, active.monthlyInflow, active.monthlyOutflow, active.safeBufferThreshold, newInvoices, newPayments);


    const afterSnapshot = {
      currentBalance: newBal,
      projectedLowestBalance: afterFore.lowestProjectedPoint,
      shortageProbabilityPct: afterRisk.riskProbability,
      safetyScore: afterSum.cashHealthScore,
      runwayDays: afterSum.runwayDays,
      riskLevel: afterRisk.riskLevel
    };

    const delta = {
      balance: Math.round(afterSnapshot.currentBalance - beforeSnapshot.currentBalance),
      projectedLowestBalance: Math.round(afterSnapshot.projectedLowestBalance - beforeSnapshot.projectedLowestBalance),
      shortageProbabilityPct: +(afterSnapshot.shortageProbabilityPct - beforeSnapshot.shortageProbabilityPct).toFixed(1),
      safetyScore: afterSnapshot.safetyScore - beforeSnapshot.safetyScore,
      runwayDays: afterSnapshot.runwayDays - beforeSnapshot.runwayDays
    };

    const impactMetrics: PaymentImpactMetrics = {
      before: beforeSnapshot,
      after: afterSnapshot,
      delta,
      message: result.success
        ? `Payment of ${formatCurrency(payment.amount)} to ${payment.counterparty} successfully processed in Demo Mode.`
        : `Payment simulation failed: ${result.message}`,
      payment: updatedPayment
    };

    setActivePaymentImpact(impactMetrics);
    setIsPaymentImpactModalOpen(true);
    setIsLoading(false);
    showToast(impactMetrics.message);
  };

  const processRazorpayPayment = async (paymentId: string) => {
    setIsLoading(true);

    if (!backendStatus.connected) {
      setIsLoading(false);
      showToast('Payment gateway unavailable. Demo mode is still available.');
      return;
    }

    try {
      // 1. Create order on backend
      const order = await apiClient.createRazorpayOrder(paymentId, currentDatasetKey);
      if (!order || !order.order_id) {
        throw new Error('Payment gateway unavailable. Demo mode is still available.');
      }

      // 2. Dynamically load Razorpay SDK
      const scriptLoaded = await loadRazorpayCheckoutScript();
      if (!scriptLoaded || !(window as any).Razorpay) {
        throw new Error('Payment gateway unavailable. Demo mode is still available.');
      }

      // 3. Launch Checkout Modal
      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency || 'INR',
        name: 'CashFlow Guardian AI',
        description: order.description || `Settlement for ${order.counterparty}`,
        order_id: order.order_id,
        handler: async (response: any) => {
          try {
            setIsLoading(true);
            const verifiedResp = await apiClient.verifyRazorpayPayment(
              paymentId,
              currentDatasetKey,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              }
            );

            // Update local React state with verified backend response
            const latestBackendDataset = await apiClient.fetchBackendScenarioData(currentDatasetKey);
            setDatasets((prev) => {
              const active = latestBackendDataset || prev[currentDatasetKey];
              const updatedPayments = (active.payments || []).map((p) =>
                p.id === paymentId ? verifiedResp.payment : p
              );
              const updatedTransactions = verifiedResp.transaction && !verifiedResp.already_processed
                ? [verifiedResp.transaction, ...(active.transactions || [])]
                : active.transactions;
              const updatedBalance = verifiedResp.impact?.after?.current_balance ?? active.currentBalance;

              let updatedInvoices = active.invoices;
              const invRef = verifiedResp.payment?.invoiceReference || verifiedResp.payment?.invoice_reference;
              if (invRef) {
                updatedInvoices = (active.invoices || []).map((inv) =>
                  inv.id === invRef ? { ...inv, status: 'paid' as const } : inv
                );
              }

              return {
                ...prev,
                [currentDatasetKey]: {
                  ...active,
                  currentBalance: updatedBalance,
                  payments: updatedPayments,
                  transactions: updatedTransactions,
                  invoices: updatedInvoices
                }
              };
            });

            if (verifiedResp.impact) {
              setActivePaymentImpact({
                before: {
                  currentBalance: verifiedResp.impact.before.current_balance,
                  projectedLowestBalance: verifiedResp.impact.before.projected_lowest_balance,
                  shortageProbabilityPct: verifiedResp.impact.before.shortage_probability_pct,
                  safetyScore: verifiedResp.impact.before.safety_score,
                  runwayDays: verifiedResp.impact.before.runway_days,
                  riskLevel: verifiedResp.impact.before.risk_level
                },
                after: {
                  currentBalance: verifiedResp.impact.after.current_balance,
                  projectedLowestBalance: verifiedResp.impact.after.projected_lowest_balance,
                  shortageProbabilityPct: verifiedResp.impact.after.shortage_probability_pct,
                  safetyScore: verifiedResp.impact.after.safety_score,
                  runwayDays: verifiedResp.impact.after.runway_days,
                  riskLevel: verifiedResp.impact.after.risk_level
                },
                delta: {
                  balance: verifiedResp.impact.delta.balance,
                  projectedLowestBalance: verifiedResp.impact.delta.projected_lowest_balance,
                  shortageProbabilityPct: verifiedResp.impact.delta.shortage_probability_pct,
                  safetyScore: verifiedResp.impact.delta.safety_score,
                  runwayDays: verifiedResp.impact.delta.runway_days
                },
                message: verifiedResp.impact.message,
                payment: verifiedResp.payment
              });
              setIsPaymentImpactModalOpen(true);
            }

            showToast(verifiedResp.impact?.message || 'Razorpay test payment verified and settled.');
          } catch (err: any) {
            console.error('Signature verification error:', err);
            showToast(err.message || 'Signature verification failed.');
          } finally {
            setIsLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            showToast('Razorpay Checkout closed.');
          }
        },
        theme: {
          color: '#0f172a'
        }
      };

      const rzpInstance = new (window as any).Razorpay(options);
      rzpInstance.open();
    } catch (err: any) {
      console.error('Razorpay process error:', err);
      showToast(err.message || 'Payment gateway unavailable. Demo mode is still available.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSafeBuffer = (newBuffer: number) => {
    setDatasets(prev => {
      const active = prev[currentDatasetKey];
      return {
        ...prev,
        [currentDatasetKey]: {
          ...active,
          safeBufferThreshold: newBuffer
        }
      };
    });
    setScenarioParams(prev => ({ ...prev, safeBufferAmount: newBuffer }));
    showToast(`Safe Cash Buffer updated to ${formatCurrency(newBuffer)} • Vulnerability zones recalculated`);
  };

  const updateInvoiceStatus = (id: string, status: 'paid' | 'pending' | 'overdue') => {
    setDatasets(prev => {
      const active = prev[currentDatasetKey];
      return {
        ...prev,
        [currentDatasetKey]: {
          ...active,
          invoices: active.invoices.map(inv => inv.id === id ? { ...inv, status } : inv)
        }
      };
    });
    showToast(`Invoice #${id} marked as ${status.toUpperCase()}`);
  };

  const applyInsightAction = (insightId: string) => {
    setInsightsState(prev => ({ ...prev, [insightId]: 'applied' }));
    showToast('Remedy applied • Inflow/Outflow schedule simulated into forward forecast');
  };

  const dismissInsightAction = (insightId: string) => {
    setInsightsState(prev => ({ ...prev, [insightId]: 'dismissed' }));
    showToast('Insight dismissed.');
  };

  const openInvoiceReminderModal = (invoice: Invoice) => {
    setActiveInvoiceForModal(invoice);
    setIsInvoiceModalOpen(true);
  };

  const resetScenarioParams = () => {
    setScenarioParams({
      ...DEFAULT_SCENARIO_PARAMS,
      safeBufferAmount: currentDataset.safeBufferThreshold
    });
    showToast('Scenario parameters reset to baseline.');
  };

  const handleSetDatasetKey = (key: string) => {
    setCurrentDatasetKey(key);
    const target = datasets[key];
    if (target) {
      showToast(`Profile loaded: ${target.name} • ML risk & 30d forecast synced`);
    }
  };

  return (
    <FinancialContext.Provider
      value={{
        activePage,
        setActivePage,
        currentDatasetKey,
        setDatasetKey: handleSetDatasetKey,
        dataset: currentDataset,
        allDatasets: datasets,
        currency,
        setCurrency,
        formatCurrency,
        summary,
        forecast,
        forecastRangeDays,
        setForecastRangeDays,
        riskPrediction,
        insights,
        scenarioParams,
        setScenarioParams,
        scenarioResult,
        resetScenarioParams,
        backendStatus,
        refreshBackendStatus,
        payments: currentDataset.payments || [],
        createPayment,
        processPayment,
        processRazorpayPayment,
        paymentConfig,
        activePaymentMode,
        setActivePaymentMode,
        refreshPaymentConfig,
        activePaymentImpact,
        setActivePaymentImpact,
        isCreatePaymentModalOpen,
        setIsCreatePaymentModalOpen,
        isPaymentImpactModalOpen,
        setIsPaymentImpactModalOpen,
        isAddModalOpen,
        setIsAddModalOpen,
        isInvoiceModalOpen,
        setIsInvoiceModalOpen,
        activeInvoiceForModal,
        openInvoiceReminderModal,
        isExportModalOpen,
        setIsExportModalOpen,
        addTransaction,
        deleteTransaction,
        addInvoice,
        addPayment,
        updateSafeBuffer,
        updateInvoiceStatus,
        applyInsightAction,
        dismissInsightAction,
        isLoading,
        toastMessage,
        showToast
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};


export const useFinancial = (): FinancialContextType => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};
