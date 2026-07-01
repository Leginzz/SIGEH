import React, { useState, useMemo, useCallback } from 'react';
import type { Room, CashTransaction, CashRegister, CashClosing, DenominationCount } from '../types';
import { RoomStatus, PaymentMethod, DEFAULT_DENOMINATIONS, DENOMINATION_VALUES, denomTotal } from '../types';
import { useCash } from '../hooks/useCash';
import { BarChart, DonutChart } from './charts';
import KpiCard from './KpiCard';
import { CurrencyDollarIcon, BanknotesIcon, CalendarDaysIcon, BuildingOfficeIcon, DocumentTextIcon, ChartBarIcon } from './icons/Icons';

interface CashViewProps {
  rooms: Room[];
  cashTransactions: CashTransaction[];
  cashRegister: CashRegister;
  onOpenRegister: (initialAmount: number, user: string) => void;
  onAddCashTransaction: (tx: Omit<CashTransaction, 'id' | 'date' | 'time' | 'reportId' | 'origin'>) => void;
  onCloseRegister: (denominations: DenominationCount) => void;
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

const denomLabels: Record<keyof DenominationCount, string> = {
  bill1000: '$1,000', bill500: '$500', bill200: '$200', bill100: '$100', bill50: '$50', bill20: '$20',
  coin20: '$20', coin10: '$10', coin5: '$5', coin2: '$2', coin1: '$1', coin050: '$0.50',
};

const isBill = (k: keyof DenominationCount) => k.startsWith('bill');

const inputClass = "mt-1 block w-full bg-white border border-gray-300 rounded-md py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500";
const labelClass = "block text-sm font-medium text-gray-700";

function formatDuration(startDate: string, startTime: string, endDate: string, endTime: string): string {
  const s = new Date(`${startDate}T${startTime}`);
  const e = new Date(`${endDate}T${endTime}`);
  const diffMs = e.getTime() - s.getTime();
  if (diffMs <= 0) return '-';
  const hours = Math.floor(diffMs / 3600000);
  const mins = Math.floor((diffMs % 3600000) / 60000);
  return `${hours}h ${mins}m`;
}

function buildDenomFromCounted(counted: number): DenominationCount {
  const d = { ...DEFAULT_DENOMINATIONS };
  let remaining = Math.round(counted * 100 + 1e-9);
  d.bill1000 = Math.floor(remaining / 100000);
  remaining %= 100000;
  d.bill500 = Math.floor(remaining / 50000);
  remaining %= 50000;
  d.bill200 = Math.floor(remaining / 20000);
  remaining %= 20000;
  d.bill100 = Math.floor(remaining / 10000);
  remaining %= 10000;
  d.bill50 = Math.floor(remaining / 5000);
  remaining %= 5000;
  d.bill20 = Math.floor(remaining / 2000);
  remaining %= 2000;
  d.coin10 = Math.floor(remaining / 1000);
  remaining %= 1000;
  d.coin5 = Math.floor(remaining / 500);
  remaining %= 500;
  d.coin2 = Math.floor(remaining / 200);
  remaining %= 200;
  d.coin1 = Math.floor(remaining / 100);
  remaining %= 100;
  d.coin050 = Math.floor(remaining / 50);
  return d;
}

const DenominationForm: React.FC<{
  denominations: DenominationCount;
  onChange: (d: DenominationCount) => void;
  readOnly?: boolean;
}> = ({ denominations, onChange, readOnly }) => {
  const handleChange = (key: keyof DenominationCount, val: string) => {
    onChange({ ...denominations, [key]: Math.max(0, parseInt(val) || 0) });
  };
  const total = denomTotal(denominations);
  const keys = Object.keys(DENOMINATION_VALUES) as (keyof DenominationCount)[];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
        {keys.map(k => (
          <div key={k} className="flex items-center gap-2">
            <span className="text-sm text-gray-600 w-16 shrink-0">{denomLabels[k]}</span>
            <span className="text-xs text-gray-400 w-8 shrink-0">{isBill(k) ? 'billete' : 'moneda'}</span>
            <input type="number" min="0" value={denominations[k] || ''}
              onChange={e => handleChange(k, e.target.value)}
              readOnly={readOnly}
              className={`w-full bg-white border border-gray-300 rounded-md py-1.5 px-2 text-sm text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 ${readOnly ? 'opacity-70' : ''}`} />
            <span className="text-xs text-gray-400 w-16 text-right">=${(denominations[k] * DENOMINATION_VALUES[k]).toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-gray-200 pt-2 flex justify-between text-sm font-bold">
        <span className="text-gray-700">Total Contado</span>
        <span className="text-indigo-700">${total.toFixed(2)}</span>
      </div>
    </div>
  );
};

const CashView: React.FC<CashViewProps> = ({
  rooms, cashTransactions, cashRegister,
  onOpenRegister, onAddCashTransaction, onCloseRegister,
}) => {
  const kpis = useCash(rooms, cashTransactions, cashRegister);
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

  const [denominations, setDenominations] = useState<DenominationCount>(DEFAULT_DENOMINATIONS);
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

  const handleShowArqueo = () => {
    setDenominations(buildDenomFromCounted(Math.round(kpis.expectedBalance * 100) / 100));
    setArqueoConfirmed(false);
    setShowArqueo(true);
  };

  const handleCloseRegister = () => {
    onCloseRegister(denominations);
    setDenominations(DEFAULT_DENOMINATIONS);
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
        <CashHistoryView closings={closings} cashTransactions={cashTransactions} rooms={rooms} />
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
          <div className="bg-white rounded-xl border border-gray-200 p-6">
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
                <button onClick={handleShowArqueo}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors">
                  Cerrar Caja
                </button>
              )}
            </div>
          </div>

          {showMovForm && (
            <form onSubmit={handleAddMovement} className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
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
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Ingresos Últimos 7 Días</h3>
              <BarChart data={incomeData} height={160} barColor="#6366f1" />
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="font-semibold text-gray-900 mb-3">Método de Pago (Total)</h3>
              {paymentData.length > 0 ? <DonutChart data={paymentData} size={180} innerRadius={60} /> : <p className="text-gray-400 text-center py-8">Sin datos</p>}
            </div>
          </div>

          {showArqueo && (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
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
                    <h4 className="font-semibold text-gray-900">Arqueo por Denominaciones</h4>
                    <DenominationForm denominations={denominations} onChange={setDenominations} />
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Contado</span>
                        <span className="font-bold text-gray-900">${denomTotal(denominations).toFixed(2)}</span>
                      </div>
                    </div>
                    <button onClick={() => setArqueoConfirmed(true)}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-colors">
                      Calcular Diferencia
                    </button>
                  </>
                ) : (
                  <>
                    <h4 className="font-semibold text-gray-900">Resumen de Arqueo</h4>
                    <DenominationForm denominations={denominations} onChange={setDenominations} readOnly />
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Efectivo Contado</span>
                        <span className="font-bold text-gray-900">${denomTotal(denominations).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Efectivo Esperado</span>
                        <span className="font-bold text-gray-900">${kpis.expectedBalance.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Diferencia</span>
                          <span className={`font-bold text-lg ${kpis.expectedBalance <= denomTotal(denominations) ? 'text-emerald-600' : 'text-red-600'}`}>
                            {kpis.expectedBalance <= denomTotal(denominations) ? '+' : ''}{(denomTotal(denominations) - kpis.expectedBalance).toFixed(2)}
                          </span>
                        </div>
                        <p className={`text-xs mt-1 ${kpis.expectedBalance <= denomTotal(denominations) ? 'text-emerald-600' : 'text-red-600'}`}>
                          {kpis.expectedBalance <= denomTotal(denominations) ? 'Sobrante' : 'Faltante'}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button onClick={handleCloseRegister}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg transition-colors">
                        Confirmar y Cerrar Caja
                      </button>
                      <button onClick={() => { setArqueoConfirmed(false); setDenominations(buildDenomFromCounted(Math.round(kpis.expectedBalance * 100) / 100)); }}
                        className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                        Corregir
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-gray-200">
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

          <div className="bg-white rounded-xl border border-gray-200">
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

/* ============================================================
   CASH HISTORY VIEW (Fase 2 - Enhanced, Fase 3 - Tabbed Detail)
   ============================================================ */
const CashHistoryView: React.FC<{ closings: CashClosing[]; cashTransactions: CashTransaction[]; rooms: Room[] }> = ({ closings, cashTransactions, rooms }) => {
  const [searchDate, setSearchDate] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = searchDate ? closings.filter(c => c.closingDate.includes(searchDate)) : closings;

  if (selected) {
    const c = closings.find(cl => cl.folio === selected);
    if (!c) return null;
    return <ClosingDetailView closing={c} cashTransactions={cashTransactions} rooms={rooms} onBack={() => setSelected(null)} />;
  }

  const totalSurplus = closings.reduce((s, c) => c.isSurplus ? s + c.difference : s, 0);
  const totalShortage = closings.reduce((s, c) => !c.isSurplus ? s + Math.abs(c.difference) : s, 0);

  return (
    <div className="space-y-4">
      {closings.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Sobrantes</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">+${totalSurplus.toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Faltantes</p>
            <p className="text-xl font-bold text-red-600 mt-1">-${totalShortage.toFixed(2)}</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200">
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
            {filtered.map(c => {
              const duration = formatDuration(c.openingDate, c.openingTime, c.closingDate, c.closingTime);
              return (
                <button key={c.folio} onClick={() => setSelected(c.folio)} className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                      <DocumentTextIcon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900">{c.folio}</p>
                      <p className="text-xs text-gray-500">{c.closingDate} — {c.user}</p>
                      <p className="text-xs text-gray-400">Duración: {duration}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="font-bold text-gray-900">${c.expectedCash.toFixed(2)}</p>
                    <p className={`text-xs ${c.isSurplus ? 'text-emerald-600' : 'text-red-600'}`}>{c.isSurplus ? `+${c.difference.toFixed(2)}` : c.difference.toFixed(2)}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

/* ============================================================
   CLOSING DETAIL VIEW (Fase 3 - Tabbed)
   ============================================================ */
const ClosingDetailView: React.FC<{
  closing: CashClosing;
  cashTransactions: CashTransaction[];
  rooms: Room[];
  onBack: () => void;
}> = ({ closing, cashTransactions, rooms, onBack }) => {
  const [detailTab, setDetailTab] = useState<'resumen' | 'movimientos' | 'habitaciones' | 'pagos' | 'arqueo'>('resumen');

  const duration = formatDuration(closing.openingDate, closing.openingTime, closing.closingDate, closing.closingTime);
  const sessionTxs = closing.registerSessionId
    ? cashTransactions.filter(t => t.registerSessionId === closing.registerSessionId)
    : [];

  const paymentBreakdown: Record<string, number> = useMemo(() => {
    const breakdown: Record<string, number> = {};
    sessionTxs.filter(t => t.type === 'income' && t.paymentMethod).forEach(t => {
      const m = t.paymentMethod!;
      breakdown[m] = (breakdown[m] || 0) + t.amount;
    });
    return breakdown;
  }, [sessionTxs]);

  const checkins = sessionTxs.filter(t => t.origin === 'checkin').length;
  const checkouts = sessionTxs.filter(t => t.origin === 'checkout').length;
  const reservations = sessionTxs.filter(t => t.origin === 'reservation').length;
  const occupiedCount = rooms.filter(r => r.status === RoomStatus.Occupied).length;
  const availableCount = rooms.filter(r => r.status === RoomStatus.Available).length;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(printClosingHTML(closing, sessionTxs, paymentBreakdown, duration, checkins, checkouts, occupiedCount, availableCount));
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const handleExportExcel = () => {
    const rows: string[][] = [];
    rows.push(['SIGEH - Corte de Caja', '', '', '', '']);
    rows.push(['Folio:', closing.folio, '', '', '']);
    rows.push(['Fecha:', closing.closingDate, '', '', '']);
    rows.push(['Responsable:', closing.user, '', '', '']);
    rows.push([]);
    rows.push(['RESUMEN FINANCIERO', '', '', '', '']);
    rows.push(['Concepto', 'Monto', '', '', '']);
    rows.push(['Saldo Inicial', closing.initialAmount.toFixed(2)]);
    rows.push(['Ingresos', closing.totalIncome.toFixed(2)]);
    rows.push(['Egresos', closing.totalExpenses.toFixed(2)]);
    if (closing.totalWithdrawals > 0) rows.push(['Retiros', closing.totalWithdrawals.toFixed(2)]);
    if (closing.totalDiverseIncome > 0) rows.push(['Ingresos Diversos', closing.totalDiverseIncome.toFixed(2)]);
    if (closing.totalAdjustments !== 0) rows.push(['Ajustes', closing.totalAdjustments.toFixed(2)]);
    rows.push(['Efectivo Esperado', closing.expectedCash.toFixed(2)]);
    rows.push(['Efectivo Contado', closing.countedCash.toFixed(2)]);
    rows.push(['Diferencia', closing.difference.toFixed(2)]);
    rows.push([]);
    rows.push(['MÉTODOS DE PAGO', '', '', '', '']);
    Object.entries(paymentBreakdown).forEach(([m, v]) => rows.push([m, v.toFixed(2)]));
    rows.push([]);
    rows.push(['HABITACIONES RELACIONADAS', '', '', '', '']);
    rows.push(['Habitación', 'Huésped', 'Noches', 'Monto', '']);
    sessionTxs.filter(t => t.origin === 'checkout').forEach(t => {
      rows.push([String(t.roomId || ''), t.guestName || '', String(t.numberOfNights || ''), t.amount.toFixed(2), '']);
    });

    const csv = rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Corte_${closing.folio}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { key: 'resumen', label: 'Resumen' },
    { key: 'movimientos', label: 'Movimientos' },
    { key: 'habitaciones', label: 'Habitaciones' },
    { key: 'pagos', label: 'Métodos de Pago' },
    { key: 'arqueo', label: 'Arqueo' },
  ] as const;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Volver al historial
        </button>
        <div className="flex gap-2">
          <button onClick={handleExportExcel} className="px-3 py-1.5 text-xs font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
            Exportar Excel
          </button>
          <button onClick={handlePrint} className="px-3 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors">
            Imprimir / PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setDetailTab(t.key)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors ${detailTab === t.key ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {detailTab === 'resumen' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Información General</h4>
                <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Folio</span><span className="font-medium text-gray-900">{closing.folio}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Responsable</span><span className="font-medium text-gray-900">{closing.user}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Apertura</span><span className="font-medium text-gray-900">{closing.openingDate} {closing.openingTime}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Cierre</span><span className="font-medium text-gray-900">{closing.closingDate} {closing.closingTime}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Duración</span><span className="font-medium text-gray-900">{duration}</span></div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Resumen Financiero</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Saldo Inicial</span><span className="font-medium text-gray-900">${closing.initialAmount.toFixed(2)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Ingresos</span><span className="font-medium text-emerald-600">+${closing.totalIncome.toFixed(2)}</span></div>
                  {closing.totalDiverseIncome > 0 && <div className="flex justify-between"><span className="text-gray-500">Ingresos Diversos</span><span className="font-medium text-emerald-600">+${closing.totalDiverseIncome.toFixed(2)}</span></div>}
                  <div className="flex justify-between"><span className="text-gray-500">Egresos</span><span className="font-medium text-red-600">-${closing.totalExpenses.toFixed(2)}</span></div>
                  {closing.totalWithdrawals > 0 && <div className="flex justify-between"><span className="text-gray-500">Retiros</span><span className="font-medium text-red-600">-${closing.totalWithdrawals.toFixed(2)}</span></div>}
                  {closing.totalAdjustments !== 0 && <div className="flex justify-between"><span className="text-gray-500">Ajustes</span><span className="font-medium text-yellow-600">{closing.totalAdjustments >= 0 ? '+' : ''}{closing.totalAdjustments.toFixed(2)}</span></div>}
                  <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
                    <div className="flex justify-between font-medium"><span className="text-gray-700">Efectivo Esperado</span><span className="font-bold">${closing.expectedCash.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-500">Efectivo Contado</span><span className="text-gray-900">${closing.countedCash.toFixed(2)}</span></div>
                    <div className="flex justify-between text-base font-bold pt-1">
                      <span>Diferencia</span>
                      <span className={closing.isSurplus ? 'text-emerald-600' : 'text-red-600'}>{closing.isSurplus ? 'Sobrante: +' : 'Faltante: '}${Math.abs(closing.difference).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Resumen Operativo</h4>
                <div className="bg-gray-50 rounded-lg p-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Habitaciones Ocupadas</span><span className="font-medium text-gray-900">{occupiedCount}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Habitaciones Disponibles</span><span className="font-medium text-gray-900">{availableCount}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Check-Ins</span><span className="font-medium text-gray-900">{checkins}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Check-Outs</span><span className="font-medium text-gray-900">{checkouts}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Reservaciones</span><span className="font-medium text-gray-900">{reservations}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Ingresos por Hospedaje</span><span className="font-medium text-emerald-600">${closing.totalIncome.toFixed(2)}</span></div>
                </div>
              </div>
            </div>
          )}

          {detailTab === 'movimientos' && (
            <div>
              {sessionTxs.length === 0 ? (
                <p className="text-gray-400 text-center py-8 text-sm">No hay movimientos registrados en este corte</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left px-3 py-2 font-medium text-gray-500">Fecha</th>
                        <th className="text-left px-3 py-2 font-medium text-gray-500">Tipo</th>
                        <th className="text-left px-3 py-2 font-medium text-gray-500">Origen</th>
                        <th className="text-left px-3 py-2 font-medium text-gray-500">Descripción</th>
                        <th className="text-left px-3 py-2 font-medium text-gray-500">Pago</th>
                        <th className="text-right px-3 py-2 font-medium text-gray-500">Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessionTxs.map(t => (
                        <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-500 whitespace-nowrap">{t.date} {t.time}</td>
                          <td className="px-3 py-2"><span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${txTypeBadge[t.type]?.color || 'text-gray-600 bg-gray-50'}`}>{txTypeBadge[t.type]?.label || t.type}</span></td>
                          <td className="px-3 py-2"><span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${originConfig[t.origin || 'manual'].color}`}>{originConfig[t.origin || 'manual'].label}</span></td>
                          <td className="px-3 py-2 text-gray-700 max-w-xs truncate">{t.description}</td>
                          <td className="px-3 py-2 text-gray-500">{t.paymentMethod || '-'}</td>
                          <td className={`px-3 py-2 text-right font-medium whitespace-nowrap ${t.type === 'expense' ? 'text-red-600' : t.type === 'income' ? 'text-emerald-600' : 'text-blue-600'}`}>
                            {t.type === 'expense' ? '-' : '+'}${Math.abs(t.amount).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {detailTab === 'habitaciones' && (
            <div>
              {sessionTxs.filter(t => t.roomId).length === 0 ? (
                <p className="text-gray-400 text-center py-8 text-sm">No hay habitaciones relacionadas en este corte</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left px-3 py-2 font-medium text-gray-500">Habitación</th>
                        <th className="text-left px-3 py-2 font-medium text-gray-500">Huésped</th>
                        <th className="text-left px-3 py-2 font-medium text-gray-500">Noches</th>
                        <th className="text-right px-3 py-2 font-medium text-gray-500">Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessionTxs.filter(t => t.roomId).map(t => (
                        <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="px-3 py-2 font-medium text-gray-900">Hab. {t.roomId}</td>
                          <td className="px-3 py-2 text-gray-700">{t.guestName || '-'}</td>
                          <td className="px-3 py-2 text-gray-500">{t.numberOfNights || '-'}</td>
                          <td className="px-3 py-2 text-right font-medium text-gray-900">${t.amount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {detailTab === 'pagos' && (
            <div>
              {Object.keys(paymentBreakdown).length === 0 ? (
                <p className="text-gray-400 text-center py-8 text-sm">No hay pagos registrados en este corte</p>
              ) : (
                <div className="space-y-3 max-w-sm">
                  {Object.entries(paymentBreakdown).map(([method, amount]) => (
                    <div key={method} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <span className="font-medium text-gray-700">{method}</span>
                      <span className="font-bold text-gray-900">${amount.toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-base">
                    <span className="text-gray-700">Total</span>
                    <span className="text-indigo-700">${Object.values(paymentBreakdown).reduce((s, v) => s + v, 0).toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {detailTab === 'arqueo' && (
            <div>
              {closing.denominations ? (
                <DenominationForm denominations={closing.denominations} onChange={() => {}} readOnly />
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">No se registraron denominaciones en este corte.</p>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-gray-600">Efectivo Contado</span><span className="font-bold text-gray-900">${closing.countedCash.toFixed(2)}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600">Efectivo Esperado</span><span className="font-bold text-gray-900">${closing.expectedCash.toFixed(2)}</span></div>
                    <div className="border-t border-gray-200 pt-2 flex justify-between font-bold">
                      <span>Diferencia</span>
                      <span className={closing.isSurplus ? 'text-emerald-600' : 'text-red-600'}>{closing.isSurplus ? 'Sobrante: +' : 'Faltante: '}${Math.abs(closing.difference).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ============================================================
   PRINT / PDF HTML GENERATOR (Fase 4 & 6)
   ============================================================ */
function printClosingHTML(
  closing: CashClosing,
  sessionTxs: CashTransaction[],
  paymentBreakdown: Record<string, number>,
  duration: string,
  checkins: number,
  checkouts: number,
  occupiedCount: number,
  availableCount: number,
): string {
  const rows = sessionTxs.filter(t => t.origin === 'checkout' && t.roomId).map(t => `
    <tr>
      <td>Hab. ${t.roomId}</td>
      <td>${t.guestName || '-'}</td>
      <td>${t.numberOfNights || '-'}</td>
      <td style="text-align:right">$${t.amount.toFixed(2)}</td>
    </tr>
  `).join('');

  const paymentRows = Object.entries(paymentBreakdown).map(([m, v]) => `
    <tr>
      <td>${m}</td>
      <td style="text-align:right">$${v.toFixed(2)}</td>
    </tr>
  `).join('');

  const denomRows = closing.denominations ? (Object.keys(DENOMINATION_VALUES) as (keyof DenominationCount)[])
    .filter(k => closing.denominations![k] > 0).map(k => `
      <tr>
        <td>${denomLabels[k]}</td>
        <td style="text-align:center">${closing.denominations![k]}</td>
        <td style="text-align:right">$${(closing.denominations![k] * DENOMINATION_VALUES[k]).toFixed(2)}</td>
      </tr>
    `).join('') : '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Corte de Caja - ${closing.folio}</title>
  <style>
    @page { margin: 1.5cm; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #1f2937; font-size: 12px; line-height: 1.5; }
    .header { text-align: center; margin-bottom: 20px; }
    .header h1 { font-size: 20px; margin: 0; }
    .header p { color: #6b7280; margin: 2px 0; font-size: 11px; }
    .folio { font-size: 14px; font-weight: bold; margin: 10px 0; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    th { background: #f3f4f6; text-align: left; padding: 6px 8px; font-size: 11px; border: 1px solid #e5e7eb; }
    td { padding: 5px 8px; border: 1px solid #e5e7eb; font-size: 11px; }
    .section-title { font-size: 13px; font-weight: bold; margin: 16px 0 8px; color: #374151; border-bottom: 2px solid #6366f1; padding-bottom: 4px; }
    .total-row td { font-weight: bold; }
    .surplus { color: #059669; }
    .shortage { color: #dc2626; }
    .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 8px 0; }
    .summary-item { padding: 6px 8px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 4px; }
    .summary-item .label { font-size: 10px; color: #6b7280; }
    .summary-item .value { font-size: 13px; font-weight: bold; }
  </style>
</head>
<body>
  <div class="header">
    <h1>SIGEH - Sistema Integral de Gestión Hotelera</h1>
    <p>Corte de Caja</p>
    <div class="folio">${closing.folio}</div>
    <p>Fecha: ${closing.closingDate} | Responsable: ${closing.user}</p>
  </div>

  <div class="section-title">Información General</div>
  <table>
    <tr><td style="width:50%"><strong>Apertura:</strong> ${closing.openingDate} ${closing.openingTime}</td>
        <td><strong>Cierre:</strong> ${closing.closingDate} ${closing.closingTime}</td></tr>
    <tr><td><strong>Duración:</strong> ${duration}</td>
        <td><strong>Responsable:</strong> ${closing.user}</td></tr>
  </table>

  <div class="section-title">Resumen Financiero</div>
  <div class="summary-grid">
    <div class="summary-item"><div class="label">Saldo Inicial</div><div class="value">$${closing.initialAmount.toFixed(2)}</div></div>
    <div class="summary-item"><div class="label">Ingresos</div><div class="value" style="color:#059669">+$${closing.totalIncome.toFixed(2)}</div></div>
    <div class="summary-item"><div class="label">Egresos</div><div class="value" style="color:#dc2626">-$${closing.totalExpenses.toFixed(2)}</div></div>
    <div class="summary-item"><div class="label">Efectivo Esperado</div><div class="value">$${closing.expectedCash.toFixed(2)}</div></div>
    <div class="summary-item"><div class="label">Efectivo Contado</div><div class="value">$${closing.countedCash.toFixed(2)}</div></div>
    <div class="summary-item"><div class="label">Diferencia</div><div class="value ${closing.isSurplus ? 'surplus' : 'shortage'}">${closing.isSurplus ? 'Sobrante: +' : 'Faltante: '}$${Math.abs(closing.difference).toFixed(2)}</div></div>
  </div>

  <div class="section-title">Resumen Operativo</div>
  <div class="summary-grid">
    <div class="summary-item"><div class="label">Habitaciones Ocupadas</div><div class="value">${occupiedCount}</div></div>
    <div class="summary-item"><div class="label">Habitaciones Disponibles</div><div class="value">${availableCount}</div></div>
    <div class="summary-item"><div class="label">Check-Ins</div><div class="value">${checkins}</div></div>
    <div class="summary-item"><div class="label">Check-Outs</div><div class="value">${checkouts}</div></div>
  </div>

  ${Object.keys(paymentBreakdown).length > 0 ? `
  <div class="section-title">Métodos de Pago</div>
  <table>
    <tr><th>Método</th><th style="text-align:right">Monto</th></tr>
    ${paymentRows}
  </table>` : ''}

  ${rows ? `
  <div class="section-title">Habitaciones Relacionadas</div>
  <table>
    <tr><th>Habitación</th><th>Huésped</th><th>Noches</th><th style="text-align:right">Monto</th></tr>
    ${rows}
  </table>` : ''}

  ${denomRows ? `
  <div class="section-title">Arqueo por Denominaciones</div>
  <table>
    <tr><th>Denominación</th><th style="text-align:center">Cantidad</th><th style="text-align:right">Subtotal</th></tr>
    ${denomRows}
    <tr class="total-row"><td colspan="2">Total Contado</td><td style="text-align:right">$${closing.countedCash.toFixed(2)}</td></tr>
  </table>` : ''}

  <p style="text-align:center; color:#9ca3af; font-size:10px; margin-top:30px;">SIGEH - Generado el ${new Date().toLocaleString('es-MX')}</p>
</body>
</html>`;
}

export default CashView;
