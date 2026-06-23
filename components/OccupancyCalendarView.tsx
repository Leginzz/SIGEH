import React, { useState, useMemo } from 'react';
import type { Room, Guest } from '../types';
import { RoomStatus } from '../types';

interface OccupancyCalendarViewProps {
  rooms: Room[];
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
  const diff = day === 0 ? -6 : 1 - day;
  r.setDate(r.getDate() + diff);
  return r;
}

function getMonthRange(year: number, month: number): { start: Date; end: Date } {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return { start, end };
}

interface DayCell {
  date: string;
  day: number;
  isToday: boolean;
  isWeekend: boolean;
}

interface CellStatus {
  status: 'available' | 'occupied' | 'reserved' | 'cleaning' | 'maintenance';
  guest?: Guest;
  reservation?: Guest;
}

const CELL_COLORS: Record<string, string> = {
  available: 'bg-emerald-200 border-emerald-300',
  occupied: 'bg-blue-200 border-blue-300',
  reserved: 'bg-amber-200 border-amber-300',
  cleaning: 'bg-gray-200 border-gray-300',
  maintenance: 'bg-red-200 border-red-300',
};

const CELL_LABELS: Record<string, string> = {
  available: 'Disponible',
  occupied: 'Ocupada',
  reserved: 'Reservada',
  cleaning: 'En Limpieza',
  maintenance: 'Mantenimiento',
};

function isDateBetween(date: string, start: string, end: string): boolean {
  return date >= start && date < end;
}

