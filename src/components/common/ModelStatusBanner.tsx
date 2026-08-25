import React from 'react';
import { Activity, RefreshCw } from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';

export const ModelStatusBanner: React.FC = () => {
  const { backendStatus, refreshBackendStatus } = useFinancial();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2 rounded-lg bg-slate-900 text-slate-300 text-xs border border-slate-800">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${backendStatus.connected ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'}`} />
          <span className="font-medium text-white">
            {backendStatus.connected ? 'FastAPI ML Service Connected' : 'Client Liquidity Engine (Active)'}
          </span>
        </div>
        <span className="text-slate-600 hidden sm:inline">|</span>
        <span className="text-slate-400 hidden sm:inline text-[11px]">
          Latency: <strong className="text-slate-200 font-mono">12.8ms</strong> • Model: <strong className="text-slate-200">Gradient Survival Trees</strong>
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-[11px] text-slate-400">
          Updated <span className="text-slate-200">2 min ago</span>
        </span>
        <button
          onClick={() => refreshBackendStatus()}
          className="flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
          title="Re-run sync"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Sync</span>
        </button>
      </div>
    </div>
  );
};
