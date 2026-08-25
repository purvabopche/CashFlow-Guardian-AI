import React from 'react';
import {
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Calendar,
  Shield,
  Zap,
  Info
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
    setActivePage
  } = useFinancial();

  // Preset Scenarios
  const applyPreset = (
    delay: number,
    expense: number,
    revPct: number,
    vendorShift: number,
    buffer?: number
  ) => {
    setScenarioParams({
      customerPaymentDelayDays: delay,
      upcomingExpenseAmount: expense,
      monthlyRevenueChangePercent: revPct,
      vendorPaymentShiftDays: vendorShift,
      safeBufferAmount: buffer ?? summary.safeBufferThreshold
    });
  };

  const isSimulatedBetter = scenarioResult.balanceDelta >= 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              What-If Scenario Simulator
            </h1>
            <span className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-800 border border-blue-200">
              Interactive Stress Testing
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Simulate operational delays, large unbudgeted capital expenses, or revenue shocks to test cash resilience dynamically.
          </p>
        </div>

        <button
          onClick={resetScenarioParams}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
          <span>Reset to Baseline</span>
        </button>
      </div>

      {/* Preset Scenario Buttons */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
          Quick Scenario Presets
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <button
            onClick={() => applyPreset(25, 0, -10, 0)}
            className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-rose-50/50 hover:border-rose-200 text-left transition-all group"
          >
            <div className="font-bold text-xs text-slate-900 group-hover:text-rose-900">
              Worst Case: 25d Client Delay
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Receivables lag + 10% revenue drop</div>
          </button>

          <button
            onClick={() => applyPreset(0, 18000, 0, 0)}
            className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-amber-50/50 hover:border-amber-200 text-left transition-all group"
          >
            <div className="font-bold text-xs text-slate-900 group-hover:text-amber-900">
              Unplanned Capex / Tax Surge
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Immediate $18,000 cash outlay</div>
          </button>

          <button
            onClick={() => applyPreset(0, 0, 15, 14)}
            className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-emerald-50/50 hover:border-emerald-200 text-left transition-all group"
          >
            <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-900">
              Optimistic: Fast Collection
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">+15% revenue & 14d vendor extension</div>
          </button>

          <button
            onClick={() => applyPreset(14, 8000, -5, -7)}
            className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-purple-50/50 hover:border-purple-200 text-left transition-all group"
          >
            <div className="font-bold text-xs text-slate-900 group-hover:text-purple-900">
              Supply Chain Squeeze
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">Early vendor demand + $8k capex</div>
          </button>
        </div>
      </div>

      {/* Dynamic Scenario Outcome Alert / Banner */}
      <div
        className={`rounded-2xl border p-5 transition-all ${
          isSimulatedBetter
            ? 'border-emerald-200 bg-gradient-to-r from-emerald-50 via-teal-50/50 to-white'
            : 'border-rose-200 bg-gradient-to-r from-rose-50 via-amber-50/50 to-white'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-md ${
                isSimulatedBetter ? 'bg-emerald-600' : 'bg-rose-600'
              }`}
            >
              {isSimulatedBetter ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Simulation Outcome Analysis
                </h3>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    isSimulatedBetter
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {isSimulatedBetter ? 'Improved Position' : 'Liquidity Pressure'}
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">{scenarioResult.summaryNote}</p>
            </div>
          </div>

          <button
            onClick={() => setActivePage('insights')}
            className="shrink-0 flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Remediate in AI Insights</span>
          </button>
        </div>
      </div>

      {/* Simulator Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Simulated Min Balance"
          value={`$${scenarioResult.simulatedMinBalance.toLocaleString()}`}
          subValue={`Baseline: $${scenarioResult.baselineMinBalance.toLocaleString()}`}
          variant={scenarioResult.simulatedMinBalance >= scenarioParams.safeBufferAmount ? 'highlight' : 'danger'}
          change={{
            value: Math.round(((scenarioResult.simulatedMinBalance - scenarioResult.baselineMinBalance) / Math.max(1, Math.abs(scenarioResult.baselineMinBalance))) * 100),
            period: 'vs baseline'
          }}
        />

        <MetricCard
          title="Simulated Shortage Risk"
          value={`${scenarioResult.simulatedRiskProbability}%`}
          subValue={`Baseline: ${scenarioResult.baselineRiskProbability}%`}
          variant={scenarioResult.simulatedRiskProbability >= 70 ? 'danger' : 'default'}
        />

        <MetricCard
          title="Lowest Balance Delta"
          value={`${scenarioResult.balanceDelta >= 0 ? '+$' : '-$'}${Math.abs(scenarioResult.balanceDelta).toLocaleString()}`}
          subValue="Net liquidity impact"
          icon={DollarSign}
          iconBg={scenarioResult.balanceDelta >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}
          iconColor={scenarioResult.balanceDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'}
        />

        <MetricCard
          title="Safe Buffer Target"
          value={`$${scenarioParams.safeBufferAmount.toLocaleString()}`}
          subValue="Threshold boundary"
          icon={Shield}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
      </div>

      {/* Interactive Controls & Chart Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Interactive Slider Controls */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Scenario Parameters
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Drag the sliders below to see live cash flow recalculations.
            </p>
          </div>

          <div className="space-y-5 text-xs">
            {/* Slider 1: Customer Payment Delay */}
            <div className="space-y-2">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700">Customer Payment Delay:</span>
                <span className="text-rose-600 font-bold font-mono">
                  {scenarioParams.customerPaymentDelayDays} Days
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="45"
                step="1"
                value={scenarioParams.customerPaymentDelayDays}
                onChange={(e) =>
                  setScenarioParams((prev) => ({
                    ...prev,
                    customerPaymentDelayDays: parseInt(e.target.value)
                  }))
                }
                className="w-full accent-rose-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0d (On Time)</span>
                <span>20d Lag</span>
                <span>45d Max Delay</span>
              </div>
            </div>

            {/* Slider 2: Upcoming Lump-Sum Expense */}
            <div className="space-y-2">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700">Upcoming Lump Expense ($):</span>
                <span className="text-slate-900 font-bold font-mono">
                  ${scenarioParams.upcomingExpenseAmount.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50000"
                step="1000"
                value={scenarioParams.upcomingExpenseAmount}
                onChange={(e) =>
                  setScenarioParams((prev) => ({
                    ...prev,
                    upcomingExpenseAmount: parseFloat(e.target.value)
                  }))
                }
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>$0</span>
                <span>$25,000</span>
                <span>$50,000</span>
              </div>
            </div>

            {/* Slider 3: Monthly Revenue Change */}
            <div className="space-y-2">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700">Monthly Revenue Shift:</span>
                <span
                  className={`font-bold font-mono ${
                    scenarioParams.monthlyRevenueChangePercent >= 0
                      ? 'text-emerald-600'
                      : 'text-rose-600'
                  }`}
                >
                  {scenarioParams.monthlyRevenueChangePercent >= 0 ? '+' : ''}
                  {scenarioParams.monthlyRevenueChangePercent}%
                </span>
              </div>
              <input
                type="range"
                min="-50"
                max="50"
                step="5"
                value={scenarioParams.monthlyRevenueChangePercent}
                onChange={(e) =>
                  setScenarioParams((prev) => ({
                    ...prev,
                    monthlyRevenueChangePercent: parseInt(e.target.value)
                  }))
                }
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>-50% (Downturn)</span>
                <span>0% (Neutral)</span>
                <span>+50% (Growth)</span>
              </div>
            </div>

            {/* Slider 4: Vendor Payment Shift */}
            <div className="space-y-2">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700">Vendor Payment Shift:</span>
                <span className="text-slate-900 font-bold font-mono">
                  {scenarioParams.vendorPaymentShiftDays > 0 ? `+${scenarioParams.vendorPaymentShiftDays}d (Postpone)` : scenarioParams.vendorPaymentShiftDays < 0 ? `${scenarioParams.vendorPaymentShiftDays}d (Accelerate)` : '0d (Original Dates)'}
                </span>
              </div>
              <input
                type="range"
                min="-15"
                max="30"
                step="1"
                value={scenarioParams.vendorPaymentShiftDays}
                onChange={(e) =>
                  setScenarioParams((prev) => ({
                    ...prev,
                    vendorPaymentShiftDays: parseInt(e.target.value)
                  }))
                }
                className="w-full accent-purple-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>-15d Early</span>
                <span>On Schedule</span>
                <span>+30d Extension</span>
              </div>
            </div>

            {/* Slider 5: Safe Cash Buffer Target */}
            <div className="space-y-2">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700">Safe Cash Buffer Target:</span>
                <span className="text-blue-600 font-bold font-mono">
                  ${scenarioParams.safeBufferAmount.toLocaleString()}
                </span>
              </div>
              <input
                type="range"
                min="5000"
                max="60000"
                step="2500"
                value={scenarioParams.safeBufferAmount}
                onChange={(e) =>
                  setScenarioParams((prev) => ({
                    ...prev,
                    safeBufferAmount: parseFloat(e.target.value)
                  }))
                }
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>$5,000</span>
                <span>$30,000</span>
                <span>$60,000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Side-by-Side Comparison Chart */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Trajectory Comparison: Baseline vs. Simulated
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Black line = Baseline reality | Emerald dashed line = Simulated scenario
                </p>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scenarioResult.timeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                    tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-xl border border-slate-200 bg-slate-900 p-3 shadow-xl text-white text-xs space-y-1 z-30">
                            <div className="font-bold text-slate-200 border-b border-slate-800 pb-1">
                              {label} (Day {data.dayIndex})
                            </div>
                            <div className="pt-1 flex justify-between gap-4">
                              <span className="text-slate-400">Baseline Balance:</span>
                              <span className="font-mono text-slate-300 font-bold">${data.baselineBalance.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-emerald-400 font-semibold">Simulated Balance:</span>
                              <span className="font-mono text-emerald-400 font-bold">${data.simulatedBalance.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between gap-4 border-t border-slate-800 pt-1">
                              <span className="text-slate-400">Variance:</span>
                              <span className={`font-mono font-bold ${data.variance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {data.variance >= 0 ? `+$${data.variance.toLocaleString()}` : `-$${Math.abs(data.variance).toLocaleString()}`}
                              </span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 10, fontSize: 11 }} />
                  <ReferenceLine
                    y={scenarioParams.safeBufferAmount}
                    stroke="#F43F5E"
                    strokeDasharray="4 4"
                    label={{
                      value: `Buffer: $${(scenarioParams.safeBufferAmount / 1000).toFixed(0)}k`,
                      position: 'right',
                      fill: '#F43F5E',
                      fontSize: 10
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="baselineBalance"
                    name="Baseline Balance"
                    stroke="#0F172A"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="simulatedBalance"
                    name="Simulated Balance"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Confidence Interval: 95% Bound</span>
            <span className="text-slate-700 font-medium">Deterministic Time-Series Simulation</span>
          </div>
        </div>
      </div>
    </div>
  );
};
