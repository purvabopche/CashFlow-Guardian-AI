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
  Transaction,
  CurrencyCode
} from '../types/financial';
import { BUSINESS_DATASETS } from '../data/mockFinancialData';
import { apiClient, BackendStatus } from '../services/apiClient';
import { calculateSummary, generateForecastTimeline, computeRiskPrediction, runScenarioSimulation, generateInsightsList } from '../utils/financialCalculations';

export type ActivePage = 'dashboard' | 'transactions' | 'forecast' | 'insights' | 'risk' | 'simulator';

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
  
  backendStatus: BackendStatus;
  refreshBackendStatus: () => Promise<void>;
  
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
  addPayment: (payment: Omit<Payment, 'id'>) => void;
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

  const refreshBackendStatus = async () => {
    const status = await apiClient.checkBackendHealth();
    setBackendStatus(status);
  };

  useEffect(() => {
    refreshBackendStatus();
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
        const [newSummary, newForecast, newRisk, newSim, newIns] = await Promise.all([
          apiClient.getSummary(currentDataset),
          apiClient.getForecast(currentDataset, forecastRangeDays, scenarioParams),
          apiClient.getRiskPrediction(currentDataset, scenarioParams),
          apiClient.simulateScenario(scenarioParams, currentDataset),
          apiClient.getInsights(currentDataset)
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
  }, [currentDataset, forecastRangeDays, scenarioParams]);

  // Merged insights with applied status
  const insights = useMemo(() => {
    return rawInsights.map(item => ({
      ...item,
      status: insightsState[item.id] || item.status
    }));
  }, [rawInsights, insightsState]);

  const addTransaction = (txData: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now().toString().slice(-4)}`
    };

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

    showToast(`Transaction "${newTx.title}" recorded!`);
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
    showToast('Transaction removed.');
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

    showToast(`Invoice #${newInvoice.id} added to ledger!`);
  };

  const addPayment = (paymentData: Omit<Payment, 'id'>) => {
    const newPayment: Payment = {
      ...paymentData,
      id: `PAY-${Date.now().toString().slice(-4)}`
    };

    setDatasets(prev => {
      const active = prev[currentDatasetKey];
      return {
        ...prev,
        [currentDatasetKey]: {
          ...active,
          payments: [newPayment, ...active.payments]
        }
      };
    });

    showToast(`Payment scheduled for ${newPayment.vendor}!`);
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
    showToast(`Safe Cash Buffer updated to ${formatCurrency(newBuffer)}`);
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
    showToast('Protective action applied! Recalculating cash projection.');
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
    showToast('Scenario reset to baseline.');
  };

  return (
    <FinancialContext.Provider
      value={{
        activePage,
        setActivePage,
        currentDatasetKey,
        setDatasetKey: setCurrentDatasetKey,
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
