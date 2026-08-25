import React from 'react';
import { RiskLevel, PriorityLevel } from '../../types/financial';

interface StatusBadgeProps {
  level: RiskLevel | PriorityLevel | 'Safe' | 'Pending' | 'Paid' | 'Overdue';
  size?: 'sm' | 'md' | 'lg';
  variant?: 'risk' | 'status' | 'pill';
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  level,
  size = 'md',
  showDot = true,
}) => {
  let colorClasses = 'bg-slate-100 text-slate-700 border-slate-200';
  let dotColor = 'bg-slate-500';

  const normalized = level.toLowerCase();

  if (normalized === 'low' || normalized === 'safe' || normalized === 'paid') {
    colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
    dotColor = 'bg-emerald-500';
  } else if (normalized === 'medium' || normalized === 'pending') {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200/80';
    dotColor = 'bg-amber-500';
  } else if (normalized === 'high' || normalized === 'critical' || normalized === 'overdue') {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200/80';
    dotColor = 'bg-rose-500 animate-pulse';
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-medium',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3.5 py-1.5 text-sm font-semibold'
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm transition-all duration-200 ${colorClasses} ${sizeClasses}`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      <span className="capitalize">{level}</span>
    </span>
  );
};
