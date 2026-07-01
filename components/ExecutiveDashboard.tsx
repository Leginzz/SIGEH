import React from 'react';
import type { Room, CashTransaction, DailyReport } from '../types';
import { RoomStatus } from '../types';
import { useDashboardStats } from '../hooks/useDashboardStats';
import KpiCard from './KpiCard';
import BarChart from './charts/BarChart';
import DonutChart from './charts/DonutChart';
import OccupancyBars from './charts/OccupancyBars';
import RecentActivity from './RecentActivity';
import { CurrencyDollarIcon, CalendarDaysIcon, BuildingOfficeIcon, ChartBarIcon } from './icons/Icons';

interface ExecutiveDashboardProps {
  rooms: Room[];
  cashTransactions: CashTransaction[];
  dailyReports: DailyReport[];
}

const Section: React.FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-4 lg:p-5">
    <div className="flex items-center gap-2 mb-3 lg:mb-4">
      {icon && <span className="text-gray-400">{icon}</span>}
      <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
    </div>
    {children}
  </div>
);

const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = (props) => {
  const { kpis, revenueDays, paymentMethods, statusCounts, recentActivity } = useDashboardStats(
    props.rooms,
    props.cashTransactions,
    props.dailyReports
  );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        <KpiCard
          title="Ocupación"
          value={`${kpis.occupancy}%`}
          subtitle={`${props.rooms.filter(r => r.status === RoomStatus.Occupied || r.status === RoomStatus.Cleaning).length}/${props.rooms.length} habitaciones`}
          icon={<BuildingOfficeIcon className="w-4 h-4" />}
          color="blue"
        />
        <KpiCard
          title="Ingresos Hoy"
          value={`$${kpis.todayIncome}`}
          icon={<CurrencyDollarIcon className="w-4 h-4" />}
          color="green"
        />
        <KpiCard
          title="Ingresos del Mes"
          value={`$${kpis.monthIncome}`}
          icon={<CurrencyDollarIcon className="w-4 h-4" />}
          color="cyan"
        />
        <KpiCard
          title="ADR"
          value={`$${kpis.adr}`}
          subtitle="Tarifa promedio por noche"
          icon={<CurrencyDollarIcon className="w-4 h-4" />}
          color="purple"
        />
        <KpiCard
          title="RevPAR"
          value={`$${kpis.revpar}`}
          subtitle="Ingreso por habitación disponible"
          icon={<CurrencyDollarIcon className="w-4 h-4" />}
          color="orange"
        />
        <KpiCard
          title="Check-In Hoy"
          value={`${kpis.checkInsToday}`}
          icon={<CalendarDaysIcon className="w-4 h-4" />}
          color="green"
        />
        <KpiCard
          title="Check-Out Hoy"
          value={`${kpis.checkOutsToday}`}
          icon={<CalendarDaysIcon className="w-4 h-4" />}
          color="red"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Section title="Ingresos Últimos 7 Días" icon={<ChartBarIcon className="w-4 h-4" />}>
          {revenueDays.some(d => d.value > 0) ? (
            <BarChart data={revenueDays.map(d => ({ ...d }))} barColor="#6366f1" />
          ) : (
            <div className="flex flex-col items-center py-8 text-center">
              <ChartBarIcon className="w-10 h-10 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">Sin ingresos esta semana</p>
              <p className="text-xs text-gray-400 mt-1">Los ingresos aparecerán al registrar check-ins y cobros.</p>
            </div>
          )}
        </Section>

        <Section title="Método de Pago (Mes)" icon={<CurrencyDollarIcon className="w-4 h-4" />}>
          {paymentMethods.some(p => p.value > 0) ? (
            <DonutChart data={paymentMethods} />
          ) : (
            <div className="flex flex-col items-center py-8 text-center">
              <CurrencyDollarIcon className="w-10 h-10 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">Sin pagos este mes</p>
              <p className="text-xs text-gray-400 mt-1">Los métodos de pago se muestran al registrar transacciones.</p>
            </div>
          )}
        </Section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Section title="Estado de Habitaciones" icon={<BuildingOfficeIcon className="w-4 h-4" />}>
          <OccupancyBars rooms={props.rooms} />
        </Section>

        <Section title="Actividad Reciente" icon={<CalendarDaysIcon className="w-4 h-4" />}>
          <RecentActivity activities={recentActivity} />
        </Section>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
