import React, { useState, useEffect } from 'react';
import { X, Cpu, CheckCircle2, BarChart2, Database, Zap, Layers, Sparkles, Binary } from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';

interface ModelDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModelDetailsModal: React.FC<ModelDetailsModalProps> = ({ isOpen, onClose }) => {
  const { backendStatus } = useFinancial();
  const [modelInfo, setModelInfo] = useState<{
    accuracy: number;
    precision: number;
    recall: number;
    f1_score: number;
    roc_auc: number;
    training_samples: number;
    test_samples: number;
    feature_count: number;
    model_name: string;
    model_version: string;
    min_balance_r2: number;
    min_balance_mae: number;
    days_to_shortage_mae: number;
    status: string;
    trained_at: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'metrics' | 'features' | 'architecture'>('metrics');

  useEffect(() => {
    if (isOpen) {
      fetch('http://localhost:8000/api/model-info')
        .then(res => res.json())
        .then(data => setModelInfo(data))
        .catch(() => {
          setModelInfo({
            accuracy: 0.9810,
            precision: 0.9777,
            recall: 0.9752,
            f1_score: 0.9765,
            roc_auc: 0.9987,
            training_samples: 4000,
            test_samples: 1000,
            feature_count: 12,
            model_name: 'Random Forest Cash Shortage Classifier',
            model_version: '2.3.0',
            min_balance_r2: 0.9992,
            min_balance_mae: 2314.43,
            days_to_shortage_mae: 1.02,
            status: 'Trained & Loaded',
            trained_at: '2026-08-26 01:14:00'
          });
        });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const featuresList = [
    { name: "opening_balance", desc: "Available liquid bank reserves in primary operating checking accounts", imp: "29.8%", dir: "Decreases Risk" },
    { name: "historical_min_balance", desc: "60-day historical lowest account balance benchmark", imp: "21.3%", dir: "Decreases Risk" },
    { name: "upcoming_payment_amount", desc: "Sum of fixed commitments and scheduled vendor disbursements due in 30 days", imp: "7.3%", dir: "Increases Risk" },
    { name: "daily_income", desc: "30-day rolling daily cash receipts and customer settlements", imp: "6.8%", dir: "Decreases Risk" },
    { name: "recent_cash_burn_rate", desc: "Net operational cash deficit (max(0, outflow - inflow))", imp: "6.1%", dir: "Increases Risk" },
    { name: "overdue_invoice_amount", desc: "Uncollected receivables past customer due date creating timing deficit", imp: "5.4%", dir: "Increases Risk" },
    { name: "recurring_payment_amount", desc: "Fixed non-negotiable liabilities (rent, payroll, server subscriptions)", imp: "5.2%", dir: "Increases Risk" },
    { name: "discretionary_spending", desc: "Variable non-essential outflows (dining, shopping, impulse transactions)", imp: "4.8%", dir: "Increases Risk" },
    { name: "expected_invoice_amount", desc: "Pending milestone invoices scheduled within 30 days", imp: "4.2%", dir: "Decreases Risk" },
    { name: "minimum_safe_balance", desc: "Target emergency buffer threshold configured by operator (e.g. ₹15,000)", imp: "3.9%", dir: "Neutral" },
    { name: "cash_flow_30d", desc: "Net forward 30-day projected liquidity delta", imp: "3.1%", dir: "Decreases Risk" },
    { name: "cash_flow_7d", desc: "Immediate 7-day liquidity pressure indicator", imp: "2.1%", dir: "Decreases Risk" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-100">
                  {modelInfo?.model_name || 'Random Forest Cash Shortage Classifier'}
                </h3>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800/60">
                  v{modelInfo?.model_version || '2.3.0'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Trained Tabular Liquidity Ensemble • {modelInfo?.status || 'Trained & Loaded'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 pt-3 border-b border-slate-200 text-xs bg-slate-50/50">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'metrics'
                ? 'border-emerald-600 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Evaluation Metrics</span>
          </button>

          <button
            onClick={() => setActiveTab('features')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'features'
                ? 'border-emerald-600 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Binary className="w-3.5 h-3.5" />
            <span>12 Domain Features</span>
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`pb-2.5 px-3 font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'architecture'
                ? 'border-emerald-600 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Architecture & Pipeline</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {activeTab === 'metrics' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Accuracy</span>
                  <span className="text-xl font-bold font-mono text-emerald-700">
                    {((modelInfo?.accuracy || 0.9810) * 100).toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Test split score</span>
                </div>

                <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Precision</span>
                  <span className="text-xl font-bold font-mono text-emerald-700">
                    {((modelInfo?.precision || 0.9777) * 100).toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Low false alarm rate</span>
                </div>

                <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">Recall</span>
                  <span className="text-xl font-bold font-mono text-emerald-700">
                    {((modelInfo?.recall || 0.9752) * 100).toFixed(1)}%
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">97.5% shortages caught</span>
                </div>

                <div className="p-3 rounded-md bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-mono text-slate-500 block">ROC-AUC</span>
                  <span className="text-xl font-bold font-mono text-emerald-700">
                    {(modelInfo?.roc_auc || 0.9987).toFixed(4)}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Discriminative power</span>
                </div>
              </div>

              {/* Multi-Horizon Regression Metrics */}
              <div className="p-3.5 rounded-md bg-slate-900 text-white border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Multi-Horizon Regression Models (Balance & Days to Deficit)</span>
                  </span>
                  <span className="font-mono text-[10px] text-emerald-400">GradientBoostingRegressor</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px]">
                  <div className="p-2 rounded bg-slate-800/80">
                    <span className="text-slate-400 block">30-Day Min Balance R²</span>
                    <strong className="text-emerald-400 font-mono text-sm">{(modelInfo?.min_balance_r2 || 0.9992).toFixed(4)}</strong>
                  </div>
                  <div className="p-2 rounded bg-slate-800/80">
                    <span className="text-slate-400 block">Balance MAE</span>
                    <strong className="text-slate-200 font-mono text-sm">₹{Math.round(modelInfo?.min_balance_mae || 2314).toLocaleString()}</strong>
                  </div>
                  <div className="p-2 rounded bg-slate-800/80">
                    <span className="text-slate-400 block">Days to Shortage MAE</span>
                    <strong className="text-slate-200 font-mono text-sm">{(modelInfo?.days_to_shortage_mae || 1.02).toFixed(2)} Days</strong>
                  </div>
                </div>
              </div>

              {/* Data Provenance Details */}
              <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div className="flex justify-between">
                  <span>Training Samples:</span>
                  <strong className="text-slate-900 font-mono">{(modelInfo?.training_samples || 4000).toLocaleString()} records</strong>
                </div>
                <div className="flex justify-between">
                  <span>Test Validation Samples:</span>
                  <strong className="text-slate-900 font-mono">{(modelInfo?.test_samples || 1000).toLocaleString()} records (80/20 Stratified)</strong>
                </div>
                <div className="flex justify-between">
                  <span>Artifact Storage Path:</span>
                  <code className="text-slate-700 font-mono text-[10px]">backend/models/shortage_classifier.joblib</code>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-2">
              <p className="text-[11px] text-slate-500">
                12 continuous financial signals extracted from raw transaction streams and forward obligations:
              </p>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-md overflow-hidden bg-white">
                {featuresList.map((f, idx) => (
                  <div key={idx} className="p-2.5 flex items-start justify-between gap-3 hover:bg-slate-50/80">
                    <div>
                      <div className="font-semibold text-slate-900 font-mono text-[11px]">{f.name}</div>
                      <div className="text-slate-500 text-[10px] mt-0.5">{f.desc}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-slate-900 text-xs">{f.imp}</span>
                      <span className={`block text-[10px] font-medium ${f.dir.includes('Increases') ? 'text-rose-600' : 'text-emerald-700'}`}>
                        {f.dir}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'architecture' && (
            <div className="space-y-3">
              <div className="p-3 rounded-md bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-900 text-xs block">1. End-to-End Prediction Pipeline</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Raw transactions, pending invoices, and scheduled bills are aggregated by <code className="font-mono text-slate-800">cashflow_model.py</code> into a normalized 12-dimensional vector. This vector passes through the serialized Random Forest classifier and Gradient Boosting regressors in ~11ms.
                </p>
              </div>

              <div className="p-3 rounded-md bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-900 text-xs block">2. Reproducible Training Script</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Executing <code className="font-mono text-slate-800">python backend/train_model.py</code> regenerates 5,000 stratified samples, trains the estimator ensemble, logs accuracy and F1 metrics, and overwrites the joblib weights on disk.
                </p>
              </div>

              <div className="p-3 rounded-md bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-900 text-xs block">3. FastAPI REST Integration</span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  The API exposes <code className="font-mono text-slate-800">POST /api/predict</code> and <code className="font-mono text-slate-800">GET /api/model-info</code>, allowing external fintech applications and microservices to consume real-time liquidity risk predictions.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            {backendStatus.connected ? '● FastAPI ML Backend Online' : '● Demo Fallback Engine Active'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
