'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | null;
  trendValue?: string;
}

export default function StatCard({
  label,
  value,
  subtext,
  icon,
  trend,
  trendValue,
}: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-neutral-600 uppercase font-semibold">{label}</p>
          <p className="text-3xl font-bold text-primary mt-1">{value}</p>
          {subtext && <p className="text-xs text-neutral-600 mt-1">{subtext}</p>}
        </div>
        {icon && <div className="text-secondary opacity-20">{icon}</div>}
      </div>

      {trend && trendValue && (
        <div className="flex items-center gap-1 text-xs">
          {trend === 'up' ? (
            <>
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-green-600 font-semibold">{trendValue}</span>
            </>
          ) : (
            <>
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span className="text-red-600 font-semibold">{trendValue}</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
