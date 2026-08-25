import React from 'react';
import {
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  SlidersHorizontal,
  Sparkles,
  CheckCircle2,
  Lock,
  Layers,
  ChevronRight,
  BarChart3,
  Calendar,
  Zap,
  ArrowUpRight,
  Cpu,
  Clock
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';

export const LandingPage: React.FC = () => {
  const { setActivePage, summary, riskPrediction, dataset } = useFinancial();

  return (
    <div className="space-y-24 pb-20 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-50/60 via-slate-50/20 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-3.5 py-1 text-xs font-bold text-emerald-800 shadow-sm animate-fade-in">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Next-Gen Cash Intelligence for Growing Businesses</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
                Predict cash shortages{' '}
                <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 bg-clip-text text-transparent">
                  before they become
                </span>{' '}
                business problems.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                CashFlow Guardian AI analyzes your live cash inflows, recurring expenses, invoice collection velocity, and upcoming vendor liabilities to pinpoint cash deficit windows up to 60 days in advance.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <button
                  onClick={() => setActivePage('dashboard')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-7 py-3.5 text-sm font-bold shadow-lg shadow-slate-900/20 hover:shadow-xl transition-all duration-200 active:scale-95"
                >
                  <span>Analyze My Cash Flow</span>
                  <ArrowRight className="w-4 h-4 text-emerald-400" />
                </button>

                <button
                  onClick={() => setActivePage('simulator')}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-6 py-3.5 text-sm font-bold shadow-sm transition-all duration-200"
                >
                  <span>View Demo & Simulator</span>
                  <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <div className="text-2xl font-black text-slate-900">14–60d</div>
                  <div className="text-xs text-slate-500 font-medium">Early Warning Window</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-emerald-600">89.4%</div>
                  <div className="text-xs text-slate-500 font-medium">Model Confidence</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">0 min</div>
                  <div className="text-xs text-slate-500 font-medium">Setup Time (API/Plaid)</div>
                </div>
              </div>
            </div>

            {/* Hero Right Visual: Live Interactive AI Card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl border border-slate-200/90 bg-white p-6 shadow-2xl shadow-slate-200/60 ring-1 ring-slate-100">
                {/* Floating alert chip */}
                <div className="absolute -top-4 -right-2 sm:right-6 flex items-center gap-2 rounded-full bg-rose-600 text-white px-3.5 py-1.5 text-xs font-bold shadow-lg animate-bounce">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Predicted Deficit: Day 16</span>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Live AI Diagnostic</span>
                  </div>
                  <span className="text-xs font-mono font-medium text-slate-400">{dataset.name.split(' ')[0]}</span>
                </div>

                {/* Score & Risk Snapshot */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase">Cash Health</span>
                    <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{summary.cashHealthScore}/100</div>
                    <span className="inline-block mt-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                      Good Resilience
                    </span>
                  </div>

                  <div className="rounded-2xl bg-rose-50/70 p-4 border border-rose-100">
                    <span className="text-[11px] font-semibold text-rose-700 uppercase">Shortage Risk</span>
                    <div className="text-2xl font-extrabold text-rose-600 mt-0.5">{riskPrediction.riskProbability}%</div>
                    <span className="inline-block mt-1 text-[11px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                      {riskPrediction.predictedShortageWindow.split(' ')[0]} {riskPrediction.predictedShortageWindow.split(' ')[1]}
                    </span>
                  </div>
                </div>

                {/* Explainable AI snippet */}
                <div className="mt-4 rounded-2xl bg-slate-900 text-white p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold flex items-center gap-1.5 text-emerald-400">
                      <Cpu className="w-3.5 h-3.5" /> Explainable Driver
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">+34% Risk Weight</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    $18,500 overdue enterprise invoice lag collides with non-deferrable $24,000 payroll scheduled on Day 15.
                  </p>
                </div>

                {/* Action CTA */}
                <button
                  onClick={() => setActivePage('insights')}
                  className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white py-3 text-xs font-bold transition-all shadow-sm active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Execute 1-Click Protective Action</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">The 4-Step Intelligence Loop</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How CashFlow Guardian Protects Your Business
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Unlike backward-looking accounting software that only reports what already happened, CashFlow Guardian AI continually forecasts your liquidity trajectory.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Ingest Financial Flows',
              desc: 'Connects to bank accounts, accounting software, and ERPs to map cash in, operating burn, and payment timing.',
              icon: Layers,
              color: 'text-blue-600 bg-blue-50'
            },
            {
              step: '02',
              title: 'Predict Deficit Windows',
              desc: 'Ensemble ML survival models identify exact date ranges where cash reserves risk falling below safety thresholds.',
              icon: TrendingUp,
              color: 'text-emerald-600 bg-emerald-50'
            },
            {
              step: '03',
              title: 'Explain Why (XAI)',
              desc: 'Provides full SHAP feature transparency so finance leaders understand which invoices or expenses triggered the alert.',
              icon: Cpu,
              color: 'text-purple-600 bg-purple-50'
            },
            {
              step: '04',
              title: 'Simulate & Remediate',
              desc: 'Run interactive what-if scenarios and deploy automated 1-click vendor shifts or invoice collection reminders.',
              icon: Sparkles,
              color: 'text-amber-600 bg-amber-50'
            }
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.step}
                className="relative rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md transition-all group"
              >
                <span className="text-4xl font-black text-slate-100 group-hover:text-emerald-100 transition-colors absolute top-4 right-5">
                  {card.step}
                </span>
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color} mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">{card.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{card.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Feature Comparison Matrix */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-slate-900 text-white p-8 sm:p-12 shadow-2xl">
          <div className="max-w-3xl mb-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Architectural Advantage</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Standard Accounting vs. CashFlow Guardian AI
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase text-[11px]">
                  <th className="py-3 px-4">Capability</th>
                  <th className="py-3 px-4">Traditional Spreadsheets & QuickBooks</th>
                  <th className="py-3 px-4 text-emerald-400 font-extrabold">CashFlow Guardian AI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr>
                  <td className="py-4 px-4 font-semibold text-white">Forecasting Horizon</td>
                  <td className="py-4 px-4 text-slate-400">Static historical P&L (backward-looking)</td>
                  <td className="py-4 px-4 text-emerald-300 font-semibold">30–90 Day ML Predictive Rolling Trajectory</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-white">Shortage Risk Detection</td>
                  <td className="py-4 px-4 text-slate-400">Discovered after bank account is already depleted</td>
                  <td className="py-4 px-4 text-emerald-300 font-semibold">14–28 days advance warning with probability score</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-white">Explainability & Drivers</td>
                  <td className="py-4 px-4 text-slate-400">Manual spreadsheet formula auditing</td>
                  <td className="py-4 px-4 text-emerald-300 font-semibold">SHAP-based Explainable AI feature attribution</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-white">Interactive What-If Simulation</td>
                  <td className="py-4 px-4 text-slate-400">Broken formulas and tedious manual recalculations</td>
                  <td className="py-4 px-4 text-emerald-300 font-semibold">Real-time multi-variable slider engine</td>
                </tr>
                <tr>
                  <td className="py-4 px-4 font-semibold text-white">Actionable Intervention</td>
                  <td className="py-4 px-4 text-slate-400">Manual email writing & guesswork</td>
                  <td className="py-4 px-4 text-emerald-300 font-semibold">1-Click invoice reminders & payment rescheduling</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-slate-900 p-8 sm:p-12 text-white shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Ready to protect your company’s cash runway?
            </h3>
            <p className="text-xs sm:text-sm text-emerald-100">
              Explore live financial projections or run stress tests on our interactive business datasets now.
            </p>
          </div>
          <button
            onClick={() => setActivePage('dashboard')}
            className="shrink-0 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold px-8 py-4 text-sm shadow-xl transition-all hover:scale-105 active:scale-95"
          >
            Launch Financial Dashboard
          </button>
        </div>
      </section>
    </div>
  );
};
