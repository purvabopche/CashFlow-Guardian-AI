import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  DollarSign,
  Clock,
  Mail,
  Filter,
  Check,
  X,
  SlidersHorizontal,
  BrainCircuit,
  HelpCircle,
  ShieldAlert,
  ArrowUpRight,
  TrendingDown,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useFinancial } from '../context/FinancialContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { IntelligenceJourneyFooter } from '../components/common/IntelligenceJourneyFooter';

export const AiInsightsPage: React.FC = () => {
  const {
    insights,
    applyInsightAction,
    dismissInsightAction,
    openInvoiceReminderModal,
    setActivePage,
    formatCurrency,
    dataset,
    riskPrediction,
    summary
  } = useFinancial();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showWhyModal, setShowWhyModal] = useState<boolean>(false);

  const categories = [
    'All',
    'Vendor Payment Timing',
    'Discretionary Spending',
    'Recurring Subscriptions',
    'Liquidity & Reserves',
    'Receivable Management'
  ];

  const filteredInsights = insights.filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    return true;
  });

  const totalPotentialRecovery = insights
    .filter((i) => i.status === 'open')
    .reduce((sum, i) => sum + i.potentialCashImpact, 0);

  const totalRunwayExtensionDays = insights
    .filter((i) => i.status === 'open')
    .reduce((sum, i) => sum + i.runwayDaysImpact, 0);

  const appliedCount = insights.filter((i) => i.status === 'applied').length;

  const handleApply = (id: string) => {
    try {
      confetti({
        particleCount: 30,
        spread: 40,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
    applyInsightAction(id);
  };

  // Group by Priority Hierarchy
  const criticalActions = filteredInsights.filter((i) => i.priority === 'Critical');
  const highPriorityActions = filteredInsights.filter((i) => i.priority === 'High');
  const watchlistActions = filteredInsights.filter((i) => i.priority === 'Medium' || i.priority === 'Low');

  return (
    <div className="space-y-7 pb-12 animate-fade-in">
      {/* 1. Header & Quick Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200/90 font-sans">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 flex-wrap">
            <span>Recommended actions</span>
            <span className="text-slate-300">•</span>
            <span>{insights.filter((i) => i.status === 'open').length} open suggestions</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              Rule-based recommendations
            </span>
          </div>
          <h1 className="text-2xl sm:text-[28px] lg:text-[30px] font-bold text-slate-900 tracking-tight mt-1">
            What you can do next
          </h1>
        </div>

        <div className="flex items-center gap-2.5 self-start lg:self-auto font-sans">
          <button
            onClick={() => setShowWhyModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors shadow-2xs btn-interactive"
          >
            <HelpCircle className="w-4 h-4 text-slate-400" />
            <span>Why these recommendations?</span>
          </button>

          <button
            onClick={() => setActivePage('simulator')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-xs transition-all active:scale-95 btn-interactive"
          >
            <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
            <span>Test in simulator</span>
          </button>
        </div>
      </div>

      {/* 2. Executive Remediation Ticker */}
      <div className="fintech-card rounded-xl border border-slate-200/90 p-4 shadow-2xs fintech-card-highlight font-sans">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          <div className="space-y-1">
            <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              Potential cash unlocked
            </span>
            <div className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
              +{formatCurrency(totalPotentialRecovery)}
            </div>
            <p className="text-xs text-slate-500">Total liquidity released if all actions applied</p>
          </div>

          <div className="space-y-1 pt-3 sm:pt-0 sm:pl-4">
            <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              Potential runway gained
            </span>
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              +{totalRunwayExtensionDays} <span className="text-sm font-normal text-slate-400 font-sans">days</span>
            </div>
            <p className="text-xs text-slate-500">Immediate operating cushion gained</p>
          </div>

          <div className="space-y-1 pt-3 sm:pt-0 sm:pl-4">
            <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              Actions applied
            </span>
            <div className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
              {appliedCount} <span className="text-sm font-normal text-slate-400 font-sans">/ {insights.length}</span>
            </div>
            <p className="text-xs text-slate-500">Reflected in forward cash forecast</p>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-sans">
        <span className="text-xs font-semibold text-slate-500 shrink-0">
          Filter area:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold shrink-0 transition-colors ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white border border-slate-200/90 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 3. TIER 1: CRITICAL ACTIONS (IMMEDIATE INTERVENTION REQUIRED) */}
      {criticalActions.length > 0 && (
        <div className="space-y-3 font-sans">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
                High priority actions
              </h2>
            </div>
            <span className="text-xs text-rose-700 font-semibold">Immediate cash impact</span>
          </div>

          <div className="space-y-3">
            {criticalActions.map((action) => {
              const isApplied = action.status === 'applied';
              return (
                <div
                  key={action.id}
                  className={`rounded-xl border p-5 transition-all shadow-2xs ${
                    isApplied
                      ? 'bg-slate-50/70 border-slate-200/80 text-slate-700'
                      : 'bg-rose-50/30 border-rose-200/90 text-slate-900'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Problem & Rationale */}
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <StatusBadge level={action.priority} size="sm" />
                        <span className="text-xs text-slate-500 font-medium">
                          {action.category}
                        </span>
                        {action.riskReductionEstimate && (
                          <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            Risk: {action.riskReductionEstimate.fromRisk}% → {action.riskReductionEstimate.toRisk}%
                          </span>
                        )}
                      </div>

                      <h3 className="text-base sm:text-[17px] font-semibold text-slate-900 tracking-tight">
                        {action.title}
                      </h3>

                      <p className="text-sm text-slate-600 leading-relaxed">
                        {action.description}
                      </p>

                      <div className="p-3 rounded-lg bg-white/80 border border-slate-200/70 text-sm text-slate-700">
                        <strong className="text-slate-900 font-semibold block mb-0.5">
                          Recommended action:
                        </strong>
                        {action.recommendedAction}
                      </div>
                    </div>

                    {/* Impact Telemetry & CTAs */}
                    <div className="flex lg:flex-col items-start lg:items-end justify-between gap-4 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-200/70">
                      <div className="text-left lg:text-right space-y-0.5">
                        <div className="text-2xl font-bold font-mono text-emerald-700 tabular-nums">
                          +{formatCurrency(action.potentialCashImpact)}
                        </div>
                        <div className="text-xs font-mono text-slate-500">
                          +{action.runwayDaysImpact} days operating runway
                        </div>
                      </div>

                      <div className="flex items-center gap-2 font-sans">
                        {action.actionType === 'invoice_reminder' && (
                          <button
                            onClick={() => {
                              const inv = dataset.invoices.find((i) => i.id === action.templateData?.invoiceId) || dataset.invoices[0];
                              if (inv) openInvoiceReminderModal(inv);
                            }}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 text-sm font-semibold transition-colors shadow-2xs btn-interactive"
                          >
                            <Mail className="w-4 h-4 text-slate-500" />
                            <span>Draft email reminder</span>
                          </button>
                        )}

                        {isApplied ? (
                          <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-100 text-emerald-800 text-sm font-semibold border border-emerald-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                            <span>Applied to forecast</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleApply(action.id)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold shadow-xs transition-all btn-interactive"
                          >
                            <Sparkles className="w-4 h-4 text-emerald-400" />
                            <span>Apply to forecast</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. TIER 2: MEDIUM PRIORITY */}
      {highPriorityActions.length > 0 && (
        <div className="space-y-3 font-sans">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
                Medium priority recommendations
              </h2>
            </div>
            <span className="text-xs text-slate-500">Buffer protection</span>
          </div>

          <div className="space-y-3">
            {highPriorityActions.map((action) => {
              const isApplied = action.status === 'applied';
              return (
                <div
                  key={action.id}
                  className={`rounded-xl border p-4 transition-all shadow-2xs ${
                    isApplied
                      ? 'bg-slate-50/70 border-slate-200/80 text-slate-700'
                      : 'bg-white border-slate-200/90 text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center gap-2">
                        <StatusBadge level={action.priority} size="sm" />
                        <span className="text-xs text-slate-500 font-medium">
                          {action.category}
                        </span>
                      </div>
                      <h4 className="font-semibold text-slate-900 text-base">{action.title}</h4>
                      <p className="text-sm text-slate-600 leading-relaxed">{action.description}</p>
                    </div>

                    <div className="flex sm:flex-col items-start sm:items-end justify-between gap-3 shrink-0">
                      <div className="text-left sm:text-right">
                        <div className="text-base font-semibold font-mono text-slate-900">
                          +{formatCurrency(action.potentialCashImpact)}
                        </div>
                        <div className="text-xs text-slate-400">
                          +{action.runwayDaysImpact} days runway
                        </div>
                      </div>

                      {isApplied ? (
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                          Active in forecast
                        </span>
                      ) : (
                        <button
                          onClick={() => handleApply(action.id)}
                          className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-sm font-semibold transition-colors btn-interactive"
                        >
                          Apply recommendation
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. TIER 3: WATCHLIST & DISCRETIONARY TRIMS */}
      {watchlistActions.length > 0 && (
        <div className="space-y-3 font-sans">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-400" />
              <h2 className="text-xl font-semibold text-slate-900 tracking-tight">
                Discretionary spending & cost trims
              </h2>
            </div>
            <span className="text-xs text-slate-500">Expense trimming</span>
          </div>

          <div className="rounded-xl border border-slate-200/90 bg-white overflow-hidden shadow-2xs">
            <div className="divide-y divide-slate-100">
              {watchlistActions.map((action) => {
                const isApplied = action.status === 'applied';
                return (
                  <div
                    key={action.id}
                    className="p-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors text-sm"
                  >
                    <div className="space-y-0.5 max-w-lg">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-sm">{action.title}</span>
                        <span className="text-xs text-slate-400">
                          • {action.category}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">{action.description}</p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <span className="font-mono font-bold text-slate-900 text-base">
                          +{formatCurrency(action.potentialCashImpact)}
                        </span>
                        <div className="text-xs text-slate-400 font-mono">
                          +{action.runwayDaysImpact}d
                        </div>
                      </div>

                      {isApplied ? (
                        <span className="text-xs text-emerald-700 font-semibold">Applied</span>
                      ) : (
                        <button
                          onClick={() => handleApply(action.id)}
                          className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs btn-interactive"
                        >
                          Apply
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Explanation Modal */}
      {showWhyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in font-sans">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-slate-800" />
                <h3 className="text-lg font-semibold text-slate-900 tracking-tight">
                  How recommendations are ranked
                </h3>
              </div>
              <button
                onClick={() => setShowWhyModal(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
              <p>
                Each action is prioritized by comparing the timing of scheduled payments against expected client receivables:
              </p>
              <div className="space-y-2 text-sm">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
                  <strong className="text-slate-900 block font-semibold">1. Timing of the cash dip:</strong>
                  <span>Identifies when your balance dips closest to the {formatCurrency(summary.safeBufferThreshold)} buffer (around Day {summary.dangerDaysFromNow || 12}). Actions that move funds before this date receive top priority.</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
                  <strong className="text-slate-900 block font-semibold">2. Runway impact:</strong>
                  <span>Calculates how many days of extra operating runway each action creates based on your monthly outflow rate.</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-0.5">
                  <strong className="text-slate-900 block font-semibold">3. Practical feasibility:</strong>
                  <span>Overdue invoices with existing customer relationships are prioritized for reminders over uncertain prospective sales.</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowWhyModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white font-medium text-sm hover:bg-slate-800"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Product Intelligence Journey Stepper */}
      <IntelligenceJourneyFooter currentPage="insights" />
    </div>
  );
};
