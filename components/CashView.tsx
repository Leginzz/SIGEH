import React, { useState, useMemo } from 'react';
import type { Room, CashTransaction, CashRegister } from '../types';
import { PaymentMethod } from '../types';
import { useCash } from '../hooks/useCash';
import { BarChart, DonutChart } from './charts';
import KpiCard from './KpiCard';
import { CurrencyDollarIcon, BanknotesIcon, CalendarDaysIcon, BuildingOfficeIcon } from './icons/Icons';

interface CashViewProps {
  rooms: Room[];
  cashTransactions: CashTransaction[];
  cashRegister: CashRegister;
  onOpenRegister: (initialAmount: number, user: string) => void;
  onAddCashTransaction: (tx: Omit<CashTransaction, 'id' | 'date' | 'time' | 'reportId' | 'origin'>) => void;
  onCloseRegister: (countedCash: number) => void;
}

const originConfig: Record<string, { label: string; color: string }> = {
  reservation: { label: 'Reserva', color: 'text-indigo-600 bg-indigo-50' },
  checkin: { label: 'Check-In', color: 'text-emerald-600 bg-emerald-50' },
  checkout: { label: 'Check-Out', color: 'text-blue-600 bg-blue-50' },
  manual: { label: 'Manual', color: 'text-gray-600 bg-gray-100' },
  adjustment: { label: 'Ajuste', color: 'text-yellow-600 bg-yellow-50' },
  withdrawal: { label: 'Retiro', color: 'text-orange-600 bg-orange-50' },
  expense: { label: 'Gasto', color: 'text-red-600 bg-red-50' },
};

const txTypeBadge: Record<string, { label: string; color: string }> = {
  income: { label: 'Ingreso', color: 'text-emerald-700 bg-emerald-50' },
  expense: { label: 'Gasto', color: 'text-red-700 bg-red-50' },
  initial: { label: 'Apertura', color: 'text-blue-700 bg-blue-50' },
};

const manualMovementTypes = [
  { value: 'expense', label: 'Gasto' },
  { value: 'withdrawal', label: 'Retiro' },
  { value: 'adjustment', label: 'Ajuste' },
] as const;

