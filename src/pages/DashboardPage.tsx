import React from 'react';
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Activity,
  AlertTriangle,
  Calendar,
  Clock,
  CheckCircle2,
  Mail,
  SlidersHorizontal,
  Plus,
  Zap,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid
} from 'recharts';
import { useFinancial } from '../context/FinancialContext';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { ModelStatusBanner } from '../components/common/ModelStatusBanner';

export const DashboardPage: React.FC = () => {
  const {
    summary,
    forecast,
    riskPrediction,
    dataset,
    currentDatasetKey,
    setDatasetKey,
    allDatasets,
    formatCurrency,
    setActivePage,
    setIsAddModalOpen,
    openInvoiceReminderModal
  } = useFinancial();

  const actionableInvoices = dataset.invoices.filter((i) => i.status !== 'paid');
  const upcomingPayments = [...dataset.payments].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  const isShortageCritical = riskPrediction.riskProbability >= 65;
  const isShortageModerate = riskPrediction.riskProbability >= 35 && riskPrediction.riskProbability < 65;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header & Demo Scenario Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Financial Operations Dashboard
            </h1>
            <span className="text-xs font-mono text-slate-400">
              • {dataset.name} ({dataset.industry})
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Predictive liquidity runway and rolling 30-day cash survival metrics.
          </p>
        </div>

        {/* Demo Scenario Switcher (Segmented Control Style) */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 self-start sm:self-auto">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-2 flex items-center gap-1">
            <Zap className="w-3 h-3 text-slate-500" /> Scenario:
          </span>
          {Object.values(allDatasets).map((ds) => (
            <button
              key={ds.id}
              onClick={() => setDatasetKey(ds.id)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                currentDatasetKey === ds.id
                  ? ds.id === 'critical_shortage'
                    ? 'bg-rose-600 text-white font-semibold shadow-sm'
                    : ds.id === 'medium_risk'
                    ? 'bg-amber-600 text-white font-semibold shadow-sm'
                    : 'bg-emerald-700 text-white font-semibold shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              {ds.id === 'critical_shortage' ? 'Critical Shortage' : ds.id === 'medium_risk' ? 'Medium Risk' : 'Healthy Safe'}
            </button>
          ))}
        </div>
      </div>

      {/* Model Status Bar */}
      <ModelStatusBanner />

      {/* Shortage Alert Banner */}
      <div
        className={`rounded-lg border p-4 transition-all ${
          isShortageCritical
            ? 'border-rose-300 bg-rose-50/40 text-slate-900'
            : isShortageModerate
            ? 'border-amber-300 bg-amber-50/40 text-slate-900'
            : 'border-emerald-300 bg-emerald-50/30 text-slate-900'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-white mt-0.5 ${
                isShortageCritical ? 'bg-rose-600' : isShortageModerate ? 'bg-amber-500' : 'bg-emerald-700'
              }`}
            >
              {isShortageCritical || isShortageModerate ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-slate-900">
                  {isShortageCritical
                    ? '⚠ Cash Shortage Predicted'
                    : isShortageModerate
                    ? '⚠ Moderate Liquidity Deficit Expected'
                    : '✓ Liquidity Buffer Healthy'}
                </span>
                <StatusBadge level={riskPrediction.riskLevel} size="sm" />
                <span className="text-xs font-mono font-medium text-slate-600">
                  {riskPrediction.riskProbability}% Probability
                </span>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed max-w-2xl">
                {riskPrediction.riskProbability >= 35
                  ? `Based on your current spending pattern and upcoming payments, your balance may drop below your safe threshold (${formatCurrency(summary.safeBufferThreshold)}) in ${summary.dangerDaysFromNow} days (${summary.dangerDate || 'around Mid-Month'}).`
                  : `Your projected closing balance remains above your safe buffer of ${formatCurrency(summary.safeBufferThreshold)} across the 30-day forecast horizon.`}
              </p>

              {riskPrediction.riskProbability >= 35 && (
                <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                  <span className="font-semibold text-slate-900">Recommended Actions:</span>
                  <span>• Reduce discretionary spending</span>
                  <span>• Delay flexible disbursements by 5–10d</span>
                  <span>• Accelerate overdue invoice collection</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
            <button
              onClick={() => setActivePage('insights')}
              className="flex items-center gap-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 text-xs font-semibold shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Review AI Insights</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <MetricCard
          title="Available Cash"
          value={formatCurrency(summary.currentBalance)}
          subValue={`Buffer Target: ${formatCurrency(summary.safeBufferThreshold)}`}
          change={{ value: summary.changeVsLastMonth.balance, isPositiveGood: true }}
          icon={Wallet}
        />

        <MetricCard
          title="Monthly Income"
          value={formatCurrency(summary.monthlyInflow)}
          subValue="Receivables & retainers"
          change={{ value: summary.changeVsLastMonth.inflow, isPositiveGood: true }}
          icon={ArrowDownLeft}
        />

        <MetricCard
          title="Monthly Outflow"
          value={formatCurrency(summary.monthlyOutflow)}
          subValue="Rent, payroll & bills"
          change={{ value: summary.changeVsLastMonth.outflow, isPositiveGood: false }}
          icon={ArrowUpRight}
        />

        <MetricCard
          title="Net Cash Flow"
          value={`${summary.netCashFlow >= 0 ? '+' : '-'}${formatCurrency(Math.abs(summary.netCashFlow))}`}
          subValue={summary.netCashFlow >= 0 ? 'Surplus Flow' : 'Monthly Burn Deficit'}
          variant={summary.netCashFlow >= 0 ? 'highlight' : 'danger'}
          icon={TrendingUp}
        />

        <MetricCard
          title="Cash Safety Score"
          value={`${summary.cashHealthScore}/100`}
          subValue={`Est. Runway: ~${summary.runwayDays} Days`}
          badge={<StatusBadge level={summary.cashHealthScore >= 70 ? 'Low' : summary.cashHealthScore >= 40 ? 'Medium' : 'High'} size="sm" />}
          icon={Activity}
        />
      </div>

      {/* Forecast Trajectory Chart */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              30-Day Liquidity Forecast Trajectory
            </h3>
            <p className="text-xs text-slate-500">
              Projected daily cash closing balances against your safe liquidity buffer.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
              <span className="text-slate-600 font-medium">Projected Balance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 border-t border-dashed border-rose-500" />
              <span className="text-slate-600 font-medium">Safe Threshold ({formatCurrency(summary.safeBufferThreshold)})</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecast.forecastDays} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
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
                      <div className="rounded-md border border-slate-700 bg-slate-900 p-2.5 shadow-lg text-white text-xs space-y-1 z-30 min-w-[160px]">
                        <div className="font-bold text-slate-200 border-b border-slate-800 pb-1 flex justify-between gap-2">
                          <span>{label} (Day {data.dayIndex})</span>
                          <span className={`text-[10px] font-mono uppercase ${data.isBelowThreshold ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {data.riskLevel}
                          </span>
                        </div>
                        <div className="flex justify-between gap-3 pt-0.5">
                          <span className="text-slate-400">Balance:</span>
                          <span className="font-mono font-semibold text-white">{formatCurrency(data.projectedBalance)}</span>
                        </div>
                        <div className="flex justify-between gap-3">
                          <span className="text-slate-400">Net Flow:</span>
                          <span className={`font-mono ${data.netChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {data.netChange >= 0 ? `+${formatCurrency(data.netChange)}` : `-${formatCurrency(Math.abs(data.netChange))}`}
                          </span>
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
              <ReferenceLine
                y={summary.safeBufferThreshold}
                stroke="#F43F5E"
                strokeDasharray="3 3"
                strokeWidth={1.5}
                label={{
                  value: 'Safe Buffer',
                  position: 'right',
                  fill: '#F43F5E',
                  fontSize: 10
                }}
              />
              <Area
                type="monotone"
                dataKey="projectedBalance"
                stroke="#059669"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#balanceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Operational Data Grid (Receivables & Scheduled Disbursements) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Receivables Table */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Pending Receivables & Client Invoices
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500 font-medium">
              {actionableInvoices.length} Pending • Total {formatCurrency(actionableInvoices.reduce((s, i) => s + i.amount, 0))}
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {actionableInvoices.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">All invoices settled.</div>
            ) : (
              actionableInvoices.map((inv) => (
                <div key={inv.id} className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-1 rounded transition-colors">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <span>{inv.client}</span>
                      <span className="text-[10px] font-mono text-slate-400">#{inv.id}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>Due: {inv.dueDate}</span>
                      {inv.status === 'overdue' && (
                        <span className="text-rose-600 font-semibold font-mono">
                          {inv.daysOverdue || 12}d overdue
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 font-mono text-xs">
                      {formatCurrency(inv.amount)}
                    </span>
                    <button
                      onClick={() => openInvoiceReminderModal(inv)}
                      title="Send AI Payment Reminder"
                      className="px-2 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-medium text-slate-700 flex items-center gap-1 transition-colors"
                    >
                      <Mail className="w-3 h-3 text-slate-500" />
                      <span>Reminder</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Payments Table */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Scheduled Outflows & Commitments
              </h3>
            </div>
            <span className="text-[11px] font-mono text-slate-500 font-medium">
              {upcomingPayments.length} Scheduled • Total {formatCurrency(upcomingPayments.reduce((s, p) => s + p.amount, 0))}
            </span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {upcomingPayments.slice(0, 4).map((pay) => (
              <div key={pay.id} className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-1 rounded transition-colors">
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-900 flex items-center gap-2">
                    <span>{pay.vendor}</span>
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded font-medium">
                      {pay.category}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">Scheduled: {pay.dueDate}</div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-bold text-slate-900 font-mono text-xs">{formatCurrency(pay.amount)}</div>
                    <div className="text-[10px] text-slate-400">{pay.isFlexible ? 'Flexible' : 'Fixed'}</div>
                  </div>
                  <StatusBadge level={pay.urgency} size="sm" showDot={false} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
