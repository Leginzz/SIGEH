import { useMemo } from 'react';
import type { Room, CashTransaction, DailyReport } from '../types';
import { RoomStatus, PaymentMethod } from '../types';

export interface KpiData {
  occupancy: number;
  todayIncome: number;
  monthIncome: number;
  adr: number;
  revpar: number;
  checkInsToday: number;
  checkOutsToday: number;
}

export interface RevenueDay {
  label: string;
  value: number;
}

export interface PaymentSegment {
  label: string;
  value: number;
  color: string;
}

export interface OccupancyStatus {
  label: string;
  count: number;
  color: string;
}

export interface ActivityItem {
  time: string;
  room: string;
  guest: string;
  action: string;
  type: 'checkin' | 'checkout' | 'income' | 'expense' | 'report';
}

export function useDashboardStats(
  rooms: Room[],
  cashTransactions: CashTransaction[],
  dailyReports: DailyReport[]
) {
  return useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const occupiedCount = rooms.filter(r => r.status === RoomStatus.Occupied).length;
    const cleaningCount = rooms.filter(r => r.status === RoomStatus.Cleaning).length;

    const incomeTxns = cashTransactions.filter(t => t.type === 'income');
    const checkoutTxns = cashTransactions.filter(t => t.origin === 'checkout');

    const monthIncomeTxns = incomeTxns.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const kpis: KpiData = {
      occupancy: rooms.length > 0 ? Math.round(((occupiedCount + cleaningCount) / rooms.length) * 100) : 0,
      todayIncome: incomeTxns.filter(t => t.date === today).reduce((s, t) => s + t.amount, 0),
      monthIncome: monthIncomeTxns.reduce((s, t) => s + t.amount, 0),
      adr: 0,
      revpar: 0,
      checkInsToday: rooms.filter(r => r.guest?.checkInDate === today).length,
      checkOutsToday: checkoutTxns.filter(t => t.date === today).length,
    };

    const totalNights = checkoutTxns.reduce((s, t) => s + (t.numberOfNights || 0), 0);
    const totalRevenue = checkoutTxns.reduce((s, t) => s + t.amount, 0);
    kpis.adr = totalNights > 0 ? Math.round(totalRevenue / totalNights) : 0;

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const availableRoomNights = rooms.length * daysInMonth;
    kpis.revpar = availableRoomNights > 0 ? Math.round(kpis.monthIncome / availableRoomNights * 100) / 100 : 0;

    const revenueDays: RevenueDay[] = [];
    const dayLabels = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = dayLabels[d.getDay()];
      const amount = incomeTxns.filter(t => t.date === dateStr).reduce((s, t) => s + t.amount, 0);
      revenueDays.push({ label: dayLabel, value: amount });
    }

    const paymentMethods: PaymentSegment[] = [
      { label: PaymentMethod.Cash, value: 0, color: '#10b981' },
      { label: PaymentMethod.Card, value: 0, color: '#6366f1' },
      { label: PaymentMethod.Transfer, value: 0, color: '#f59e0b' },
    ];

    monthIncomeTxns.forEach(t => {
      const pm = paymentMethods.find(p => p.label === t.paymentMethod);
      if (pm) pm.value += t.amount;
    });

    const statusCounts: OccupancyStatus[] = [
      { label: 'Ocupadas', count: occupiedCount, color: '#ef4444' },
      { label: 'Disponibles', count: rooms.filter(r => r.status === RoomStatus.Available).length, color: '#10b981' },
      { label: 'Limpieza', count: cleaningCount, color: '#eab308' },
      { label: 'Mantenimiento', count: rooms.filter(r => r.status === RoomStatus.Maintenance).length, color: '#3b82f6' },
      { label: 'Reservadas', count: rooms.filter(r => r.status === RoomStatus.Reserved).length, color: '#a855f7' },
    ];

    const activities: ActivityItem[] = [];

    rooms.filter(r => r.guest?.checkInDate === today && r.status === RoomStatus.Occupied).forEach(r => {
      activities.push({
        time: today,
        room: `#${r.id}`,
        guest: r.guest!.name,
        action: 'Check-In',
        type: 'checkin',
      });
    });

    checkoutTxns.filter(t => t.date === today).forEach(t => {
      activities.push({
        time: today,
        room: `#${t.roomId}`,
        guest: t.guestName || '',
        action: 'Check-Out',
        type: 'checkout',
      });
    });

    cashTransactions.slice(0, 10).forEach(t => {
      activities.push({
        time: t.date.split('T')[0],
        room: '',
        guest: '',
        action: t.type === 'income' ? `Ingreso: $${t.amount}` : t.type === 'expense' ? `Gasto: $${t.amount}` : 'Fondo inicial',
        type: t.type as 'income' | 'expense',
      });
    });

    if (dailyReports.length > 0) {
      const lastReport = dailyReports[0];
      activities.push({
        time: lastReport.date,
        room: '',
        guest: '',
        action: `Corte de caja: $${lastReport.totalIncome}`,
        type: 'report',
      });
    }

    activities.sort((a, b) => b.time.localeCompare(a.time));
    const recentActivity = activities.slice(0, 15);

    return { kpis, revenueDays, paymentMethods, statusCounts, recentActivity };
  }, [rooms, cashTransactions, dailyReports]);
}
