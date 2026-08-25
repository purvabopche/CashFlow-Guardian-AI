import React from 'react';
import { ShieldAlert, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';

export const Footer: React.FC = () => {
  const { setActivePage } = useFinancial();

  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand & Mission */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-emerald-400">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <span className="font-bold text-slate-900 tracking-tight text-sm">
                CashFlow <span className="text-emerald-600">Guardian</span> AI
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Predicting small and medium business cash shortages before they become insolvency crises through explainable AI and dynamic scenario modeling.
            </p>
            <div className="pt-1 flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                FastAPI & ML Ready
              </span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Application</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button onClick={() => setActivePage('dashboard')} className="hover:text-emerald-600 transition-colors">
                  Financial Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('forecast')} className="hover:text-emerald-600 transition-colors">
                  Cash Flow Forecast
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('risk')} className="hover:text-emerald-600 transition-colors">
                  Shortage Risk (ML & XAI)
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('simulator')} className="hover:text-emerald-600 transition-colors">
                  What-If Scenario Simulator
                </button>
              </li>
              <li>
                <button onClick={() => setActivePage('insights')} className="hover:text-emerald-600 transition-colors">
                  AI Actionable Recommendations
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Architecture & Tech */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Architecture</h4>
            <ul className="space-y-1.5 text-xs text-slate-500">
              <li>• Frontend: React 18, TypeScript, Tailwind</li>
              <li>• Visualizations: Recharts Time-Series</li>
              <li>• Backend: Python FastAPI & Pydantic v2</li>
              <li>• ML Pipeline: Cash Survival Classifier</li>
              <li>• Explainability: SHAP Feature Attributions</li>
            </ul>
          </div>

          {/* Col 4: Repository & Resources */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Open Source & Git</h4>
            <p className="text-xs text-slate-500">
              View the open codebase, inspect the ML inference endpoints, and run local benchmarks.
            </p>
            <a
              href="https://github.com/purvabopche/CashFlow-Guardian-AI"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-900 transition-colors"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
              <span>GitHub Repository</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} CashFlow Guardian AI. Developed for SME Financial Health & Resilience.
          </div>
          <div className="flex items-center gap-4">
            <span>Model Transparency: Calibrated Heuristic & ML Stubs</span>
            <span>•</span>
            <span>Security: Plaid Bank Encryption Compatible</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
