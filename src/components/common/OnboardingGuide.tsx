import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  TrendingDown,
  Brain,
  SlidersHorizontal,
  ArrowRight,
  X,
  Sparkles,
  Info
} from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';

interface OnboardingGuideProps {
  onStartJourney?: () => void;
}

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ onStartJourney }) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const { setActivePage } = useFinancial();

  useEffect(() => {
    const isDismissed = localStorage.getItem('cf_guardian_onboarding_dismissed');
    if (!isDismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('cf_guardian_onboarding_dismissed', 'true');
    setIsVisible(false);
  };

  const handleStart = () => {
    handleDismiss();
    if (onStartJourney) {
      onStartJourney();
    } else {
      setActivePage('forecast');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 border border-slate-800 text-white p-5 sm:p-6 shadow-xl relative overflow-hidden animate-fade-in">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 bg-hero-grid opacity-20 pointer-events-none" />

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors z-10"
        title="Dismiss guide"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="relative z-10">
        {/* Header Strip */}
        <div className="flex items-center gap-2 mb-2 font-sans">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/80">
            <Sparkles className="w-3 h-3" />
            Quick product overview
          </span>
          <span className="text-xs text-slate-400 hidden sm:inline">
            Predictive cash flow intelligence
          </span>
        </div>

        <div className="max-w-2xl font-sans">
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
            CashFlow Guardian AI
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
            Spot cash shortages weeks before they happen and test practical ways to protect your runway.
          </p>
        </div>

        {/* 4 Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5 font-sans">
          {/* Step 1 */}
          <div className="p-3.5 rounded-xl bg-slate-850/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>1. Monitor cash position</span>
            </div>
            <p className="text-xs text-slate-300/90 leading-snug">
              Track your real-time balance, daily net burn rate, and your 30-day operating buffer.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 rounded-xl bg-slate-850/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
              <TrendingDown className="w-4 h-4 shrink-0" />
              <span>2. Spot future risk</span>
            </div>
            <p className="text-xs text-slate-300/90 leading-snug">
              Machine learning models estimate the probability of your balance dipping below your safety reserve.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 rounded-xl bg-slate-850/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold">
              <Brain className="w-4 h-4 shrink-0" />
              <span>3. See what drives it</span>
            </div>
            <p className="text-xs text-slate-300/90 leading-snug">
              Diagnostic factor attribution reveals whether risk is driven by delayed receivables or upcoming bills.
            </p>
          </div>

          {/* Step 4 */}
          <div className="p-3.5 rounded-xl bg-slate-850/80 border border-slate-800 space-y-1.5">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-semibold">
              <SlidersHorizontal className="w-4 h-4 shrink-0" />
              <span>4. Test solutions</span>
            </div>
            <p className="text-xs text-slate-300/90 leading-snug">
              Try recommended actions or test what-if levers in the simulator to see your runway extend.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 mt-5 pt-4 border-t border-slate-800/80 flex-wrap font-sans">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Info className="w-3.5 h-3.5 text-slate-500" />
            <span>Switch sample profiles or simulate test payments anytime.</span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleDismiss}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white transition-colors"
            >
              Dismiss
            </button>
            <button
              onClick={handleStart}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-all shadow-sm active:scale-95"
            >
              <span>Start product tour</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
