import React, { useState } from 'react';
import {
  Search,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  CreditCard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  Info,
  Building2,
  FileText,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';
import { PaymentRecord, PaymentDirection, PaymentStatus } from '../types/financial';
import { EmptyState } from '../components/common/EmptyState';

export const PaymentsPage: React.FC = () => {
  const {
    dataset,
    payments,
    formatCurrency,
    setIsCreatePaymentModalOpen,
    processPayment,
    processRazorpayPayment,
    paymentConfig,
    activePaymentMode,
    setActivePaymentMode,
    setActivePaymentImpact,
    setIsPaymentImpactModalOpen,
    summary,
    forecast,
    riskPrediction
  } = useFinancial();

  const [searchQuery, setSearchQuery] = useState('');
  const [directionFilter, setDirectionFilter] = useState<'all' | 'outgoing' | 'incoming'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | PaymentStatus>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const paymentList: PaymentRecord[] = payments || [];

  // Filter payments
  const filteredPayments = paymentList.filter((p) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (p.counterparty || '').toLowerCase().includes(query) ||
      (p.description || '').toLowerCase().includes(query) ||
      (p.id || '').toLowerCase().includes(query) ||
      (p.invoiceReference || '').toLowerCase().includes(query);

    const matchesDirection =
      directionFilter === 'all' ? true : p.direction === directionFilter;

    const matchesStatus =
      statusFilter === 'all' ? true : p.status === statusFilter;

    return matchesSearch && matchesDirection && matchesStatus;
  });

  // Derived Institutional Metrics
  const totalVolume = paymentList.reduce((sum, p) => sum + p.amount, 0);

  const completedList = paymentList.filter((p) => p.status === 'paid');
  const completedVolume = completedList.reduce((sum, p) => sum + p.amount, 0);

  const pendingOutgoing = paymentList.filter(
    (p) => p.status === 'pending' && p.direction === 'outgoing'
  );
  const pendingOutgoingVolume = pendingOutgoing.reduce((sum, p) => sum + p.amount, 0);

  const pendingIncoming = paymentList.filter(
    (p) => p.status === 'pending' && p.direction === 'incoming'
  );
  const pendingIncomingVolume = pendingIncoming.reduce((sum, p) => sum + p.amount, 0);

  const failedList = paymentList.filter((p) => p.status === 'failed');
  const failedVolume = failedList.reduce((sum, p) => sum + p.amount, 0);

  // Process payment handler in Demo mode
  const handleProcess = async (paymentId: string, simulateFailure: boolean = false) => {
    setProcessingId(paymentId);
    try {
      await processPayment(paymentId, simulateFailure, 'demo');
    } finally {
      setProcessingId(null);
    }
  };

  // Process payment handler in Razorpay Test Mode
  const handleProcessRazorpay = async (paymentId: string) => {
    setProcessingId(paymentId);
    try {
      await processRazorpayPayment(paymentId);
    } finally {
      setProcessingId(null);
    }
  };

  // View existing impact handler
  const handleViewImpact = (payment: PaymentRecord) => {
    setActivePaymentImpact({
      before: {
        currentBalance: summary.currentBalance,
        projectedLowestBalance: forecast.lowestProjectedPoint,
        shortageProbabilityPct: riskPrediction.riskProbability,
        safetyScore: summary.cashHealthScore,
        runwayDays: summary.runwayDays,
        riskLevel: riskPrediction.riskLevel
      },
      after: {
        currentBalance: summary.currentBalance,
        projectedLowestBalance: forecast.lowestProjectedPoint,
        shortageProbabilityPct: riskPrediction.riskProbability,
        safetyScore: summary.cashHealthScore,
        runwayDays: summary.runwayDays,
        riskLevel: riskPrediction.riskLevel
      },
      delta: {
        balance: 0,
        projectedLowestBalance: 0,
        shortageProbabilityPct: 0,
        safetyScore: 0,
        runwayDays: 0
      },
      message: `Recorded payment: ${payment.counterparty} (${formatCurrency(payment.amount)}) [Ref: ${payment.referenceId || 'N/A'}]`,
      payment
    });
    setIsPaymentImpactModalOpen(true);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in">
      {/* 1. Header & Operations Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/90 font-sans">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Payments & cash flow</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-800 font-semibold">{dataset.name}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold text-slate-900 tracking-tight">
              Payments & cash flow
            </h1>
            {activePaymentMode === 'razorpay' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200/80">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                Razorpay test mode
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Demo payment mode
              </span>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Track upcoming vendor payments and expected customer receivables. Settling a payment logs the transaction and immediately updates your 30-day forecast.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0 flex-wrap font-sans">
          {/* Mode Switcher */}
          <div className="inline-flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200/80 text-xs">
            <button
              onClick={() => setActivePaymentMode('demo')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                activePaymentMode === 'demo'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Demo mode
            </button>
            <button
              onClick={() => setActivePaymentMode('razorpay')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                activePaymentMode === 'razorpay'
                  ? 'bg-white text-blue-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Razorpay test mode
            </button>
          </div>

          <button
            onClick={() => setIsCreatePaymentModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-xs transition-all active:scale-95 btn-interactive"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Create payment</span>
          </button>
        </div>
      </div>

      {/* 2. Fintech Settlement Engine Architecture & Flow Pipeline */}
      <div className="fintech-card rounded-xl p-4 border border-slate-200/90 shadow-2xs space-y-3 font-sans">
        {/* Top: Active Gateway Configuration */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pb-3 border-b border-slate-100">
          <div className="flex flex-wrap items-center gap-3">
            {activePaymentMode === 'razorpay' ? (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    Active provider:
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-semibold bg-blue-50 text-blue-800 border border-blue-200/80 text-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                    RazorpayProvider (Test Mode)
                  </span>
                </div>

                <span className="hidden sm:inline text-slate-300">|</span>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    Credentials:
                  </span>
                  {paymentConfig?.is_configured ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-emerald-700 bg-emerald-50 border border-emerald-200 text-xs font-mono">
                      Configured • Key: {paymentConfig.key_id ? `${paymentConfig.key_id.slice(0, 12)}...` : 'rzp_test_***'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-amber-700 bg-amber-50 border border-amber-200 text-xs" title="Payment gateway unavailable. Demo mode is still available.">
                      Unconfigured • Demo fallback active
                    </span>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                    Active provider:
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    DemoProvider (Instant Simulator)
                  </span>
                </div>

                <span className="hidden sm:inline text-slate-300">|</span>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    Gateway adapter:
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-slate-600 bg-slate-100 border border-slate-200 text-xs">
                    RazorpayProvider {paymentConfig?.is_configured ? '(Configured • Ready)' : '(Available on demand)'}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Cryptographic Idempotency Protected</span>
          </div>
        </div>

        {/* Bottom: Visual Telemetry Flow Pipeline */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto py-1 text-xs custom-scrollbar">
          <div className="flex items-center gap-2 min-w-max">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100/90 border border-slate-200 text-slate-800 font-mono text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              <span className="font-semibold">1. Payment committed</span>
            </div>
            <span className="text-slate-400 font-mono">──▶</span>

            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs border ${
              activePaymentMode === 'razorpay'
                ? 'bg-blue-50/80 border-blue-200 text-blue-900'
                : 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${activePaymentMode === 'razorpay' ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span className="font-semibold">{activePaymentMode === 'razorpay' ? '2. Razorpay checkout & HMAC verify' : '2. Demo clearing engine'}</span>
            </div>
            <span className="text-slate-400 font-mono">──▶</span>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100/90 border border-slate-200 text-slate-800 font-mono text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
              <span className="font-semibold">3. Transaction logged exactly once</span>
            </div>
            <span className="text-slate-400 font-mono">──▶</span>

            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50/80 border border-emerald-200 text-emerald-900 font-mono text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="font-semibold">4. 30d forecast & ML risk recalculated</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Summary Ticker Bar */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs font-sans">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {/* Total Payment Volume */}
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-slate-500" />
              Total payment volume
            </span>
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {formatCurrency(totalVolume)}
            </div>
            <p className="text-xs text-slate-500">
              {paymentList.length} total records
            </p>
          </div>

          {/* Completed / Settled */}
          <div className="space-y-1 pt-3 md:pt-0 md:pl-4">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Completed & settled
            </span>
            <div className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
              {formatCurrency(completedVolume)}
            </div>
            <p className="text-xs text-slate-500">
              {completedList.length} cleared ({Math.round((completedVolume / Math.max(1, totalVolume)) * 100)}% of volume)
            </p>
          </div>

          {/* Pending Commitments (Outgoing) */}
          <div className="space-y-1 pt-3 md:pt-0 md:pl-4">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-amber-600" />
              Pending payments
            </span>
            <div className="text-2xl font-bold font-mono text-amber-700 tabular-nums">
              {formatCurrency(pendingOutgoingVolume)}
            </div>
            <p className="text-xs text-slate-500">
              {pendingOutgoing.length} disbursements due
            </p>
          </div>

          {/* Pending Receivables (Incoming) */}
          <div className="space-y-1 pt-3 md:pt-0 md:pl-4">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <ArrowDownLeft className="w-3.5 h-3.5 text-blue-600" />
              Expected inflows
            </span>
            <div className="text-2xl font-bold font-mono text-blue-700 tabular-nums">
              +{formatCurrency(pendingIncomingVolume)}
            </div>
            <p className="text-xs text-slate-500">
              {pendingIncoming.length} receivables expected
            </p>
          </div>

          {/* Failed / Cancelled */}
          <div className="space-y-1 pt-3 md:pt-0 md:pl-4">
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
              Failed / declined
            </span>
            <div className="text-2xl font-bold font-mono text-slate-700 tabular-nums">
              {formatCurrency(failedVolume)}
            </div>
            <p className="text-xs text-slate-500">
              {failedList.length} declined
            </p>
          </div>
        </div>
      </div>

      {/* 3. Filter & Search Controls Strip */}
      <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 font-sans">
          {/* Search Field */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search payments by counterparty, ID, invoice reference, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>

          {/* Direction Tabs */}
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200/80 text-xs self-start md:self-auto font-sans">
            {(['all', 'outgoing', 'incoming'] as const).map((dir) => (
              <button
                key={dir}
                onClick={() => setDirectionFilter(dir)}
                className={`px-3 py-1.5 rounded-md capitalize font-semibold transition-all ${
                  directionFilter === dir
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {dir === 'all'
                  ? 'All flows'
                  : dir === 'outgoing'
                  ? 'Disbursements (-)'
                  : 'Collections (+)'}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 pb-0.5 custom-scrollbar text-xs font-sans">
          <span className="text-xs font-semibold text-slate-500 mr-1 shrink-0">
            Status:
          </span>
          {(['all', 'pending', 'paid', 'failed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium shrink-0 transition-colors ${
                statusFilter === st
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {st === 'all'
                ? 'All statuses'
                : st === 'pending'
                ? `Pending (${pendingOutgoing.length + pendingIncoming.length})`
                : st === 'paid'
                ? `Paid (${completedList.length})`
                : `Failed (${failedList.length})`}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Professional Operations Payment Ledger Table */}
      <div className="rounded-xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden font-sans">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between text-sm text-slate-500">
          <span>
            Showing <strong className="text-slate-900 font-semibold">{filteredPayments.length}</strong> of{' '}
            <strong className="text-slate-900 font-semibold">{paymentList.length}</strong> payments
          </span>
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            Settling updates your balance & forecast
          </span>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={CreditCard}
              title="No payments found"
              description="No payments match your current filter. You can create a new payment or clear filters."
              actionLabel="Create payment"
              onAction={() => setIsCreatePaymentModalOpen(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/80 text-xs uppercase tracking-wider font-semibold text-slate-500">
                  <th className="py-3.5 px-5">Payment ID</th>
                  <th className="py-3.5 px-5">Counterparty & description</th>
                  <th className="py-3.5 px-5">Type</th>
                  <th className="py-3.5 px-5">Category</th>
                  <th className="py-3.5 px-5">Due date</th>
                  <th className="py-3.5 px-5 text-right">Amount</th>
                  <th className="py-3.5 px-5 text-center">Status</th>
                  <th className="py-3.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans text-sm">
                {filteredPayments.map((p) => {
                  const isIncoming = p.direction === 'incoming';
                  const isPending = p.status === 'pending';
                  const isPaid = p.status === 'paid';
                  const isFailed = p.status === 'failed';
                  const isBusy = processingId === p.id;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/80 transition-colors group text-sm text-slate-800"
                    >
                      {/* Payment ID */}
                      <td className="py-3.5 px-5 font-mono text-xs text-slate-500 whitespace-nowrap align-middle">
                        <span className="font-semibold text-slate-700">{p.id}</span>
                        {p.referenceId && (
                          <div className="text-xs text-slate-400 font-mono">
                            {p.referenceId}
                          </div>
                        )}
                      </td>

                      {/* Counterparty & Description with Event Badges */}
                      <td className="py-3.5 px-5 align-middle">
                        <div className="font-semibold text-slate-900 text-sm flex items-center gap-1.5 flex-wrap">
                          <span>{p.counterparty}</span>
                          {p.invoiceReference && (
                            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              Ref: {p.invoiceReference}
                            </span>
                          )}
                          {p.amount >= 25000 && !isIncoming && (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                              Major outflow
                            </span>
                          )}
                          {p.amount >= 30000 && isIncoming && (
                            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
                              Core receivable
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 max-w-sm truncate">
                          {p.description}
                        </div>
                      </td>

                      {/* Flow Direction */}
                      <td className="py-3.5 px-5 whitespace-nowrap align-middle">
                        {isIncoming ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                            Incoming
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            <ArrowUpRight className="w-3 h-3 text-slate-500" />
                            Outgoing
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-5 whitespace-nowrap align-middle">
                        <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/70">
                          {p.category}
                        </span>
                      </td>

                      {/* Scheduled Date */}
                      <td className="py-3.5 px-5 font-mono text-xs text-slate-600 whitespace-nowrap align-middle">
                        {p.scheduledDate || p.dueDate}
                      </td>

                      {/* Amount */}
                      <td className="py-3.5 px-5 text-right whitespace-nowrap align-middle">
                        <span
                          className={`font-mono font-bold text-base tabular-nums ${
                            isIncoming ? 'text-emerald-700' : 'text-slate-900'
                          }`}
                        >
                          {isIncoming ? '+' : '-'}
                          {formatCurrency(p.amount)}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-5 text-center whitespace-nowrap align-middle">
                        {isPaid && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Paid
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            Pending
                          </span>
                        )}
                        {isFailed && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200">
                            <AlertCircle className="w-3 h-3 text-rose-600" />
                            Failed
                          </span>
                        )}
                      </td>

                      {/* Operations / Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        {isPending && (
                          <div className="inline-flex items-center gap-1.5">
                            {activePaymentMode === 'razorpay' ? (
                              <>
                                <button
                                  onClick={() => handleProcessRazorpay(p.id)}
                                  disabled={isBusy}
                                  title="Open Razorpay Test Mode Checkout"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all btn-interactive disabled:opacity-50 shadow-2xs"
                                >
                                  <CreditCard className="w-3 h-3 text-blue-200" />
                                  <span>{isBusy ? 'Opening...' : 'Pay with Razorpay'}</span>
                                </button>
                                <button
                                  onClick={() => handleProcess(p.id, false)}
                                  disabled={isBusy}
                                  title="Process using Demo simulator"
                                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-medium transition-colors btn-interactive"
                                >
                                  Use demo
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleProcess(p.id, false)}
                                  disabled={isBusy}
                                  title="Process in Demo Payment Mode (settles payment, updates ledger & triggers forecast)"
                                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all btn-interactive disabled:opacity-50 shadow-2xs"
                                >
                                  <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                                  <span>{isBusy ? 'Clearing...' : 'Process demo'}</span>
                                </button>
                                <button
                                  onClick={() => handleProcess(p.id, true)}
                                  disabled={isBusy}
                                  title="Simulate payment failure to test risk and transaction isolation"
                                  className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-700 hover:border-rose-300 hover:bg-rose-50/50 text-xs font-medium transition-colors btn-interactive"
                                >
                                  Simulate fail
                                </button>
                              </>
                            )}
                          </div>
                        )}

                        {isPaid && (
                          <button
                            onClick={() => handleViewImpact(p)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors btn-interactive"
                          >
                            <Sparkles className="w-3 h-3 text-emerald-600" />
                            <span>View impact</span>
                          </button>
                        )}

                        {isFailed && (
                          activePaymentMode === 'razorpay' ? (
                            <button
                              onClick={() => handleProcessRazorpay(p.id)}
                              disabled={isBusy}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-blue-200 text-blue-700 hover:bg-blue-50 text-xs font-semibold transition-colors"
                            >
                              <RotateCcw className="w-3 h-3 text-blue-600" />
                              <span>Retry Razorpay</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleProcess(p.id, false)}
                              disabled={isBusy}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition-colors"
                            >
                              <RotateCcw className="w-3 h-3 text-rose-600" />
                              <span>Retry demo</span>
                            </button>
                          )
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
    </div>
  );
};
