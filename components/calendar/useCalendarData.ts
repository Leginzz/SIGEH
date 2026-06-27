import { useMemo } from 'react';
import type { Room, Guest } from '../../types';
import { RoomStatus } from '../../types';

export interface DayInfo {
  date: string;
  day: number;
  isToday: boolean;
  isWeekend: boolean;
  dayName: string;
}

export interface StayInterval {
  type: 'occupied' | 'reserved';
  guest: Guest;
  gridStart: number;
  gridEnd: number;
}

export interface RoomRowData {
  room: Room;
  label: string;
  isUniformStatus: boolean;
  uniformStatus: 'maintenance' | 'cleaning' | null;
  intervals: StayInterval[];
}

export interface KpiData {
  occupied: number;
  available: number;
  reserved: number;
  maintenance: number;
  occupancyRate: number;
}

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function getMonday(d: Date): Date {
  const r = new Date(d);
  const day = r.getDay();
  r.setDate(r.getDate() + (day === 0 ? -6 : 1 - day));
  return r;
}

function getMonthRange(year: number, month: number): { start: Date; end: Date } {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return { start, end };
}

function isDateBetween(date: string, start: string, end: string): boolean {
  return date >= start && date < end;
}

function findRange(days: DayInfo[], checkIn: string, checkOut: string): { start: number; end: number } | null {
  let s = -1, e = -1;
  for (let i = 0; i < days.length; i++) {
    if (isDateBetween(days[i].date, checkIn, checkOut)) {
      if (s === -1) s = i;
      e = i + 1;
    }
  }
  return s === -1 ? null : { start: s, end: e };
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function getDayStatusForDate(room: Room, dateStr: string): string {
  if (room.status === RoomStatus.Maintenance) return 'maintenance';
  if (room.status === RoomStatus.Cleaning) return 'cleaning';
  if (room.guest && isDateBetween(dateStr, room.guest.checkInDate, room.guest.checkOutDate)) return 'occupied';
  if (room.reservations?.some(r => isDateBetween(dateStr, r.checkInDate, r.checkOutDate))) return 'reserved';
  if (room.status === RoomStatus.Occupied) return 'occupied';
  return 'available';
}

export function useCalendarData(
  rooms: Room[],
  viewMode: 'week' | 'month',
  baseDate: Date,
  searchQuery: string,
  statusFilters: Set<string>,
) {
  return useMemo(() => {
    const today = new Date();
    const todayStr = formatDate(today);

    const days: DayInfo[] = [];
    if (viewMode === 'week') {
      const monday = getMonday(baseDate);
      for (let i = 0; i < 7; i++) {
        const d = addDays(monday, i);
        days.push({
          date: formatDate(d),
          day: d.getDate(),
          isToday: formatDate(d) === todayStr,
          isWeekend: d.getDay() === 0 || d.getDay() === 6,
          dayName: DAY_NAMES[d.getDay()],
        });
      }
    } else {
      const { start, end } = getMonthRange(baseDate.getFullYear(), baseDate.getMonth());
      const count = end.getDate();
      for (let i = 0; i < count; i++) {
        const d = addDays(start, i);
        days.push({
          date: formatDate(d),
          day: d.getDate(),
          isToday: formatDate(d) === todayStr,
          isWeekend: d.getDay() === 0 || d.getDay() === 6,
          dayName: DAY_NAMES[d.getDay()],
        });
      }
    }

    const todayInRange = days.some(d => d.isToday);

    let roomRows: RoomRowData[] = [];
    const kpis: KpiData = { occupied: 0, available: 0, reserved: 0, maintenance: 0, occupancyRate: 0 };

    for (const room of rooms) {
      const isUniform = room.status === RoomStatus.Maintenance || room.status === RoomStatus.Cleaning;
      const uniformStatus = room.status === RoomStatus.Maintenance ? 'maintenance' as const
        : room.status === RoomStatus.Cleaning ? 'cleaning' as const
        : null;

      const intervals: StayInterval[] = [];

      if (!isUniform) {
        if (room.guest) {
          const range = findRange(days, room.guest.checkInDate, room.guest.checkOutDate);
          if (range) {
            intervals.push({
              type: 'occupied',
              guest: room.guest,
              gridStart: range.start + 2,
              gridEnd: range.end + 2,
            });
          }
        }
        for (const res of (room.reservations || [])) {
          const range = findRange(days, res.checkInDate, res.checkOutDate);
          if (range) {
            intervals.push({
              type: 'reserved',
              guest: res,
              gridStart: range.start + 2,
              gridEnd: range.end + 2,
            });
          }
        }
      }

      roomRows.push({
        room,
        label: `Hab. ${pad(room.id)}`,
        isUniformStatus: isUniform,
        uniformStatus,
        intervals,
      });

      if (todayInRange) {
        const s = getDayStatusForDate(room, todayStr);
        if (s === 'occupied') kpis.occupied++;
        else if (s === 'available') kpis.available++;
        else if (s === 'reserved') kpis.reserved++;
        else if (s === 'maintenance') kpis.maintenance++;
      }
    }

    kpis.occupancyRate = rooms.length > 0 ? Math.round((kpis.occupied / rooms.length) * 100) : 0;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      roomRows = roomRows.filter(r =>
        r.label.toLowerCase().includes(q) ||
        (r.room.guest?.name || '').toLowerCase().includes(q) ||
        r.room.reservations?.some(res => res.name.toLowerCase().includes(q))
      );
    }

    if (statusFilters.size > 0) {
      roomRows = roomRows.filter(r => {
        const s = getDayStatusForDate(r.room, todayStr);
        return s !== null && statusFilters.has(s);
      });
    }

    const weekStart = getMonday(baseDate);
    const weekEnd = addDays(weekStart, 6);
    const friendlyLabel = viewMode === 'week'
      ? `Semana del ${weekStart.getDate()} al ${weekEnd.getDate()} de ${MONTH_NAMES[weekEnd.getMonth()]} ${weekEnd.getFullYear()}`
      : `${MONTH_NAMES[baseDate.getMonth()]} ${baseDate.getFullYear()}`;

    return { days, roomRows, kpis, periodLabel: friendlyLabel, totalColumns: days.length + 1 };
  }, [rooms, viewMode, baseDate, searchQuery, Array.from(statusFilters).sort().join(',')]);
}
