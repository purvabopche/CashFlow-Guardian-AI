import React from 'react';
import {
  RotateCcw,
  Sparkles,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Utensils,
  Clock,
  PlusCircle,
  PiggyBank,
  Sliders,
  ArrowRight,
  ShieldAlert,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { useFinancial } from '../context/FinancialContext';
import { IntelligenceJourneyFooter } from '../components/common/IntelligenceJourneyFooter';

export const ScenarioSimulatorPage: React.FC = () => {
  const {
    scenarioParams,
    setScenarioParams,
    scenarioResult,
    resetScenarioParams,
    summary,
    formatCurrency,
    setActivePage
  } = useFinancial();

  const applyPreset = (
    extraSpend: number,
    emergency: number,
    newRecurring: number,
    delay: number,
    foodReduction: number,
    dailyTrim: number,
    bufferAmount?: number
  ) => {
    setScenarioParams({
      extraSpendingThisWeek: extraSpend,
      emergencyFundingAmount: emergency,
      newRecurringExpenseAmount: newRecurring,
      customerPaymentDelayDays: delay,
      foodExpenseReductionPercent: foodReduction,
      dailyDiscretionaryTrim: dailyTrim,
      monthlyRevenueChangePercent: 0,
      vendorPaymentShiftDays: 0,
      safeBufferAmount: bufferAmount ?? summary.safeBufferThreshold
    });
  };

  const isSimulatedBetter = scenarioResult.balanceDelta >= 0;

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/90 font-sans">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Cash simulator</span>
            <span className="text-slate-300">•</span>
            <span>See how changes affect your cash position</span>
          </div>
          <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold text-slate-900 tracking-tight mt-1">
            Test a scenario
          </h1>
        </div>

        <button
          onClick={resetScenarioParams}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition-colors shadow-2xs self-start sm:self-auto btn-interactive"
        >
          <RotateCcw className="w-4 h-4 text-slate-400" />
          <span>Reset parameters</span>
        </button>
      </div>

      {/* 2. 1-Click Business Presets Strip */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs space-y-3 font-sans">
        <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-slate-500" /> Quick scenario presets
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <button
            onClick={() => applyPreset(0, 25000, 0, 0, 0, 0)}
            className="p-3 rounded-lg border border-slate-200/90 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-left transition-all group btn-interactive"
          >
            <div className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
              <PiggyBank className="w-4 h-4 text-emerald-700" />
              <span>+₹25,000 Bridge capital</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">Test short-term cash injection</div>
          </button>

          <button
            onClick={() => applyPreset(0, 0, 0, 14, 0, 0)}
            className="p-3 rounded-lg border border-slate-200/90 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-left transition-all group btn-interactive"
          >
            <div className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>+14-day payment delay</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">Test late customer receivables</div>
          </button>

          <button
            onClick={() => applyPreset(0, 0, 0, 0, 25, 0)}
            className="p-3 rounded-lg border border-slate-200/90 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-left transition-all group btn-interactive"
          >
            <div className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
              <Utensils className="w-4 h-4 text-teal-700" />
              <span>-25% Discretionary spend</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">Trim non-essential variable costs</div>
          </button>

          <button
            onClick={() => applyPreset(0, 0, 4500, 0, 0, 0)}
            className="p-3 rounded-lg border border-slate-200/90 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 text-left transition-all group btn-interactive"
          >
            <div className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
              <PlusCircle className="w-4 h-4 text-purple-700" />
              <span>+₹4,500/mo New tool</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">Evaluate recurring software expense</div>
          </button>
        </div>
      </div>

      {/* 3. Interactive Split Workspace: INPUTS → SIMULATION & IMPACT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start font-sans">
        {/* Left Column: Parameter Inputs & Levers (5 cols) */}
        <div className="lg:col-span-5 fintech-card rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-5 fintech-card-highlight">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-slate-800" />
              <h2 className="text-base font-semibold text-slate-900 tracking-tight">
                Adjust scenario levers
              </h2>
            </div>
            <span className="text-xs text-slate-400">Live preview</span>
          </div>

          <div className="space-y-4 text-xs">
            {/* Lever 1: Customer Delay */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-sans">
                <span className="font-semibold text-slate-800 text-sm">Customer Payment Delay</span>
                <span className="font-bold text-slate-900 font-mono text-sm">{scenarioParams.customerPaymentDelayDays} Days</span>
              </div>
              <input
                type="range"
                min={0}
                max={45}
                step={1}
                value={scenarioParams.customerPaymentDelayDays}
                onChange={(e) =>
                  setScenarioParams({
                    ...scenarioParams,
                    customerPaymentDelayDays: parseInt(e.target.value)
                  })
                }
                className="w-full accent-slate-900"
              />
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>0 Days</span>
                <span>45 Days</span>
              </div>
            </div>

            {/* Lever 2: Variable Spend Reduction */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex justify-between font-sans">
                <span className="font-semibold text-slate-800 text-sm">Variable Food & Discretionary Trim</span>
                <span className="font-bold text-slate-900 font-mono text-sm">
                  {scenarioParams.foodExpenseReductionPercent}%
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={50}
                step={5}
                value={scenarioParams.foodExpenseReductionPercent}
                onChange={(e) =>
                  setScenarioParams({
                    ...scenarioParams,
                    foodExpenseReductionPercent: parseInt(e.target.value)
                  })
                }
                className="w-full accent-emerald-600"
              />
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>0%</span>
                <span>50% Cut</span>
              </div>
            </div>

            {/* Lever 3: Emergency Funding */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex justify-between font-sans">
                <span className="font-semibold text-slate-800 text-sm">Emergency Capital Infusion</span>
                <span className="font-bold text-emerald-700 font-mono text-sm">
                  +{formatCurrency(scenarioParams.emergencyFundingAmount)}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100000}
                step={2500}
                value={scenarioParams.emergencyFundingAmount}
                onChange={(e) =>
                  setScenarioParams({
                    ...scenarioParams,
                    emergencyFundingAmount: parseInt(e.target.value)
                  })
                }
                className="w-full accent-emerald-600"
              />
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>₹0</span>
                <span>₹100,000</span>
              </div>
            </div>

            {/* Lever 4: New Recurring Expense */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex justify-between font-sans">
                <span className="font-semibold text-slate-800 text-sm">New Monthly Recurring Commitment</span>
                <span className="font-bold text-slate-900 font-mono text-sm">
                  +{formatCurrency(scenarioParams.newRecurringExpenseAmount)}/mo
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={25000}
                step={1000}
                value={scenarioParams.newRecurringExpenseAmount}
                onChange={(e) =>
                  setScenarioParams({
                    ...scenarioParams,
                    newRecurringExpenseAmount: parseInt(e.target.value)
                  })
                }
                className="w-full accent-slate-900"
              />
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>₹0</span>
                <span>₹25,000/mo</span>
              </div>
            </div>

            {/* Lever 5: Safe Buffer Tuning */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex justify-between font-sans">
                <span className="font-semibold text-slate-800 text-sm">Safe Operating Buffer Target</span>
                <span className="font-bold text-rose-700 font-mono text-sm">
                  {formatCurrency(scenarioParams.safeBufferAmount)}
                </span>
              </div>
              <input
                type="range"
                min={5000}
                max={50000}
                step={2500}
                value={scenarioParams.safeBufferAmount}
                onChange={(e) =>
                  setScenarioParams({
                    ...scenarioParams,
                    safeBufferAmount: parseInt(e.target.value)
                  })
                }
                className="w-full accent-rose-600"
              />
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>₹5,000</span>
                <span>₹50,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Simulation Results & Impact (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* A. Simulation Impact Summary Banner */}
          <div
            className={`rounded-xl border p-5 transition-all shadow-2xs ${
              isSimulatedBetter
                ? 'bg-emerald-50/40 border-emerald-200/90 text-slate-900'
                : 'bg-rose-50/40 border-rose-200/90 text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {isSimulatedBetter ? (
                <TrendingUp className="w-5 h-5 text-emerald-700" />
              ) : (
                <TrendingDown className="w-5 h-5 text-rose-600" />
              )}
              <span className="text-xl font-semibold text-slate-900 tracking-tight font-sans">
                Simulation outcome: How your cash position changes
              </span>
            </div>

            <p className="text-sm text-slate-700 leading-relaxed font-normal">
              {scenarioResult.summaryNote}
            </p>

            {/* Before vs After Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-4 border-t border-slate-200/80 font-sans">
              {/* Shortage Risk */}
              <div className="space-y-0.5">
                <span className="text-xs text-slate-500 font-semibold block">
                  Shortage risk
                </span>
                <div className="text-2xl font-bold font-mono">
                  <span className="text-slate-400 line-through text-xs mr-1">
                    {scenarioResult.baselineRiskProbability}%
                  </span>
                  <span className={scenarioResult.simulatedRiskProbability > scenarioResult.baselineRiskProbability ? 'text-rose-600' : 'text-emerald-700'}>
                    {scenarioResult.simulatedRiskProbability}%
                  </span>
                </div>
              </div>

              {/* Lowest Point */}
              <div className="space-y-0.5">
                <span className="text-xs text-slate-500 font-semibold block">
                  Lowest point
                </span>
                <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                  {formatCurrency(scenarioResult.simulatedMinBalance)}
                </div>
                <div className="text-xs text-slate-500">
                  Base: {formatCurrency(scenarioResult.baselineMinBalance)}
                </div>
              </div>

              {/* Operating Runway Delta */}
              <div className="space-y-0.5">
                <span className="text-xs text-slate-500 font-semibold block">
                  Runway change
                </span>
                <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                  {scenarioResult.runwayImpactDays >= 0 ? '+' : ''}{scenarioResult.runwayImpactDays}{' '}
                  <span className="text-xs font-normal text-slate-400 font-sans">days</span>
                </div>
                <div className="text-xs text-slate-500">
                  {scenarioResult.runwayImpactDays >= 0 ? 'Runway extended' : 'Runway compressed'}
                </div>
              </div>

              {/* Safety Score */}
              <div className="space-y-0.5">
                <span className="text-xs text-slate-500 font-semibold block">
                  Safety score
                </span>
                <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                  {scenarioResult.simulatedSafetyScore} <span className="text-xs font-normal text-slate-400 font-mono">/ 100</span>
                </div>
                <div className="text-xs font-mono">
                  {scenarioResult.simulatedSafetyScore >= scenarioResult.baselineSafetyScore ? (
                    <span className="text-emerald-700 font-semibold">
                      +{scenarioResult.simulatedSafetyScore - scenarioResult.baselineSafetyScore} pts
                    </span>
                  ) : (
                    <span className="text-rose-600 font-semibold">
                      {scenarioResult.simulatedSafetyScore - scenarioResult.baselineSafetyScore} pts
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* B. Comparative Forecast Trajectory Chart */}
          <div className="fintech-card rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4 fintech-card-highlight font-sans">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
                  Baseline vs. simulated trajectory (30 days)
                </h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  Comparing your current cash path against your simulated outcome.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-slate-400 inline-block" />
                  <span>Baseline</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-purple-600 inline-block" />
                  <span>Simulated</span>
                </span>
              </div>
            </div>

            <div className="h-72 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={scenarioResult.timeline}
                  margin={{ top: 10, right: 15, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    tickLine={false}
                    axisLine={{ stroke: '#E2E8F0' }}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => formatCurrency(val, true)}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-xl border border-slate-800 bg-slate-950 text-white p-3.5 shadow-xl text-xs space-y-1.5 min-w-[200px] font-sans">
                            <div className="font-semibold text-slate-200 border-b border-slate-800 pb-1">
                              {data.date}
                            </div>
                            <div className="flex justify-between text-slate-400 font-mono">
                              <span>Baseline:</span>
                              <strong className="text-slate-200">{formatCurrency(data.baselineBalance)}</strong>
                            </div>
                            <div className="flex justify-between font-mono">
                              <span className="text-purple-400">Simulated:</span>
                              <strong className="text-purple-300">{formatCurrency(data.simulatedBalance)}</strong>
                            </div>
                            <div className="pt-1 border-t border-slate-800 flex justify-between font-mono text-xs">
                              <span>Net delta:</span>
                              <span className={data.simulatedBalance >= data.baselineBalance ? 'text-emerald-400' : 'text-rose-400'}>
                                {data.simulatedBalance >= data.baselineBalance ? '+' : ''}
                                {formatCurrency(data.simulatedBalance - data.baselineBalance)}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine
                    y={scenarioParams.safeBufferAmount}
                    stroke="#E11D48"
                    strokeDasharray="4 4"
                    strokeWidth={1.5}
                    label={{
                      value: `Safe Buffer (${formatCurrency(scenarioParams.safeBufferAmount)})`,
                      fill: '#E11D48',
                      fontSize: 11,
                      position: 'insideTopRight'
                    }}
                  />
                  <ReferenceLine y={0} stroke="#94A3B8" strokeWidth={1} />
                  <Line
                    type="monotone"
                    dataKey="baselineBalance"
                    stroke="#94A3B8"
                    strokeWidth={1.5}
                    dot={false}
                    activeDot={{ r: 4, strokeWidth: 1.5 }}
                    name="Baseline Balance"
                  />
                  <Line
                    type="monotone"
                    dataKey="simulatedBalance"
                    stroke="#7C3AED"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, strokeWidth: 2 }}
                    name="Simulated Balance"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-sm font-sans">
              <span className="text-slate-600">Ready to execute this mitigation strategy?</span>
              <button
                onClick={() => setActivePage('insights')}
                className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 hover:text-emerald-800"
              >
                <span>View Remediation Queue in Actions</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Intelligence Journey Stepper */}
      <IntelligenceJourneyFooter currentPage="simulator" />
    </div>
  );
};
