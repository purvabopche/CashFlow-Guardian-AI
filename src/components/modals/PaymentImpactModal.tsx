import React from 'react';
import {
  X,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Clock,
  LayoutDashboard,
  Receipt,
  Sparkles
} from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';

export const PaymentImpactModal: React.FC = () => {
  const {
    isPaymentImpactModalOpen,
    setIsPaymentImpactModalOpen,
    activePaymentImpact,
    formatCurrency,
    setActivePage
  } = useFinancial();

  if (!isPaymentImpactModalOpen || !activePaymentImpact) return null;

  const { before, after, delta, message, payment } = activePaymentImpact;
  const isPaid = payment.status === 'paid';
  const isIncoming = payment.direction === 'incoming';

  const handleGoTo = (page: 'dashboard' | 'transactions') => {
    setIsPaymentImpactModalOpen(false);
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-900 max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 font-sans">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                isPaid
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                  : 'bg-rose-50 text-rose-600 border border-rose-200'
              }`}
            >
              {isPaid ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2 font-sans">
                <h2 className="text-lg font-bold text-slate-900">
                  {isPaid ? 'Payment cleared' : 'Payment failed'}
                </h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                  Test execution
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 font-sans">
                {isPaid
                  ? `Settlement confirmed • Transaction recorded • Forecast updated`
                  : `Simulation finished with declination • Financial ledger untouched`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsPaymentImpactModalOpen(false)}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Payment Summary Pill */}
        <div className="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-sans">
          <div>
            <span className="text-xs text-slate-500 font-medium block">
              Counterparty & ID
            </span>
            <div className="font-semibold text-slate-900 text-sm flex items-center gap-1.5 mt-0.5">
              <span>{payment.counterparty}</span>
              <span className="text-slate-300">•</span>
              <span className="font-mono text-slate-500 text-xs">{payment.id}</span>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-500 font-medium block">
              Amount
            </span>
            <div
              className={`text-base font-bold font-mono ${
                isIncoming ? 'text-emerald-700' : 'text-slate-900'
              }`}
            >
              {isIncoming ? '+' : '-'}
              {formatCurrency(payment.amount)}
            </div>
          </div>
        </div>

        {/* 4-Stage Settlement Pipeline Flow */}
        <div className="mt-3 p-3.5 rounded-xl bg-slate-950 text-white border border-slate-800 text-xs font-sans">
          <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center justify-between">
            <span>Settlement to forecast flow</span>
            <span className="text-emerald-400">● Synced</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              <span className="text-emerald-400 font-semibold block text-xs">1. Payment settled</span>
              <span className="text-xs text-slate-400">Status confirmed</span>
            </div>
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              <span className="text-emerald-400 font-semibold block text-xs">2. Logged to ledger</span>
              <span className="text-xs text-slate-400">Transaction saved</span>
            </div>
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              <span className="text-emerald-400 font-semibold block text-xs">3. Forecast updated</span>
              <span className="text-xs text-slate-400">Trajectory adjusted</span>
            </div>
            <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              <span className="text-emerald-400 font-semibold block text-xs">4. Risk refreshed</span>
              <span className="text-xs text-slate-400">ML model re-run</span>
            </div>
          </div>
        </div>

        {/* Message Banner */}
        <div
          className={`mt-3 p-3.5 rounded-xl border text-xs flex items-start gap-2 font-sans ${
            isPaid
              ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
              : 'bg-rose-50/70 border-rose-200 text-rose-900'
          }`}
        >
          {isPaid ? (
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <span className="font-semibold text-sm block">{message}</span>
            {payment.referenceId && (
              <span className="font-mono text-xs text-slate-500 block mt-0.5">
                Settlement Ref ID: <strong>{payment.referenceId}</strong>
                {payment.transactionId && ` • Linked Transaction: ${payment.transactionId}`}
              </span>
            )}
          </div>
        </div>

        {/* Genuine Impact Comparison Grid */}
        <div className="mt-4 space-y-3 font-sans">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-900 text-sm">How your cash position changed</span>
            <span className="text-xs text-slate-400">Before → after</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            {/* 1. Current Balance */}
            <div className="p-3 rounded-xl border border-slate-200/90 bg-white shadow-2xs space-y-1">
              <div className="text-xs font-medium text-slate-500">
                Available cash
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-slate-400 font-mono line-through text-xs">
                  {formatCurrency(before.currentBalance)}
                </span>
                <ArrowRight className="w-3 h-3 text-slate-300 mx-1" />
                <span className="text-base font-bold font-mono text-slate-900">
                  {formatCurrency(after.currentBalance)}
                </span>
              </div>
              <div
                className={`text-xs font-mono font-bold ${
                  delta.balance > 0
                    ? 'text-emerald-700'
                    : delta.balance < 0
                    ? 'text-slate-700'
                    : 'text-slate-400'
                }`}
              >
                Change: {delta.balance > 0 ? '+' : ''}
                {formatCurrency(delta.balance)}
              </div>
            </div>

            {/* 2. Projected Lowest Balance */}
            <div className="p-3 rounded-xl border border-slate-200/90 bg-white shadow-2xs space-y-1">
              <div className="text-xs font-medium text-slate-500">
                30-day lowest point
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-slate-400 font-mono line-through text-xs">
                  {formatCurrency(before.projectedLowestBalance)}
                </span>
                <ArrowRight className="w-3 h-3 text-slate-300 mx-1" />
                <span className="text-base font-bold font-mono text-slate-900">
                  {formatCurrency(after.projectedLowestBalance)}
                </span>
              </div>
              <div
                className={`text-xs font-mono font-bold ${
                  delta.projectedLowestBalance > 0
                    ? 'text-emerald-700'
                    : delta.projectedLowestBalance < 0
                    ? 'text-rose-600'
                    : 'text-slate-400'
                }`}
              >
                Change: {delta.projectedLowestBalance > 0 ? '+' : ''}
                {formatCurrency(delta.projectedLowestBalance)}
              </div>
            </div>

            {/* 3. Shortage Risk Probability */}
            <div className="p-3 rounded-xl border border-slate-200/90 bg-white shadow-2xs space-y-1">
              <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
                <span>Shortage risk</span>
                <span className="text-xs font-normal text-slate-400">ML model</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-slate-400 font-mono line-through text-xs">
                  {before.shortageProbabilityPct.toFixed(1)}%
                </span>
                <ArrowRight className="w-3 h-3 text-slate-300 mx-1" />
                <span
                  className={`text-base font-bold font-mono ${
                    after.shortageProbabilityPct >= 65
                      ? 'text-rose-600'
                      : after.shortageProbabilityPct >= 35
                      ? 'text-amber-600'
                      : 'text-emerald-700'
                  }`}
                >
                  {after.shortageProbabilityPct.toFixed(1)}%
                </span>
              </div>
              <div
                className={`text-xs font-mono font-bold flex items-center gap-1 ${
                  delta.shortageProbabilityPct < 0
                    ? 'text-emerald-700'
                    : delta.shortageProbabilityPct > 0
                    ? 'text-rose-600'
                    : 'text-slate-400'
                }`}
              >
                {delta.shortageProbabilityPct < 0 ? (
                  <TrendingDown className="w-3 h-3 text-emerald-600" />
                ) : delta.shortageProbabilityPct > 0 ? (
                  <TrendingUp className="w-3 h-3 text-rose-600" />
                ) : null}
                Risk change: {delta.shortageProbabilityPct > 0 ? '+' : ''}
                {delta.shortageProbabilityPct.toFixed(1)}%
              </div>
            </div>

            {/* 4. Cash Safety Score */}
            <div className="p-3 rounded-xl border border-slate-200/90 bg-white shadow-2xs space-y-1">
              <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
                <span>Safety score</span>
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-slate-400 font-mono line-through text-xs">
                  {before.safetyScore}/100
                </span>
                <ArrowRight className="w-3 h-3 text-slate-300 mx-1" />
                <span className="text-base font-bold font-mono text-slate-900">
                  {after.safetyScore}/100
                </span>
              </div>
              <div
                className={`text-xs font-mono font-bold ${
                  delta.safetyScore > 0
                    ? 'text-emerald-700'
                    : delta.safetyScore < 0
                    ? 'text-rose-600'
                    : 'text-slate-400'
                }`}
              >
                Score change: {delta.safetyScore > 0 ? '+' : ''}
                {delta.safetyScore} pts
              </div>
            </div>
          </div>

          {/* 5. Operating Runway */}
          <div className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/70 flex items-center justify-between text-xs font-sans">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-500" />
              <div>
                <span className="font-semibold text-slate-800 text-sm">Operating runway</span>
                <span className="text-xs text-slate-500 block">
                  Based on daily net outflows
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono font-bold text-slate-900 text-base">
                ~{after.runwayDays} days
              </span>
              <span
                className={`text-xs font-mono font-semibold block ${
                  delta.runwayDays > 0
                    ? 'text-emerald-700'
                    : delta.runwayDays < 0
                    ? 'text-rose-600'
                    : 'text-slate-400'
                }`}
              >
                {delta.runwayDays > 0 ? `+${delta.runwayDays}` : delta.runwayDays} days change
              </span>
            </div>
          </div>
        </div>

        {/* Navigation CTAs */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-sm font-sans">
          <button
            onClick={() => setIsPaymentImpactModalOpen(false)}
            className="w-full sm:w-auto px-4 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold transition-colors btn-interactive"
          >
            Close
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleGoTo('transactions')}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-semibold transition-colors btn-interactive"
            >
              <Receipt className="w-4 h-4 text-slate-500" />
              <span>View ledger</span>
            </button>
            <button
              onClick={() => handleGoTo('dashboard')}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all active:scale-95 shadow-xs btn-interactive"
            >
              <span>View dashboard →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
