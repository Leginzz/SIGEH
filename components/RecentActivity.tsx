import React from 'react';
import type { ActivityItem } from '../hooks/useDashboardStats';

interface RecentActivityProps {
  activities: ActivityItem[];
}

const typeConfig: Record<string, { bg: string; label: string }> = {
  checkin: { bg: 'bg-green-100 text-green-700', label: 'Entrada' },
  checkout: { bg: 'bg-red-100 text-red-700', label: 'Salida' },
  income: { bg: 'bg-green-100 text-green-700', label: 'Ingreso' },
  expense: { bg: 'bg-red-100 text-red-700', label: 'Gasto' },
  report: { bg: 'bg-indigo-100 text-indigo-700', label: 'Corte' },
};

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  if (activities.length === 0) {
    return (
      <div className="text-center p-6 text-gray-400 text-sm">
        No hay actividad reciente.
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {activities.map((act, i) => {
        const cfg = typeConfig[act.type] || { bg: 'bg-gray-100 text-gray-700', label: act.type };
        return (
          <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${cfg.bg}`}>
              {cfg.label}
            </span>
            {act.room && <span className="text-sm font-bold text-gray-700 w-8">{act.room}</span>}
            {!act.room && <span className="w-8" />}
            <span className="flex-1 text-sm text-gray-600 truncate">
              {act.guest && <span className="font-semibold text-gray-800">{act.guest}</span>}
              {act.guest && ' — '}
              {act.action}
            </span>
            <span className="text-[11px] text-gray-400">{act.time}</span>
          </div>
        );
      })}
    </div>
  );
};

export default RecentActivity;
