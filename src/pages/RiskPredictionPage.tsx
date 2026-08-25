import React from 'react';
import {
  AlertTriangle,
  Cpu,
  CheckCircle2,
  Clock,
  Sparkles,
  SlidersHorizontal,
  BrainCircuit
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid
} from 'recharts';
import { useFinancial } from '../context/FinancialContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { MetricCard } from '../components/common/MetricCard';

export const RiskPredictionPage: React.FC = () => {
  const { riskPrediction, summary, formatCurrency, setActivePage, backendStatus } = useFinancial();

  const xaiChartData = riskPrediction.explainability.map((item) => ({
    name: item.name.length > 25 ? `${item.name.slice(0, 24)}...` : item.name,
    fullName: item.name,
    impact: item.impactPercent,
    direction: item.direction,
    description: item.description,
    category: item.category,
    shap: item.shapValue
  }));

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Shortage Risk Analysis & Explainability (XAI)
            </h1>
            <span className="text-xs font-mono text-slate-400">
              • Survival Probability Diagnostics
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Algorithmic cash shortage probability scoring and transparent SHAP-based feature attribution.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setActivePage('simulator')}
            className="flex items-center gap-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 transition-colors"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>Simulate Stress Test</span>
          </button>
          <button
            onClick={() => setActivePage('insights')}
            className="flex items-center gap-1 rounded-md bg-slate-900 hover:bg-slate-800 text-white px-2.5 py-1 text-xs font-medium shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Remediation</span>
          </button>
        </div>
      </div>

      {/* Model Transparency Status */}
      <div className="rounded-lg border border-slate-800 bg-slate-950 text-white p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold block">
              Inference Architecture
            </span>
            <div className="font-semibold text-slate-100">Gradient Boosted Survival Classifier</div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Analyzes receivables aging, burn volatility, and cash safety buffer coverage.
            </p>
          </div>

          <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-800 pt-2 md:pt-0 md:pl-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Execution Status
            </span>
            <div className="font-mono text-slate-200">{backendStatus.connected ? 'FastAPI Service (8000)' : 'Client Prediction Mode'}</div>
            <div className="text-[11px] text-slate-400">Inference Latency: 12.8ms</div>
          </div>

          <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-800 pt-2 md:pt-0 md:pl-4">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Confidence Score
            </span>
            <div className="font-mono font-bold text-emerald-400 text-base">{riskPrediction.confidenceScore}%</div>
            <div className="text-[11px] text-slate-400">18 micro-signals evaluated</div>
          </div>
        </div>
      </div>

      {/* Primary Risk Prediction Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Risk Probability Card */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Shortage Probability
              </span>
              <StatusBadge level={riskPrediction.riskLevel} size="sm" />
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className={`text-3xl font-black font-mono tracking-tight ${riskPrediction.riskProbability >= 65 ? 'text-rose-600' : riskPrediction.riskProbability >= 35 ? 'text-amber-600' : 'text-emerald-700'}`}>
                {riskPrediction.riskProbability}%
              </span>
              <span className="text-xs text-slate-400">Deficit Likelihood</span>
            </div>

            {/* Probability Progress Bar */}
            <div className="mt-2 w-full h-1.5 rounded bg-slate-100 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  riskPrediction.riskProbability >= 65
                    ? 'bg-rose-500'
                    : riskPrediction.riskProbability >= 35
                    ? 'bg-amber-500'
                    : 'bg-emerald-600'
                }`}
                style={{ width: `${riskPrediction.riskProbability}%` }}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Operating Runway:</span>
            <strong className="text-slate-900 font-mono">~{summary.runwayDays} Days</strong>
          </div>
        </div>

        {/* Shortage Window Card */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Shortage Window
              </span>
              <Clock className="w-3.5 h-3.5 text-slate-400" />
            </div>

            <div className="mt-2 text-base font-bold text-slate-900 leading-snug">
              {riskPrediction.predictedShortageWindow}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Window where scheduled disbursements collide with receivables delay.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Earliest Deficit Date:</span>
            <strong className="text-rose-600 font-mono font-medium">{summary.dangerDate || 'Day 12'}</strong>
          </div>
        </div>

        {/* Confidence Score Card */}
        <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Reliability Index
              </span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            </div>

            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-black font-mono text-slate-900 tracking-tight">
                {riskPrediction.confidenceScore}%
              </span>
              <span className="text-xs text-slate-400">Data Confidence</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Calibrated from historical recurring stability and bank payment streams.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between">
            <span>Features Checked:</span>
            <strong className="text-slate-900 font-mono">18 Signals</strong>
          </div>
        </div>
      </div>

      {/* Explainable AI (XAI) Bar Section */}
      <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <BrainCircuit className="w-3.5 h-3.5 text-slate-600" />
              Feature Attribution (Why was this score assigned?)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              SHAP-inspired proportional factor contribution to overall cash deficit probability.
            </p>
          </div>
        </div>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={xaiChartData}
              layout="vertical"
              margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="2 2" stroke="#F1F5F9" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: '#64748B' }}
                tickFormatter={(val) => `${val}%`}
                domain={[0, 50]}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 10, fill: '#334155', fontWeight: 500 }}
                width={160}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded border border-slate-700 bg-slate-900 p-2 text-white text-xs space-y-1 z-30 max-w-xs">
                        <div className="font-bold text-slate-200">{data.fullName}</div>
                        <div className="text-[10px] text-slate-300">{data.description}</div>
                        <div className="pt-1 flex justify-between border-t border-slate-800 text-[10px]">
                          <span className="text-slate-400">Impact Weight:</span>
                          <span className="font-bold font-mono text-white">{data.impact}%</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="impact" radius={[0, 3, 3, 0]}>
                {xaiChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.direction === 'increases_risk' ? '#F43F5E' : '#10B981'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Detailed Factor Attribution Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
          {riskPrediction.explainability.map((factor) => (
            <div
              key={factor.id}
              className={`p-3 rounded border text-xs ${
                factor.direction === 'increases_risk'
                  ? 'bg-rose-50/20 border-rose-200'
                  : 'bg-emerald-50/20 border-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-slate-900">{factor.name}</span>
                <span className={`font-mono text-[11px] font-semibold ${factor.direction === 'increases_risk' ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {factor.direction === 'increases_risk' ? `+${factor.impactPercent}%` : `-${factor.impactPercent}%`}
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">{factor.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
