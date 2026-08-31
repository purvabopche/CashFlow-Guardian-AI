import React from 'react';
import { ShieldAlert, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';

export const Footer: React.FC = () => {
  const { setActivePage } = useFinancial();

  return (
    <footer className="border-t border-slate-200 bg-white text-slate-500 text-xs py-6 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-slate-900 text-emerald-400">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-slate-800 text-xs">
              CashFlow Guardian AI
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500 text-xs font-medium">
              Predictive Liquidity Intelligence
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <button onClick={() => setActivePage('dashboard')} className="hover:text-slate-900 transition-colors font-medium">
              Dashboard
            </button>
            <button onClick={() => setActivePage('transactions')} className="hover:text-slate-900 transition-colors font-medium">
              Transactions
            </button>
            <button onClick={() => setActivePage('forecast')} className="hover:text-slate-900 transition-colors font-medium">
              Forecast
            </button>
            <button onClick={() => setActivePage('simulator')} className="hover:text-slate-900 transition-colors font-medium">
              Simulator
            </button>
            <a
              href="https://github.com/purvabopche/CashFlow-Guardian-AI"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-slate-900 transition-colors font-medium text-slate-700"
            >
              <span>GitHub</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} CashFlow Guardian AI. Developed for SME & Individual Liquidity Intelligence.
          </div>
          <div className="flex items-center gap-2">
            <span>Model Transparency: Calibrated Survival Trees</span>
            <span>•</span>
            <span>Local & FastAPI Connected</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
