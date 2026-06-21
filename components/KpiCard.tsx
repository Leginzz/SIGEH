import React from 'react';

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'cyan' | 'orange';
  trend?: { value: string; positive: boolean };
}

const colorMap: Record<string, { bg: string; text: string; border: string }> = {
  blue: { bg: 'bg-blue-500/20', text: 'text-blue-400', border: 'border-blue-500/30' },
  green: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  red: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  yellow: { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  purple: { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30' },
  cyan: { bg: 'bg-cyan-500/20', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  orange: { bg: 'bg-orange-500/20', text: 'text-orange-400', border: 'border-orange-500/30' },
};

const KpiCard: React.FC<KpiCardProps> = ({ title, value, subtitle, icon, color, trend }) => {
  const c = colorMap[color];
  return (
    <div className={`bg-slate-800/50 border ${c.border} rounded-xl p-4 flex flex-col justify-between min-h-[120px]`}>
      <div className="flex items-start justify-between">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{title}</p>
        <div className={`${c.bg} p-2 rounded-lg`}>
          <div className={`w-5 h-5 ${c.text}`}>{icon}</div>
        </div>
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold text-white">{value}</p>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
        {trend && (
          <p className={`text-xs font-semibold mt-1 ${trend.positive ? 'text-green-400' : 'text-red-400'}`}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </p>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
