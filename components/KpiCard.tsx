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
  blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
  green: { bg: 'bg-green-100', text: 'text-green-600' },
  red: { bg: 'bg-red-100', text: 'text-red-600' },
  yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
  cyan: { bg: 'bg-cyan-100', text: 'text-cyan-600' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
};

const KpiCard: React.FC<KpiCardProps> = ({ title, value, subtitle, icon, color, trend }) => {
  const c = colorMap[color];
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col justify-between min-h-[110px]">
      <div className="flex items-start justify-between">
        <p className="text-gray-500 text-xs font-medium uppercase tracking-wider">{title}</p>
        <div className={`${c.bg} p-2 rounded-lg`}>
          <div className={`w-5 h-5 ${c.text}`}>{icon}</div>
        </div>
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        {trend && (
          <p className={`text-xs font-semibold mt-1 ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </p>
        )}
      </div>
    </div>
  );
};

export default KpiCard;
