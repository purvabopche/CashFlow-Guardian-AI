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
  Payment
} from '../types/financial';
import { BUSINESS_DATASETS } from '../data/mockFinancialData';
import { apiClient, BackendStatus } from '../services/apiClient';

export type ActivePage = 'landing' | 'dashboard' | 'forecast' | 'risk' | 'simulator' | 'insights';

interface FinancialContextType {
  activePage: ActivePage;
  setActivePage: (page: ActivePage) => void;
  currentDatasetKey: string;
  setDatasetKey: (key: string) => void;
  dataset: FinancialDataset;
  allDatasets: Record<string, FinancialDataset>;
  
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
  customerPaymentDelayDays: 0,
  upcomingExpenseAmount: 0,
  monthlyRevenueChangePercent: 0,
  vendorPaymentShiftDays: 0,
  safeBufferAmount: 25000
};

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activePage, setActivePage] = useState<ActivePage>('landing');
  const [currentDatasetKey, setCurrentDatasetKey] = useState<string>('tech_startup');
  const [datasets, setDatasets] = useState<Record<string, FinancialDataset>>(BUSINESS_DATASETS);
  const [forecastRangeDays, setForecastRangeDays] = useState<number>(30);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [backendStatus, setBackendStatus] = useState<BackendStatus>(apiClient.getStatus());
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [activeInvoiceForModal, setActiveInvoiceForModal] = useState<Invoice | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const currentDataset = datasets[currentDatasetKey] || datasets.tech_startup;

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

  // Calculations synced to current dataset and active forecast range
  const [summary, setSummary] = useState<CashFlowSummary>(() => ({
    currentBalance: currentDataset.currentBalance,
    monthlyInflow: currentDataset.monthlyInflow,
    monthlyOutflow: currentDataset.monthlyOutflow,
    projected30DayBalance: currentDataset.currentBalance + (currentDataset.monthlyInflow - currentDataset.monthlyOutflow),
    cashHealthScore: 72,
    safeBufferThreshold: currentDataset.safeBufferThreshold,
    runwayDays: 28,
    netBurnRate: Math.max(0, currentDataset.monthlyOutflow - currentDataset.monthlyInflow),
    changeVsLastMonth: { balance: 4.2, inflow: 8.5, outflow: 3.1, healthScore: 6 }
  }));

  const [forecast, setForecast] = useState<ForecastData>(() => ({
    forecastDays: [],
    safeBufferThreshold: currentDataset.safeBufferThreshold,
    lowestProjectedPoint: currentDataset.currentBalance,
    daysBelowThresholdCount: 0,
    predictedBreachDate: null,
    totalProjectedInflow: currentDataset.monthlyInflow,
    totalProjectedOutflow: currentDataset.monthlyOutflow
  }));

  const [riskPrediction, setRiskPrediction] = useState<RiskPrediction>(() => ({
    riskProbability: 74,
    riskLevel: 'High',
    predictedShortageWindow: 'Days 14 – 21',
    confidenceScore: 89.4,
    runwayDays: 28,
    keyFactors: [],
    explainability: [],
    modelMetadata: {
      modelVersion: 'v1.2.0-fastapi-ensemble',
      modelType: 'Gradient Boosted Cash Survival Classifier',
      trainingStatus: 'Calibrated Heuristic Pipeline',
      inferenceLatencyMs: 14.2,
      featuresEvaluated: 18,
      isMockOrLive: 'mock_local'
    }
  }));

  const [scenarioResult, setScenarioResult] = useState<ScenarioResult>(() => ({
    params: scenarioParams,
    baselineMinBalance: 12000,
    simulatedMinBalance: 12000,
    baselineRiskProbability: 74,
    simulatedRiskProbability: 74,
    balanceDelta: 0,
    runwayImpactDays: 0,
    timeline: [],
    summaryNote: 'Adjust sliders to evaluate financial resilience.'
  }));

  const [rawInsights, setRawInsights] = useState<ActionInsight[]>([]);

  // Recalculate everything whenever dataset, scenarioParams, or forecast range changes
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.all([
      apiClient.getSummary(currentDataset),
      apiClient.getForecast(currentDataset, forecastRangeDays),
      apiClient.getRiskPrediction(currentDataset),
      apiClient.simulateScenario(scenarioParams, currentDataset),
      apiClient.getInsights(currentDataset)
    ]).then(([sum, fc, risk, sim, ins]) => {
      if (isMounted) {
        setSummary(sum);
        setForecast(fc);
        setRiskPrediction(risk);
        setScenarioResult(sim);
        setRawInsights(ins);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [currentDataset, forecastRangeDays, scenarioParams]);

  // Merged insights with applied status
  const insights = useMemo(() => {
    return rawInsights.map(item => ({
      ...item,
      status: insightsState[item.id] || item.status
    }));
  }, [rawInsights, insightsState]);

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

    showToast(`Invoice #${newInvoice.id} for $${newInvoice.amount.toLocaleString()} added successfully!`);
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

    showToast(`Payment scheduled for $${newPayment.amount.toLocaleString()} (${newPayment.vendor})!`);
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
    showToast(`Safe Cash Buffer updated to $${newBuffer.toLocaleString()}`);
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
    showToast(`Invoice #${id} status marked as ${status.toUpperCase()}`);
  };

  const applyInsightAction = (insightId: string) => {
    setInsightsState(prev => ({ ...prev, [insightId]: 'applied' }));
    showToast('Action implemented! Recalculating cash projection impact.');
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

  return (
    <FinancialContext.Provider
      value={{
        activePage,
        setActivePage,
        currentDatasetKey,
        setDatasetKey: setCurrentDatasetKey,
        dataset: currentDataset,
        allDatasets: datasets,
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
