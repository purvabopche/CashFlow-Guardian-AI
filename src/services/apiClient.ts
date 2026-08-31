import {
  CashFlowSummary,
  ForecastData,
  RiskPrediction,
  ScenarioParams,
  ScenarioResult,
  ActionInsight,
  FinancialDataset,
  Transaction,
  PaymentRecord,
  CreatePaymentInput
} from '../types/financial';
import {
  calculateSummary,
  generateForecastTimeline,
  computeRiskPrediction,
  runScenarioSimulation,
  generateInsightsList
} from '../utils/financialCalculations';
import { BUSINESS_DATASETS } from '../data/mockFinancialData';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export interface BackendStatus {
  connected: boolean;
  service: string;
  version: string;
  modelReady: boolean;
  latencyMs?: number;
}

export class CashFlowApiClient {
  private backendStatus: BackendStatus = {
    connected: false,
    service: 'Client ML Simulation Engine',
    version: '2.1.0-standalone',
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
        signal: AbortSignal.timeout(2500)
      });
      if (res.ok) {
        const data = await res.json();
        this.backendStatus = {
          connected: true,
          service: data.service || 'FastAPI Python ML Service',
          version: data.version || '2.1.0',
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
      service: 'Client ML Engine (Local Fallback)',
      version: '2.1.0-local',
      modelReady: true,
      latencyMs: 1
    };
    return this.backendStatus;
  }

  public getStatus(): BackendStatus {
    return this.backendStatus;
  }

  public async fetchBackendScenarioData(scenarioId: string): Promise<FinancialDataset | null> {
    if (!this.backendStatus.connected) return null;
    try {
      const [dashRes, txRes, payRes] = await Promise.all([
        fetch(`${API_BASE_URL}/dashboard?scenario_id=${scenarioId}`, { signal: AbortSignal.timeout(3000) }),
        fetch(`${API_BASE_URL}/transactions?scenario_id=${scenarioId}`, { signal: AbortSignal.timeout(3000) }),
        fetch(`${API_BASE_URL}/payments?scenario_id=${scenarioId}`, { signal: AbortSignal.timeout(3000) })
      ]);

      if (dashRes.ok && txRes.ok && payRes.ok) {
        const dash = await dashRes.json();
        const txs = await txRes.json();
        const pays = await payRes.json();

        const baseMock = BUSINESS_DATASETS[scenarioId] || BUSINESS_DATASETS.critical_shortage;

        const normalizedTxs: Transaction[] = txs.map((t: any) => ({
          id: t.id,
          date: t.date,
          title: t.title,
          category: t.category,
          type: t.type,
          amount: t.amount,
          isRecurring: Boolean(t.is_recurring ?? t.isRecurring),
          isDiscretionary: Boolean(t.is_discretionary ?? t.isDiscretionary),
          merchant: t.merchant,
          notes: t.notes
        }));

        const normalizedPays: PaymentRecord[] = pays.map((p: any) => ({
          id: p.id,
          counterparty: p.counterparty || p.vendor,
          vendor: p.vendor || p.counterparty,
          description: p.description,
          amount: p.amount,
          direction: p.direction,
          category: p.category,
          status: p.status,
          scheduledDate: p.scheduled_date || p.scheduledDate,
          dueDate: p.due_date || p.dueDate || p.scheduled_date,
          invoiceReference: p.invoice_reference || p.invoiceReference,
          isRecurring: Boolean(p.is_recurring ?? p.isRecurring),
          isFlexible: Boolean(p.is_flexible ?? p.isFlexible),
          urgency: p.urgency || 'Medium',
          notes: p.notes,
          provider: p.provider,
          referenceId: p.reference_id || p.referenceId,
          transactionId: p.transaction_id || p.transactionId,
          createdAt: p.created_at || p.createdAt,
          processedAt: p.processed_at || p.processedAt
        }));

        return {
          id: scenarioId,
          name: baseMock.name,
          industry: baseMock.industry,
          description: baseMock.description,
          currentBalance: dash.current_balance,
          monthlyInflow: dash.monthly_inflow,
          monthlyOutflow: dash.monthly_outflow,
          safeBufferThreshold: dash.safe_buffer_threshold,
          transactions: normalizedTxs,
          invoices: baseMock.invoices,
          payments: normalizedPays
        };
      }
    } catch (err) {
      console.warn('Error fetching backend scenario dataset:', err);
    }
    return null;
  }

  public async getSummary(dataset: FinancialDataset): Promise<CashFlowSummary> {
    if (this.backendStatus.connected) {
      try {
        const res = await fetch(`${API_BASE_URL}/dashboard?scenario_id=${dataset.id}`, {
          signal: AbortSignal.timeout(3000)
        });
        if (res.ok) {
          const d = await res.json();
          return {
            currentBalance: d.current_balance,
            monthlyInflow: d.monthly_inflow,
            monthlyOutflow: d.monthly_outflow,
            netCashFlow: d.net_cash_flow,
            projected30DayBalance: d.projected_30d_balance,
            cashHealthScore: d.cash_safety_score,
            safeBufferThreshold: d.safe_buffer_threshold,
            runwayDays: d.runway_days,
            netBurnRate: d.net_burn_rate,
            dangerDayCount: d.danger_day_count,
            dangerDate: d.danger_date,
            dangerDaysFromNow: d.danger_days_from_now,
            changeVsLastMonth: {
              balance: +4.2,
              inflow: +8.5,
              outflow: +3.1,
              healthScore: d.cash_safety_score >= 70 ? +6 : -8
            }
          };
        }
      } catch (err) {
        console.warn('FastAPI summary error, using client engine:', err);
      }
    }

    return calculateSummary(
      dataset.currentBalance,
      dataset.monthlyInflow,
      dataset.monthlyOutflow,
      dataset.safeBufferThreshold,
      dataset.transactions
    );
  }

  public async getForecast(dataset: FinancialDataset, days: number = 30, scenarioParams?: Partial<ScenarioParams>): Promise<ForecastData> {
    const hasScenarioModifications = scenarioParams && (
      (scenarioParams.extraSpendingThisWeek ?? 0) > 0 ||
      (scenarioParams.emergencyFundingAmount ?? 0) > 0 ||
      (scenarioParams.newRecurringExpenseAmount ?? 0) > 0 ||
      (scenarioParams.customerPaymentDelayDays ?? 0) > 0 ||
      (scenarioParams.foodExpenseReductionPercent ?? 0) > 0 ||
      (scenarioParams.dailyDiscretionaryTrim ?? 0) > 0 ||
      (scenarioParams.monthlyRevenueChangePercent ?? 0) !== 0 ||
      (scenarioParams.vendorPaymentShiftDays ?? 0) > 0
    );

    if (this.backendStatus.connected && !hasScenarioModifications) {
      try {
        const res = await fetch(`${API_BASE_URL}/forecast?scenario_id=${dataset.id}&days=${days}`, {
          signal: AbortSignal.timeout(3000)
        });
        if (res.ok) {
          const d = await res.json();
          return {
            historicalDays: [],
            forecastDays: d.forecast_days.map((p: any) => ({
              date: p.date,
              dayIndex: p.day_index,
              projectedBalance: p.projected_balance,
              predictedInflow: p.predicted_inflow,
              predictedOutflow: p.predicted_outflow,
              netChange: p.net_change,
              isBelowThreshold: p.is_below_threshold,
              isDangerZone: p.is_danger_zone,
              riskLevel: p.risk_level,
              confidenceLower: p.confidence_lower,
              confidenceUpper: p.confidence_upper,
              events: p.events
            })),
            combinedTimeline: d.forecast_days.map((p: any) => ({
              date: p.date,
              dayIndex: p.day_index,
              projectedBalance: p.projected_balance,
              predictedInflow: p.predicted_inflow,
              predictedOutflow: p.predicted_outflow,
              netChange: p.net_change,
              isBelowThreshold: p.is_below_threshold,
              isDangerZone: p.is_danger_zone,
              riskLevel: p.risk_level,
              isHistorical: false
            })),
            safeBufferThreshold: d.safe_buffer_threshold,
            lowestProjectedPoint: d.lowest_projected_point,
            daysBelowThresholdCount: d.days_below_threshold_count,
            predictedBreachDate: d.predicted_breach_date,
            totalProjectedInflow: d.total_projected_inflow,
            totalProjectedOutflow: d.total_projected_outflow
          };
        }
      } catch (err) {
        console.warn('FastAPI forecast error, using client engine:', err);
      }
    }

    return generateForecastTimeline(
      dataset.currentBalance,
      dataset.monthlyInflow,
      dataset.monthlyOutflow,
      dataset.safeBufferThreshold,
      days,
      dataset.invoices,
      dataset.payments,
      scenarioParams
    );
  }

  public async getRiskPrediction(
    dataset: FinancialDataset,
    scenarioParams?: Partial<ScenarioParams>
  ): Promise<RiskPrediction> {
    const hasScenarioModifications = scenarioParams && (
      (scenarioParams.extraSpendingThisWeek ?? 0) > 0 ||
      (scenarioParams.emergencyFundingAmount ?? 0) > 0 ||
      (scenarioParams.newRecurringExpenseAmount ?? 0) > 0 ||
      (scenarioParams.customerPaymentDelayDays ?? 0) > 0 ||
      (scenarioParams.foodExpenseReductionPercent ?? 0) > 0 ||
      (scenarioParams.dailyDiscretionaryTrim ?? 0) > 0 ||
      (scenarioParams.monthlyRevenueChangePercent ?? 0) !== 0 ||
      (scenarioParams.vendorPaymentShiftDays ?? 0) > 0
    );

    if (this.backendStatus.connected && !hasScenarioModifications) {
      try {
        const res = await fetch(`${API_BASE_URL}/risk-analysis?scenario_id=${dataset.id}`, {
          signal: AbortSignal.timeout(3000)
        });
        if (res.ok) {
          const d = await res.json();
          return {
            riskProbability: d.risk_probability,
            riskLevel: d.risk_level,
            predictedShortageWindow: d.predicted_shortage_window,
            confidenceScore: d.confidence_score,
            runwayDays: d.runway_days,
            keyFactors: d.key_factors,
            explainability: d.explainability.map((f: any) => ({
              id: f.id,
              name: f.name,
              impactPercent: f.impact_percent,
              direction: f.direction,
              description: f.description,
              category: f.category,
              shapValue: f.shap_value,
              isRemediable: f.is_remediable
            })),
            modelMetadata: {
              modelVersion: d.model_metadata?.model_version || '2.3.0',
              modelType: d.model_metadata?.model_name || d.model_metadata?.model_type || 'Random Forest Cash Shortage Classifier',
              trainingStatus: d.model_metadata?.status || 'Trained & Loaded',
              inferenceLatencyMs: d.model_metadata?.inference_latency_ms || 11.2,
              featuresEvaluated: d.model_metadata?.feature_count || d.model_metadata?.features_evaluated || 12,
              isMockOrLive: 'live_fastapi'
            }
          };
        }
      } catch (err) {
        console.warn('FastAPI risk model error, using client engine:', err);
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
    if (this.backendStatus.connected) {
      try {
        const body = {
          scenario_id: dataset.id,
          extra_spending_this_week: params.extraSpendingThisWeek,
          emergency_funding_amount: params.emergencyFundingAmount,
          new_recurring_expense_amount: params.newRecurringExpenseAmount,
          customer_payment_delay_days: params.customerPaymentDelayDays,
          food_expense_reduction_percent: params.foodExpenseReductionPercent,
          daily_discretionary_trim: params.dailyDiscretionaryTrim,
          monthly_revenue_change_percent: params.monthlyRevenueChangePercent,
          vendor_payment_shift_days: params.vendorPaymentShiftDays,
          safe_buffer_amount: params.safeBufferAmount
        };

        const res = await fetch(`${API_BASE_URL}/simulate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(3500)
        });

        if (res.ok) {
          const d = await res.json();
          return {
            params,
            baselineMinBalance: d.baseline_min_balance,
            simulatedMinBalance: d.simulated_min_balance,
            baselineRiskProbability: d.baseline_risk_probability,
            simulatedRiskProbability: d.simulated_risk_probability,
            baselineSafetyScore: d.baseline_safety_score,
            simulatedSafetyScore: d.simulated_safety_score,
            balanceDelta: d.balance_delta,
            runwayImpactDays: d.runway_impact_days,
            timeline: d.timeline.map((p: any) => ({
              date: p.date,
              dayIndex: p.day_index,
              baselineBalance: p.baseline_balance,
              simulatedBalance: p.simulated_balance,
              safeBuffer: p.safe_buffer,
              variance: p.variance
            })),
            summaryNote: d.summary_note
          };
        }
      } catch (err) {
        console.warn('FastAPI simulation error, using client engine:', err);
      }
    }

    return runScenarioSimulation(
      params,
      dataset.currentBalance,
      dataset.monthlyInflow,
      dataset.monthlyOutflow,
      dataset.invoices,
      dataset.payments,
      dataset.transactions
    );
  }

  public async getInsights(dataset: FinancialDataset): Promise<ActionInsight[]> {
    if (this.backendStatus.connected) {
      try {
        const res = await fetch(`${API_BASE_URL}/insights?scenario_id=${dataset.id}`, {
          signal: AbortSignal.timeout(3000)
        });
        if (res.ok) {
          const d = await res.json();
          return d.map((ins: any) => ({
            id: ins.id,
            title: ins.title,
            description: ins.description,
            category: ins.category,
            priority: ins.priority,
            potentialCashImpact: ins.potential_cash_impact,
            runwayDaysImpact: ins.runway_days_impact,
            recommendedAction: ins.recommended_action,
            status: ins.status,
            actionType: ins.action_type,
            riskReductionEstimate: ins.risk_reduction_from ? {
              fromRisk: ins.risk_reduction_from,
              toRisk: ins.risk_reduction_to
            } : undefined,
            templateData: ins.template_data
          }));
        }
      } catch (err) {
        console.warn('FastAPI insights error, using client engine:', err);
      }
    }

    return generateInsightsList(
      dataset.currentBalance,
      dataset.monthlyInflow,
      dataset.monthlyOutflow,
      dataset.safeBufferThreshold,
      dataset.invoices,
      dataset.payments,
      dataset.transactions
    );
  }

  public async recordTransaction(tx: Omit<Transaction, 'id'>, datasetId: string): Promise<any> {
    if (this.backendStatus.connected) {
      try {
        const res = await fetch(`${API_BASE_URL}/transactions?scenario_id=${datasetId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: `tx-api-${Date.now().toString().slice(-4)}`,
            date: tx.date,
            title: tx.title,
            category: tx.category,
            type: tx.type,
            amount: tx.amount,
            is_recurring: tx.isRecurring,
            is_discretionary: tx.isDiscretionary,
            merchant: tx.merchant,
            notes: tx.notes
          }),
          signal: AbortSignal.timeout(3000)
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('FastAPI record transaction error:', err);
      }
    }
    return null;
  }

  public async getModelInfo(): Promise<any> {
    if (this.backendStatus.connected) {
      try {
        const res = await fetch(`${API_BASE_URL}/model-info`, {
          signal: AbortSignal.timeout(2500)
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('FastAPI model-info error:', err);
      }
    }
    return null;
  }

  public async predictCustom(params: {
    current_balance: number;
    safe_threshold: number;
    recent_transactions: any[];
    expected_income: any[];
    recurring_payments: any[];
  }): Promise<any> {
    if (this.backendStatus.connected) {
      try {
        const res = await fetch(`${API_BASE_URL}/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(params),
          signal: AbortSignal.timeout(3500)
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('FastAPI predict error:', err);
      }
    }
    return null;
  }

  public async getPayments(datasetId: string): Promise<PaymentRecord[]> {
    if (this.backendStatus.connected) {
      try {
        const res = await fetch(`${API_BASE_URL}/payments?scenario_id=${datasetId}`, {
          signal: AbortSignal.timeout(3000)
        });
        if (res.ok) {
          const data = await res.json();
          return data.map((p: any) => ({
            id: p.id,
            counterparty: p.counterparty || p.vendor,
            vendor: p.vendor || p.counterparty,
            description: p.description,
            amount: p.amount,
            direction: p.direction,
            category: p.category,
            status: p.status,
            scheduledDate: p.scheduled_date,
            dueDate: p.due_date || p.scheduled_date,
            invoiceReference: p.invoice_reference,
            isRecurring: p.is_recurring,
            isFlexible: p.is_flexible,
            urgency: p.urgency,
            notes: p.notes,
            provider: p.provider,
            referenceId: p.reference_id,
            transactionId: p.transaction_id,
            createdAt: p.created_at,
            processedAt: p.processed_at
          }));
        }
      } catch (err) {
        console.warn('FastAPI getPayments error, using dataset payments:', err);
      }
    }
    return (BUSINESS_DATASETS[datasetId]?.payments as PaymentRecord[]) || [];
  }

  public async createPayment(
    payment: CreatePaymentInput,
    datasetId: string
  ): Promise<PaymentRecord | null> {
    if (this.backendStatus.connected) {
      try {
        const res = await fetch(`${API_BASE_URL}/payments?scenario_id=${datasetId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            counterparty: payment.counterparty,
            description: payment.description,
            amount: payment.amount,
            direction: payment.direction,
            category: payment.category,
            scheduled_date: payment.scheduledDate,
            invoice_reference: payment.invoiceReference,
            is_recurring: payment.isRecurring
          }),
          signal: AbortSignal.timeout(3000)
        });
        if (res.ok) {
          const p = await res.json();
          return {
            id: p.id,
            counterparty: p.counterparty,
            vendor: p.vendor,
            description: p.description,
            amount: p.amount,
            direction: p.direction,
            category: p.category,
            status: p.status,
            scheduledDate: p.scheduled_date,
            dueDate: p.due_date,
            invoiceReference: p.invoice_reference,
            isRecurring: p.is_recurring,
            isFlexible: p.is_flexible,
            urgency: p.urgency,
            notes: p.notes,
            provider: p.provider,
            referenceId: p.reference_id,
            transactionId: p.transaction_id,
            createdAt: p.created_at,
            processedAt: p.processed_at
          };
        }
      } catch (err) {
        console.warn('FastAPI createPayment error:', err);
      }
    }
    return null;
  }

  public async processPayment(
    paymentId: string,
    datasetId: string,
    simulateFailure: boolean = false,
    provider: string = 'demo'
  ): Promise<any> {
    if (this.backendStatus.connected) {
      try {
        const res = await fetch(`${API_BASE_URL}/payments/${paymentId}/process?scenario_id=${datasetId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            simulate_failure: simulateFailure,
            provider
          }),
          signal: AbortSignal.timeout(4000)
        });
        if (res.ok) {
          const raw = await res.json();
          const p = raw.payment;
          const normalizedPayment: PaymentRecord = {
            id: p.id,
            counterparty: p.counterparty || p.vendor,
            vendor: p.vendor || p.counterparty,
            description: p.description,
            amount: p.amount,
            direction: p.direction,
            category: p.category,
            status: p.status,
            scheduledDate: p.scheduled_date || p.scheduledDate,
            dueDate: p.due_date || p.dueDate || p.scheduled_date,
            invoiceReference: p.invoice_reference || p.invoiceReference,
            isRecurring: p.is_recurring ?? p.isRecurring ?? false,
            isFlexible: p.is_flexible ?? p.isFlexible ?? false,
            urgency: p.urgency || 'Medium',
            notes: p.notes,
            provider: p.provider,
            referenceId: p.reference_id || p.referenceId,
            transactionId: p.transaction_id || p.transactionId,
            createdAt: p.created_at || p.createdAt,
            processedAt: p.processed_at || p.processedAt
          };

          let normalizedTx = null;
          if (raw.transaction) {
            const t = raw.transaction;
            normalizedTx = {
              id: t.id,
              date: t.date,
              title: t.title,
              category: t.category,
              type: t.type,
              amount: t.amount,
              isRecurring: t.is_recurring ?? t.isRecurring ?? false,
              isDiscretionary: t.is_discretionary ?? t.isDiscretionary ?? false,
              merchant: t.merchant,
              notes: t.notes
            };
          }

          return {
            ...raw,
            payment: normalizedPayment,
            transaction: normalizedTx
          };
        }
      } catch (err) {
        console.warn('FastAPI processPayment error:', err);
      }
    }
    return null;
  }


  public async getPaymentConfig(): Promise<{
    active_provider: string;
    provider_name: string;
    is_configured: boolean;
    key_id: string | null;
    demo_available: boolean;
    message: string;
  } | null> {
    if (this.backendStatus.connected) {
      try {
        const res = await fetch(`${API_BASE_URL}/payments/config`, {
          signal: AbortSignal.timeout(3000)
        });
        if (res.ok) {
          return await res.json();
        }
      } catch (err) {
        console.warn('FastAPI getPaymentConfig error:', err);
      }
    }
    return {
      active_provider: 'demo',
      provider_name: 'Demo Payment Simulator (Test Mode)',
      is_configured: true,
      key_id: null,
      demo_available: true,
      message: 'Demo Payment Mode active.'
    };
  }

  public async createRazorpayOrder(
    paymentId: string,
    datasetId: string
  ): Promise<{
    order_id: string;
    amount: number;
    amount_inr: number;
    currency: string;
    key_id: string;
    payment_id: string;
    counterparty: string;
    description: string;
    receipt?: string;
  }> {
    if (!this.backendStatus.connected) {
      throw new Error('Payment gateway unavailable. Demo mode is still available.');
    }
    const res = await fetch(`${API_BASE_URL}/payments/${paymentId}/razorpay/create-order?scenario_id=${datasetId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Payment gateway unavailable. Demo mode is still available.');
    }
    return await res.json();
  }

  public async verifyRazorpayPayment(
    paymentId: string,
    datasetId: string,
    payload: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    }
  ): Promise<any> {
    if (!this.backendStatus.connected) {
      throw new Error('Payment gateway unavailable. Demo mode is still available.');
    }
    const res = await fetch(`${API_BASE_URL}/payments/${paymentId}/razorpay/verify?scenario_id=${datasetId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Payment signature verification failed.');
    }
    const raw = await res.json();
    const p = raw.payment;
    const normalizedPayment: PaymentRecord = {
      id: p.id,
      counterparty: p.counterparty || p.vendor,
      vendor: p.vendor || p.counterparty,
      description: p.description,
      amount: p.amount,
      direction: p.direction,
      category: p.category,
      status: p.status,
      scheduledDate: p.scheduled_date || p.scheduledDate,
      dueDate: p.due_date || p.dueDate || p.scheduled_date,
      invoiceReference: p.invoice_reference || p.invoiceReference,
      isRecurring: p.is_recurring ?? p.isRecurring ?? false,
      isFlexible: p.is_flexible ?? p.isFlexible ?? false,
      urgency: p.urgency || 'Medium',
      notes: p.notes,
      provider: p.provider,
      referenceId: p.reference_id || p.referenceId,
      transactionId: p.transaction_id || p.transactionId,
      createdAt: p.created_at || p.createdAt,
      processedAt: p.processed_at || p.processedAt
    };

    let normalizedTx = null;
    if (raw.transaction) {
      const t = raw.transaction;
      normalizedTx = {
        id: t.id,
        date: t.date,
        title: t.title,
        category: t.category,
        type: t.type,
        amount: t.amount,
        isRecurring: t.is_recurring ?? t.isRecurring ?? false,
        isDiscretionary: t.is_discretionary ?? t.isDiscretionary ?? false,
        merchant: t.merchant,
        notes: t.notes
      };
    }

    return {
      ...raw,
      payment: normalizedPayment,
      transaction: normalizedTx
    };
  }

  public getDatasets(): Record<string, FinancialDataset> {
    return BUSINESS_DATASETS;
  }
}


export const apiClient = new CashFlowApiClient();
