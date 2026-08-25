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
      className={`rounded-lg border bg-white p-4 transition-all duration-150 ${
        variant === 'danger'
          ? 'border-rose-200 bg-rose-50/20'
          : variant === 'highlight'
          ? 'border-emerald-200 bg-emerald-50/10'
          : 'border-slate-200/90 hover:border-slate-300'
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {title}
        </span>
        {badge ? (
          badge
        ) : Icon ? (
          <Icon className="w-4 h-4 text-slate-400" />
        ) : null}
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-2">
        <div className="text-xl font-semibold tracking-tight text-slate-900 font-mono">
          {value}
        </div>

        {change && (
          <span
            className={`text-xs font-medium font-mono ${
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
        <div className="mt-1 text-xs text-slate-500 truncate">
          {subValue}
        </div>
      )}
    </div>
  );
};
