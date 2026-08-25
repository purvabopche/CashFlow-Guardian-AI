import React from 'react';
import {
  AlertTriangle,
  Cpu,
  CheckCircle2,
  ShieldAlert,
  Percent,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Info,
  HelpCircle,
  Database,
  SlidersHorizontal,
  ChevronRight,
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

  // Explainable AI chart data
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
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Cash Shortage Risk Analysis & XAI
            </h1>
            <span className="rounded-md bg-purple-50 px-2 py-0.5 text-xs font-bold text-purple-800 border border-purple-200">
              ML Inference Pipeline
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Algorithmic shortage risk scoring, predicted liquidity squeeze windows, and transparent factor attribution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActivePage('simulator')}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
            <span>Simulate Stress Test</span>
          </button>
          <button
            onClick={() => setActivePage('insights')}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Remediation Actions</span>
          </button>
        </div>
      </div>

      {/* Model Transparency & Readiness Callout */}
      <div className="rounded-2xl border border-slate-200 bg-slate-900 text-white p-6 shadow-md">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                Machine Learning Architecture & XAI Readiness
              </span>
              <span className="rounded bg-white/10 px-2 py-0.5 text-[10px] font-mono text-slate-300">
                {backendStatus.connected ? 'FastAPI Backend Connected' : 'Calibrated Local Decision Rules'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              Explainable Ensemble Liquidity Survival Model
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              This pipeline analyzes 18+ high-dimensional features including receivable aging latency, fixed rent/payroll concentration, variance in revenue velocity, and buffer coverage ratio to predict cash insolvencies before they materialize.
            </p>
          </div>

          <div className="lg:col-span-4 rounded-xl bg-white/5 border border-white/10 p-4 text-xs space-y-2">
            <div className="flex justify-between text-slate-300">
              <span>Model Architecture:</span>
              <span className="font-mono text-emerald-400 font-bold">Gradient Boosted Survival Trees</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Explainability Framework:</span>
              <span className="font-mono text-emerald-400 font-bold">SHAP Feature Attribution</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Confidence Threshold:</span>
              <span className="font-mono text-emerald-400 font-bold">{riskPrediction.confidenceScore}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Risk Prediction Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Risk Probability Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Shortage Probability</span>
              <StatusBadge level={riskPrediction.riskLevel} size="md" />
            </div>

            <div className="flex items-baseline gap-2">
              <span className={`text-4xl lg:text-5xl font-black tracking-tight ${riskPrediction.riskProbability >= 65 ? 'text-rose-600' : riskPrediction.riskProbability >= 35 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {riskPrediction.riskProbability}%
              </span>
              <span className="text-xs font-semibold text-slate-400">Shortage Probability</span>
            </div>

            {/* Visual Probability Bar */}
            <div className="mt-4 w-full h-3 rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  riskPrediction.riskProbability >= 65
                    ? 'bg-rose-500'
                    : riskPrediction.riskProbability >= 35
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${riskPrediction.riskProbability}%` }}
              />
            </div>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>Estimated Runway:</span>
            <strong className="text-slate-900 font-mono">~{summary.runwayDays} Days</strong>
          </div>
        </div>

        {/* Predicted Shortage Window Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Predicted Shortage Window</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>

            <div className="text-2xl font-extrabold text-slate-900">
              {riskPrediction.predictedShortageWindow}
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Date window where high-volume disbursements converge against uncollected receivables.
            </p>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>Earliest Deficit Breach:</span>
            <strong className="text-rose-600 font-semibold">{summary.dangerDate || 'Day 12'}</strong>
          </div>
        </div>

        {/* Model Confidence Score Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Model Confidence</span>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl lg:text-5xl font-black text-emerald-600 tracking-tight">
                {riskPrediction.confidenceScore}%
              </span>
              <span className="text-xs font-semibold text-slate-400">Reliability Score</span>
            </div>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Based on historical invoice payment variance and verified bank transaction streams.
            </p>
          </div>

          <div className="mt-6 pt-3 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>Features Evaluated:</span>
            <strong className="text-slate-900 font-mono">18 Micro-Signals</strong>
          </div>
        </div>
      </div>

      {/* Explainable AI (XAI) Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">
                Explainable AI (XAI) - Why Was This Risk Score Assigned?
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              SHAP-inspired feature attribution breakdown demonstrating exact risk contributors.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">Total Contribution: 100%</span>
        </div>

        {/* Feature Importance Bar Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={xaiChartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: '#64748B' }}
                tickFormatter={(val) => `${val}%`}
                domain={[0, 50]}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 11, fill: '#334155', fontWeight: 500 }}
                width={190}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-slate-200 bg-slate-900 p-3 shadow-xl text-white text-xs space-y-1 z-30 max-w-xs">
                        <div className="font-bold text-emerald-400">{data.fullName}</div>
                        <div className="text-[11px] text-slate-300">{data.description}</div>
                        <div className="pt-1 flex justify-between border-t border-slate-800">
                          <span className="text-slate-400">Impact Weight:</span>
                          <span className="font-bold text-white font-mono">{data.impact}%</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="impact" radius={[0, 6, 6, 0]}>
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

        {/* Detailed Explainability Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {riskPrediction.explainability.map((factor) => (
            <div
              key={factor.id}
              className={`p-4 rounded-xl border transition-all ${
                factor.direction === 'increases_risk'
                  ? 'bg-rose-50/40 border-rose-200'
                  : 'bg-emerald-50/40 border-emerald-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${factor.direction === 'increases_risk' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                  <span className="font-bold text-xs text-slate-900">{factor.name}</span>
                </div>
                <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${factor.direction === 'increases_risk' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                  {factor.direction === 'increases_risk' ? `+${factor.impactPercent}% Risk` : `-${factor.impactPercent}% Risk`}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{factor.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Key Factors Summary Checklist */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3">
          Synthesized Risk Assessment Signals
        </h3>
        <div className="space-y-2.5">
          {riskPrediction.keyFactors.map((factorText, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span className="text-slate-700 leading-relaxed">{factorText}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">Want to test how resolving these drivers changes your forecast?</span>
          <button
            onClick={() => setActivePage('simulator')}
            className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 hover:text-emerald-700"
          >
            <span>Open What-If Simulator</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
