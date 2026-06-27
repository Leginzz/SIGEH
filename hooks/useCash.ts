import { useMemo } from 'react';
import type { Room, CashTransaction, CashRegister } from '../types';
import { PaymentMethod, RoomStatus } from '../types';

export interface CashKpis {
  todayIncome: number;
  monthIncome: number;
  incomeCash: number;
  incomeCard: number;
  incomeTransfer: number;
  currentFund: number;
  totalIncomeTx: number;
  totalExpenses: number;
  expectedBalance: number;
  occupiedRooms: number;
  occupiedIncome: number;
  sessionTransactions: CashTransaction[];
  todayTransactions: CashTransaction[];
  monthTransactions: CashTransaction[];
  recentCheckouts: CashTransaction[];
}

export function useCash(
  rooms: Room[],
  cashTransactions: CashTransaction[],
  cashRegister: CashRegister
): CashKpis {
  return useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const incomeTxns = cashTransactions.filter(t => t.type === 'income');

    const todayIncome = incomeTxns
      .filter(t => t.date === today)
      .reduce((s, t) => s + t.amount, 0);

    const monthIncome = incomeTxns
      .filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((s, t) => s + t.amount, 0);

    const incomeCash = incomeTxns
      .filter(t => t.paymentMethod === PaymentMethod.Cash)
      .reduce((s, t) => s + t.amount, 0);

    const incomeCard = incomeTxns
      .filter(t => t.paymentMethod === PaymentMethod.Card)
      .reduce((s, t) => s + t.amount, 0);

    const incomeTransfer = incomeTxns
      .filter(t => t.paymentMethod === PaymentMethod.Transfer)
      .reduce((s, t) => s + t.amount, 0);

    const unreported = cashTransactions.filter(t => !t.reportId);
    const currentFund = unreported
      .filter(t => t.type === 'initial')
      .reduce((s, t) => s + t.amount, 0);
    const totalIncomeTx = unreported
      .filter(t => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
    const totalExpenses = unreported
      .filter(t => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
    const expectedBalance = currentFund + totalIncomeTx - totalExpenses;

    const occupiedRooms = rooms.filter(r => r.status === RoomStatus.Occupied);
    const occupiedIncome = occupiedRooms.reduce((s, r) => s + (r.guest?.totalAgreedPrice || 0), 0);

    const sessionTransactions = cashRegister.isOpen && cashRegister.sessionId
      ? cashTransactions.filter(t => t.registerSessionId === cashRegister.sessionId)
      : [];

    const todayTransactions = cashTransactions.filter(t => {
      const d = t.date || '';
      return d.startsWith(today);
    });

    const monthTransactions = cashTransactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const recentCheckouts = cashTransactions
      .filter(t => t.origin === 'checkout')
      .slice(0, 20);

    return {
      todayIncome,
      monthIncome,
      incomeCash,
      incomeCard,
      incomeTransfer,
      currentFund,
      totalIncomeTx,
      totalExpenses,
      expectedBalance,
      occupiedRooms: occupiedRooms.length,
      occupiedIncome,
      sessionTransactions,
      todayTransactions,
      monthTransactions,
      recentCheckouts,
    };
  }, [rooms, cashTransactions, cashRegister]);
}
