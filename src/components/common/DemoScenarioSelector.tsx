import React from 'react';
import { AlertOctagon, AlertTriangle, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';

export const DemoScenarioSelector: React.FC = () => {
  const { currentDatasetKey, setDatasetKey, formatCurrency } = useFinancial();

  const scenarios = [
    {
      id: 'critical_shortage',
      label: 'Critical Shortage',
      subtitle: 'Retail / Consulting SME',
      badgeText: 'High Deficit Risk',
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
      icon: AlertOctagon,
      iconColor: 'text-rose-600',
      activeRing: 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/20',
      headline: '₹28,500 overdue invoice vs rent & payroll',
      breachDetail: 'Deficit projected on Day 12'
    },
    {
      id: 'medium_risk',
      label: 'Payment Pressure',
      subtitle: 'Growth B2B SaaS',
      badgeText: 'Moderate Risk',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      activeRing: 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20',
      headline: 'Disbursements squeeze safe operating buffer',
      breachDetail: 'Tight buffer around Day 16'
    },
    {
      id: 'healthy_safe',
      label: 'Safe Cushion',
      subtitle: 'Profitable E-Commerce',
      badgeText: 'Resilient Surplus',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      icon: ShieldCheck,
      iconColor: 'text-emerald-600',
      activeRing: 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/20',
      headline: 'Positive cash velocity + predictable inflows',
      breachDetail: 'Zero deficit days across 30d'
    }
  ];

  return (
    <div className="mb-6 rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-xs font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-900 text-white">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            Interactive profiles
          </span>
          <h3 className="text-sm font-semibold text-slate-800 tracking-tight">
            Switch business profiles to see how cash risk reacts
          </h3>
        </div>
        <span className="text-xs text-slate-500 font-normal">
          Real-time updates to cash position, 30-day forecast, and safety score
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {scenarios.map((sc) => {
          const Icon = sc.icon;
          const isActive = currentDatasetKey === sc.id;

          return (
            <button
              key={sc.id}
              onClick={() => setDatasetKey(sc.id)}
              className={`text-left p-3.5 rounded-xl border transition-all relative btn-interactive ${
                isActive
                  ? `${sc.activeRing} shadow-sm`
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white shadow-2xs' : 'bg-slate-100'}`}>
                    <Icon className={`w-4 h-4 ${sc.iconColor}`} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{sc.label}</div>
                    <div className="text-xs text-slate-500">{sc.subtitle}</div>
                  </div>
                </div>

                <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${sc.badgeColor}`}>
                  {sc.badgeText}
                </span>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1">
                <p className="text-sm text-slate-700 leading-snug">
                  {sc.headline}
                </p>
                <div className="text-xs text-slate-500 flex items-center justify-between pt-0.5">
                  <span>{sc.breachDetail}</span>
                  {isActive && <span className="font-semibold text-emerald-700 flex items-center gap-1">● Active</span>}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
