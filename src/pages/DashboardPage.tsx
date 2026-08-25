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
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
  TrendingDown,
  Info
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
    openInvoiceReminderModal,
    backendStatus
  } = useFinancial();

  const actionableInvoices = dataset.invoices.filter((i) => i.status !== 'paid');
  const upcomingPayments = [...dataset.payments].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  );

  const isShortageCritical = riskPrediction.riskProbability >= 65;
  const isShortageModerate = riskPrediction.riskProbability >= 35 && riskPrediction.riskProbability < 65;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Intro Value Proposition Bar */}
      <div className="rounded-lg bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 text-white p-4 border border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-slate-100 tracking-tight">
              Predict cash shortages before they become financial emergencies.
            </h2>
          </div>
          <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
            CashFlow Guardian AI analyzes opening balances, upcoming fixed obligations, and uncollected client receivables to forecast liquidity risk and recommend preventative actions.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setActivePage('simulator')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Simulate Scenarios</span>
          </button>
          <button
            onClick={() => setActivePage('insights')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Actions</span>
          </button>
        </div>
      </div>

      {/* Header & Scenario Controls */}
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

        {/* Professional Scenario Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200 self-start sm:self-auto">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-2 flex items-center gap-1">
            <Zap className="w-3 h-3 text-slate-500" /> Demo Profile:
          </span>
          {Object.values(allDatasets).map((ds) => {
            const isSelected = currentDatasetKey === ds.id;
            const label = ds.id === 'critical_shortage' ? 'Critical Shortage' : ds.id === 'medium_risk' ? 'Payment Pressure' : 'Stable Growth';
            return (
              <button
                key={ds.id}
                onClick={() => setDatasetKey(ds.id)}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  isSelected
                    ? ds.id === 'critical_shortage'
                      ? 'bg-rose-600 text-white font-semibold shadow-xs'
                      : ds.id === 'medium_risk'
                      ? 'bg-amber-600 text-white font-semibold shadow-xs'
                      : 'bg-emerald-700 text-white font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Model Evidence & Provenance Bar */}
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
                    ? '⚠ Cash Shortage Predicted (Imminent Buffer Breach)'
                    : isShortageModerate
                    ? '⚠ Moderate Liquidity Squeeze Expected'
                    : '✓ Cash Liquidity Buffer Safe'}
                </span>
                <StatusBadge level={riskPrediction.riskLevel} size="sm" />
                <span className="text-xs font-mono font-medium text-slate-600">
                  {riskPrediction.riskProbability}% Shortage Probability
                </span>
              </div>

              <p className="text-xs text-slate-700 max-w-2xl leading-relaxed">
                {isShortageCritical
                  ? `Your liquid reserves are projected to cross below the ${formatCurrency(summary.safeBufferThreshold)} safety threshold in ~${summary.dangerDaysFromNow || 12} days (${summary.dangerDate || 'mid-month'}). Uncollected invoices and fixed liabilities require intervention.`
                  : isShortageModerate
                  ? `Operating cash balances will approach the ${formatCurrency(summary.safeBufferThreshold)} minimum cushion around Day 24. Modest invoice follow-ups or flexible bill delays prevent a breach.`
                  : `Operating cash flow remains positive with >3.5x buffer cushion. Projected closing balance maintains safety across the 30-day window.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            {isShortageCritical && (
              <button
                onClick={() => setActivePage('insights')}
                className="flex items-center gap-1 rounded-md bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 text-xs font-semibold shadow-xs transition-colors"
              >
                <span>Take Action</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setActivePage('forecast')}
              className="rounded-md border border-slate-300 bg-white hover:bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors"
            >
              View 30-Day Ledger
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MetricCard
          title="Liquid Balance"
          value={formatCurrency(summary.currentBalance)}
          subValue={`Min Buffer: ${formatCurrency(summary.safeBufferThreshold)}`}
          change={{ value: 4.2, isPositiveGood: true }}
          icon={Wallet}
        />

        <MetricCard
          title="Monthly Income"
          value={formatCurrency(summary.monthlyInflow)}
          subValue="Recurring & Invoices"
          change={{ value: 8.5, isPositiveGood: true }}
          icon={ArrowDownLeft}
          variant="highlight"
        />

        <MetricCard
          title="Monthly Outflow"
          value={formatCurrency(summary.monthlyOutflow)}
          subValue="Rent, Payroll & Tools"
          change={{ value: 3.1, isPositiveGood: false }}
          icon={ArrowUpRight}
          variant={isShortageCritical ? 'danger' : 'default'}
        />

        <MetricCard
          title="Operating Runway"
          value={`~${summary.runwayDays} Days`}
          subValue={summary.netCashFlow >= 0 ? 'Surplus Generation' : `Burn: ${formatCurrency(summary.netBurnRate)}/mo`}
          variant={summary.runwayDays > 45 ? 'highlight' : summary.runwayDays > 20 ? 'default' : 'danger'}
          icon={Calendar}
        />

        <MetricCard
          title="Cash Safety Score"
          value={`${summary.cashHealthScore}/100`}
          subValue={summary.cashHealthScore >= 75 ? 'Optimal Health' : summary.cashHealthScore >= 50 ? 'Moderate Buffer' : 'Critical Deficit'}
          variant={summary.cashHealthScore >= 75 ? 'highlight' : summary.cashHealthScore >= 50 ? 'default' : 'danger'}
          icon={Activity}
        />
      </div>

      {/* 30-Day Forecast Chart */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-slate-600" />
              Rolling 30-Day Cash Balance Trajectory
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Predicted daily closing liquid cash balance against target safe reserve threshold.
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 inline-block" />
              Projected Balance
            </span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-0.5 bg-rose-500 inline-block" />
              Safe Buffer ({formatCurrency(summary.safeBufferThreshold)})
            </span>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecast.combinedTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={{ stroke: '#E2E8F0' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickLine={false} axisLine={false} tickFormatter={(val) => formatCurrency(val, true)} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded border border-slate-200 bg-white p-2.5 shadow-md text-xs space-y-1 z-30">
                        <div className="font-semibold text-slate-900">{data.date}</div>
                        <div className="flex justify-between gap-4 text-slate-600">
                          <span>Balance:</span>
                          <strong className="font-mono text-slate-900">{formatCurrency(data.projectedBalance)}</strong>
                        </div>
                        {data.predictedInflow > 0 && (
                          <div className="flex justify-between gap-4 text-emerald-600">
                            <span>Inflow:</span>
                            <span className="font-mono">+{formatCurrency(data.predictedInflow)}</span>
                          </div>
                        )}
                        {data.predictedOutflow > 0 && (
                          <div className="flex justify-between gap-4 text-rose-600">
                            <span>Outflow:</span>
                            <span className="font-mono">-{formatCurrency(data.predictedOutflow)}</span>
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={summary.safeBufferThreshold} stroke="#F43F5E" strokeDasharray="3 3" label={{ value: 'Safe Buffer', fill: '#F43F5E', fontSize: 10, position: 'insideTopRight' }} />
              <Area type="monotone" dataKey="projectedBalance" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#balanceGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* "Why This Prediction?" Factor Attributions */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <BrainCircuit className="w-3.5 h-3.5 text-slate-600" />
              Why this prediction? (Key Contributing Signals)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Transparent signals evaluated by the machine learning risk engine.
            </p>
          </div>
          <button
            onClick={() => setActivePage('risk')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <span>Full Explainability</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-md bg-rose-50/30 border border-rose-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                <span>Primary Risk Driver</span>
              </span>
              <span className="font-mono font-bold text-rose-700 text-[11px]">+29.8% Impact</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {isShortageCritical
                ? '₹28,500 overdue invoice lag from client coincides with non-negotiable rent commitment.'
                : 'Upcoming engineering payroll commitment requires consistent invoice settlements.'}
            </p>
          </div>

          <div className="p-3 rounded-md bg-slate-50 border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                <span>Outflow Pressure</span>
              </span>
              <span className="font-mono font-bold text-slate-700 text-[11px]">Fixed Commitments</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {isShortageCritical
                ? '₹37,000 in scheduled liabilities due before client invoice collections clear.'
                : '₹28,000 in bi-weekly compensation scheduled within the mid-month window.'}
            </p>
          </div>

          <div className="p-3 rounded-md bg-emerald-50/30 border border-emerald-200 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-900 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Buffer Resilience</span>
              </span>
              <span className="font-mono font-bold text-emerald-700 text-[11px]">{summary.cashHealthScore}/100 Score</span>
            </div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              {summary.cashHealthScore >= 70
                ? 'Strong recurring monthly inflow provides comfortable liquidity margin above safety threshold.'
                : 'Current liquid reserve coverage is below target buffer. Applying 1-click remedies restores health.'}
            </p>
          </div>
        </div>
      </div>

      {/* Operational Tables: Receivables & Scheduled Outflows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Pending Receivables */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                Pending & Overdue Receivables
              </h3>
              <p className="text-[11px] text-slate-500">Uncollected client invoices</p>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-700">
              {formatCurrency(actionableInvoices.reduce((acc, i) => acc + i.amount, 0))}
            </span>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-md overflow-hidden bg-white">
            {actionableInvoices.map((inv) => (
              <div key={inv.id} className="p-2.5 flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors text-xs">
                <div>
                  <div className="font-semibold text-slate-900">{inv.client}</div>
                  <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2 mt-0.5">
                    <span>Due: {inv.dueDate}</span>
                    {inv.status === 'overdue' && (
                      <span className="text-rose-600 font-semibold">• {inv.daysOverdue}d Overdue</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-slate-900">{formatCurrency(inv.amount)}</span>
                  {inv.status === 'overdue' && (
                    <button
                      onClick={() => openInvoiceReminderModal(inv)}
                      className="p-1 rounded text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                      title="1-Click Payment Reminder"
                    >
                      <Mail className="w-3.5 h-3.5 text-rose-600" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scheduled Outflows */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                Scheduled Commitments & Bills
              </h3>
              <p className="text-[11px] text-slate-500">Upcoming fixed and flexible outflows</p>
            </div>
            <span className="text-xs font-mono font-semibold text-slate-700">
              {formatCurrency(upcomingPayments.reduce((acc, p) => acc + p.amount, 0))}
            </span>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-md overflow-hidden bg-white">
            {upcomingPayments.slice(0, 4).map((p) => (
              <div key={p.id} className="p-2.5 flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors text-xs">
                <div>
                  <div className="font-semibold text-slate-900">{p.vendor}</div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    Due: {p.dueDate} • {p.category}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-slate-900">{formatCurrency(p.amount)}</span>
                  <StatusBadge level={p.urgency} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
