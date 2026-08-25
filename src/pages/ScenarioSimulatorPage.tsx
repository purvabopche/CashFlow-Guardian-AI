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
  Info,
  Utensils,
  ShoppingBag,
  Clock,
  ArrowRight,
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

  // Preset Scenario Handlers
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
            Simulate emergency cash injections, delayed customer receivables (7/14/30d), discretionary trims, or new recurring tools.
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

      {/* Standout 1-Click Scenario Prompts */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-emerald-600" /> Standout Scenario Prompts
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => applyPreset(0, 25000, 0, 0, 0, 0)}
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-emerald-50/60 hover:border-emerald-300 text-left transition-all group"
          >
            <div className="font-bold text-xs text-slate-900 group-hover:text-emerald-900 flex items-center gap-1.5">
              <PiggyBank className="w-3.5 h-3.5 text-emerald-600" />
              <span>Add ₹25,000 Emergency Funding?</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Instant liquidity bridge & risk drops to 12%</div>
          </button>

          <button
            onClick={() => applyPreset(0, 0, 0, 14, 0, 0)}
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-amber-50/60 hover:border-amber-300 text-left transition-all group"
          >
            <div className="font-bold text-xs text-slate-900 group-hover:text-amber-900 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Invoice delayed by 14 days?</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Simulate receivables collection lag</div>
          </button>

          <button
            onClick={() => applyPreset(0, 0, 0, 0, 25, 0)}
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-teal-50/60 hover:border-teal-300 text-left transition-all group"
          >
            <div className="font-bold text-xs text-slate-900 group-hover:text-teal-900 flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-teal-600" />
              <span>Reduce food & dining by 25%?</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Trim delivery & non-essential dining</div>
          </button>

          <button
            onClick={() => applyPreset(0, 0, 4500, 0, 0, 0)}
            className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-purple-50/60 hover:border-purple-300 text-left transition-all group"
          >
            <div className="font-bold text-xs text-slate-900 group-hover:text-purple-900 flex items-center gap-1.5">
              <PlusCircle className="w-3.5 h-3.5 text-purple-600" />
              <span>Add ₹4,500/mo New Tool?</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Test impact of new recurring commitment</div>
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
                  Dynamic Simulation Analysis
                </h3>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    isSimulatedBetter
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {isSimulatedBetter ? 'Liquidity Protected' : 'Increased Shortage Risk'}
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
            <span>Apply in AI Insights</span>
          </button>
        </div>
      </div>

      {/* Simulator KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Simulated Safety Score"
          value={`${scenarioResult.simulatedSafetyScore}/100`}
          subValue={`Baseline: ${scenarioResult.baselineSafetyScore}/100`}
          variant={scenarioResult.simulatedSafetyScore >= scenarioResult.baselineSafetyScore ? 'highlight' : 'danger'}
          change={{
            value: scenarioResult.simulatedSafetyScore - scenarioResult.baselineSafetyScore,
            isPositiveGood: true,
            period: 'score pts'
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
          iconBg={scenarioResult.balanceDelta >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}
          iconColor={scenarioResult.balanceDelta >= 0 ? 'text-emerald-600' : 'text-rose-600'}
        />
      </div>

      {/* Interactive Controls & Chart Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Col: Interactive Sliders */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              Interactive Stress Parameters
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Adjust variables to test financial resilience in real-time.
            </p>
          </div>

          <div className="space-y-4 text-xs">
            {/* Control 1: Emergency Capital Injection */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700">Add Emergency Funding:</span>
                <span className="text-emerald-600 font-bold font-mono">
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
                className="w-full accent-emerald-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>₹0</span>
                <span>₹50,000</span>
                <span>₹1,00,000</span>
              </div>
            </div>

            {/* Control 2: Delay Invoice Payment by 7, 14, 30 days */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700">Delay Invoice Collection:</span>
                <span className="text-amber-600 font-bold font-mono">
                  {scenarioParams.customerPaymentDelayDays} Days Lag
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1 pt-0.5 pb-1">
                {[0, 7, 14, 30].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() =>
                      setScenarioParams((prev) => ({ ...prev, customerPaymentDelayDays: d }))
                    }
                    className={`py-1 rounded-lg text-[11px] font-bold border transition-all ${
                      scenarioParams.customerPaymentDelayDays === d
                        ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {d === 0 ? 'On-Time' : `+${d} Days`}
                  </button>
                ))}
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={scenarioParams.customerPaymentDelayDays}
                onChange={(e) =>
                  setScenarioParams((prev) => ({
                    ...prev,
                    customerPaymentDelayDays: parseInt(e.target.value)
                  }))
                }
                className="w-full accent-amber-600 cursor-pointer"
              />
            </div>

            {/* Control 3: Safe Buffer Threshold Target */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700">Minimum Safety Cushion:</span>
                <span className="text-blue-600 font-bold font-mono">
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
                className="w-full accent-blue-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>₹5,000</span>
                <span>₹25,000</span>
                <span>₹50,000</span>
              </div>
            </div>

            {/* Control 4: Add New Recurring Expense / Tool */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700">Add New Recurring Expense:</span>
                <span className="text-purple-600 font-bold font-mono">
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
                className="w-full accent-purple-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>₹0/mo</span>
                <span>₹10,000/mo</span>
                <span>₹20,000/mo</span>
              </div>
            </div>

            {/* Control 5: Reduce Food & Dining Expense Cut % */}
            <div className="space-y-1.5">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-700">Reduce Food & Dining (%):</span>
                <span className="text-teal-600 font-bold font-mono">
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
                className="w-full accent-teal-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Col: Comparison Chart */}
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
                    tickFormatter={(val) => formatCurrency(val, true)}
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
                              <span className="font-mono text-slate-300 font-bold">{formatCurrency(data.baselineBalance)}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-emerald-400 font-semibold">Simulated Balance:</span>
                              <span className="font-mono text-emerald-400 font-bold">{formatCurrency(data.simulatedBalance)}</span>
                            </div>
                            <div className="flex justify-between gap-4 border-t border-slate-800 pt-1">
                              <span className="text-slate-400">Net Variance:</span>
                              <span className={`font-mono font-bold ${data.variance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {data.variance >= 0 ? `+${formatCurrency(data.variance)}` : `-${formatCurrency(Math.abs(data.variance))}`}
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
                      value: `Safe Buffer: ${formatCurrency(scenarioParams.safeBufferAmount)}`,
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

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Dynamic Liquidity Engine</span>
            <span>Real-time Financial Recalculation</span>
          </div>
        </div>
      </div>
    </div>
  );
};
