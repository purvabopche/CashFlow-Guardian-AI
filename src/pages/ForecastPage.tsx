import React, { useState } from 'react';
import {
  TrendingUp,
  Calendar,
  Shield,
  ArrowDownLeft,
  ArrowUpRight,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Sliders,
  DollarSign,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
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
import { StatusBadge } from '../components/common/StatusBadge';
import { MetricCard } from '../components/common/MetricCard';

export const ForecastPage: React.FC = () => {
  const {
    forecast,
    forecastRangeDays,
    setForecastRangeDays,
    summary,
    updateSafeBuffer,
    dataset
  } = useFinancial();

  const [granularity, setGranularity] = useState<'daily' | 'weekly'>('daily');
  const [filterRiskOnly, setFilterRiskOnly] = useState(false);
  const [editingBuffer, setEditingBuffer] = useState(false);
  const [bufferInput, setBufferInput] = useState(summary.safeBufferThreshold.toString());

  // Aggregate by week if weekly selected
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
          date: `Week ${weekIndex} (${day.date})`,
          dayIndex: day.dayIndex,
          projectedBalance: day.projectedBalance,
          predictedInflow: day.predictedInflow,
          predictedOutflow: day.predictedOutflow,
          netChange: day.netChange,
          isBelowThreshold: day.isBelowThreshold,
          riskLevel: day.riskLevel
        };
      } else {
        currentWeek.projectedBalance = day.projectedBalance; // end-of-week balance
        currentWeek.predictedInflow += day.predictedInflow;
        currentWeek.predictedOutflow += day.predictedOutflow;
        currentWeek.netChange += day.netChange;
        if (day.isBelowThreshold) currentWeek.isBelowThreshold = true;
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
    if (!isNaN(val) && val >= 1000) {
      updateSafeBuffer(val);
      setEditingBuffer(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Cash Flow Forecast
            </h1>
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
              Predictive Time-Series
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Projected daily and weekly liquidity balance with safe buffer boundary triggers.
          </p>
        </div>

        {/* Forecast Horizon Switcher (30, 60, 90 days) */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          {[30, 60, 90].map((days) => (
            <button
              key={days}
              onClick={() => setForecastRangeDays(days)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                forecastRangeDays === days
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Safe Cash Buffer"
          value={`$${summary.safeBufferThreshold.toLocaleString()}`}
          subValue={editingBuffer ? 'Enter new threshold' : 'Click to adjust target'}
          icon={Shield}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          badge={
            <button
              onClick={() => setEditingBuffer(!editingBuffer)}
              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 underline"
            >
              {editingBuffer ? 'Cancel' : 'Edit'}
            </button>
          }
        />

        <MetricCard
          title="Lowest Projected Point"
          value={`$${forecast.lowestProjectedPoint.toLocaleString()}`}
          subValue={forecast.lowestProjectedPoint >= summary.safeBufferThreshold ? 'Safe Cushion Maintained' : 'Deficit Risk Detected'}
          variant={forecast.lowestProjectedPoint >= summary.safeBufferThreshold ? 'highlight' : 'danger'}
          icon={TrendingUp}
          iconBg={forecast.lowestProjectedPoint >= summary.safeBufferThreshold ? 'bg-emerald-50' : 'bg-rose-50'}
          iconColor={forecast.lowestProjectedPoint >= summary.safeBufferThreshold ? 'text-emerald-600' : 'text-rose-600'}
        />

        <MetricCard
          title="Days Below Buffer"
          value={`${forecast.daysBelowThresholdCount} Days`}
          subValue={forecast.predictedBreachDate ? `First breach: ${forecast.predictedBreachDate}` : 'No buffer breach predicted'}
          icon={AlertTriangle}
          iconBg={forecast.daysBelowThresholdCount > 0 ? 'bg-rose-50' : 'bg-emerald-50'}
          iconColor={forecast.daysBelowThresholdCount > 0 ? 'text-rose-600' : 'text-emerald-600'}
        />

        <MetricCard
          title="Total Projected Inflow"
          value={`$${forecast.totalProjectedInflow.toLocaleString()}`}
          subValue={`Outflow: $${forecast.totalProjectedOutflow.toLocaleString()}`}
          icon={ArrowDownLeft}
          iconBg="bg-slate-100"
          iconColor="text-slate-800"
        />
      </div>

      {/* Inline Safe Buffer Editor if open */}
      {editingBuffer && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-slide-up">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-blue-900 font-medium">
              Configure minimum reserve cushion required for uninterrupted operations:
            </span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-40">
              <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="number"
                min="1000"
                step="1000"
                value={bufferInput}
                onChange={(e) => setBufferInput(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleBufferSave}
              className="rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 text-xs font-bold shadow-sm"
            >
              Save Buffer
            </button>
          </div>
        </div>
      )}

      {/* Main Forecast Chart Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">
                {forecastRangeDays}-Day Cash Flow & Liquidity Projection
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Line represents closing cash balance; columns represent daily inflows vs disbursements.
            </p>
          </div>

          {/* Granularity Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">View:</span>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg">
              <button
                onClick={() => setGranularity('daily')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                  granularity === 'daily' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                Daily
              </button>
              <button
                onClick={() => setGranularity('weekly')}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                  granularity === 'weekly' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                }`}
              >
                Weekly
              </button>
            </div>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={displayChartData} margin={{ top: 15, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
              />
              <YAxis
                yAxisId="balance"
                orientation="left"
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
              />
              <YAxis
                yAxisId="flows"
                orientation="right"
                tick={{ fontSize: 10, fill: '#94A3B8' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-slate-200 bg-slate-900 p-3.5 shadow-xl text-white text-xs space-y-1.5 z-30 min-w-[200px]">
                        <div className="font-bold text-emerald-400 border-b border-slate-800 pb-1 flex justify-between gap-4">
                          <span>{label}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-mono ${data.isBelowThreshold ? 'bg-rose-900 text-rose-300' : 'bg-emerald-900 text-emerald-300'}`}>
                            {data.riskLevel}
                          </span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-400">Closing Balance:</span>
                          <span className="font-bold text-white font-mono">${data.projectedBalance.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-emerald-400">Inflow:</span>
                          <span className="font-mono text-emerald-400 font-semibold">+${data.predictedInflow.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-rose-400">Outflow:</span>
                          <span className="font-mono text-rose-400 font-semibold">-${data.predictedOutflow.toLocaleString()}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 15, fontSize: 11 }}
              />
              <ReferenceLine
                yAxisId="balance"
                y={summary.safeBufferThreshold}
                stroke="#F43F5E"
                strokeDasharray="4 4"
                strokeWidth={2}
                label={{
                  value: `Safe Buffer ($${(summary.safeBufferThreshold / 1000).toFixed(0)}k)`,
                  position: 'top',
                  fill: '#F43F5E',
                  fontSize: 10,
                  fontWeight: 600
                }}
              />
              <Bar
                yAxisId="flows"
                dataKey="predictedInflow"
                name="Predicted Inflow"
                fill="#10B981"
                opacity={0.7}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                yAxisId="flows"
                dataKey="predictedOutflow"
                name="Predicted Outflow"
                fill="#F43F5E"
                opacity={0.6}
                radius={[4, 4, 0, 0]}
              />
              <Line
                yAxisId="balance"
                type="monotone"
                dataKey="projectedBalance"
                name="Projected Balance"
                stroke="#0F172A"
                strokeWidth={3}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Forecast Breakdown Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Timeline Daily Forecast Ledger</h3>
            <p className="text-xs text-slate-500">
              Audit granular projected balances and safety buffer compliance day by day.
            </p>
          </div>

          <button
            onClick={() => setFilterRiskOnly(!filterRiskOnly)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
              filterRiskOnly
                ? 'bg-rose-50 border-rose-300 text-rose-800'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>{filterRiskOnly ? 'Showing Buffer Breaches Only' : 'Filter High Risk Days'}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-bold uppercase text-[11px]">
                <th className="py-3 px-3">Date</th>
                <th className="py-3 px-3">Day</th>
                <th className="py-3 px-3">Projected Balance</th>
                <th className="py-3 px-3 text-emerald-700">Inflow</th>
                <th className="py-3 px-3 text-rose-700">Outflow</th>
                <th className="py-3 px-3">Net Change</th>
                <th className="py-3 px-3">Risk Level</th>
                <th className="py-3 px-3">Events / Triggers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLedger.slice(0, 15).map((d) => (
                <tr
                  key={d.dayIndex}
                  className={`hover:bg-slate-50 transition-colors ${
                    d.isBelowThreshold ? 'bg-rose-50/30' : ''
                  }`}
                >
                  <td className="py-3 px-3 font-semibold text-slate-900">{d.date}</td>
                  <td className="py-3 px-3 text-slate-500 font-mono">Day {d.dayIndex}</td>
                  <td className="py-3 px-3 font-bold font-mono">
                    <span className={d.isBelowThreshold ? 'text-rose-600' : 'text-slate-900'}>
                      ${d.projectedBalance.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-emerald-600 font-medium">
                    +${d.predictedInflow.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 font-mono text-rose-600 font-medium">
                    -${d.predictedOutflow.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 font-mono font-medium">
                    <span className={d.netChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                      {d.netChange >= 0 ? `+$${d.netChange.toLocaleString()}` : `-$${Math.abs(d.netChange).toLocaleString()}`}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <StatusBadge level={d.riskLevel} size="sm" />
                  </td>
                  <td className="py-3 px-3 text-[11px] text-slate-500">
                    {d.events ? (
                      <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/80">
                        {d.events.join('; ')}
                      </span>
                    ) : (
                      <span className="text-slate-400">Regular Flow</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
