import React from 'react';
import {
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
  ArrowRight,
  ShieldCheck,
  TrendingDown,
  Info,
  Layers,
  ChevronRight,
  Receipt,
  FileText
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
import { StatusBadge } from '../components/common/StatusBadge';
import { ModelStatusBanner } from '../components/common/ModelStatusBanner';
import { OnboardingGuide } from '../components/common/OnboardingGuide';
import { DemoScenarioSelector } from '../components/common/DemoScenarioSelector';
import { IntelligenceJourneyFooter } from '../components/common/IntelligenceJourneyFooter';

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

  const totalActionableInvoices = actionableInvoices.reduce((acc, i) => acc + i.amount, 0);
  const totalUpcomingPayments = upcomingPayments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="space-y-7 pb-12 animate-fade-in">
      {/* 1. Header & Account Switcher Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/90 font-sans">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 font-normal">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
            <span>Financial overview</span>
            <span className="text-slate-300">•</span>
            <span className="font-semibold text-slate-900">{dataset.name}</span>
            <span className="text-slate-400">({dataset.industry})</span>
          </div>
          <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold text-slate-900 tracking-tight mt-1">
            Your cash position & 30-day outlook
          </h1>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Account Profile Switcher */}
          <div className="inline-flex rounded-lg bg-slate-200/70 p-1 border border-slate-300/60 text-xs shadow-2xs font-sans">
            {Object.values(allDatasets).map((ds) => {
              const isSelected = currentDatasetKey === ds.id;
              const label =
                ds.id === 'critical_shortage'
                  ? 'Consulting (Critical)'
                  : ds.id === 'medium_risk'
                  ? 'B2B SaaS (Pressure)'
                  : 'Retail (Stable)';
              return (
                <button
                  key={ds.id}
                  onClick={() => setDatasetKey(ds.id)}
                  className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                    isSelected
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-xs transition-all active:scale-95 btn-interactive"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Add transaction</span>
          </button>
        </div>
      </div>

      {/* 0. Hackathon Guided Onboarding Tour */}
      <OnboardingGuide />

      {/* 1. Hackathon Demo Showcase Scenario Switcher */}
      <DemoScenarioSelector />

      {/* Model Connection Status Line */}
      <ModelStatusBanner />

      {/* 2. Hero Financial Intelligence Command Console */}
      <div
        className={`rounded-2xl border transition-all shadow-xl overflow-hidden fintech-card-highlight relative ${
          isShortageCritical
            ? 'bg-[#080D1A] border-slate-800 text-white shadow-rose-950/20'
            : isShortageModerate
            ? 'bg-[#0A1224] border-slate-800 text-white shadow-amber-950/20'
            : 'bg-[#061514] border-slate-800 text-white shadow-emerald-950/20'
        }`}
      >
        {/* Subtle Background Data Grid Overlay */}
        <div className="absolute inset-0 bg-hero-grid opacity-60 pointer-events-none" />

        {/* Top Intelligence Status Banner inside Hero */}
        <div className="relative flex flex-wrap items-center justify-between gap-3 px-6 py-3 border-b border-slate-800/80 bg-black/40 text-xs backdrop-blur-xs font-sans">
          <div className="flex items-center gap-2.5">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-2xs ${
                isShortageCritical
                  ? 'bg-rose-950/80 text-rose-300 border-rose-800/80'
                  : isShortageModerate
                  ? 'bg-amber-950/80 text-amber-300 border-amber-800/80'
                  : 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full animate-pulse ${
                  isShortageCritical ? 'bg-rose-400 ring-4 ring-rose-500/20' : isShortageModerate ? 'bg-amber-400 ring-4 ring-amber-500/20' : 'bg-emerald-400 ring-4 ring-emerald-500/20'
                }`}
              />
              {isShortageCritical
                ? 'Critical cash shortage expected'
                : isShortageModerate
                ? 'Moderate buffer pressure'
                : 'Healthy cash position'}
            </span>

            <span className="text-slate-600 hidden sm:inline">•</span>

            <span className="text-slate-400 text-xs hidden sm:inline">
              Forecast window: <strong className="text-slate-200 font-sans font-medium">30 days</strong>
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <div className="hidden md:flex items-center gap-1.5 text-xs font-sans">
              <span className="text-slate-400">Model confidence:</span>
              <span className="font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50 font-mono text-xs">
                {riskPrediction.confidenceScore}%
              </span>
            </div>
            <button
              onClick={() => setActivePage('risk')}
              className="text-slate-300 hover:text-white flex items-center gap-1 font-medium transition-colors btn-interactive text-xs"
            >
              <span>View risk drivers</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Main Command Console Content */}
        <div className="relative p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Dominant Column (7 Cols): Available Cash & Core Diagnosis */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5 font-sans">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Current available cash
                  </span>
                  {summary.dangerDaysFromNow > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-rose-950/70 border border-rose-800/60 text-rose-300 text-xs font-medium font-sans">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
                      Deficit in ~{summary.dangerDaysFromNow} days ({summary.dangerDate})
                    </span>
                  )}
                </div>
                <div className="mt-1.5 flex items-baseline gap-4 flex-wrap">
                  <div className="text-4xl md:text-5xl font-black font-mono text-white tracking-tight tabular-nums">
                    {formatCurrency(summary.currentBalance)}
                  </div>
                  <div className="text-xs text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-md border border-slate-800 font-sans">
                    Safe buffer:{' '}
                    <span className="text-slate-200 font-bold font-mono">{formatCurrency(summary.safeBufferThreshold)}</span>
                  </div>
                </div>
              </div>

              {/* Natural Language Financial Verdict & Executive Summary */}
              <div
                className={`rounded-xl p-5 border transition-all ${
                  isShortageCritical
                    ? 'bg-rose-950/40 border-rose-800/60 text-slate-200 border-l-4 border-l-rose-500'
                    : isShortageModerate
                    ? 'bg-amber-950/40 border-amber-800/60 text-slate-200 border-l-4 border-l-amber-500'
                    : 'bg-emerald-950/40 border-emerald-800/60 text-slate-200 border-l-4 border-l-emerald-500'
                }`}
              >
                <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center justify-between font-sans">
                  <span className="uppercase tracking-wider">Predictive Diagnosis ({riskPrediction.riskProbability}% Risk)</span>
                  <span className="text-xs font-mono text-slate-400">Model Confidence {riskPrediction.confidenceScore}%</span>
                </div>

                <div className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug font-sans">
                  {isShortageCritical
                    ? `High risk of falling below your ${formatCurrency(summary.safeBufferThreshold)} safety operating buffer.`
                    : isShortageModerate
                    ? `Moderate liquidity pressure nearing your ${formatCurrency(summary.safeBufferThreshold)} operating buffer.`
                    : `Healthy cash reserves safely above your ${formatCurrency(summary.safeBufferThreshold)} operating buffer.`}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-slate-800/80 text-xs font-sans">
                  <div>
                    <span className="text-slate-400 font-semibold block mb-0.5">WHY?</span>
                    <span className="text-slate-200 leading-snug">
                      {isShortageCritical
                        ? 'Delayed client receivables colliding with fixed lease & payroll.'
                        : isShortageModerate
                        ? 'Mid-month contractor payouts before retainer arrivals.'
                        : 'Positive net cash velocity covering all liabilities.'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold block mb-0.5">WHEN?</span>
                    <span className="text-slate-200 font-mono font-semibold">
                      {summary.dangerDate ? `${summary.dangerDate} (~Day ${summary.dangerDaysFromNow || 12})` : 'No deficit in 30 days'}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold block mb-0.5">WHAT CAN I DO?</span>
                    <span className="text-slate-200 leading-snug">
                      {isShortageCritical
                        ? `Accelerate ${formatCurrency(totalActionableInvoices)} in receivables & reschedule ${formatCurrency(totalUpcomingPayments)} payments.`
                        : isShortageModerate
                        ? 'Test discretionary trims or shift vendor payouts by 7 days.'
                        : 'Reinvest cash surplus or adjust safe buffer target.'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Primary Call to Action Controls */}
              <div className="flex items-center gap-3 pt-1 flex-wrap font-sans">
                <button
                  onClick={() => setActivePage('insights')}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-semibold text-sm transition-all shadow-md btn-interactive ${
                    isShortageCritical
                      ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/30'
                      : isShortageModerate
                      ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-900/30'
                      : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/30'
                  }`}
                >
                  <span>Review actions</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setActivePage('simulator')}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-sm border border-slate-700/80 transition-colors shadow-xs btn-interactive"
                >
                  <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                  <span>Test a scenario</span>
                </button>

                <button
                  onClick={() => setActivePage('forecast')}
                  className="text-sm text-slate-300 hover:text-white transition-colors font-medium px-2.5 py-1.5 rounded-md hover:bg-slate-800/50"
                >
                  View 30-day forecast →
                </button>
              </div>
            </div>

            {/* Right Telemetry Column (5 Cols): Asymmetric Risk Indicators & Health Telemetry */}
            <div className="lg:col-span-5 rounded-xl bg-slate-950/70 border border-slate-800/90 p-5 space-y-5 backdrop-blur-xs shadow-inner font-sans">
              {/* Shortage Risk Probability Metric with Enhanced Gauge & Smart Contextual Insight */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400 text-xs font-medium flex items-center gap-1.5 font-sans">
                    <Activity className="w-3.5 h-3.5 text-slate-400" />
                    Shortage risk probability
                  </span>
                  <span
                    className={`font-mono font-bold text-base tabular-nums ${
                      isShortageCritical ? 'text-rose-400' : isShortageModerate ? 'text-amber-400' : 'text-emerald-400'
                    }`}
                  >
                    {riskPrediction.riskProbability}%
                  </span>
                </div>

                {/* Segmented High-Precision Risk Meter */}
                <div className="h-2.5 w-full rounded-full bg-slate-850 p-0.5 border border-slate-800 overflow-hidden flex">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-out shadow-xs ${
                      isShortageCritical
                        ? 'bg-gradient-to-r from-rose-600 to-rose-400'
                        : isShortageModerate
                        ? 'bg-gradient-to-r from-amber-600 to-amber-400'
                        : 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                    }`}
                    style={{ width: `${Math.max(5, riskPrediction.riskProbability)}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs font-mono text-slate-400 mt-1.5">
                  <span className="text-emerald-400">0% Safe</span>
                  <span className="text-slate-400">Threshold 50%</span>
                  <span className="text-rose-400">100% Critical</span>
                </div>

                {/* Smart Contextual Insight */}
                <p className="text-xs text-slate-300 mt-2 leading-relaxed font-sans">
                  {riskPrediction.riskProbability >= 65
                    ? 'Risk is elevated — primarily driven by delayed customer receivables and upcoming payroll commitments.'
                    : riskPrediction.riskProbability >= 35
                    ? 'Buffer pressure — mid-month contractor disbursements compress liquidity headroom before retainer arrivals.'
                    : 'Risk is well-contained — strong operating cash velocity provides healthy buffer protection across all 30 days.'}
                </p>
              </div>

              {/* 2-Column Telemetry Split: Runway & Safety Score */}
              <div className="grid grid-cols-2 gap-4 pt-3.5 border-t border-slate-800/80 font-sans">
                <div>
                  <div className="text-xs text-slate-400 font-medium">
                    Operating runway
                  </div>
                  <div className="mt-1 text-2xl font-black font-mono text-white tabular-nums">
                    ~{summary.runwayDays} <span className="text-xs font-normal text-slate-400 font-sans">days</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {summary.netCashFlow >= 0 ? (
                      <span className="text-emerald-400 font-medium">Surplus (+{formatCurrency(summary.monthlyInflow)})</span>
                    ) : (
                      <span>Burn: {formatCurrency(summary.netBurnRate)}/mo</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-xs text-slate-400 font-medium">
                    Cash safety score
                  </div>
                  <div className="mt-1 text-2xl font-black font-mono text-white tabular-nums flex items-baseline gap-1">
                    <span>{summary.cashHealthScore}</span>
                    <span className="text-xs font-normal text-slate-500 font-mono">/100</span>
                  </div>
                  <div className="text-xs mt-0.5 font-medium">
                    <span
                      className={
                        summary.cashHealthScore >= 70
                          ? 'text-emerald-400'
                          : summary.cashHealthScore >= 45
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }
                    >
                      {summary.cashHealthScore >= 70
                        ? 'Healthy buffer'
                        : summary.cashHealthScore >= 45
                        ? 'Moderate cushion'
                        : 'Tight buffer'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Earliest Breach Status Pill */}
              <div
                className={`p-3 rounded-lg border text-xs flex items-center justify-between transition-colors font-sans ${
                  isShortageCritical
                    ? 'bg-rose-950/50 border-rose-800/80 text-rose-200'
                    : isShortageModerate
                    ? 'bg-amber-950/50 border-amber-800/80 text-amber-200'
                    : 'bg-slate-900/90 border-slate-800 text-slate-400'
                }`}
              >
                <span className="flex items-center gap-1.5 font-normal">
                  <Calendar className="w-3.5 h-3.5" />
                  Earliest risk date:
                </span>
                <span className="font-mono font-bold text-slate-100">
                  {summary.dangerDate
                    ? `${summary.dangerDate} (~Day ${summary.dangerDaysFromNow || 12})`
                    : 'None in 30 days'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Core Cash Velocity Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 font-sans">
        <div className="fintech-card rounded-xl p-5 border border-slate-200/90 shadow-2xs group hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Monthly inflows
            </span>
            <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:scale-105 transition-transform">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-[26px] font-bold font-mono text-slate-900 tracking-tight tabular-nums">
            +{formatCurrency(summary.monthlyInflow)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Client retainers & invoice payments
          </div>
        </div>

        <div className="fintech-card rounded-xl p-5 border border-slate-200/90 shadow-2xs group hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
              Monthly outflows
            </span>
            <div className="p-1.5 rounded-md bg-rose-50 text-rose-600 border border-rose-100 group-hover:scale-105 transition-transform">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-[26px] font-bold font-mono text-slate-900 tracking-tight tabular-nums">
            -{formatCurrency(summary.monthlyOutflow)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Rent, payroll & recurring vendor bills
          </div>
        </div>

        <div className="fintech-card rounded-xl p-5 border border-slate-200/90 shadow-2xs group hover:shadow-xs transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-600 font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Net cash flow
            </span>
            <div className="p-1.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 group-hover:scale-105 transition-transform">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div
            className={`mt-3 text-2xl sm:text-[26px] font-bold font-mono tracking-tight tabular-nums ${
              summary.netCashFlow >= 0 ? 'text-emerald-700' : 'text-rose-600'
            }`}
          >
            {summary.netCashFlow >= 0 ? '+' : ''}
            {formatCurrency(summary.netCashFlow)}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {summary.netCashFlow >= 0
              ? 'Inflows exceed outflows, building cash reserves'
              : 'Outflows exceed inflows, drawing from cash buffer'}
          </div>
        </div>
      </div>

      {/* 4. Hero Visualization: 30-Day Forward Cash Trajectory Chart */}
      <div className="fintech-card rounded-2xl p-6 shadow-sm space-y-4 border border-slate-200/90 fintech-card-highlight font-sans">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100">
                <TrendingUp className="w-4 h-4" />
              </div>
              <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
                30-day cash balance forecast
              </h2>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Projected daily cash balance compared with your <strong className="font-mono text-slate-700">{formatCurrency(summary.safeBufferThreshold)}</strong> safe operating buffer.
            </p>
          </div>

          {/* Key Chart Stats Chips */}
          <div className="flex items-center gap-2 text-xs flex-wrap font-sans">
            <div className="px-3 py-1 rounded-md bg-slate-100/80 border border-slate-200 text-slate-700 flex items-center gap-1.5">
              <span className="text-slate-500 text-xs">Lowest point:</span>
              <strong className={`font-mono ${forecast.lowestProjectedPoint < summary.safeBufferThreshold ? 'text-rose-600 font-bold' : 'text-slate-900 font-bold'}`}>
                {formatCurrency(forecast.lowestProjectedPoint)}
              </strong>
            </div>
            <div className="px-3 py-1 rounded-md bg-rose-50 border border-rose-200/90 text-rose-800 flex items-center gap-1.5">
              <span className="text-rose-700 text-xs">Safety buffer:</span>
              <strong className="font-bold font-mono">{formatCurrency(summary.safeBufferThreshold)}</strong>
            </div>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={forecast.combinedTimeline}
              margin={{ top: 10, right: 15, left: -10, bottom: 5 }}
            >
              <defs>
                <linearGradient id="balanceHeroGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.28} />
                  <stop offset="60%" stopColor="#10B981" stopOpacity={0.03} />
                  <stop offset="100%" stopColor="#F43F5E" stopOpacity={0.16} />
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
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const isDeficit = data.projectedBalance < summary.safeBufferThreshold;
                    const variance = data.projectedBalance - summary.safeBufferThreshold;
                    return (
                      <div className="rounded-xl border border-slate-800 bg-slate-950 text-white p-3.5 shadow-2xl text-xs space-y-1.5 z-30 font-sans min-w-[220px]">
                        <div className="font-semibold text-slate-200 border-b border-slate-800 pb-1.5 flex justify-between">
                          <span>{data.date}</span>
                          <span className="text-xs text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">Day {data.dayIndex}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-300">
                          <span>Closing balance:</span>
                          <strong className={`font-mono text-sm tabular-nums ${isDeficit ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {formatCurrency(data.projectedBalance)}
                          </strong>
                        </div>
                        {data.predictedInflow > 0 && (
                          <div className="flex justify-between items-center text-emerald-400 font-mono text-xs tabular-nums">
                            <span>Expected inflow:</span>
                            <span>+{formatCurrency(data.predictedInflow)}</span>
                          </div>
                        )}
                        {data.predictedOutflow > 0 && (
                          <div className="flex justify-between items-center text-rose-400 font-mono text-xs tabular-nums">
                            <span>Scheduled outflow:</span>
                            <span>-{formatCurrency(data.predictedOutflow)}</span>
                          </div>
                        )}
                        <div className="pt-1.5 border-t border-slate-800 flex justify-between text-xs text-slate-400 font-mono tabular-nums">
                          <span>Cushion margin:</span>
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
              <Area
                type="monotone"
                dataKey="projectedBalance"
                stroke="#059669"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#balanceHeroGradient)"
                activeDot={{ r: 5, fill: '#059669', stroke: '#ffffff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Visual Timeline Risk Strip */}
        <div className="grid grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 text-xs font-sans">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
            <span className="text-xs text-slate-500 font-semibold block">
              Days 1 – 5
            </span>
            <span className="font-semibold text-slate-900 text-sm">Initial buffer cushion</span>
            <p className="text-xs text-slate-500 mt-0.5 leading-snug">Opening balance covers immediate operating days.</p>
          </div>

          <div
            className={`p-3 rounded-lg border ${
              isShortageCritical
                ? 'bg-rose-50/60 border-rose-200 text-rose-900'
                : 'bg-slate-50 border-slate-200/70 text-slate-800'
            }`}
          >
            <span
              className={`text-xs font-semibold block ${
                isShortageCritical ? 'text-rose-700' : 'text-slate-500'
              }`}
            >
              Days 6 – 18 (Vulnerability zone)
            </span>
            <span className="font-semibold text-sm">
              {isShortageCritical ? 'Projected buffer deficit' : 'Scheduled commitments'}
            </span>
            <p className="text-xs text-slate-500 mt-0.5 leading-snug">
              Rent & payroll obligations fall due before collections.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/70">
            <span className="text-xs text-slate-500 font-semibold block">
              Days 19 – 30
            </span>
            <span className="font-semibold text-slate-900 text-sm">Receivables inflow phase</span>
            <p className="text-xs text-slate-500 mt-0.5 leading-snug">Month-end invoices restore operating reserve buffer.</p>
          </div>
        </div>
      </div>

      {/* 5. Editorial Intelligence: What's Affecting Your Cash Position? */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4 font-sans">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="text-xs font-semibold text-slate-500">
              Risk factor diagnostics (ML model)
            </div>
            <h2 className="text-xl font-semibold text-slate-900 tracking-tight mt-0.5">
              What's affecting your cash flow?
            </h2>
          </div>

          <button
            onClick={() => setActivePage('risk')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
          >
            <span>See detailed risk breakdown</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Editorial 2-Column Asymmetric Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Primary Driver Hero Callout (5 Cols) */}
          <div className="lg:col-span-5 rounded-xl bg-rose-50/50 border border-rose-200/90 p-5 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full">
                  Main risk driver
                </span>
                <span className="text-xs font-mono font-bold text-rose-800">+29.8% Impact Weight</span>
              </div>

              <div className="mt-3 font-sans">
                <div className="text-xs text-rose-900 font-semibold">
                  Receivables timing lag
                </div>
                <div className="text-2xl font-bold font-mono text-rose-950 mt-0.5">
                  ₹28,500 overdue
                </div>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed mt-2.5 font-sans">
                Client milestone invoice for the FinTech design sprint is 14 days overdue. Because this timing coincides directly with studio rent and compensation cycles, it constitutes the primary risk multiplier.
              </p>
            </div>

            <div className="pt-3 border-t border-rose-200/80 font-sans">
              <button
                onClick={() => {
                  const overdueInv = actionableInvoices.find((i) => i.status === 'overdue') || actionableInvoices[0];
                  if (overdueInv) openInvoiceReminderModal(overdueInv);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-800 hover:text-rose-900 transition-colors btn-interactive"
              >
                <Mail className="w-3.5 h-3.5 text-rose-600" />
                <span>Send 1-click friendly payment reminder →</span>
              </button>
            </div>
          </div>

          {/* Supporting Drivers Editorial List (7 Cols) */}
          <div className="lg:col-span-7 rounded-xl border border-slate-200/80 p-5 flex flex-col justify-between space-y-4 font-sans">
            <div className="text-xs font-semibold text-slate-500">
              Supporting financial signals
            </div>

            <div className="space-y-4 text-xs">
              {/* Driver 1 */}
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-700 mt-1.5 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-semibold text-slate-900">Fixed non-negotiable obligations:</strong>
                    <span className="font-mono font-bold text-slate-800 text-sm">₹37,000</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mt-0.5">
                    Studio workspace lease (₹22,000) and contract motion design commitments fall due between Days 4 and 10 before uncollected invoices arrive.
                  </p>
                </div>
              </div>

              {/* Driver 2 */}
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-700 mt-1.5 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-semibold text-slate-900">Operating cushion deficit:</strong>
                    <span className="font-mono font-bold text-slate-800 text-sm">₹6,500 below target</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mt-0.5">
                    Current liquid balance of {formatCurrency(summary.currentBalance)} sits below your {formatCurrency(summary.safeBufferThreshold)} safety cushion, leaving limited margin for disbursement delays.
                  </p>
                </div>
              </div>

              {/* Driver 3 */}
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-700 mt-1.5 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-semibold text-slate-900">Discretionary spend velocity:</strong>
                    <span className="font-mono font-bold text-slate-800 text-sm">Elastic buffer</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed mt-0.5">
                    Variable food delivery and non-essential tooling can be trimmed by 25% to recover ₹4,200 in operating buffer cushion immediately.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-sans">
              <span>Model attribution based on 12 financial indicators</span>
              <button
                onClick={() => setActivePage('insights')}
                className="text-emerald-700 hover:text-emerald-800 font-semibold"
              >
                Review recommended actions →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Financial Operations Interface: Receivables & Scheduled Outflows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans">
        {/* Uncollected Receivables Ledger */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-600" />
                <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                  Pending invoices & receivables
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {actionableInvoices.length > 0
                  ? `${actionableInvoices.length} invoices awaiting customer settlement`
                  : 'All customer invoices settled'}
              </p>
            </div>

            <span className="text-base font-mono font-bold text-slate-900">
              {formatCurrency(totalActionableInvoices)}
            </span>
          </div>

          {actionableInvoices.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-500 opacity-60" />
              <span className="font-medium text-slate-700">All customer invoices have been collected.</span>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-white">
              {actionableInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold text-slate-900">{inv.client}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-2 font-mono">
                      <span>Due {inv.dueDate}</span>
                      {inv.status === 'overdue' && (
                        <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-medium border border-rose-200 text-xs">
                          {inv.daysOverdue}d overdue
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900 text-base">
                      {formatCurrency(inv.amount)}
                    </span>
                    {inv.status === 'overdue' && (
                      <button
                        onClick={() => openInvoiceReminderModal(inv)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                        title="Send friendly payment reminder"
                      >
                        <Mail className="w-4 h-4 text-rose-600" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Scheduled Outflows Ledger */}
        <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 font-sans">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-600" />
                <h3 className="text-base font-semibold text-slate-900 tracking-tight">
                  Upcoming payments & bills
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {upcomingPayments.length > 0
                  ? `${upcomingPayments.length} payments scheduled across 30 days`
                  : 'No upcoming commitments'}
              </p>
            </div>

            <span className="text-base font-mono font-bold text-slate-900">
              {formatCurrency(totalUpcomingPayments)}
            </span>
          </div>

          {upcomingPayments.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <Calendar className="w-6 h-6 text-slate-400 opacity-60" />
              <span className="font-medium text-slate-700">No scheduled bills in the next 30 days.</span>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden bg-white">
              {upcomingPayments.slice(0, 4).map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold text-slate-900">{p.vendor}</div>
                    <div className="text-xs text-slate-500 font-sans">
                      Due {p.dueDate} • {p.category}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-slate-900 text-base">
                      {formatCurrency(p.amount)}
                    </span>
                    <StatusBadge level={p.urgency} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Product Intelligence Journey Stepper */}
      <IntelligenceJourneyFooter currentPage="dashboard" />
    </div>
  );
};
