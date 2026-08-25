import React, { useState } from 'react';
import { X, FileText, Download, Check, Copy, Shield, FileSpreadsheet } from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';

export const ExportReportModal: React.FC = () => {
  const { isExportModalOpen, setIsExportModalOpen, summary, forecast, riskPrediction, dataset, showToast } = useFinancial();
  const [copiedSummary, setCopiedSummary] = useState(false);

  if (!isExportModalOpen) return null;

  const executiveBrief = `CASHFLOW GUARDIAN AI - EXECUTIVE LIQUIDITY BRIEF
==================================================
Entity: ${dataset.name}
Industry: ${dataset.industry}
Report Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}

1. LIQUIDITY & HEALTH POSITION
--------------------------------------------------
- Current Available Liquidity: $${summary.currentBalance.toLocaleString()}
- Configured Safe Cash Buffer: $${summary.safeBufferThreshold.toLocaleString()}
- Cash Health Index: ${summary.cashHealthScore}/100 (${summary.cashHealthScore >= 70 ? 'Resilient' : summary.cashHealthScore >= 40 ? 'Cautious' : 'Vulnerable'})
- Estimated Operating Runway: ${summary.runwayDays} Days
- Monthly Baseline Inflow: $${summary.monthlyInflow.toLocaleString()}
- Monthly Baseline Outflow: $${summary.monthlyOutflow.toLocaleString()}

2. PREDICTIVE SHORTAGE RISK
--------------------------------------------------
- Shortage Probability: ${riskPrediction.riskProbability}% (${riskPrediction.riskLevel.toUpperCase()} RISK)
- Predicted Shortage Window: ${riskPrediction.predictedShortageWindow}
- Model Confidence Score: ${riskPrediction.confidenceScore}%
- Lowest Projected Balance Point: $${forecast.lowestProjectedPoint.toLocaleString()}
- Forecasted Days Below Buffer: ${forecast.daysBelowThresholdCount} Days

3. TOP EXPLAINABLE RISK DRIVERS
--------------------------------------------------
${riskPrediction.explainability.map((f, i) => `${i + 1}. ${f.name} (Impact: ${f.impactPercent}%) - ${f.description}`).join('\n')}

==================================================
Generated via CashFlow Guardian AI Engine`;

  const handleDownloadCSV = () => {
    const headers = ['Date', 'Day Index', 'Projected Balance ($)', 'Predicted Inflow ($)', 'Predicted Outflow ($)', 'Net Flow ($)', 'Risk Level', 'Below Safe Buffer'];
    const rows = forecast.forecastDays.map(d => [
      d.date,
      d.dayIndex,
      d.projectedBalance,
      d.predictedInflow,
      d.predictedOutflow,
      d.netChange,
      d.riskLevel,
      d.isBelowThreshold ? 'YES' : 'NO'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CashFlow_Guardian_Forecast_${dataset.id}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Forecast CSV exported successfully!');
    setIsExportModalOpen(false);
  };

  const handleCopyBrief = () => {
    navigator.clipboard.writeText(executiveBrief);
    setCopiedSummary(true);
    showToast('Executive Briefing copied to clipboard!');
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Export Financial Intelligence Report</h3>
              <p className="text-xs text-slate-500">Board-ready executive briefing and CSV time-series data</p>
            </div>
          </div>
          <button
            onClick={() => setIsExportModalOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Options */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-emerald-50/40 hover:border-emerald-300 text-left transition-all group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">Download CSV Forecast</div>
              <div className="text-[11px] text-slate-500">{forecast.forecastDays.length}-Day Daily Ledger data</div>
            </div>
          </button>

          <button
            onClick={handleCopyBrief}
            className="flex items-center gap-3 p-4 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-blue-50/40 hover:border-blue-300 text-left transition-all group"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700 group-hover:scale-105 transition-transform">
              {copiedSummary ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-900">{copiedSummary ? 'Copied Brief!' : 'Copy Executive Brief'}</div>
              <div className="text-[11px] text-slate-500">Formatted for email / board review</div>
            </div>
          </button>
        </div>

        {/* Executive summary preview box */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-slate-700">Executive Brief Preview:</span>
            <span className="text-[11px] text-slate-400 font-mono">{dataset.name}</span>
          </div>
          <pre className="h-44 overflow-y-auto rounded-xl border border-slate-200 bg-slate-900 p-3 text-[11px] font-mono text-emerald-400 leading-relaxed custom-scrollbar">
            {executiveBrief}
          </pre>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={() => setIsExportModalOpen(false)}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
