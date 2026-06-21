import React, { useState } from 'react';
import type { Room, BookingRecord, CashTransaction, DailyReport, CashRegister } from '../types';
import { PaymentMethod } from '../types';
import { useCashControl } from '../hooks/useCashControl';
import KpiCard from './KpiCard';
import { CurrencyDollarIcon, BanknotesIcon, CalendarDaysIcon, BuildingOfficeIcon } from './icons/Icons';
import { BarChart, DonutChart } from './charts';

interface CashManagementViewProps {
  rooms: Room[];
  bookingHistory: BookingRecord[];
  cashTransactions: CashTransaction[];
  dailyReports: DailyReport[];
  cashRegister: CashRegister;
}

const originConfig: Record<string, { label: string; color: string }> = {
  reservation: { label: 'Reserva', color: 'text-indigo-600 bg-indigo-50' },
  checkin: { label: 'Check-In', color: 'text-emerald-600 bg-emerald-50' },
  checkout: { label: 'Check-Out', color: 'text-blue-600 bg-blue-50' },
  sale: { label: 'Venta', color: 'text-purple-600 bg-purple-50' },
  adjustment: { label: 'Ajuste', color: 'text-yellow-600 bg-yellow-50' },
  withdrawal: { label: 'Retiro', color: 'text-orange-600 bg-orange-50' },
  expense: { label: 'Gasto', color: 'text-red-600 bg-red-50' },
  manual: { label: 'Manual', color: 'text-gray-600 bg-gray-100' },
};

const CashManagementView: React.FC<CashManagementViewProps> = ({
  rooms, bookingHistory, cashTransactions, dailyReports, cashRegister,
}) => {
  const kpis = useCashControl(rooms, bookingHistory, cashTransactions, dailyReports);
  const [periodTab, setPeriodTab] = useState<'today' | 'month'>('today');

  const transactions = periodTab === 'today' ? kpis.transactionsToday : kpis.transactionsMonth;
  const totalFiltered = transactions.reduce((s, t) => t.type === 'income' ? s + t.amount : s, 0);

  const paymentData = [
    { label: 'Efectivo', value: kpis.incomeCash, color: '#059669' },
    { label: 'Tarjeta', value: kpis.incomeCard, color: '#6366f1' },
    { label: 'Transferencia', value: kpis.incomeTransfer, color: '#d97706' },
  ].filter(d => d.value > 0);

  const incomeData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString('es-MX', { weekday: 'short' });
    const dayStr = d.toISOString().split('T')[0];
    const value = bookingHistory
      .filter(b => b.checkOutDate === dayStr)
      .reduce((s, b) => s + b.totalIncome, 0);
    return { label, value };
  });

  return (
    <div className="space-y-6">
      {cashRegister.isOpen && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <p className="text-sm text-emerald-800">
            Caja abierta por <span className="font-semibold">{cashRegister.user}</span> —{' '}
            {cashRegister.openingDate} {cashRegister.openingTime}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Ingresos Hoy"
          value={`$${kpis.todayIncome.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          subtitle={`${kpis.pendingCheckouts} check-outs pendientes`}
          icon={<CurrencyDollarIcon className="w-6 h-6" />}
          color="green"
        />
        <KpiCard
          title="Ingresos del Mes"
          value={`$${kpis.monthIncome.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          icon={<CalendarDaysIcon className="w-6 h-6" />}
          color="purple"
        />
        <KpiCard
          title="Habs Ocupadas"
          value={`${kpis.occupiedRooms}`}
          subtitle={`$${kpis.occupiedIncome.toLocaleString('es-MX', { minimumFractionDigits: 2 })} esperado`}
          icon={<BuildingOfficeIcon className="w-6 h-6" />}
          color="blue"
        />
        <KpiCard
          title="Saldo en Caja"
          value={`$${kpis.expectedBalance.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
          subtitle={`Gastos: $${kpis.totalExpenses.toFixed(2)}`}
          icon={<BanknotesIcon className="w-6 h-6" />}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Ingresos Últimos 7 Días</h3>
          <BarChart data={incomeData} height={160} barColor="#6366f1" />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-900 mb-3">Método de Pago (Total)</h3>
          {paymentData.length > 0 ? (
            <DonutChart data={paymentData} size={180} innerRadius={60} />
          ) : (
            <p className="text-gray-400 text-center py-8">Sin datos de ingresos</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-gray-900">Movimientos Financieros</h3>
            <div className="flex gap-1">
              <button
                onClick={() => setPeriodTab('today')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${periodTab === 'today' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                Hoy
              </button>
              <button
                onClick={() => setPeriodTab('month')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${periodTab === 'month' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`}
              >
                Mes
              </button>
            </div>
          </div>
          <p className="text-sm font-medium text-gray-700">
            Total: <span className="text-emerald-600">+${totalFiltered.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
          </p>
        </div>

        <div className="overflow-x-auto">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p className="text-sm">No hay movimientos {periodTab === 'today' ? 'hoy' : 'este mes'}</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Fecha</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Origen</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Descripción</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Habitación</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Huésped</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Pago</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Monto</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => {
                  const originCfg = originConfig[t.origin || 'manual'];
                  return (
                    <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {t.date}{t.time ? ` ${t.time}` : ''}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${originCfg.color}`}>
                          {originCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{t.description}</td>
                      <td className="px-4 py-3 text-gray-500">{t.roomId || '-'}</td>
                      <td className="px-4 py-3 text-gray-500">{t.guestName || '-'}</td>
                      <td className="px-4 py-3 text-gray-500">{t.paymentMethod || '-'}</td>
                      <td className={`px-4 py-3 text-right font-medium whitespace-nowrap ${t.type === 'expense' ? 'text-red-600' : 'text-emerald-600'}`}>
                        {t.type === 'expense' ? '-' : '+'}${t.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Últimos Check-Outs</h3>
        </div>
        <div className="overflow-x-auto">
          {kpis.recentBookings.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              <p className="text-sm">No hay check-outs registrados</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Hab</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Huésped</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Salida</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Noches</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Pago</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Total</th>
                </tr>
              </thead>
              <tbody>
                {kpis.recentBookings.map(b => (
                  <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{b.roomId}</td>
                    <td className="px-4 py-3 text-gray-700">{b.guestName}</td>
                    <td className="px-4 py-3 text-gray-500">{b.checkOutDate}</td>
                    <td className="px-4 py-3 text-gray-500">{b.numberOfNights}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                        b.paymentMethod === PaymentMethod.Cash ? 'bg-emerald-50 text-emerald-700' :
                        b.paymentMethod === PaymentMethod.Card ? 'bg-indigo-50 text-indigo-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {b.paymentMethod}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-gray-900">
                      ${b.totalIncome.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default CashManagementView;