const OccupancyCalendarView: React.FC<OccupancyCalendarViewProps> = ({ rooms }) => {
  const today = new Date();
  const todayStr = formatDate(today);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [baseDate, setBaseDate] = useState(() => getMonday(today));
  const [selectedCell, setSelectedCell] = useState<{ roomId: number; date: string; status: CellStatus } | null>(null);

  const days = useMemo((): DayCell[] => {
    if (viewMode === 'week') {
      return Array.from({ length: 7 }, (_, i) => {
        const d = addDays(baseDate, i);
        return { date: formatDate(d), day: d.getDate(), isToday: formatDate(d) === todayStr, isWeekend: d.getDay() === 0 || d.getDay() === 6 };
      });
    } else {
      const { start, end } = getMonthRange(baseDate.getFullYear(), baseDate.getMonth());
      const count = end.getDate();
      return Array.from({ length: count }, (_, i) => {
        const d = addDays(start, i);
        return { date: formatDate(d), day: d.getDate(), isToday: formatDate(d) === todayStr, isWeekend: d.getDay() === 0 || d.getDay() === 6 };
      });
    }
  }, [baseDate, viewMode, todayStr]);

  const cells = useMemo((): Map<string, Map<number, CellStatus>> => {
    const byDate = new Map<string, Map<number, CellStatus>>();
    for (const day of days) {
      const byRoom = new Map<number, CellStatus>();
      for (const room of rooms) {
        const rStatus = room.status;
        const guest = room.guest;
        const reservations = room.reservations || [];

        if (rStatus === RoomStatus.Maintenance) {
          byRoom.set(room.id, { status: 'maintenance' });
        } else if (rStatus === RoomStatus.Cleaning) {
          byRoom.set(room.id, { status: 'cleaning' });
        } else if (guest && isDateBetween(day.date, guest.checkInDate, guest.checkOutDate)) {
          byRoom.set(room.id, { status: 'occupied', guest });
        } else {
          const matchingReservation = reservations.find(r => isDateBetween(day.date, r.checkInDate, r.checkOutDate));
          if (matchingReservation) {
            byRoom.set(room.id, { status: 'reserved', reservation: matchingReservation });
          } else if (rStatus === RoomStatus.Occupied) {
            byRoom.set(room.id, { status: 'occupied', guest: guest || undefined });
          } else {
            byRoom.set(room.id, { status: 'available' });
          }
        }
      }
      byDate.set(day.date, byRoom);
    }
    return byDate;
  }, [days, rooms]);

  const kpis = useMemo(() => {
    const currentDay = cells.get(todayStr);
    let occupied = 0, available = 0, reserved = 0, maintenance = 0;
    if (currentDay) {
      currentDay.forEach(c => {
        if (c.status === 'occupied') occupied++;
        else if (c.status === 'available') available++;
        else if (c.status === 'reserved') reserved++;
        else if (c.status === 'maintenance') maintenance++;
      });
    }
    const total = rooms.length;
    return { occupied, available, reserved, maintenance, occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0 };
  }, [cells, todayStr, rooms.length]);

  const navigate = (direction: 'prev' | 'next' | 'today') => {
    if (direction === 'today') {
      setBaseDate(viewMode === 'week' ? getMonday(today) : new Date(today.getFullYear(), today.getMonth(), 1));
    } else if (viewMode === 'week') {
      setBaseDate(prev => addDays(prev, direction === 'prev' ? -7 : 7));
    } else {
      setBaseDate(prev => {
        const d = new Date(prev);
        d.setMonth(d.getMonth() + (direction === 'prev' ? -1 : 1));
        return d;
      });
    }
  };

  const periodLabel = viewMode === 'week'
    ? `${days[0]?.date} - ${days[days.length - 1]?.date}`
    : `${MONTH_NAMES[baseDate.getMonth()]} ${baseDate.getFullYear()}`;

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-5 gap-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <p className="text-xs text-blue-600 font-medium uppercase tracking-wider">Ocupadas</p>
          <p className="text-2xl font-bold text-blue-700">{kpis.occupied}</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
          <p className="text-xs text-emerald-600 font-medium uppercase tracking-wider">Disponibles</p>
          <p className="text-2xl font-bold text-emerald-700">{kpis.available}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
          <p className="text-xs text-amber-600 font-medium uppercase tracking-wider">Reservadas</p>
          <p className="text-2xl font-bold text-amber-700">{kpis.reserved}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
          <p className="text-xs text-red-600 font-medium uppercase tracking-wider">Mantenimiento</p>
          <p className="text-2xl font-bold text-red-700">{kpis.maintenance}</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 text-center">
          <p className="text-xs text-indigo-600 font-medium uppercase tracking-wider">Ocupación</p>
          <p className="text-2xl font-bold text-indigo-700">{kpis.occupancyRate}%</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('prev')} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            ← Anterior
          </button>
          <button onClick={() => navigate('today')} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
            Hoy
          </button>
          <button onClick={() => navigate('next')} className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            Siguiente →
          </button>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-gray-900">{periodLabel}</span>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => { setViewMode('week'); setBaseDate(getMonday(baseDate)); }}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${viewMode === 'week' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              Semana
            </button>
            <button onClick={() => { setViewMode('month'); setBaseDate(new Date(baseDate.getFullYear(), baseDate.getMonth(), 1)); }}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${viewMode === 'month' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              Mes
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-collapse" style={{ minWidth: days.length * 36 + 100 }}>
            <thead>
              <tr>
                <th className="sticky left-0 bg-white z-10 px-1.5 py-1 text-left font-medium text-gray-500 border-b border-gray-200 text-[10px]" style={{ minWidth: 100 }}>
                  Habitación
                </th>
                {days.map(d => (
                  <th key={d.date} className={`px-0.5 py-1 text-center font-medium border-b border-gray-200 ${d.isToday ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500'}`}>
                    <div className="text-[9px] leading-tight">{DAY_NAMES[new Date(d.date + 'T00:00:00').getDay()]}</div>
                    <div className={`text-xs leading-tight ${d.isToday ? 'font-bold' : ''}`}>{d.day}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rooms.map(room => {
                const roomCells = days.map(d => cells.get(d.date)?.get(room.id));
                return (
                  <tr key={room.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="sticky left-0 bg-white z-10 px-1.5 py-0.5 font-medium text-gray-900 border-r border-gray-100 text-[10px] leading-tight">
                      {room.id}
                    </td>
                    {roomCells.map((cell, i) => {
                      if (!cell) return <td key={i} className="border-r border-gray-50 p-1" />;
                      const guestName = cell.guest?.name || cell.reservation?.name || '';
                      const colorClass = CELL_COLORS[cell.status] || CELL_COLORS.available;
                      return (
                        <td key={i} className="border-r border-gray-50 p-px">
                          <button
                            onClick={() => setSelectedCell({ roomId: room.id, date: days[i].date, status: cell })}
                            className={`w-full h-7 rounded-[3px] border ${colorClass} transition-opacity hover:opacity-80 cursor-pointer`}
                            title={`Hab. ${room.id} - ${CELL_LABELS[cell.status]}${guestName ? ` - ${guestName}` : ''}`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-600">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-200 border border-emerald-300 inline-block" /> Disponible</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-200 border border-blue-300 inline-block" /> Ocupada</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-200 border border-amber-300 inline-block" /> Reservada</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-gray-200 border border-gray-300 inline-block" /> Limpieza</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-200 border border-red-300 inline-block" /> Mantenimiento</span>
      </div>

      {/* Cell Detail Modal */}
      {selectedCell && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50" onClick={() => setSelectedCell(null)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm m-4 p-6 border border-gray-200" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                Hab. {selectedCell.roomId}
              </h3>
              <button onClick={() => setSelectedCell(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <p className="text-sm text-gray-500 mb-1">{selectedCell.date}</p>
            <p className="text-sm font-medium text-gray-700 mb-4">
              Estado: <span className="font-bold">{CELL_LABELS[selectedCell.status.status]}</span>
            </p>
            {selectedCell.status.guest && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Huésped</span><span className="font-semibold text-gray-900">{selectedCell.status.guest.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Check-In</span><span className="text-gray-700">{selectedCell.status.guest.checkInDate}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Check-Out</span><span className="text-gray-700">{selectedCell.status.guest.checkOutDate}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="font-semibold text-gray-900">${selectedCell.status.guest.totalAgreedPrice.toFixed(2)}</span></div>
                {(() => {
                  const paid = selectedCell.status.guest!.payments?.reduce((s, p) => s + p.amount, 0) ?? selectedCell.status.guest!.amountPaidAtCheckIn ?? 0;
                  const pending = selectedCell.status.guest!.totalAgreedPrice - paid;
                  return pending > 0 ? (
                    <div className="flex justify-between"><span className="text-gray-500">Saldo pendiente</span><span className="font-bold text-red-600">${pending.toFixed(2)}</span></div>
                  ) : null;
                })()}
                <div className="flex justify-between"><span className="text-gray-500">Contacto</span><span className="text-gray-700">{selectedCell.status.guest.contact}</span></div>
              </div>
            )}
            {selectedCell.status.reservation && (
              <div className="bg-amber-50 rounded-lg p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Huésped</span><span className="font-semibold text-gray-900">{selectedCell.status.reservation.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Check-In</span><span className="text-gray-700">{selectedCell.status.reservation.checkInDate}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Check-Out</span><span className="text-gray-700">{selectedCell.status.reservation.checkOutDate}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Total acordado</span><span className="font-semibold text-gray-900">${selectedCell.status.reservation.totalAgreedPrice.toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Contacto</span><span className="text-gray-700">{selectedCell.status.reservation.contact}</span></div>
              </div>
            )}
            {selectedCell.status.status === 'available' && (
              <div className="bg-emerald-50 rounded-lg p-4 text-center text-sm text-emerald-700">
                Habitación disponible
              </div>
            )}
            {selectedCell.status.status === 'cleaning' && (
              <div className="bg-gray-50 rounded-lg p-4 text-center text-sm text-gray-600">
                Habitación en limpieza
              </div>
            )}
            {selectedCell.status.status === 'maintenance' && (
              <div className="bg-red-50 rounded-lg p-4 text-center text-sm text-red-600">
                Habitación en mantenimiento
              </div>
            )}
            <button onClick={() => setSelectedCell(null)}
              className="mt-4 w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg transition-colors text-sm">
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OccupancyCalendarView;
