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
  HelpCircle
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
    formatCurrency,
    dataset,
    riskPrediction,
    summary
  } = useFinancial();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
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
        particleCount: 30,
        spread: 40,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
    applyInsightAction(id);
  };

  // Separate the top critical recommendation to be visually dominant
  const primaryInsight = filteredInsights.find(i => i.priority === 'Critical' && i.status === 'open') || filteredInsights[0];
  const secondaryInsights = filteredInsights.filter(i => i.id !== primaryInsight?.id);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Actionable AI Liquidity Recommendations
            </h1>
            <span className="text-xs font-mono text-slate-400">
              • {insights.filter((i) => i.status === 'open').length} Open Prescriptions
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Targeted interventions to prevent liquidity shortages and protect your {formatCurrency(summary.safeBufferThreshold)} safety cushion.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowWhyModal(true)}
            className="flex items-center gap-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
            <span>Why is this predicted?</span>
          </button>

          <button
            onClick={() => setActivePage('simulator')}
            className="flex items-center gap-1 rounded-md bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-1 text-xs font-medium shadow-sm transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Simulator</span>
          </button>
        </div>
      </div>

      {/* Aggregate Opportunities Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <MetricCard
          title="Recoverable Liquidity Cushion"
          value={formatCurrency(totalPotentialRecovery)}
          subValue="Available across open actions"
          icon={DollarSign}
        />

        <MetricCard
          title="Potential Runway Extension"
          value={`+${totalRunwayExtensionDays} Days`}
          subValue="Cumulative operating buffer"
          icon={Clock}
        />

        <MetricCard
          title="Implementation Status"
          value={`${insights.filter((i) => i.status === 'applied').length} / ${insights.length}`}
          subValue="Actions implemented in forecast"
          icon={Sparkles}
        />
      </div>

      {/* Primary Dominant Recommendation */}
      {primaryInsight && (
        <div className="rounded-lg border-2 border-rose-200 bg-rose-50/20 p-5 space-y-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <StatusBadge level={primaryInsight.priority} size="md" />
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-800 font-mono">
                Primary Actionable Deficit Remediation
              </span>
            </div>
            {primaryInsight.riskReductionEstimate && (
              <span className="text-xs font-mono font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                Reduces Shortage Risk: {primaryInsight.riskReductionEstimate.fromRisk}% → {primaryInsight.riskReductionEstimate.toRisk}%
              </span>
            )}
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              {primaryInsight.title}
            </h2>
            <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs bg-white p-3.5 rounded border border-slate-200/80">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Financial Impact</span>
                <span className="text-sm font-bold text-emerald-700 font-mono">
                  {formatCurrency(primaryInsight.potentialCashImpact)}
                </span>
                <span className="text-slate-500 text-[11px] block">+{primaryInsight.runwayDaysImpact} days runway</span>
              </div>
              <div className="md:col-span-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">Why This Matters</span>
                <p className="text-slate-700 text-xs leading-relaxed mt-0.5">
                  {primaryInsight.description}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-rose-100">
            <div className="text-xs text-slate-700">
              <strong className="text-slate-900 font-semibold">Action: </strong>
              {primaryInsight.recommendedAction}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {primaryInsight.actionType === 'invoice_reminder' && (
                <button
                  onClick={() => {
                    const tData = primaryInsight.templateData || {};
                    const matchingInvoice = dataset.invoices.find((i) => i.id === tData.invoiceId) || dataset.invoices[0];
                    if (matchingInvoice) openInvoiceReminderModal(matchingInvoice);
                  }}
                  className="flex items-center gap-1.5 rounded bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1.5 text-xs font-semibold shadow-sm"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send 1-Click Reminder</span>
                </button>
              )}

              <button
                onClick={() => handleApply(primaryInsight.id)}
                className="flex items-center gap-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 text-xs font-semibold shadow-sm"
              >
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Implement in Forecast</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Secondary Recommendations List */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Additional Secondary Recommendations ({secondaryInsights.length})
          </h3>
          <span className="text-[11px] text-slate-400">Ranked by liquidity impact</span>
        </div>

        <div className="divide-y divide-slate-100">
          {secondaryInsights.map((item) => {
            const isApplied = item.status === 'applied';
            return (
              <div key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2">
                    <StatusBadge level={item.priority} size="sm" />
                    <span className="font-semibold text-slate-900">{item.title}</span>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-500">{item.category}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <div className="text-right">
                    <span className="font-mono font-bold text-slate-900 text-xs">
                      {formatCurrency(item.potentialCashImpact)}
                    </span>
                    <span className="text-[10px] text-slate-400 block">+{item.runwayDaysImpact}d</span>
                  </div>

                  {!isApplied ? (
                    <button
                      onClick={() => handleApply(item.id)}
                      className="px-2.5 py-1 rounded border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 flex items-center gap-1 transition-colors"
                    >
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Apply</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Applied
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Explainable Modal */}
      {showWhyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-xl rounded-lg bg-white p-5 shadow-xl border border-slate-200 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-emerald-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Feature Attribution: Why Was This Shortage Predicted?
                </h3>
              </div>
              <button
                onClick={() => setShowWhyModal(false)}
                className="p-1 rounded text-slate-400 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              The model continuously evaluates pending receivables against scheduled liabilities. Here are the core factors driving the <strong className="text-slate-900 font-mono">{riskPrediction.riskProbability}% shortage risk</strong>:
            </p>

            <div className="space-y-2 text-xs">
              {riskPrediction.explainability.map((f) => (
                <div
                  key={f.id}
                  className={`p-2.5 rounded border ${
                    f.direction === 'increases_risk'
                      ? 'bg-rose-50/40 border-rose-200'
                      : 'bg-emerald-50/40 border-emerald-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-0.5 font-semibold">
                    <span className="text-slate-900">{f.name}</span>
                    <span className={`font-mono ${f.direction === 'increases_risk' ? 'text-rose-700' : 'text-emerald-700'}`}>
                      {f.direction === 'increases_risk' ? `+${f.impactPercent}% Weight` : `-${f.impactPercent}% Weight`}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px]">{f.description}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowWhyModal(false)}
                className="px-3 py-1.5 rounded bg-slate-900 text-white text-xs font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
