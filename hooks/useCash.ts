import { useMemo, useState, useCallback } from 'react';
import type { Room, BookingRecord, CashTransaction, CashRegister, CashClosing } from '../types';
import { PaymentMethod } from '../types';

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
  recentBookings: BookingRecord[];
}

export function useCash(
  rooms: Room[],
  bookingHistory: BookingRecord[],
  cashTransactions: CashTransaction[],
  cashRegister: CashRegister
): CashKpis {
  return useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const todayIncome = bookingHistory
      .filter(b => b.checkOutDate === today)
      .reduce((s, b) => s + b.totalIncome, 0);

    const monthIncome = bookingHistory
      .filter(b => {
        const d = new Date(b.checkOutDate);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      })
      .reduce((s, b) => s + b.totalIncome, 0);

    const incomeCash = bookingHistory
      .filter(b => b.paymentMethod === PaymentMethod.Cash)
      .reduce((s, b) => s + b.totalIncome, 0);

    const incomeCard = bookingHistory
      .filter(b => b.paymentMethod === PaymentMethod.Card)
      .reduce((s, b) => s + b.totalIncome, 0);

    const incomeTransfer = bookingHistory
      .filter(b => b.paymentMethod === PaymentMethod.Transfer)
      .reduce((s, b) => s + b.totalIncome, 0);

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

    const occupiedRooms = rooms.filter(r => r.status === 'Ocupada' || r.status === 'Ocupado');
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

    const recentBookings = bookingHistory.slice(0, 20);

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
      recentBookings,
    };
  }, [rooms, bookingHistory, cashTransactions, cashRegister]);
}
