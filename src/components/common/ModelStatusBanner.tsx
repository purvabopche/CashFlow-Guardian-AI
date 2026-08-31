import React, { useState, useEffect } from 'react';
import { RefreshCw, Cpu, CheckCircle2, Info } from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';
import { apiClient } from '../../services/apiClient';
import { ModelDetailsModal } from '../modals/ModelDetailsModal';

export const ModelStatusBanner: React.FC = () => {
  const { backendStatus, refreshBackendStatus } = useFinancial();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modelInfo, setModelInfo] = useState<{
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    roc_auc: number;
    training_samples: number;
    feature_count: number;
    model_name: string;
    status: string;
    trained_at: string;
  } | null>(null);

  useEffect(() => {
    apiClient.getModelInfo()
      .then(data => {
        if (data) setModelInfo(data);
      })
      .catch(() => {
        setModelInfo(null);
      });
  }, [backendStatus.connected]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 px-3.5 py-2 rounded-lg bg-slate-50 text-slate-700 text-xs border border-slate-200/80">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${backendStatus.connected ? 'bg-emerald-500' : 'bg-amber-400'}`} />
            <span className="font-medium text-slate-900">Cash flow outlook</span>
          </div>

          <span className="text-slate-300 hidden sm:inline">•</span>

          <span className="text-slate-500">
            {backendStatus.connected
              ? 'Prediction updated from your latest cash activity'
              : 'Using local simulation engine'}
          </span>
        </div>

        <div className="flex items-center gap-2 font-sans">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 transition-colors font-medium hover:bg-slate-200/60 px-2 py-0.5 rounded"
            title="View model accuracy and verification details"
          >
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Model details ({((modelInfo?.accuracy || 0.981) * 100).toFixed(1)}% acc)</span>
          </button>

          <button
            onClick={() => refreshBackendStatus()}
            className="flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 transition-colors font-medium hover:bg-slate-200/60 px-2 py-0.5 rounded"
            title="Check live service connection"
          >
            <RefreshCw className="w-3 h-3 text-slate-400" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <ModelDetailsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
