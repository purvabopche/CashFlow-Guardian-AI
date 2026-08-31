import React, { useState } from 'react';
import {
  TrendingUp,
  Shield,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  Filter,
  CheckCircle2,
  Calendar,
  Layers,
  Edit2,
  Check,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
  Legend
} from 'recharts';
import { useFinancial } from '../context/FinancialContext';
import { EmptyState } from '../components/common/EmptyState';
import { IntelligenceJourneyFooter } from '../components/common/IntelligenceJourneyFooter';

export const ForecastPage: React.FC = () => {
  const {
    forecast,
    forecastRangeDays,
    setForecastRangeDays,
    summary,
    formatCurrency,
    updateSafeBuffer
  } = useFinancial();

  const [granularity, setGranularity] = useState<'daily' | 'weekly'>('daily');
  const [filterRiskOnly, setFilterRiskOnly] = useState(false);
  const [editingBuffer, setEditingBuffer] = useState(false);
  const [bufferInput, setBufferInput] = useState(summary.safeBufferThreshold.toString());

  const displayChartData = React.useMemo(() => {
    if (granularity === 'daily') {
      return forecast.forecastDays;
    }

    const weeklyData: any[] = [];
    let currentWeek: any = null;

    forecast.forecastDays.forEach((day, index) => {
      const weekIndex = Math.floor(index / 7) + 1;
      if (!currentWeek || currentWeek.weekIndex !== weekIndex) {
        if (currentWeek) weeklyData.push(currentWeek);
        currentWeek = {
          date: `W${weekIndex} (${day.date})`,
          dayIndex: day.dayIndex,
          projectedBalance: day.projectedBalance,
          predictedInflow: day.predictedInflow,
          predictedOutflow: day.predictedOutflow,
          netChange: day.netChange,
          isBelowThreshold: day.isBelowThreshold,
          isDangerZone: day.isDangerZone,
          riskLevel: day.riskLevel
        };
      } else {
        currentWeek.projectedBalance = day.projectedBalance;
        currentWeek.predictedInflow += day.predictedInflow;
        currentWeek.predictedOutflow += day.predictedOutflow;
        currentWeek.netChange += day.netChange;
        if (day.isBelowThreshold) currentWeek.isBelowThreshold = true;
        if (day.isDangerZone) currentWeek.isDangerZone = true;
        if (day.riskLevel === 'Critical' || day.riskLevel === 'High') {
          currentWeek.riskLevel = day.riskLevel;
        }
      }
    });

    if (currentWeek) weeklyData.push(currentWeek);
    return weeklyData;
  }, [forecast.forecastDays, granularity]);

  const filteredLedger = forecast.forecastDays.filter((d) => {
    if (filterRiskOnly) return d.isBelowThreshold || d.riskLevel !== 'Low';
    return true;
  });

  const handleBufferSave = () => {
    const val = parseFloat(bufferInput);
    if (!isNaN(val) && val >= 500) {
      updateSafeBuffer(val);
      setEditingBuffer(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* 1. Workstation Header & Resolution Switchers */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/90 font-sans">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
            <span>Cash flow forecast</span>
            <span className="text-slate-300">•</span>
            <span>{forecastRangeDays}-day outlook</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
              ML forecast model
            </span>
          </div>
          <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold text-slate-900 tracking-tight mt-1">
            Where your balance is heading
          </h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap self-start lg:self-auto font-sans">
          {/* Resolution toggle */}
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200 text-xs">
            <button
              onClick={() => setGranularity('daily')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                granularity === 'daily'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setGranularity('weekly')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                granularity === 'weekly'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weekly
            </button>
          </div>

          {/* Horizon toggle */}
          <div className="inline-flex rounded-lg bg-slate-200/80 p-0.5 border border-slate-300/80 text-xs">
            {[30, 60, 90].map((days) => (
              <button
                key={days}
                onClick={() => setForecastRangeDays(days)}
                className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                  forecastRangeDays === days
                    ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Analytical Telemetry Ticker */}
      <div className="fintech-card rounded-xl border border-slate-200/90 p-4 shadow-2xs fintech-card-highlight">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {/* Safe Buffer Target */}
          <div className="space-y-1 font-sans">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-slate-500" />
                Safe buffer
              </span>
              <button
                onClick={() => setEditingBuffer(!editingBuffer)}
                className="text-xs text-slate-500 hover:text-slate-800 underline"
              >
                {editingBuffer ? 'Cancel' : 'Edit'}
              </button>
            </div>
            {editingBuffer ? (
              <div className="flex items-center gap-1 mt-1">
                <input
                  type="number"
                  value={bufferInput}
                  onChange={(e) => setBufferInput(e.target.value)}
                  className="w-24 px-2 py-0.5 border border-slate-300 rounded text-xs font-mono font-bold"
                  autoFocus
                />
                <button
                  onClick={handleBufferSave}
                  className="p-1 rounded bg-slate-900 text-white hover:bg-slate-800"
                >
                  <Check className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {formatCurrency(summary.safeBufferThreshold)}
              </div>
            )}
            <p className="text-xs text-slate-500">Minimum operating cushion</p>
          </div>

          {/* Lowest Point */}
          <div className="space-y-1 pt-3 md:pt-0 md:pl-4 font-sans">
            <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-slate-500" />
              Lowest point
            </span>
            <div
              className={`text-2xl font-bold font-mono tabular-nums ${
                forecast.lowestProjectedPoint < summary.safeBufferThreshold
                  ? 'text-rose-600'
                  : 'text-slate-900'
              }`}
            >
              {formatCurrency(forecast.lowestProjectedPoint)}
            </div>
            <p className="text-xs text-slate-500">
              {forecast.lowestProjectedPoint < summary.safeBufferThreshold
                ? 'Breaches safe threshold'
                : 'Buffer maintained safely'}
            </p>
          </div>

          {/* Breach Window */}
          <div className="space-y-1 pt-3 md:pt-0 md:pl-4 font-sans">
            <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              Days below buffer
            </span>
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {forecast.daysBelowThresholdCount}{' '}
              <span className="text-xs font-normal text-slate-400 font-sans">days</span>
            </div>
            <p className="text-xs text-slate-500">
              {forecast.predictedBreachDate ? `First breach: ${forecast.predictedBreachDate}` : 'Zero breach days'}
            </p>
          </div>

          {/* Projected Inflows */}
          <div className="space-y-1 pt-3 md:pt-0 md:pl-4 font-sans">
            <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
              Expected inflows
            </span>
            <div className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
              +{formatCurrency(forecast.totalProjectedInflow)}
            </div>
            <p className="text-xs text-slate-500">{forecastRangeDays}-day expected receipts</p>
          </div>

          {/* Projected Outflows */}
          <div className="space-y-1 pt-3 md:pt-0 md:pl-4 font-sans">
            <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
              Expected outflows
            </span>
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              -{formatCurrency(forecast.totalProjectedOutflow)}
            </div>
            <p className="text-xs text-slate-500">{forecastRangeDays}-day scheduled bills</p>
          </div>
        </div>
      </div>

      {/* 3. Core Forecasting Canvas (Hero Element) */}
      <div className="fintech-card rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4 fintech-card-highlight font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-800" />
              <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
                Projected cash trajectory ({forecastRangeDays} days)
              </h2>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Simulated closing cash balances mapped against scheduled disbursements and client collections.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-sans text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-emerald-600 inline-block" />
              <span>Projected balance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t-2 border-dashed border-rose-500 inline-block" />
              <span>Safe buffer ({formatCurrency(summary.safeBufferThreshold)})</span>
            </div>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="h-88 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={displayChartData} margin={{ top: 15, right: 15, left: -10, bottom: 5 }}>
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
                    const isBelow = data.projectedBalance < summary.safeBufferThreshold;
                    const variance = data.projectedBalance - summary.safeBufferThreshold;
                    return (
                      <div className="rounded-xl border border-slate-800 bg-slate-950 text-white p-3.5 shadow-2xl text-xs space-y-1.5 min-w-[210px] font-sans">
                        <div className="font-semibold text-slate-200 border-b border-slate-800 pb-1 flex justify-between">
                          <span>{data.date}</span>
                          <span className="text-xs text-slate-400 font-mono">Day {data.dayIndex}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-300">
                          <span>Closing Balance:</span>
                          <strong
                            className={`font-mono text-sm ${isBelow ? 'text-rose-400' : 'text-emerald-400'}`}
                          >
                            {formatCurrency(data.projectedBalance)}
                          </strong>
                        </div>
                        {data.predictedInflow > 0 && (
                          <div className="flex justify-between text-emerald-400 font-mono text-xs">
                            <span>Expected Inflow:</span>
                            <span>+{formatCurrency(data.predictedInflow)}</span>
                          </div>
                        )}
                        {data.predictedOutflow > 0 && (
                          <div className="flex justify-between text-rose-400 font-mono text-xs">
                            <span>Scheduled Outflow:</span>
                            <span>-{formatCurrency(data.predictedOutflow)}</span>
                          </div>
                        )}
                        <div className="pt-1 border-t border-slate-800 flex justify-between text-xs text-slate-400 font-mono">
                          <span>Buffer Variance:</span>
                          <span className={variance >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                            {variance >= 0 ? `+${formatCurrency(variance)}` : formatCurrency(variance)}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="predictedInflow" fill="#10B981" opacity={0.4} radius={[2, 2, 0, 0]} name="Expected Inflow" />
              <Bar dataKey="predictedOutflow" fill="#F43F5E" opacity={0.3} radius={[2, 2, 0, 0]} name="Scheduled Outflow" />
              <ReferenceLine
                y={summary.safeBufferThreshold}
                stroke="#E11D48"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: `Safe Buffer (${formatCurrency(summary.safeBufferThreshold)})`,
                  fill: '#E11D48',
                  fontSize: 11,
                  position: 'insideTopRight',
                  fontWeight: 600
                }}
              />
              <ReferenceLine y={0} stroke="#94A3B8" strokeWidth={1} />
              <Line
                type="monotone"
                dataKey="projectedBalance"
                stroke="#059669"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#059669', stroke: '#ffffff', strokeWidth: 2 }}
                name="Projected Balance"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Supporting Forecast Days Ledger */}
      <div className="rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden font-sans">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
              Daily forecast breakdown
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Day-by-day cash flow audit factoring in scheduled transactions and expected client receivables.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterRiskOnly(!filterRiskOnly)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-colors btn-interactive ${
                filterRiskOnly
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{filterRiskOnly ? 'Showing deficit days only' : 'Filter deficit days'}</span>
            </button>
          </div>
        </div>

        {filteredLedger.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={CheckCircle2}
              title="No deficit days predicted"
              description="Across this forecast window, your closing balance remains safely above your target operating buffer."
              actionLabel="Show all days"
              onAction={() => setFilterRiskOnly(false)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse font-sans">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/80 text-xs uppercase tracking-wider font-semibold text-slate-500">
                  <th className="py-3.5 px-5">Day</th>
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5 text-right">Inflow</th>
                  <th className="py-3.5 px-5 text-right">Outflow</th>
                  <th className="py-3.5 px-5 text-right">Net change</th>
                  <th className="py-3.5 px-5 text-right">Ending balance</th>
                  <th className="py-3.5 px-5 text-center">Buffer status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans text-sm">
                {filteredLedger.map((day) => {
                  const isBelow = day.isBelowThreshold;
                  return (
                    <tr
                      key={day.dayIndex}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isBelow ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      <td className="py-3.5 px-5 font-mono text-xs text-slate-500 font-semibold align-middle">
                        Day {day.dayIndex}
                      </td>
                      <td className="py-3.5 px-5 font-mono text-slate-900 font-medium whitespace-nowrap text-sm align-middle">
                        {day.date}
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono text-emerald-700 whitespace-nowrap tabular-nums text-sm align-middle">
                        {day.predictedInflow > 0 ? `+${formatCurrency(day.predictedInflow)}` : '—'}
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono text-rose-600 whitespace-nowrap tabular-nums text-sm align-middle">
                        {day.predictedOutflow > 0 ? `-${formatCurrency(day.predictedOutflow)}` : '—'}
                      </td>
                      <td
                        className={`py-3.5 px-5 text-right font-mono font-medium whitespace-nowrap tabular-nums text-sm align-middle ${
                          day.netChange > 0
                            ? 'text-emerald-700'
                            : day.netChange < 0
                            ? 'text-rose-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {day.netChange > 0 ? `+${formatCurrency(day.netChange)}` : day.netChange < 0 ? formatCurrency(day.netChange) : '₹0'}
                      </td>
                      <td className="py-3.5 px-5 text-right font-mono font-bold text-sm text-slate-900 whitespace-nowrap tabular-nums align-middle">
                        <span className={isBelow ? 'text-rose-600' : 'text-slate-900'}>
                          {formatCurrency(day.projectedBalance)}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 text-center whitespace-nowrap align-middle">
                        {isBelow ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
                            Deficit breach
                          </span>
                        ) : day.projectedBalance < summary.safeBufferThreshold * 1.2 ? (
                          <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            Tight buffer
                          </span>
                        ) : (
                          <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            Safe cushion
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Product Intelligence Journey Stepper */}
      <IntelligenceJourneyFooter currentPage="forecast" />
    </div>
  );
};
