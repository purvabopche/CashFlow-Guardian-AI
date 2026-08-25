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
  PiggyBank
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
import { MetricCard } from '../components/common/MetricCard';

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
    <div className="space-y-5 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              What-If Financial Stress Simulator
            </h1>
            <span className="text-xs font-mono text-slate-400">
              • Dynamic Cash Flow Recalculation
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Test the liquidity impact of receivables delays, emergency funding, and discretionary trims in real-time.
          </p>
        </div>

        <button
          onClick={resetScenarioParams}
          className="flex items-center gap-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          <span>Reset Parameters</span>
        </button>
      </div>

      {/* 1-Click Scenario Prompts Bar */}
      <div className="rounded-lg border border-slate-200 bg-white p-3.5 space-y-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-slate-500" /> Scenario Presets
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
          <button
            onClick={() => applyPreset(0, 25000, 0, 0, 0, 0)}
            className="p-2.5 rounded border border-slate-200 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-300 text-left transition-all"
          >
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <PiggyBank className="w-3.5 h-3.5 text-emerald-700" />
              <span>+₹25k Emergency Funding</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Liquidity bridge drops risk to 12%</div>
          </button>

          <button
            onClick={() => applyPreset(0, 0, 0, 14, 0, 0)}
            className="p-2.5 rounded border border-slate-200 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-300 text-left transition-all"
          >
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>+14d Invoice Delay</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Tests receivables collection lag</div>
          </button>

          <button
            onClick={() => applyPreset(0, 0, 0, 0, 25, 0)}
            className="p-2.5 rounded border border-slate-200 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-300 text-left transition-all"
          >
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-teal-700" />
              <span>-25% Food & Dining Trim</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Cuts variable delivery spend</div>
          </button>

          <button
            onClick={() => applyPreset(0, 0, 4500, 0, 0, 0)}
            className="p-2.5 rounded border border-slate-200 bg-slate-50/60 hover:bg-slate-100 hover:border-slate-300 text-left transition-all"
          >
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <PlusCircle className="w-3.5 h-3.5 text-purple-700" />
              <span>+₹4.5k/mo New Tool</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Simulates new recurring commitment</div>
          </button>
        </div>
      </div>

      {/* Outcome Banner */}
      <div
        className={`rounded-lg border p-3.5 transition-all text-xs ${
          isSimulatedBetter
            ? 'border-emerald-200 bg-emerald-50/20 text-slate-900'
            : 'border-rose-200 bg-rose-50/20 text-slate-900'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            {isSimulatedBetter ? (
              <TrendingUp className="w-4 h-4 text-emerald-700 shrink-0" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <div>
              <span className="font-semibold text-slate-900">
                Simulation Analysis:
              </span>{' '}
              <span className="text-slate-700">{scenarioResult.summaryNote}</span>
            </div>
          </div>

          <button
            onClick={() => setActivePage('insights')}
            className="shrink-0 rounded bg-slate-900 hover:bg-slate-800 text-white px-3 py-1 text-xs font-semibold"
          >
            Apply in Insights
          </button>
        </div>
      </div>

      {/* Simulator KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          title="Simulated Safety Score"
          value={`${scenarioResult.simulatedSafetyScore}/100`}
          subValue={`Baseline: ${scenarioResult.baselineSafetyScore}/100`}
          variant={scenarioResult.simulatedSafetyScore >= scenarioResult.baselineSafetyScore ? 'highlight' : 'danger'}
          change={{
            value: scenarioResult.simulatedSafetyScore - scenarioResult.baselineSafetyScore,
            isPositiveGood: true
          }}
        />

        <MetricCard
          title="Simulated Shortage Risk"
          value={`${scenarioResult.simulatedRiskProbability}%`}
          subValue={`Baseline: ${scenarioResult.baselineRiskProbability}%`}
          variant={scenarioResult.simulatedRiskProbability >= 65 ? 'danger' : 'default'}
        />

        <MetricCard
          title="Simulated Min Balance"
          value={formatCurrency(scenarioResult.simulatedMinBalance)}
          subValue={`Baseline: ${formatCurrency(scenarioResult.baselineMinBalance)}`}
          variant={scenarioResult.simulatedMinBalance >= scenarioParams.safeBufferAmount ? 'highlight' : 'danger'}
        />

        <MetricCard
          title="Net Liquidity Delta"
          value={`${scenarioResult.balanceDelta >= 0 ? '+' : '-'}${formatCurrency(Math.abs(scenarioResult.balanceDelta))}`}
          subValue="Impact on lowest cash point"
          icon={DollarSign}
        />
      </div>

      {/* Controls & Comparison Chart Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Col: Parameter Sliders */}
        <div className="lg:col-span-5 rounded-lg border border-slate-200 bg-white p-4 space-y-3.5">
          <div className="pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Stress Parameters
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            {/* Control 1: Emergency Capital Injection */}
            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span className="text-slate-700">Add Emergency Funding:</span>
                <span className="text-emerald-700 font-bold font-mono">
                  +{formatCurrency(scenarioParams.emergencyFundingAmount)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100000"
                step="5000"
                value={scenarioParams.emergencyFundingAmount}
                onChange={(e) =>
                  setScenarioParams((prev) => ({
                    ...prev,
                    emergencyFundingAmount: parseFloat(e.target.value)
                  }))
                }
                className="w-full accent-emerald-700 cursor-pointer"
              />
            </div>

            {/* Control 2: Delay Invoice Payment by 7, 14, 30 days */}
            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span className="text-slate-700">Delay Invoice Collection:</span>
                <span className="text-amber-700 font-bold font-mono">
                  {scenarioParams.customerPaymentDelayDays} Days Lag
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1">
                {[0, 7, 14, 30].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() =>
                      setScenarioParams((prev) => ({ ...prev, customerPaymentDelayDays: d }))
                    }
                    className={`py-0.5 rounded text-[10px] font-mono border transition-all ${
                      scenarioParams.customerPaymentDelayDays === d
                        ? 'bg-amber-600 text-white border-amber-600 font-semibold shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {d === 0 ? '0d' : `+${d}d`}
                  </button>
                ))}
              </div>
            </div>

            {/* Control 3: Safe Buffer Target */}
            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span className="text-slate-700">Safe Cushion Target:</span>
                <span className="text-slate-900 font-bold font-mono">
                  {formatCurrency(scenarioParams.safeBufferAmount)}
                </span>
              </div>
              <input
                type="range"
                min="5000"
                max="50000"
                step="2500"
                value={scenarioParams.safeBufferAmount}
                onChange={(e) =>
                  setScenarioParams((prev) => ({
                    ...prev,
                    safeBufferAmount: parseFloat(e.target.value)
                  }))
                }
                className="w-full accent-slate-800 cursor-pointer"
              />
            </div>

            {/* Control 4: Add New Recurring Tool */}
            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span className="text-slate-700">New Recurring Commitment:</span>
                <span className="text-purple-700 font-bold font-mono">
                  +{formatCurrency(scenarioParams.newRecurringExpenseAmount)}/mo
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="20000"
                step="1000"
                value={scenarioParams.newRecurringExpenseAmount}
                onChange={(e) =>
                  setScenarioParams((prev) => ({
                    ...prev,
                    newRecurringExpenseAmount: parseFloat(e.target.value)
                  }))
                }
                className="w-full accent-purple-700 cursor-pointer"
              />
            </div>

            {/* Control 5: Reduce Food & Dining Cut % */}
            <div className="space-y-1">
              <div className="flex justify-between font-medium">
                <span className="text-slate-700">Reduce Food & Dining:</span>
                <span className="text-teal-700 font-bold font-mono">
                  -{scenarioParams.foodExpenseReductionPercent}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                value={scenarioParams.foodExpenseReductionPercent}
                onChange={(e) =>
                  setScenarioParams((prev) => ({
                    ...prev,
                    foodExpenseReductionPercent: parseInt(e.target.value)
                  }))
                }
                className="w-full accent-teal-700 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Col: Comparison Line Chart */}
        <div className="lg:col-span-7 rounded-lg border border-slate-200 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Baseline Reality vs. Simulated Trajectory
              </h3>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={scenarioResult.timeline} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#F1F5F9" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={{ stroke: '#E2E8F0' }}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => formatCurrency(val, true)}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded border border-slate-700 bg-slate-900 p-2.5 text-white text-xs space-y-1 z-30">
                          <div className="font-bold text-slate-200 border-b border-slate-800 pb-1">
                            {label} (Day {data.dayIndex})
                          </div>
                          <div className="pt-0.5 flex justify-between gap-3">
                            <span className="text-slate-400">Baseline:</span>
                            <span className="font-mono text-slate-300 font-semibold">{formatCurrency(data.baselineBalance)}</span>
                          </div>
                          <div className="flex justify-between gap-3">
                            <span className="text-emerald-400">Simulated:</span>
                            <span className="font-mono text-emerald-400 font-bold">{formatCurrency(data.simulatedBalance)}</span>
                          </div>
                          <div className="flex justify-between gap-3 border-t border-slate-800 pt-0.5">
                            <span className="text-slate-400">Variance:</span>
                            <span className={`font-mono font-semibold ${data.variance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {data.variance >= 0 ? `+${formatCurrency(data.variance)}` : `-${formatCurrency(Math.abs(data.variance))}`}
                            </span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 8, fontSize: 11 }} />
                <ReferenceLine
                  y={scenarioParams.safeBufferAmount}
                  stroke="#F43F5E"
                  strokeDasharray="3 3"
                  label={{
                    value: `Buffer: ${formatCurrency(scenarioParams.safeBufferAmount)}`,
                    position: 'right',
                    fill: '#F43F5E',
                    fontSize: 10
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="baselineBalance"
                  name="Baseline"
                  stroke="#0F172A"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="simulatedBalance"
                  name="Simulated"
                  stroke="#059669"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