const CashView: React.FC<CashViewProps> = ({
  rooms, cashTransactions, cashRegister,
  onOpenRegister, onAddCashTransaction, onCloseRegister,
}) => {
  const kpis = useCash(rooms, [], cashTransactions, cashRegister);
  const [tab, setTab] = useState<'dashboard' | 'history'>('dashboard');
  const [periodTab, setPeriodTab] = useState<'today' | 'month'>('today');
  const [showOpeningForm, setShowOpeningForm] = useState(false);
  const [showArqueo, setShowArqueo] = useState(false);
  const [showMovForm, setShowMovForm] = useState(false);

  const [openingAmount, setOpeningAmount] = useState('');
  const [openingUser, setOpeningUser] = useState('');
  const [moveType, setMoveType] = useState<'expense' | 'withdrawal' | 'adjustment'>('expense');
  const [moveAmount, setMoveAmount] = useState('');
  const [moveDesc, setMoveDesc] = useState('');
  const [countedCash, setCountedCash] = useState('');
  const [arqueoConfirmed, setArqueoConfirmed] = useState(false);

  const transactions = periodTab === 'today' ? kpis.todayTransactions : kpis.monthTransactions;
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
    const value = cashTransactions
      .filter(t => t.type === 'income' && t.date === dayStr)
      .reduce((s, t) => s + t.amount, 0);
    return { label, value };
  });

  const handleOpenRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(openingAmount);
    if (isNaN(amount) || amount < 0 || !openingUser.trim()) return;
    onOpenRegister(amount, openingUser.trim());
    setOpeningAmount('');
    setOpeningUser('');
    setShowOpeningForm(false);
  };

  const handleAddMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(moveAmount);
    if (isNaN(amount) || amount <= 0 || !moveDesc.trim()) return;
    const type = moveType === 'expense' ? 'expense' : moveType === 'withdrawal' ? 'expense' : 'income';
    const desc = moveType === 'expense' ? `Gasto: ${moveDesc}` : moveType === 'withdrawal' ? `Retiro: ${moveDesc}` : `Ajuste: ${moveDesc}`;
    onAddCashTransaction({ type: type as 'expense' | 'income', amount, description: desc });
    setMoveAmount('');
    setMoveDesc('');
    setShowMovForm(false);
  };

  const handleCloseRegister = () => {
    const counted = parseFloat(countedCash);
    if (isNaN(counted) || counted < 0) return;
    onCloseRegister(counted);
    setCountedCash('');
    setArqueoConfirmed(false);
    setShowArqueo(false);
    setShowOpeningForm(false);
  };

  const closings = cashRegister.closings;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex gap-2">
          <button onClick={() => setTab('dashboard')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'dashboard' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'}`}>
            Panel
          </button>
          <button onClick={() => setTab('history')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === 'history' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'}`}>
            Historial ({closings.length})
          </button>
        </div>
        {!cashRegister.isOpen && tab === 'dashboard' && (
          <button onClick={() => setShowOpeningForm(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Abrir Caja
          </button>
        )}
      </div>

      {tab === 'history' && (
        <CashHistoryView closings={closings} cashTransactions={cashTransactions} />
      )}

      {tab === 'dashboard' && !cashRegister.isOpen && !showOpeningForm && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#9ca3af" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900">Caja Cerrada</h3>
          <p className="text-gray-500 mt-1 mb-6">Abre la caja para comenzar a registrar movimientos</p>
          <button onClick={() => setShowOpeningForm(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors">
            Abrir Caja
          </button>
        </div>
      )}

      {showOpeningForm && (
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Apertura de Caja</h3>
            <form onSubmit={handleOpenRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto Inicial</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input type="number" step="0.01" min="0" value={openingAmount}
                    onChange={e => setOpeningAmount(e.target.value)} placeholder="0.00"
                    className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500" autoFocus />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
                <input type="text" value={openingUser} onChange={e => setOpeningUser(e.target.value)}
                  placeholder="Nombre del cajero"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={!openingAmount || !openingUser.trim()}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-semibold py-2.5 rounded-lg transition-colors">
                  Abrir Caja
                </button>
                <button type="button" onClick={() => setShowOpeningForm(false)}
                  className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {cashRegister.isOpen && tab === 'dashboard' && (
        <>
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-sm text-emerald-800">
                Caja abierta por <span className="font-semibold">{cashRegister.user}</span>
                {' — '}{cashRegister.openingDate} {cashRegister.openingTime}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowMovForm(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
                + Movimiento
              </button>
              {!showArqueo && (
                <button onClick={() => setShowArqueo(true)}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors">
                  Cerrar Caja
                </button>
              )}
            </div>
          </div>

          {showMovForm && (
            <form onSubmit={handleAddMovement} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-3">
              <h4 className="font-semibold text-gray-900">Registrar Movimiento Manual</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select value={moveType} onChange={e => setMoveType(e.target.value as typeof moveType)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900">
                  {manualMovementTypes.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input type="number" step="0.01" min="0.01" value={moveAmount}
                    onChange={e => setMoveAmount(e.target.value)} placeholder="0.00"
                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900" />
                </div>
                <input type="text" value={moveDesc} onChange={e => setMoveDesc(e.target.value)}
                  placeholder="Descripción" className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900" />
              </div>
              <div className="flex gap-2">
                <button type="submit" disabled={!moveAmount || !moveDesc.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                  Registrar
                </button>
                <button type="button" onClick={() => setShowMovForm(false)}
                  className="text-gray-600 text-sm font-medium px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard title="Ingresos Hoy" value={`$${kpis.todayIncome.toFixed(2)}`} subtitle={`${kpis.occupiedRooms} ocupadas`}
              icon={<CurrencyDollarIcon className="w-6 h-6" />} color="green" />
            <KpiCard title="Ingresos del Mes" value={`$${kpis.monthIncome.toFixed(2)}`}
              icon={<CalendarDaysIcon className="w-6 h-6" />} color="purple" />
            <KpiCard title="Fondo Actual" value={`$${kpis.currentFund.toFixed(2)}`} subtitle={`Gastos: $${kpis.totalExpenses.toFixed(2)}`}
              icon={<BanknotesIcon className="w-6 h-6" />} color="blue" />
            <KpiCard title="Saldo en Caja" value={`$${kpis.expectedBalance.toFixed(2)}`}
              icon={<BuildingOfficeIcon className="w-6 h-6" />} color="yellow" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Ingresos Últimos 7 Días</h3>
              <BarChart data={incomeData} height={160} barColor="#6366f1" />
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Método de Pago (Total)</h3>
              {paymentData.length > 0 ? <DonutChart data={paymentData} size={180} innerRadius={60} /> : <p className="text-gray-400 text-center py-8">Sin datos</p>}
            </div>
          </div>

          {showArqueo && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Arqueo y Cierre de Caja</h3>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Efectivo Esperado</span>
                    <span className="font-bold text-gray-900">${kpis.expectedBalance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Fondo Inicial</span>
                    <span className="font-medium text-gray-700">${kpis.currentFund.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ingresos</span>
                    <span className="font-medium text-emerald-600">+${kpis.totalIncomeTx.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Gastos</span>
                    <span className="font-medium text-red-600">-${kpis.totalExpenses.toFixed(2)}</span>
                  </div>
                </div>
                {!arqueoConfirmed ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Efectivo Contado</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                        <input type="number" step="0.01" min="0" value={countedCash}
                          onChange={e => setCountedCash(e.target.value)} placeholder="0.00"
                          className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg text-gray-900 text-lg font-bold" autoFocus />
                      </div>
                    </div>
                    <button onClick={() => setArqueoConfirmed(true)} disabled={!countedCash || parseFloat(countedCash) <= 0}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-semibold py-2.5 rounded-lg transition-colors">
                      Calcular Diferencia
                    </button>
                  </>
                ) : (
                  <>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Efectivo Contado</span>
                        <span className="font-bold text-gray-900">${parseFloat(countedCash || '0').toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Efectivo Esperado</span>
                        <span className="font-bold text-gray-900">${kpis.expectedBalance.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Diferencia</span>
                          <span className={`font-bold text-lg ${kpis.expectedBalance <= parseFloat(countedCash || '0') ? 'text-emerald-600' : 'text-red-600'}`}>
                            {kpis.expectedBalance <= parseFloat(countedCash || '0') ? '+' : ''}{(parseFloat(countedCash || '0') - kpis.expectedBalance).toFixed(2)}
                          </span>
                        </div>
                        <p className={`text-xs mt-1 ${kpis.expectedBalance <= parseFloat(countedCash || '0') ? 'text-emerald-600' : 'text-red-600'}`}>
                          {kpis.expectedBalance <= parseFloat(countedCash || '0') ? 'Sobrante' : 'Faltante'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={handleCloseRegister}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg transition-colors">
                        Confirmar y Cerrar Caja
                      </button>
                      <button onClick={() => { setArqueoConfirmed(false); setCountedCash(''); }}
                        className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        Corregir
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-gray-900">Movimientos</h3>
                <div className="flex gap-1">
                  <button onClick={() => setPeriodTab('today')}
                    className={`px-3 py-1 text-xs font-medium rounded-md ${periodTab === 'today' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`}>Hoy</button>
                  <button onClick={() => setPeriodTab('month')}
                    className={`px-3 py-1 text-xs font-medium rounded-md ${periodTab === 'month' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`}>Mes</button>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-700">Total: <span className="text-emerald-600">+${totalFiltered.toFixed(2)}</span></p>
            </div>
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-gray-400"><p className="text-sm">No hay movimientos</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Fecha</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Tipo</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Origen</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Descripción</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Hab</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Huésped</th>
                      <th className="text-left px-4 py-3 font-medium text-gray-500">Pago</th>
                      <th className="text-right px-4 py-3 font-medium text-gray-500">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(t => {
                      const originCfg = originConfig[t.origin || 'manual'];
                      const typeCfg = txTypeBadge[t.type];
                      return (
                        <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{t.date}{t.time ? ` ${t.time}` : ''}</td>
                          <td className="px-4 py-3"><span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${typeCfg?.color || 'text-gray-600 bg-gray-50'}`}>{typeCfg?.label || t.type}</span></td>
                          <td className="px-4 py-3"><span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${originCfg.color}`}>{originCfg.label}</span></td>
                          <td className="px-4 py-3 text-gray-700 max-w-xs truncate">{t.description}</td>
                          <td className="px-4 py-3 text-gray-500">{t.roomId || '-'}</td>
                          <td className="px-4 py-3 text-gray-500">{t.guestName || '-'}</td>
                          <td className="px-4 py-3 text-gray-500">{t.paymentMethod || '-'}</td>
                          <td className={`px-4 py-3 text-right font-medium whitespace-nowrap ${t.type === 'expense' ? 'text-red-600' : t.type === 'income' ? 'text-emerald-600' : 'text-blue-600'}`}>
                            {t.type === 'expense' ? '-' : '+'}${Math.abs(t.amount).toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Últimos Check-Outs</h3>
            </div>
            {kpis.recentCheckouts.length === 0 ? (
              <div className="p-8 text-center text-gray-400"><p className="text-sm">No hay check-outs registrados</p></div>
            ) : (
              <div className="overflow-x-auto">
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
                    {kpis.recentCheckouts.map(t => (
                      <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{t.roomId}</td>
                        <td className="px-4 py-3 text-gray-700">{t.guestName}</td>
                        <td className="px-4 py-3 text-gray-500">{t.date}</td>
                        <td className="px-4 py-3 text-gray-500">{t.numberOfNights || '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${t.paymentMethod === PaymentMethod.Cash ? 'bg-emerald-50 text-emerald-700' : t.paymentMethod === PaymentMethod.Card ? 'bg-indigo-50 text-indigo-700' : 'bg-amber-50 text-amber-700'}`}>
                            {t.paymentMethod || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">${t.amount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

const CashHistoryView: React.FC<{ closings: CashRegister['closings']; cashTransactions: CashTransaction[] }> = ({ closings, cashTransactions }) => {
  const [searchDate, setSearchDate] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = searchDate ? closings.filter(c => c.closingDate.includes(searchDate)) : closings;

  if (selected) {
    const c = closings.find(cl => cl.folio === selected);
    if (!c) return null;
    return (
      <div className="space-y-4">
        <button onClick={() => setSelected(null)} className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Volver al historial
        </button>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Corte {c.folio}</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Apertura</span><span className="text-gray-700">{c.openingDate} {c.openingTime}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Cierre</span><span className="text-gray-700">{c.closingDate} {c.closingTime}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Responsable</span><span className="text-gray-700">{c.user}</span></div>
            <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
              <div className="flex justify-between"><span className="text-gray-500">Monto Inicial</span><span className="text-gray-700">${c.initialAmount.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Ingresos</span><span className="text-emerald-600">+${c.totalIncome.toFixed(2)}</span></div>
              {c.totalDiverseIncome > 0 && <div className="flex justify-between"><span className="text-gray-500">Ingresos Diversos</span><span className="text-emerald-600">+${c.totalDiverseIncome.toFixed(2)}</span></div>}
              <div className="flex justify-between"><span className="text-gray-500">Egresos</span><span className="text-red-600">-${c.totalExpenses.toFixed(2)}</span></div>
              {c.totalWithdrawals > 0 && <div className="flex justify-between"><span className="text-gray-500">Retiros</span><span className="text-red-600">-${c.totalWithdrawals.toFixed(2)}</span></div>}
              {c.totalAdjustments !== 0 && <div className="flex justify-between"><span className="text-gray-500">Ajustes</span><span className="text-yellow-600">{c.totalAdjustments >= 0 ? '+' : ''}{c.totalAdjustments.toFixed(2)}</span></div>}
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between font-medium"><span className="text-gray-700">Efectivo Esperado</span><span className="font-bold">${c.expectedCash.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Efectivo Contado</span><span className="text-gray-900">${c.countedCash.toFixed(2)}</span></div>
              <div className="flex justify-between text-base font-bold pt-1">
                <span>Diferencia</span>
                <span className={c.isSurplus ? 'text-emerald-600' : 'text-red-600'}>{c.isSurplus ? 'Sobrante: +' : 'Faltante: '}${Math.abs(c.difference).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalSurplus = closings.reduce((s, c) => c.isSurplus ? s + c.difference : s, 0);
  const totalShortage = closings.reduce((s, c) => !c.isSurplus ? s + Math.abs(c.difference) : s, 0);

  return (
    <div className="space-y-4">
      {closings.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Sobrantes</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">+${totalSurplus.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Faltantes</p>
            <p className="text-xl font-bold text-red-600 mt-1">-${totalShortage.toFixed(2)}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex items-center gap-3">
          <h3 className="font-semibold text-gray-900">Historial de Cortes</h3>
          <div className="ml-auto">
            <input type="date" value={searchDate} onChange={e => setSearchDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700" />
          </div>
        </div>
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400"><p className="text-sm">{searchDate ? 'No hay cortes en esta fecha' : 'No hay cortes registrados'}</p></div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map(c => (
              <button key={c.folio} onClick={() => setSelected(c.folio)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#4f46e5" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{c.folio}</p>
                    <p className="text-xs text-gray-500">{c.closingDate} — {c.user}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">${c.expectedCash.toFixed(2)}</p>
                  <p className={`text-xs ${c.isSurplus ? 'text-emerald-600' : 'text-red-600'}`}>{c.isSurplus ? `+${c.difference.toFixed(2)}` : c.difference.toFixed(2)}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CashView;
