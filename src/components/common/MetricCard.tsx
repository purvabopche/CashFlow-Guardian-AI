import React from 'react';
import { TrendingUp, TrendingDown, HelpCircle, LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  change?: {
    value: number;
    isPositiveGood?: boolean;
    period?: string;
  };
  icon?: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  tooltip?: string;
  badge?: React.ReactNode;
  variant?: 'default' | 'highlight' | 'danger' | 'accent';
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subValue,
  change,
  icon: Icon,
  iconBg = 'bg-slate-100',
  iconColor = 'text-slate-700',
  tooltip,
  badge,
  variant = 'default',
  onClick
}) => {
  let borderClasses = 'border-slate-200/80 hover:border-slate-300';
  let bgClasses = 'bg-white';

  if (variant === 'highlight') {
    borderClasses = 'border-emerald-200/90 shadow-fintech-glow/20 ring-1 ring-emerald-500/10';
    bgClasses = 'bg-gradient-to-br from-white via-white to-emerald-50/30';
  } else if (variant === 'danger') {
    borderClasses = 'border-rose-200/90 shadow-fintech-danger/20 ring-1 ring-rose-500/10';
    bgClasses = 'bg-gradient-to-br from-white via-white to-rose-50/30';
  } else if (variant === 'accent') {
    borderClasses = 'border-blue-200/90';
    bgClasses = 'bg-gradient-to-br from-white via-white to-blue-50/30';
  }

  const isPositiveChange = change && change.value >= 0;
  const isGood = change ? (change.isPositiveGood !== false ? isPositiveChange : !isPositiveChange) : true;

  return (
    <div
      onClick={onClick}
      className={`rounded-2xl border p-5 shadow-sm transition-all duration-300 hover:shadow-md ${bgClasses} ${borderClasses} ${onClick ? 'cursor-pointer hover:-translate-y-0.5' : ''}`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
          {tooltip && (
            <div className="group relative">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 transition-colors cursor-help" />
              <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 rounded-lg bg-slate-900 px-2.5 py-1.5 text-center text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 z-30">
                {tooltip}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
              </div>
            </div>
          )}
        </div>
        {badge ? (
          badge
        ) : Icon ? (
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg} ${iconColor} transition-transform group-hover:scale-105`}>
            <Icon className="w-5 h-5" />
          </div>
        ) : null}
      </div>

      <div className="space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">{value}</span>
        </div>
        {subValue && <p className="text-xs text-slate-500">{subValue}</p>}
      </div>

      {change && (
        <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-slate-100 text-xs font-medium">
          <span className={`inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 font-semibold ${isGood ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
            {isPositiveChange ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {isPositiveChange ? `+${change.value}%` : `${change.value}%`}
          </span>
          <span className="text-slate-400">{change.period || 'vs last month'}</span>
        </div>
      )}
    </div>
  );
};
