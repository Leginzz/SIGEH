import { useMemo } from 'react';
import type { Room, BookingRecord, CashTransaction, DailyReport } from '../types';
import { PaymentMethod } from '../types';

export interface CashKpis {
  todayIncome: number;
  monthIncome: number;
  incomeCash: number;
  incomeCard: number;
  incomeTransfer: number;
  currentFund: number;
  totalExpenses: number;
  totalWithdrawals: number;
  expectedBalance: number;
  pendingCheckouts: number;
  occupiedRooms: number;
  occupiedIncome: number;
  transactionsToday: CashTransaction[];
  transactionsMonth: CashTransaction[];
  recentBookings: BookingRecord[];
}

export function useCashControl(
  rooms: Room[],
  bookingHistory: BookingRecord[],
  cashTransactions: CashTransaction[],
  dailyReports: DailyReport[]
): CashKpis {
  return useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

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

    const currentPeriodTx = cashTransactions.filter(t => !t.reportId);
    const totalExpenses = currentPeriodTx
      .filter(t => t.type === 'expense')
      .reduce((s, t) => s + t.amount, 0);
    const totalWithdrawals = 0;
    const initialFund = currentPeriodTx
      .filter(t => t.type === 'initial')
      .reduce((s, t) => s + t.amount, 0);
    const totalIncomeTx = currentPeriodTx
      .filter(t => t.type === 'income')
      .reduce((s, t) => s + t.amount, 0);
    const expectedBalance = initialFund + totalIncomeTx - totalExpenses;

    const occupiedRooms = rooms.filter(r => r.status === 'Ocupada' || r.status === 'Ocupado');
    const occupiedIncome = occupiedRooms.reduce((s, r) => s + (r.guest?.totalAgreedPrice || 0), 0);
    const pendingCheckouts = occupiedRooms.length;

    const transactionsToday = cashTransactions.filter(t => {
      const txDate = t.date || t.date;
      return txDate.startsWith(today);
    });
    const transactionsMonth = cashTransactions.filter(t => {
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
      currentFund: initialFund,
      totalExpenses,
      totalWithdrawals,
      expectedBalance,
      pendingCheckouts,
      occupiedRooms: occupiedRooms.length,
      occupiedIncome,
      transactionsToday,
      transactionsMonth,
      recentBookings,
    };
  }, [rooms, bookingHistory, cashTransactions, dailyReports]);
}
