import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  DollarSign,
  Clock,
  Mail,
  Calendar,
  Layers,
  Filter,
  Check,
  X,
  SlidersHorizontal,
  ChevronRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useFinancial } from '../context/FinancialContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { MetricCard } from '../components/common/MetricCard';

export const AiInsightsPage: React.FC = () => {
  const {
    insights,
    applyInsightAction,
    dismissInsightAction,
    openInvoiceReminderModal,
    setActivePage,
    dataset
  } = useFinancial();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');

  const categories = ['All', 'Receivable Management', 'Vendor Payment Timing', 'Expense Optimization', 'Liquidity & Reserves'];

  const filteredInsights = insights.filter((item) => {
    if (selectedCategory !== 'All' && item.category !== selectedCategory) return false;
    if (selectedPriority !== 'All' && item.priority !== selectedPriority) return false;
    return true;
  });

  const totalPotentialRecovery = insights
    .filter((i) => i.status === 'open')
    .reduce((sum, i) => sum + i.potentialCashImpact, 0);

  const totalRunwayExtensionDays = insights
    .filter((i) => i.status === 'open')
    .reduce((sum, i) => sum + i.runwayDaysImpact, 0);

  const handleApply = (id: string) => {
    try {
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
    applyInsightAction(id);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              AI Financial Action Recommendations
            </h1>
            <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
              Prescriptive Intelligence
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Prioritized liquidity interventions to eliminate predicted shortage risks and extend operating runway.
          </p>
        </div>

        <button
          onClick={() => setActivePage('simulator')}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
          <span>Simulate Action Impact</span>
        </button>
      </div>

      {/* Aggregate Opportunities Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Total Cash Buffer Unlocked"
          value={`$${totalPotentialRecovery.toLocaleString()}`}
          subValue="From active open recommendations"
          icon={DollarSign}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          variant="highlight"
        />

        <MetricCard
          title="Potential Runway Extension"
          value={`+${totalRunwayExtensionDays} Days`}
          subValue="Cumulative runway protection"
          icon={Clock}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
          variant="accent"
        />

        <MetricCard
          title="Actionable Interventions"
          value={`${insights.filter((i) => i.status === 'open').length} Items`}
          subValue={`${insights.filter((i) => i.status === 'applied').length} Implemented`}
          icon={Sparkles}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="font-semibold text-slate-500 mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Category:
          </span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500">Priority:</span>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical Only</option>
            <option value="High">High Only</option>
            <option value="Medium">Medium</option>
          </select>
        </div>
      </div>

      {/* Insights Cards List */}
      <div className="space-y-4">
        {filteredInsights.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs">
            No recommendations match the selected filters.
          </div>
        ) : (
          filteredInsights.map((item) => {
            const isApplied = item.status === 'applied';
            const isDismissed = item.status === 'dismissed';

            return (
              <div
                key={item.id}
                className={`rounded-2xl border p-6 transition-all shadow-sm ${
                  isApplied
                    ? 'border-emerald-200 bg-emerald-50/30 opacity-90'
                    : isDismissed
                    ? 'border-slate-200 bg-slate-50 opacity-60'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Left content */}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <StatusBadge level={item.priority} size="sm" />
                      <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                        {item.category}
                      </span>
                      {isApplied && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <Check className="w-3 h-3" /> Implemented
                        </span>
                      )}
                      {isDismissed && (
                        <span className="text-[11px] font-semibold text-slate-400">Dismissed</span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">{item.title}</h3>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">{item.description}</p>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-semibold">
                      <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>${item.potentialCashImpact.toLocaleString()} Liquidity Impact</span>
                      </div>
                      <div className="flex items-center gap-1 text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/60">
                        <Clock className="w-3.5 h-3.5" />
                        <span>+{item.runwayDaysImpact} Days Runway</span>
                      </div>
                    </div>

                    {/* Recommended action callout box */}
                    <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-xs text-slate-700 space-y-1">
                      <div className="font-bold text-slate-900 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Prescribed Action:
                      </div>
                      <p className="text-slate-600">{item.recommendedAction}</p>
                    </div>
                  </div>

                  {/* Right Action Trigger Buttons */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-between gap-2 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    {!isApplied && !isDismissed && (
                      <>
                        {item.actionType === 'invoice_reminder' && (
                          <button
                            onClick={() => {
                              const tData = item.templateData || {};
                              const matchingInvoice = dataset.invoices.find((i) => i.id === tData.invoiceId) || {
                                id: tData.invoiceId || 'INV-1042',
                                client: tData.client || 'Apex Global Logistics',
                                amount: tData.amount || item.potentialCashImpact,
                                dueDate: '2026-09-05',
                                status: 'overdue' as const,
                                daysOverdue: tData.daysOverdue || 14
                              };
                              openInvoiceReminderModal(matchingInvoice);
                            }}
                            className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all active:scale-95"
                          >
                            <Mail className="w-3.5 h-3.5" />
                            <span>Launch 1-Click Reminder</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleApply(item.id)}
                          className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold shadow-sm transition-all"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Mark as Applied</span>
                        </button>

                        <button
                          onClick={() => dismissInsightAction(item.id)}
                          className="text-xs text-slate-400 hover:text-slate-600 font-medium px-2 py-1 transition-colors"
                        >
                          Dismiss
                        </button>
                      </>
                    )}

                    {isApplied && (
                      <button
                        onClick={() => applyInsightAction(item.id)}
                        className="text-xs font-bold text-emerald-600 bg-emerald-100/50 px-3 py-1.5 rounded-xl flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active in Forecast
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
