import React, { useState } from 'react';
import {
  TrendingUp,
  Shield,
  ArrowDownLeft,
  AlertTriangle,
  Filter,
  Info
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
import { StatusBadge } from '../components/common/StatusBadge';
import { MetricCard } from '../components/common/MetricCard';

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
    <div className="space-y-5 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Cash Flow Forecast & Risk Horizon
            </h1>
            <span className="text-xs font-mono text-slate-400">
              • {forecastRangeDays}-Day Rolling Horizon
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Forward cash projection with scheduled disbursements and buffer breach detection.
          </p>
        </div>

        {/* Forecast Horizon Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md border border-slate-200 self-start sm:self-auto">
          {[30, 60, 90].map((days) => (
            <button
              key={days}
              onClick={() => setForecastRangeDays(days)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                forecastRangeDays === days
                  ? 'bg-white text-slate-900 font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {days}d
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          title="Safe Buffer Target"
          value={formatCurrency(summary.safeBufferThreshold)}
          subValue={editingBuffer ? 'Enter target' : 'Click to adjust target'}
          icon={Shield}
          badge={
            <button
              onClick={() => setEditingBuffer(!editingBuffer)}
              className="text-[11px] font-medium text-slate-500 hover:text-slate-900 underline"
            >
              {editingBuffer ? 'Cancel' : 'Edit'}
            </button>
          }
        />

        <MetricCard
          title="Lowest Projected Point"
          value={formatCurrency(forecast.lowestProjectedPoint)}
          subValue={forecast.lowestProjectedPoint >= summary.safeBufferThreshold ? 'Safe Cushion Maintained' : 'Deficit Risk Detected'}
          variant={forecast.lowestProjectedPoint >= summary.safeBufferThreshold ? 'highlight' : 'danger'}
          icon={TrendingUp}
        />

        <MetricCard
          title="Days in Deficit Zone"
          value={`${forecast.daysBelowThresholdCount} Days`}
          subValue={forecast.predictedBreachDate ? `First breach: ${forecast.predictedBreachDate}` : 'No buffer breach predicted'}
          icon={AlertTriangle}
        />

        <MetricCard
          title="Total Projected Inflow"
          value={formatCurrency(forecast.totalProjectedInflow)}
          subValue={`Projected Outflow: ${formatCurrency(forecast.totalProjectedOutflow)}`}
          icon={ArrowDownLeft}
        />
      </div>

      {/* Inline Safe Buffer Editor */}
      {editingBuffer && (
        <div className="rounded-md border border-slate-300 bg-slate-50 p-3 flex flex-col sm:flex-row items-center justify-between gap-3 animate-slide-up text-xs">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-slate-600" />
            <span className="text-slate-800 font-medium">
              Configure minimum safe cash cushion:
            </span>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              type="number"
              min="500"
              step="500"
              value={bufferInput}
              onChange={(e) => setBufferInput(e.target.value)}
              className="w-full sm:w-36 px-2.5 py-1 rounded border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
            <button
              onClick={handleBufferSave}
              className="rounded bg-slate-900 hover:bg-slate-800 text-white px-3 py-1 text-xs font-semibold"
            >
              Save Target
            </button>
          </div>
        </div>
      )}

      {/* Composed Chart */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Projected Balance Trajectory & Inflow/Disbursement Schedule
            </h3>
            <p className="text-xs text-slate-500">
              Black line shows daily projected closing balance; vertical bars show scheduled events.
            </p>
          </div>

          {/* Granularity Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded border border-slate-200">
            <button
              onClick={() => setGranularity('daily')}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
                granularity === 'daily' ? 'bg-white text-slate-900 font-semibold shadow-sm' : 'text-slate-600'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setGranularity('weekly')}
              className={`px-2 py-0.5 rounded text-xs font-medium transition-all ${
                granularity === 'weekly' ? 'bg-white text-slate-900 font-semibold shadow-sm' : 'text-slate-600'
              }`}
            >
              Weekly
            </button>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={displayChartData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="2 2" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#64748B' }}
                tickLine={false}
                axisLine={{ stroke: '#E2E8F0' }}
              />
              <YAxis
                yAxisId="balance"
                orientation="left"
                tick={{ fontSize: 10, fill: '#64748B' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => formatCurrency(val, true)}
              />
              <YAxis
                yAxisId="flows"
                orientation="right"
                tick={{ fontSize: 9, fill: '#94A3B8' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => formatCurrency(val, true)}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded border border-slate-700 bg-slate-900 p-2.5 shadow-lg text-white text-xs space-y-1 z-30 min-w-[170px]">
                        <div className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex justify-between gap-3">
                          <span>{label}</span>
                          <span className={`text-[10px] uppercase font-mono ${data.isBelowThreshold ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {data.riskLevel}
                          </span>
                        </div>
                        <div className="flex justify-between gap-3 pt-0.5">
                          <span className="text-slate-400">Balance:</span>
                          <span className="font-bold text-white font-mono">{formatCurrency(data.projectedBalance)}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-emerald-400">Inflow:</span>
                          <span className="font-mono text-emerald-400">+{formatCurrency(data.predictedInflow)}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-rose-400">Outflow:</span>
                          <span className="font-mono text-rose-400">-{formatCurrency(data.predictedOutflow)}</span>
                        </div>
                        {data.events && (
                          <div className="pt-1 text-[10px] text-amber-300 border-t border-slate-800">
                            • {data.events.join(', ')}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: 10, fontSize: 11 }}
              />
              <ReferenceLine
                yAxisId="balance"
                y={summary.safeBufferThreshold}
                stroke="#F43F5E"
                strokeDasharray="3 3"
                strokeWidth={1.5}
                label={{
                  value: `Buffer (${formatCurrency(summary.safeBufferThreshold)})`,
                  position: 'top',
                  fill: '#F43F5E',
                  fontSize: 10
                }}
              />
              <Bar
                yAxisId="flows"
                dataKey="predictedInflow"
                name="Inflow Events"
                fill="#10B981"
                opacity={0.65}
                radius={[2, 2, 0, 0]}
              />
              <Bar
                yAxisId="flows"
                dataKey="predictedOutflow"
                name="Disbursements"
                fill="#F43F5E"
                opacity={0.55}
                radius={[2, 2, 0, 0]}
              />
              <Line
                yAxisId="balance"
                type="monotone"
                dataKey="projectedBalance"
                name="Projected Balance"
                stroke="#0F172A"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Forecast Table */}
      <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between gap-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Daily Forecast Ledger
          </h3>
          <button
            onClick={() => setFilterRiskOnly(!filterRiskOnly)}
            className={`px-2 py-0.5 rounded text-xs font-medium border transition-colors ${
              filterRiskOnly
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {filterRiskOnly ? 'Showing Deficit Days Only' : 'Filter Deficit Days'}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider font-mono">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Projected Balance</th>
                <th className="py-2.5 px-3 text-emerald-700">Inflow</th>
                <th className="py-2.5 px-3 text-rose-700">Outflow</th>
                <th className="py-2.5 px-3">Net</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLedger.slice(0, 15).map((d) => (
                <tr
                  key={d.dayIndex}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    d.isBelowThreshold ? 'bg-rose-50/30' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-mono font-medium text-slate-900">{d.date}</td>
                  <td className="py-2.5 px-3 font-mono font-semibold">
                    <span className={d.isBelowThreshold ? 'text-rose-600' : 'text-slate-900'}>
                      {formatCurrency(d.projectedBalance)}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-emerald-700">
                    +{formatCurrency(d.predictedInflow)}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-rose-600">
                    -{formatCurrency(d.predictedOutflow)}
                  </td>
                  <td className="py-2.5 px-3 font-mono font-medium">
                    <span className={d.netChange >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                      {d.netChange >= 0 ? `+${formatCurrency(d.netChange)}` : `-${formatCurrency(Math.abs(d.netChange))}`}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">
                    <StatusBadge level={d.riskLevel} size="sm" />
                  </td>
                  <td className="py-2.5 px-3 text-[11px] text-slate-600">
                    {d.events ? d.events.join('; ') : '—'}
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
