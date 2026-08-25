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
  ChevronRight,
  Plus,
  ShieldCheck,
  Zap,
  DollarSign
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
    setActivePage,
    setIsAddModalOpen,
    openInvoiceReminderModal,
    updateInvoiceStatus
  } = useFinancial();

  // Pending & Overdue Invoices
  const actionableInvoices = dataset.invoices.filter((i) => i.status !== 'paid');

  // Next Upcoming Payments
  const upcomingPayments = [...dataset.payments].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Financial Dashboard
            </h1>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 border border-slate-200">
              {dataset.industry}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time cash flow diagnostics, liquidity runway, and predictive risk indicators for{' '}
            <strong className="text-slate-700">{dataset.name}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setActivePage('simulator')}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition-all"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>Simulate Scenarios</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 text-xs font-bold shadow-sm shadow-emerald-600/20 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>

      {/* Model & Heuristic Status Banner */}
      <ModelStatusBanner />

      {/* Urgent Risk Alert Banner if High/Medium Risk */}
      {riskPrediction.riskProbability >= 40 && (
        <div className="rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 via-rose-50/70 to-amber-50/50 p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white shadow-md">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-rose-900">
                    Liquidity Warning: {riskPrediction.riskProbability}% Cash Shortage Probability
                  </h3>
                  <StatusBadge level={riskPrediction.riskLevel} size="sm" />
                </div>
                <p className="text-xs text-rose-700">
                  Predicted critical shortage window: <strong className="font-semibold">{riskPrediction.predictedShortageWindow}</strong>.
                  Lowest projected balance: <strong className="font-semibold">${forecast.lowestProjectedPoint.toLocaleString()}</strong> (Breaches safe buffer of ${summary.safeBufferThreshold.toLocaleString()}).
                </p>
              </div>
            </div>

            <button
              onClick={() => setActivePage('insights')}
              className="shrink-0 flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all active:scale-95"
            >
              <span>View Recommended Actions</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Current Cash Balance"
          value={`$${summary.currentBalance.toLocaleString()}`}
          subValue={`Safe Buffer: $${summary.safeBufferThreshold.toLocaleString()}`}
          change={{ value: summary.changeVsLastMonth.balance, isPositiveGood: true }}
          icon={Wallet}
          iconBg="bg-slate-100"
          iconColor="text-slate-800"
          tooltip="Live liquid cash available across linked checking and treasury bank accounts."
        />

        <MetricCard
          title="Monthly Cash Inflow"
          value={`$${summary.monthlyInflow.toLocaleString()}`}
          subValue="Recurring revenue & collections"
          change={{ value: summary.changeVsLastMonth.inflow, isPositiveGood: true }}
          icon={ArrowDownLeft}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          tooltip="Average 30-day customer payments, subscriptions, and receivables settled."
        />

        <MetricCard
          title="Monthly Cash Outflow"
          value={`$${summary.monthlyOutflow.toLocaleString()}`}
          subValue="Payroll, rent & vendor burn"
          change={{ value: summary.changeVsLastMonth.outflow, isPositiveGood: false }}
          icon={ArrowUpRight}
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
          tooltip="Total scheduled operating expenses, payroll, infrastructure, and contractor costs."
        />

        <MetricCard
          title="Projected 30-Day Balance"
          value={`$${summary.projected30DayBalance.toLocaleString()}`}
          subValue={summary.projected30DayBalance >= summary.safeBufferThreshold ? 'Above Safe Buffer' : 'Below Safe Cushion'}
          variant={summary.projected30DayBalance >= summary.safeBufferThreshold ? 'highlight' : 'danger'}
          icon={TrendingUp}
          iconBg={summary.projected30DayBalance >= summary.safeBufferThreshold ? 'bg-emerald-50' : 'bg-rose-50'}
          iconColor={summary.projected30DayBalance >= summary.safeBufferThreshold ? 'text-emerald-600' : 'text-rose-600'}
          tooltip="Calculated trajectory based on current balance + scheduled inflow - scheduled obligations."
        />

        <MetricCard
          title="Cash Health Score"
          value={`${summary.cashHealthScore}/100`}
          subValue={`Runway: ~${summary.runwayDays} Days`}
          badge={<StatusBadge level={summary.cashHealthScore >= 70 ? 'Low' : summary.cashHealthScore >= 40 ? 'Medium' : 'High'} size="sm" />}
          icon={Activity}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          tooltip="Composite algorithmic index assessing burn velocity, buffer ratio, and invoice aging."
        />
      </div>

      {/* Main Interactive Cash Flow Trend Chart */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">30-Day Projected Cash Flow Trajectory</h3>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                Daily Granularity
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualizes daily closing cash balance against the configured safety buffer threshold.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-600">Projected Balance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 border-t-2 border-dashed border-rose-500" />
              <span className="text-slate-600">Safe Buffer (${summary.safeBufferThreshold.toLocaleString()})</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecast.forecastDays} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
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
                        <div className="font-bold text-emerald-400 border-b border-slate-800 pb-1 flex justify-between gap-4">
                          <span>{label} (Day {data.dayIndex})</span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-mono ${data.isBelowThreshold ? 'bg-rose-900 text-rose-300' : 'bg-emerald-900 text-emerald-300'}`}>
                            {data.riskLevel} Risk
                          </span>
                        </div>
                        <div className="pt-1 flex justify-between gap-4">
                          <span className="text-slate-400">Closing Balance:</span>
                          <span className="font-bold text-white font-mono">${data.projectedBalance.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-400">Day Net Flow:</span>
                          <span className={`font-mono ${data.netChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {data.netChange >= 0 ? `+$${data.netChange.toLocaleString()}` : `-$${Math.abs(data.netChange).toLocaleString()}`}
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
                strokeDasharray="4 4"
                strokeWidth={2}
                label={{
                  value: 'Safe Threshold',
                  position: 'right',
                  fill: '#F43F5E',
                  fontSize: 10,
                  fontWeight: 600
                }}
              />
              <Area
                type="monotone"
                dataKey="projectedBalance"
                stroke="#10B981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#balanceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Column Grid: Receivables & Scheduled Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Expected Invoice Collections (Receivables) */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <ArrowDownLeft className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Expected Invoice Collections</h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {actionableInvoices.length} Active Invoices
              </span>
            </div>

            <div className="space-y-2.5">
              {actionableInvoices.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">All invoices collected!</div>
              ) : (
                actionableInvoices.map((inv) => (
                  <div
                    key={inv.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100/80 transition-colors text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{inv.client}</span>
                        <span className="text-[11px] font-mono text-slate-400">#{inv.id}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span>Due: {inv.dueDate}</span>
                        {inv.status === 'overdue' && (
                          <span className="font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded">
                            {inv.daysOverdue || 12}d Overdue
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-bold text-slate-900">${inv.amount.toLocaleString()}</div>
                        <div className="text-[10px] text-slate-400">
                          {inv.status === 'overdue' ? 'High Delay Risk' : 'Expected on time'}
                        </div>
                      </div>

                      <button
                        onClick={() => openInvoiceReminderModal(inv)}
                        title="Send 1-Click AI Reminder"
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-300 shadow-sm transition-all"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Total Uncollected Receivables:</span>
            <span className="font-bold text-slate-900 font-mono">
              ${actionableInvoices.reduce((s, i) => s + i.amount, 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Right Col: Upcoming Scheduled Payments (Outflows) */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Upcoming Payments & Obligations</h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {upcomingPayments.length} Scheduled
              </span>
            </div>

            <div className="space-y-2.5">
              {upcomingPayments.slice(0, 4).map((pay) => (
                <div
                  key={pay.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100/80 transition-colors text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{pay.vendor}</span>
                      <span className="rounded bg-slate-200/80 px-1.5 py-0.2 text-[10px] font-semibold text-slate-700">
                        {pay.category}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500">Scheduled: {pay.dueDate}</div>
                  </div>

                  <div className="text-right flex items-center gap-3">
                    <div>
                      <div className="font-bold text-slate-900">${pay.amount.toLocaleString()}</div>
                      <div className="text-[10px]">
                        {pay.isFlexible ? (
                          <span className="text-emerald-600 font-medium">Flexible / Deferrable</span>
                        ) : (
                          <span className="text-rose-600 font-medium">Non-Negotiable</span>
                        )}
                      </div>
                    </div>
                    <StatusBadge level={pay.urgency} size="sm" showDot={false} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 mt-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Next 30 Days Commitments:</span>
            <span className="font-bold text-slate-900 font-mono">
              ${upcomingPayments.reduce((s, p) => s + p.amount, 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
