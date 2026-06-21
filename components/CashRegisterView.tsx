import React, { useState, useMemo } from 'react';
import type { CashRegister, CashMovement, CashClosing } from '../types';
import CashOpeningForm from './CashOpeningForm';
import CashSummary from './CashSummary';
import CashMovements from './CashMovements';
import CashArqueo from './CashArqueo';
import CashClosingForm from './CashClosingForm';
import CashHistory from './CashHistory';

interface CashRegisterViewProps {
  cashRegister: CashRegister;
  onOpenRegister: (initialAmount: number, user: string) => void;
  onAddCashMovement: (movement: Omit<CashMovement, 'id' | 'date' | 'time'>) => void;
  onCloseRegister: (countedCash: number) => void;
}

const CashRegisterView: React.FC<CashRegisterViewProps> = ({
  cashRegister,
  onOpenRegister,
  onAddCashMovement,
  onCloseRegister,
}) => {
  const [lastClosing, setLastClosing] = useState<CashClosing | null>(null);
  const [showArqueo, setShowArqueo] = useState(false);
  const [subview, setSubview] = useState<'register' | 'history'>('register');

  const closings = cashRegister.closings;

  const expectedCash = useMemo(() => {
    if (!cashRegister.isOpen) return 0;
    const totalIncome = cashRegister.movements.filter(m => m.type === 'income').reduce((s, m) => s + m.amount, 0);
    const totalDiverse = cashRegister.movements.filter(m => m.type === 'diverse_income').reduce((s, m) => s + m.amount, 0);
    const totalExpenses = cashRegister.movements.filter(m => m.type === 'expense').reduce((s, m) => s + Math.abs(m.amount), 0);
    const totalWithdrawals = cashRegister.movements.filter(m => m.type === 'withdrawal').reduce((s, m) => s + Math.abs(m.amount), 0);
    const totalAdjustments = cashRegister.movements.filter(m => m.type === 'adjustment').reduce((s, m) => s + m.amount, 0);
    return cashRegister.initialAmount + totalIncome + totalDiverse - totalExpenses - totalWithdrawals + totalAdjustments;
  }, [cashRegister]);

  const handleCloseWithArqueo = (countedCash: number) => {
    onCloseRegister(countedCash);
    const totalIncome = cashRegister.movements.filter(m => m.type === 'income').reduce((s, m) => s + m.amount, 0);
    const totalDiverse = cashRegister.movements.filter(m => m.type === 'diverse_income').reduce((s, m) => s + m.amount, 0);
    const totalExpenses = cashRegister.movements.filter(m => m.type === 'expense').reduce((s, m) => s + Math.abs(m.amount), 0);
    const totalWithdrawals = cashRegister.movements.filter(m => m.type === 'withdrawal').reduce((s, m) => s + Math.abs(m.amount), 0);
    const totalAdjustments = cashRegister.movements.filter(m => m.type === 'adjustment').reduce((s, m) => s + m.amount, 0);
    const diff = countedCash - expectedCash;
    setLastClosing({
      folio: '',
      openingDate: cashRegister.openingDate,
      openingTime: cashRegister.openingTime,
      closingDate: new Date().toISOString().split('T')[0],
      closingTime: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }),
      user: cashRegister.user,
      initialAmount: cashRegister.initialAmount,
      totalIncome,
      totalDiverseIncome: totalDiverse,
      totalExpenses,
      totalWithdrawals,
      totalAdjustments,
      expectedCash,
      countedCash,
      difference: diff,
      isSurplus: diff >= 0,
      movements: [],
    });
    setShowArqueo(false);
  };

  if (lastClosing) {
    return (
      <CashClosingForm
        closing={lastClosing}
        onDone={() => setLastClosing(null)}
      />
    );
  }

  if (!cashRegister.isOpen) {
    return (
      <div className="space-y-6">
        <div className="flex gap-2">
          <button
            onClick={() => setSubview('register')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${subview === 'register' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'}`}
          >
            Apertura
          </button>
          <button
            onClick={() => setSubview('history')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${subview === 'history' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'}`}
          >
            Historial ({closings.length})
          </button>
        </div>

        {subview === 'register' ? (
          <CashOpeningForm onOpen={onOpenRegister} />
        ) : (
          <CashHistory closings={closings} />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <p className="text-sm text-gray-500">
              Caja abierta por <span className="font-medium text-gray-700">{cashRegister.user}</span>
            </p>
            <p className="text-xs text-gray-400">
              {cashRegister.openingDate} {cashRegister.openingTime}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSubview('history')}
            className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Historial ({closings.length})
          </button>
          {!showArqueo && (
            <button
              onClick={() => setShowArqueo(true)}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Cerrar Caja
            </button>
          )}
        </div>
      </div>

      {subview === 'history' && (
        <div className="mb-6">
          <CashHistory closings={closings} />
        </div>
      )}

      <CashSummary register={cashRegister} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CashMovements movements={cashRegister.movements} onAddMovement={onAddCashMovement} />
        {showArqueo && (
          <CashArqueo expectedCash={expectedCash} onClose={handleCloseWithArqueo} />
        )}
      </div>
    </div>
  );
};

export default CashRegisterView;
