import React from 'react';
import type { ActivityItem } from '../hooks/useDashboardStats';
import { SparklesIcon } from './icons/Icons';

interface RecentActivityProps {
  activities: ActivityItem[];
}

const typeConfig: Record<string, { dot: string; label: string }> = {
  checkin: { dot: 'bg-emerald-500', label: 'Entrada' },
  checkout: { dot: 'bg-red-500', label: 'Salida' },
  income: { dot: 'bg-emerald-500', label: 'Ingreso' },
  expense: { dot: 'bg-red-500', label: 'Gasto' },
  report: { dot: 'bg-indigo-500', label: 'Corte' },
};

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <SparklesIcon className="w-10 h-10 text-gray-300 mb-2" />
        <p className="text-sm text-gray-500">No hay actividad reciente</p>
        <p className="text-xs text-gray-400 mt-1">Los movimientos del día aparecerán aquí.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((act, i) => {
        const cfg = typeConfig[act.type] || { dot: 'bg-gray-400', label: act.type };
        return (
          <div key={i} className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
            <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
            <span className="text-xs font-medium text-gray-500 w-14 shrink-0">{cfg.label}</span>
            {act.room && <span className="text-sm font-semibold text-gray-700 w-10 shrink-0">{act.room}</span>}
            <span className="flex-1 text-sm text-gray-600 truncate min-w-0">
              {act.guest && <span className="font-medium text-gray-800">{act.guest}</span>}
              {act.guest && ' — '}
              {act.action}
            </span>
            <span className="text-xs text-gray-400 shrink-0">{act.time}</span>
          </div>
        );
      })}
    </div>
  );
};

export default RecentActivity;
