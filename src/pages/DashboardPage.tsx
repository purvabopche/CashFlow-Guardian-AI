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
  DollarSign,
  Receipt,
  Sparkles,
  ArrowRight,
  PlayCircle
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

  // Pending & Overdue Invoices
  const actionableInvoices = dataset.invoices.filter((i) => i.status !== 'paid');

  // Next Upcoming Payments
  const upcomingPayments = [...dataset.payments].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header & Quick Demo Scenario Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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
            Real-time liquidity diagnostics, runway burn velocity, and predictive shortage alerts for{' '}
            <strong className="text-slate-700">{dataset.name}</strong>.
          </p>
        </div>

        {/* ⚡ Hackathon Live Demo Scenario Switcher */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900 text-white p-2 rounded-2xl shadow-md border border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1 pl-2 pr-1">
            <Zap className="w-3.5 h-3.5" /> Demo Mode:
          </span>
          {Object.values(allDatasets).map((ds) => (
            <button
              key={ds.id}
              onClick={() => setDatasetKey(ds.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                currentDatasetKey === ds.id
                  ? 'bg-emerald-500 text-slate-950 shadow-sm'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {ds.id === 'critical_shortage' ? '🔴 Critical Shortage' : ds.id === 'medium_risk' ? '🟡 Medium Risk' : '🟢 Healthy Safe'}
            </button>
          ))}
        </div>
      </div>

      {/* Model & Heuristic Status Banner */}
      <ModelStatusBanner />

      {/* Prominent Shortage Alert Banner */}
      <div
        className={`rounded-2xl border p-6 shadow-sm transition-all ${
          riskPrediction.riskProbability >= 65
            ? 'border-rose-300 bg-gradient-to-r from-rose-50 via-rose-50/70 to-amber-50/50 ring-1 ring-rose-400/20'
            : riskPrediction.riskProbability >= 35
            ? 'border-amber-300 bg-gradient-to-r from-amber-50 via-amber-50/70 to-white ring-1 ring-amber-400/20'
            : 'border-emerald-300 bg-gradient-to-r from-emerald-50 via-teal-50/40 to-white ring-1 ring-emerald-400/20'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-md ${
                riskPrediction.riskProbability >= 65
                  ? 'bg-rose-600 shadow-rose-600/20'
                  : riskPrediction.riskProbability >= 35
                  ? 'bg-amber-500 shadow-amber-500/20'
                  : 'bg-emerald-600 shadow-emerald-600/20'
              }`}
            >
              {riskPrediction.riskProbability >= 35 ? (
                <AlertTriangle className="w-6 h-6" />
              ) : (
                <CheckCircle2 className="w-6 h-6" />
              )}
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>
                    {riskPrediction.riskProbability >= 65
                      ? '⚠ Critical Cash Shortage Predicted'
                      : riskPrediction.riskProbability >= 35
                      ? '⚠ Moderate Liquidity Pressure Detected'
                      : '✓ Cash Flow Health Safe & Stable'}
                  </span>
                </h3>
                <StatusBadge level={riskPrediction.riskLevel} size="sm" />
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                    riskPrediction.riskProbability >= 65
                      ? 'bg-rose-200 text-rose-900'
                      : riskPrediction.riskProbability >= 35
                      ? 'bg-amber-200 text-amber-900'
                      : 'bg-emerald-200 text-emerald-900'
                  }`}
                >
                  {riskPrediction.riskProbability}% Probability
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-3xl">
                {riskPrediction.riskProbability >= 35
                  ? `Based on your current spending pattern and upcoming payments, your balance may drop below your ${formatCurrency(summary.safeBufferThreshold)} safety buffer in ${summary.dangerDaysFromNow} days (${summary.dangerDate || 'Mid-Month'}).`
                  : `Your projected 30-day balance remains comfortably above your ${formatCurrency(summary.safeBufferThreshold)} safety buffer with a safe runway of ~${summary.runwayDays} days.`}
              </p>
              
              {riskPrediction.riskProbability >= 35 && (
                <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-slate-900">Suggested actions:</span>
                  <span className="rounded-md bg-white border border-slate-200 px-2.5 py-1 text-slate-700 font-medium">
                    • Reduce discretionary spending by ₹300/day
                  </span>
                  <span className="rounded-md bg-white border border-slate-200 px-2.5 py-1 text-slate-700 font-medium">
                    • Delay flexible vendor payments by 5–10 days
                  </span>
                  <span className="rounded-md bg-white border border-slate-200 px-2.5 py-1 text-slate-700 font-medium">
                    • Accelerate uncollected overdue client invoices
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-end lg:self-center">
            <button
              onClick={() => setActivePage('insights')}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>View Prescriptions in AI Insights</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          title="Available Cash Balance"
          value={formatCurrency(summary.currentBalance)}
          subValue={`Safe Buffer: ${formatCurrency(summary.safeBufferThreshold)}`}
          change={{ value: summary.changeVsLastMonth.balance, isPositiveGood: true }}
          icon={Wallet}
          iconBg="bg-slate-100"
          iconColor="text-slate-800"
          tooltip="Liquid cash available across active bank accounts."
        />

        <MetricCard
          title="Monthly Inflow"
          value={formatCurrency(summary.monthlyInflow)}
          subValue="Client retainers & sales"
          change={{ value: summary.changeVsLastMonth.inflow, isPositiveGood: true }}
          icon={ArrowDownLeft}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          tooltip="Total scheduled collections and expected deposits for the 30-day cycle."
        />

        <MetricCard
          title="Monthly Outflow"
          value={formatCurrency(summary.monthlyOutflow)}
          subValue="Rent, payroll & operating burn"
          change={{ value: summary.changeVsLastMonth.outflow, isPositiveGood: false }}
          icon={ArrowUpRight}
          iconBg="bg-rose-50"
          iconColor="text-rose-600"
          tooltip="Total scheduled operating expenses, rent, SaaS subscriptions, and bills."
        />

        <MetricCard
          title="Net Cash Flow"
          value={`${summary.netCashFlow >= 0 ? '+' : '-'}${formatCurrency(Math.abs(summary.netCashFlow))}`}
          subValue={summary.netCashFlow >= 0 ? 'Cash Positive Surplus' : 'Operating Deficit (Burn)'}
          variant={summary.netCashFlow >= 0 ? 'highlight' : 'danger'}
          icon={TrendingUp}
          iconBg={summary.netCashFlow >= 0 ? 'bg-emerald-50' : 'bg-rose-50'}
          iconColor={summary.netCashFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'}
          tooltip="Monthly Income minus Monthly Expenses."
        />

        <MetricCard
          title="Cash Safety Score"
          value={`${summary.cashHealthScore}/100`}
          subValue={`Est. Runway: ~${summary.runwayDays} Days`}
          badge={<StatusBadge level={summary.cashHealthScore >= 70 ? 'Low' : summary.cashHealthScore >= 40 ? 'Medium' : 'High'} size="sm" />}
          icon={Activity}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          tooltip="Algorithmic score (0-100) evaluating reserve cushion, burn elasticity, and recurring ratio."
        />
      </div>

      {/* Main Interactive Cash Flow Trend Chart with Danger Zone */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900">30-Day Cash Flow Forecast & Liquidity Horizon</h3>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200">
                Daily Predictive Trajectory
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Projected daily closing balance against your configured safety threshold.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-600">Projected Balance</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 border-t-2 border-dashed border-rose-500" />
              <span className="text-slate-600">Safe Threshold ({formatCurrency(summary.safeBufferThreshold)})</span>
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
                tickFormatter={(val) => formatCurrency(val, true)}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-slate-200 bg-slate-900 p-3 shadow-xl text-white text-xs space-y-1 z-30 min-w-[180px]">
                        <div className="font-bold text-emerald-400 border-b border-slate-800 pb-1 flex justify-between gap-4">
                          <span>{label} (Day {data.dayIndex})</span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-mono ${data.isBelowThreshold ? 'bg-rose-900 text-rose-300' : 'bg-emerald-900 text-emerald-300'}`}>
                            {data.riskLevel} Risk
                          </span>
                        </div>
                        <div className="pt-1 flex justify-between gap-4">
                          <span className="text-slate-400">Closing Balance:</span>
                          <span className="font-bold text-white font-mono">{formatCurrency(data.projectedBalance)}</span>
                        </div>
                        <div className="flex justify-between gap-4">
                          <span className="text-slate-400">Day Net Change:</span>
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

      {/* Two Column Grid: Receivables & Scheduled Recurring Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Expected Invoices (Receivables) */}
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
                {actionableInvoices.length} Pending
              </span>
            </div>

            <div className="space-y-2.5">
              {actionableInvoices.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">All invoices settled!</div>
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
                        <div className="font-bold text-slate-900">{formatCurrency(inv.amount)}</div>
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
            <span className="text-slate-500">Total Uncollected Inflows:</span>
            <span className="font-bold text-slate-900 font-mono">
              {formatCurrency(actionableInvoices.reduce((s, i) => s + i.amount, 0))}
            </span>
          </div>
        </div>

        {/* Right Col: Upcoming Recurring Payments */}
        <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Upcoming Recurring Payments</h3>
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
                      <div className="font-bold text-slate-900">{formatCurrency(pay.amount)}</div>
                      <div className="text-[10px]">
                        {pay.isFlexible ? (
                          <span className="text-emerald-600 font-medium">Flexible</span>
                        ) : (
                          <span className="text-rose-600 font-medium">Fixed</span>
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
              {formatCurrency(upcomingPayments.reduce((s, p) => s + p.amount, 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
