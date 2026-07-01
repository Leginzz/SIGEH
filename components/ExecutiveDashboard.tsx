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

const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = (props) => {
  const { kpis, revenueDays, paymentMethods, statusCounts, recentActivity } = useDashboardStats(
    props.rooms,
    props.cashTransactions,
    props.dailyReports
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        <KpiCard
          title="Ocupación"
          value={`${kpis.occupancy}%`}
          subtitle={`${props.rooms.filter(r => r.status === RoomStatus.Occupied || r.status === RoomStatus.Cleaning).length}/${props.rooms.length} habitaciones`}
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
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Ingresos Últimos 7 Días</h3>
          {revenueDays.some(d => d.value > 0) ? (
            <BarChart data={revenueDays.map(d => ({ ...d }))} barColor="#6366f1" />
          ) : (
            <div className="flex flex-col items-center py-8 text-center">
              <ChartBarIcon className="w-10 h-10 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">Sin ingresos esta semana</p>
              <p className="text-xs text-gray-400 mt-1">Los ingresos aparecerán al registrar check-ins y cobros.</p>
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Método de Pago (Mes)</h3>
          {paymentMethods.some(p => p.value > 0) ? (
            <DonutChart data={paymentMethods} />
          ) : (
            <div className="flex flex-col items-center py-8 text-center">
              <CurrencyDollarIcon className="w-10 h-10 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">Sin pagos este mes</p>
              <p className="text-xs text-gray-400 mt-1">Los métodos de pago se muestran al registrar transacciones.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Estado de Habitaciones</h3>
          <OccupancyBars rooms={props.rooms} />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Actividad Reciente</h3>
          <RecentActivity activities={recentActivity} />
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;
