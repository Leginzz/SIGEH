import React from 'react';

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'cyan' | 'orange';
  trend?: { value: string; positive: boolean };
}

const colorMap: Record<string, { bg: string; text: string }> = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
  green: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
  red: { bg: 'bg-red-50', text: 'text-red-600' },
  yellow: { bg: 'bg-amber-50', text: 'text-amber-600' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
  cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600' },
};

const KpiCard: React.FC<KpiCardProps> = ({ title, value, subtitle, icon, color, trend }) => {
  const c = colorMap[color];
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col justify-between min-h-[100px]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
        <div className={`${c.bg} p-1.5 rounded-lg shrink-0`}>
          <div className={`w-4 h-4 ${c.text}`}>{icon}</div>
        </div>
      </div>
      <div className="mt-1.5">
        <p className="text-xl font-bold text-gray-900 leading-tight">{value}</p>
        {subtitle && <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>}
        {trend && (
          <p className={`text-[11px] font-semibold mt-1 ${trend.positive ? 'text-emerald-600' : 'text-red-600'}`}>
            {trend.positive ? '\u2191' : '\u2193'} {trend.value}
          </p>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
