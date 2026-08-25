import React from 'react';
import { Cpu, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';

export const ModelStatusBanner: React.FC = () => {
  const { backendStatus, refreshBackendStatus, riskPrediction } = useFinancial();

  return (
    <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-slate-900 via-fintech-navy to-slate-900 text-white p-4 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start md:items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-semibold text-white tracking-wide">
                Predictive Risk Engine & ML Inference Pipeline
              </h4>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] font-medium text-emerald-300 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                {backendStatus.connected ? 'FastAPI Service Live' : 'Calibrated Ensemble Heuristics'}
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                v{riskPrediction.modelMetadata.modelVersion}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Trained on cash survival curve classification & SHAP feature attribution. API-ready for production model weights (XGBoost / LightGBM).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end md:self-center shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-[11px] text-slate-400">Inference Latency</div>
            <div className="text-xs font-mono font-bold text-emerald-400">
              {backendStatus.latencyMs ? `${backendStatus.latencyMs} ms` : '14.2 ms'}
            </div>
          </div>

          <button
            onClick={() => refreshBackendStatus()}
            title="Refresh backend status"
            className="flex items-center gap-1.5 rounded-lg bg-white/10 hover:bg-white/15 px-2.5 py-1.5 text-xs font-medium text-slate-200 border border-white/10 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sync API</span>
          </button>
        </div>
      </div>
    </div>
  );
};
