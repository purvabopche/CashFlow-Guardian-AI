import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  subValue?: string;
  change?: {
    value: number;
    isPositiveGood?: boolean;
    period?: string;
  };
  icon?: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  variant?: 'default' | 'highlight' | 'danger' | 'accent';
  badge?: React.ReactNode;
  tooltip?: string;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subValue,
  change,
  icon: Icon,
  variant = 'default',
  badge,
  className = ''
}) => {
  return (
    <div
      className={`rounded-xl border bg-white p-5 transition-all duration-150 shadow-2xs ${
        variant === 'danger'
          ? 'border-rose-200 bg-rose-50/20'
          : variant === 'highlight'
          ? 'border-emerald-200 bg-emerald-50/10'
          : 'border-slate-200/90 hover:border-slate-300'
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2 font-sans">
        <span className="text-xs font-semibold text-slate-500 tracking-normal">
          {title}
        </span>
        {badge ? (
          badge
        ) : Icon ? (
          <div className="p-1 rounded-md bg-slate-100/80 text-slate-500 border border-slate-200/50">
            <Icon className="w-3.5 h-3.5" />
          </div>
        ) : null}
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <div className="text-2xl sm:text-[26px] font-bold tracking-tight text-slate-900 font-mono tabular-nums">
          {value}
        </div>

        {change && (
          <span
            className={`text-xs font-semibold font-mono tabular-nums ${
              change.value >= 0
                ? change.isPositiveGood !== false
                  ? 'text-emerald-700'
                  : 'text-rose-600'
                : change.isPositiveGood !== false
                ? 'text-rose-600'
                : 'text-emerald-700'
            }`}
          >
            {change.value >= 0 ? '+' : ''}
            {change.value}%
          </span>
        )}
      </div>

      {subValue && (
        <div className="mt-1.5 text-xs text-slate-500 truncate font-sans">
          {subValue}
        </div>
      )}
    </div>
  );
};
