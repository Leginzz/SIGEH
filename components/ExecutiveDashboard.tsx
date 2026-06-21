import React from 'react';
import type { Room, BookingRecord, CashTransaction, DailyReport } from '../types';
import { useDashboardStats } from '../hooks/useDashboardStats';
import KpiCard from './KpiCard';
import BarChart from './charts/BarChart';
import DonutChart from './charts/DonutChart';
import OccupancyBars from './charts/OccupancyBars';
import RecentActivity from './RecentActivity';
import { CurrencyDollarIcon, CalendarDaysIcon, BuildingOfficeIcon } from './icons/Icons';

interface ExecutiveDashboardProps {
  rooms: Room[];
  bookingHistory: BookingRecord[];
  cashTransactions: CashTransaction[];
  dailyReports: DailyReport[];
}

const IconWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>{children}</>
);

const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = (props) => {
  const { kpis, revenueDays, paymentMethods, statusCounts, recentActivity } = useDashboardStats(
    props.rooms,
    props.bookingHistory,
    props.cashTransactions,
    props.dailyReports
  );

  const totalStatus = statusCounts.reduce((s, c) => s + c.count, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Dashboard Ejecutivo</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        <KpiCard
          title="Ocupación"
          value={`${kpis.occupancy}%`}
          subtitle={`${props.rooms.filter(r => r.status === 'Ocupada' || r.status === 'En Limpieza').length}/${props.rooms.length} habitaciones`}
          icon={<BuildingOfficeIcon className="w-5 h-5" />}
          color="blue"
        />
        <KpiCard
          title="Ingresos Hoy"
          value={`$${kpis.todayIncome}`}
          icon={<CurrencyDollarIcon className="w-5 h-5" />}
          color="green"
        />
        <KpiCard
          title="Ingresos del Mes"
          value={`$${kpis.monthIncome}`}
          icon={<CurrencyDollarIcon className="w-5 h-5" />}
          color="cyan"
        />
        <KpiCard
          title="ADR"
          value={`$${kpis.adr}`}
          subtitle="Tarifa promedio por noche"
          icon={<CurrencyDollarIcon className="w-5 h-5" />}
          color="purple"
        />
        <KpiCard
          title="RevPAR"
          value={`$${kpis.revpar}`}
          subtitle="Ingreso por habitación disponible"
          icon={<CurrencyDollarIcon className="w-5 h-5" />}
          color="orange"
        />
        <KpiCard
          title="Check-In Hoy"
          value={`${kpis.checkInsToday}`}
          icon={<CalendarDaysIcon className="w-5 h-5" />}
          color="green"
        />
        <KpiCard
          title="Check-Out Hoy"
          value={`${kpis.checkOutsToday}`}
          icon={<CalendarDaysIcon className="w-5 h-5" />}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <h3 className="text-lg font-bold text-white mb-4">Ingresos Últimos 7 Días</h3>
          {revenueDays.some(d => d.value > 0) ? (
            <BarChart data={revenueDays.map(d => ({ ...d }))} barColor="#6366f1" />
          ) : (
            <p className="text-center text-slate-400 py-8">No hay ingresos registrados en los últimos 7 días.</p>
          )}
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <h3 className="text-lg font-bold text-white mb-4">Método de Pago (Mes)</h3>
          {paymentMethods.some(p => p.value > 0) ? (
            <DonutChart data={paymentMethods} />
          ) : (
            <p className="text-center text-slate-400 py-8">No hay pagos registrados este mes.</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <h3 className="text-lg font-bold text-white mb-4">Estado de Habitaciones</h3>
          <OccupancyBars rooms={props.rooms} />
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
          <h3 className="text-lg font-bold text-white mb-4">Actividad Reciente</h3>
          <RecentActivity activities={recentActivity} />
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
