import React from 'react';
import type { ActivityItem } from '../hooks/useDashboardStats';

interface RecentActivityProps {
  activities: ActivityItem[];
}

const typeConfig: Record<string, { bg: string; label: string }> = {
  checkin: { bg: 'bg-green-500/20 text-green-400', label: 'Entrada' },
  checkout: { bg: 'bg-red-500/20 text-red-400', label: 'Salida' },
  income: { bg: 'bg-green-500/20 text-green-400', label: 'Ingreso' },
  expense: { bg: 'bg-red-500/20 text-red-400', label: 'Gasto' },
  report: { bg: 'bg-indigo-500/20 text-indigo-400', label: 'Corte' },
};

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  if (activities.length === 0) {
    return (
      <div className="text-center p-6 text-slate-400 text-sm">
        No hay actividad reciente.
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {activities.map((act, i) => {
        const cfg = typeConfig[act.type] || { bg: 'bg-slate-500/20 text-slate-400', label: act.type };
        return (
          <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/30 transition-colors">
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${cfg.bg}`}>
              {cfg.label}
            </span>
            {act.room && <span className="text-sm font-bold text-slate-300 w-8">{act.room}</span>}
            {!act.room && <span className="w-8" />}
            <span className="flex-1 text-sm text-slate-300 truncate">
              {act.guest && <span className="font-semibold text-slate-100">{act.guest}</span>}
              {act.guest && ' — '}
              {act.action}
            </span>
            <span className="text-[11px] text-slate-500">{act.time}</span>
          </div>
        );
      })}
    </div>
  );
};

export default RecentActivity;
