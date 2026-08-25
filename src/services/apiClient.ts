import {
  CashFlowSummary,
  ForecastData,
  RiskPrediction,
  ScenarioParams,
  ScenarioResult,
  ActionInsight,
  FinancialDataset
} from '../types/financial';
import {
  calculateSummary,
  generateForecastTimeline,
  computeRiskPrediction,
  runScenarioSimulation,
  generateInsightsList
} from '../utils/financialCalculations';
import { BUSINESS_DATASETS } from '../data/mockFinancialData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const USE_MOCK_ENV = import.meta.env.VITE_USE_MOCK_API !== 'false';

export interface BackendStatus {
  connected: boolean;
  service: string;
  version: string;
  modelReady: boolean;
  latencyMs?: number;
}

export class CashFlowApiClient {
  private useMock: boolean = USE_MOCK_ENV;
  private backendStatus: BackendStatus = {
    connected: false,
    service: 'Client-Side ML Simulation Pipeline',
    version: '1.2.0-standalone',
    modelReady: true
  };

  constructor() {
    this.checkBackendHealth();
  }

  public async checkBackendHealth(): Promise<BackendStatus> {
    const startTime = performance.now();
    try {
      const res = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(2000)
      });
      if (res.ok) {
        const data = await res.json();
        this.backendStatus = {
          connected: true,
          service: data.service || 'FastAPI Python ML Service',
          version: data.version || '1.0.0',
          modelReady: true,
          latencyMs: Math.round(performance.now() - startTime)
        };
        return this.backendStatus;
      }
    } catch {
      // Backend not reachable, fall back to standalone client pipeline
    }

    this.backendStatus = {
      connected: false,
      service: 'Client ML Simulation Engine (Local)',
      version: '1.2.0-standalone',
      modelReady: true,
      latencyMs: 2
    };
    return this.backendStatus;
  }

  public getStatus(): BackendStatus {
    return this.backendStatus;
  }

  public setUseMock(useMock: boolean) {
    this.useMock = useMock;
  }

  public async getSummary(dataset: FinancialDataset): Promise<CashFlowSummary> {
    if (!this.useMock && this.backendStatus.connected) {
      try {
        const res = await fetch(`${API_BASE_URL}/financial-summary?dataset_id=${dataset.id}`);
        if (res.ok) {
          const data = await res.json();
          return {
            ...data,
            changeVsLastMonth: {
              balance: +4.2,
              inflow: +8.5,
              outflow: +3.1,
              healthScore: data.cashHealthScore >= 70 ? +6 : -8
            }
          };
        }
      } catch (err) {
        console.warn('FastAPI fallback to client calculation:', err);
      }
    }

    // Client fallback
    return calculateSummary(
      dataset.currentBalance,
      dataset.monthlyInflow,
      dataset.monthlyOutflow,
      dataset.safeBufferThreshold
    );
  }

  public async getForecast(dataset: FinancialDataset, days: number = 30): Promise<ForecastData> {
    if (!this.useMock && this.backendStatus.connected) {
      try {
        const res = await fetch(`${API_BASE_URL}/forecast?dataset_id=${dataset.id}&days=${days}`);
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('FastAPI fallback to client forecast:', err);
      }
    }

    return generateForecastTimeline(
      dataset.currentBalance,
      dataset.monthlyInflow,
      dataset.monthlyOutflow,
      dataset.safeBufferThreshold,
      days,
      dataset.invoices,
      dataset.payments
    );
  }

  public async getRiskPrediction(
    dataset: FinancialDataset,
    scenarioParams?: Partial<ScenarioParams>
  ): Promise<RiskPrediction> {
    if (!this.useMock && this.backendStatus.connected && !scenarioParams) {
      try {
        const res = await fetch(`${API_BASE_URL}/risk-prediction?dataset_id=${dataset.id}`);
        if (res.ok) {
          const data = await res.json();
          return {
            ...data,
            modelMetadata: {
              ...data.modelMetadata,
              isMockOrLive: 'live_fastapi'
            }
          };
        }
      } catch (err) {
        console.warn('FastAPI fallback to client risk model:', err);
      }
    }

    return computeRiskPrediction(
      dataset.currentBalance,
      dataset.monthlyInflow,
      dataset.monthlyOutflow,
      dataset.safeBufferThreshold,
      dataset.invoices,
      dataset.payments,
      scenarioParams
    );
  }

  public async simulateScenario(
    params: ScenarioParams,
    dataset: FinancialDataset
  ): Promise<ScenarioResult> {
    if (!this.useMock && this.backendStatus.connected) {
      try {
        const res = await fetch(`${API_BASE_URL}/simulate?dataset_id=${dataset.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params)
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('FastAPI fallback to client scenario engine:', err);
      }
    }

    return runScenarioSimulation(
      params,
      dataset.currentBalance,
      dataset.monthlyInflow,
      dataset.monthlyOutflow,
      dataset.invoices,
      dataset.payments
    );
  }

  public async getInsights(dataset: FinancialDataset): Promise<ActionInsight[]> {
    if (!this.useMock && this.backendStatus.connected) {
      try {
        const res = await fetch(`${API_BASE_URL}/insights?dataset_id=${dataset.id}`);
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('FastAPI fallback to client insights engine:', err);
      }
    }

    return generateInsightsList(
      dataset.currentBalance,
      dataset.monthlyInflow,
      dataset.monthlyOutflow,
      dataset.safeBufferThreshold,
      dataset.invoices,
      dataset.payments
    );
  }

  public getDatasets(): Record<string, FinancialDataset> {
    return BUSINESS_DATASETS;
  }
}

export const apiClient = new CashFlowApiClient();
