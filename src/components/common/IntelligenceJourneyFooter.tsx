import React from 'react';
import { ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';

interface IntelligenceJourneyFooterProps {
  currentPage: 'dashboard' | 'forecast' | 'risk' | 'insights' | 'simulator';
}

interface StepInfo {
  id: 'dashboard' | 'forecast' | 'risk' | 'insights' | 'simulator';
  stepNumber: number;
  label: string;
  shortDesc: string;
}

const JOURNEY_STEPS: StepInfo[] = [
  { id: 'dashboard', stepNumber: 1, label: 'Dashboard', shortDesc: 'Executive Position' },
  { id: 'forecast', stepNumber: 2, label: 'Forecast', shortDesc: '30-Day Timeline' },
  { id: 'risk', stepNumber: 3, label: 'Risk Analysis', shortDesc: 'ML Attribution' },
  { id: 'insights', stepNumber: 4, label: 'Prescriptive Actions', shortDesc: 'Rule Remedies' },
  { id: 'simulator', stepNumber: 5, label: 'Simulator', shortDesc: 'Outcome Testing' },
];

export const IntelligenceJourneyFooter: React.FC<IntelligenceJourneyFooterProps> = ({ currentPage }) => {
  const { setActivePage } = useFinancial();

  const currentIndex = JOURNEY_STEPS.findIndex(s => s.id === currentPage);
  const currentStep = JOURNEY_STEPS[currentIndex];
  const nextStep = currentIndex < JOURNEY_STEPS.length - 1 ? JOURNEY_STEPS[currentIndex + 1] : null;
  const isFinalStep = currentPage === 'simulator';

  const handleNavigate = (page: 'dashboard' | 'forecast' | 'risk' | 'insights' | 'simulator') => {
    setActivePage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="mt-8 rounded-2xl bg-white border border-slate-200/90 p-4 sm:p-5 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Journey Progress Indicator */}
        <div className="space-y-2 font-sans">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Step {currentStep.stepNumber} of 5
            </span>
            <span className="text-sm font-medium text-slate-800">
              {currentStep.label} — {currentStep.shortDesc}
            </span>
          </div>

          {/* Stepper Dots */}
          <div className="flex items-center gap-1.5 pt-0.5">
            {JOURNEY_STEPS.map((step, idx) => {
              const isPast = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={step.id}
                  onClick={() => handleNavigate(step.id)}
                  title={`Go to ${step.label}`}
                  className={`flex items-center gap-1 text-xs font-medium transition-all rounded-md px-2.5 py-1 ${
                    isCurrent
                      ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                      : isPast
                      ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {isPast && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />}
                  <span>{step.stepNumber}. {step.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Next Step CTA */}
        <div className="flex items-center gap-2.5 font-sans">
          {isFinalStep ? (
            <button
              onClick={() => handleNavigate('dashboard')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold transition-all shadow-sm active:scale-95 btn-interactive"
            >
              <RotateCcw className="w-4 h-4 text-emerald-400" />
              <span>Return to dashboard</span>
            </button>
          ) : nextStep ? (
            <button
              onClick={() => handleNavigate(nextStep.id)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all shadow-sm active:scale-95 btn-interactive"
            >
              <span>Continue to {nextStep.label} →</span>
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
