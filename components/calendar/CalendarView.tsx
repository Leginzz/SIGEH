import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { Room } from '../../types';
import { RoomStatus } from '../../types';
import { useCalendarData, type DayInfo, type RoomRowData, type StayInterval, type KpiData } from './useCalendarData';
import { CalendarToolbar } from './CalendarToolbar';

interface CalendarViewProps {
  rooms: Room[];
  onSelectRoom?: (room: Room) => void;
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

function getBgClass(status: string): string {
  switch (status) {
    case 'occupied': return 'bg-blue-100';
    case 'available': return 'bg-emerald-50';
    case 'reserved': return 'bg-amber-100';
    case 'cleaning': return 'bg-gray-100';
    case 'maintenance': return 'bg-red-100';
    default: return 'bg-emerald-50';
  }
}

function getDayStatusForDate(room: Room, dateStr: string): string {
  if (room.status === RoomStatus.Maintenance) return 'maintenance';
  if (room.status === RoomStatus.Cleaning) return 'cleaning';
  if (room.guest && dateStr >= room.guest.checkInDate && dateStr < room.guest.checkOutDate) return 'occupied';
  if (room.reservations?.some(r => dateStr >= r.checkInDate && dateStr < r.checkOutDate)) return 'reserved';
  if (room.status === RoomStatus.Occupied) return 'occupied';
  return 'available';
}

function isDayCovered(dayIndex: number, intervals: StayInterval[]): boolean {
  const col = dayIndex + 2;
  return intervals.some(inv => col >= inv.gridStart && col < inv.gridEnd);
}

function CalendarKPI({ kpis }: { kpis: KpiData }) {
  const items = [
    { label: 'Ocupadas', value: kpis.occupied, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
    { label: 'Disponibles', value: kpis.available, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    { label: 'Reservadas', value: kpis.reserved, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
    { label: 'Mantenimiento', value: kpis.maintenance, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200' },
    { label: 'Ocupación', value: `${kpis.occupancyRate}%`, color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
  ];
  return (
    <div className="flex gap-2 flex-wrap">
      {items.map(item => (
        <div key={item.label} className={`${item.bg} ${item.border} border rounded-lg px-3 py-1.5 flex items-center gap-2`}>
          <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500">{item.label}</span>
          <span className={`text-base font-bold ${item.color}`}>{item.value}</span>
        </div>
      ))}
    </div>
  );
}

interface TooltipData {
  interval: StayInterval;
  roomLabel: string;
  barRect: DOMRect;
}

function OccupancyTooltip({ data, onClose }: { data: TooltipData; onClose: () => void }) {
  const { interval, roomLabel } = data;
  const guest = interval.guest;

  const checkIn = new Date(guest.checkInDate + 'T00:00:00');
  const checkOut = new Date(guest.checkOutDate + 'T00:00:00');
  const nights = Math.max(1, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
  const paid = guest.payments?.reduce((s, p) => s + p.amount, 0) ?? guest.amountPaidAtCheckIn ?? 0;
  const pending = Math.max(0, guest.totalAgreedPrice - paid);

  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, above: true });

  useEffect(() => {
    if (!tooltipRef.current) return;
    const tip = tooltipRef.current;
    const tipRect = tip.getBoundingClientRect();
    const spaceAbove = data.barRect.top;
    const spaceBelow = window.innerHeight - data.barRect.bottom;
    const above = spaceAbove > spaceBelow || spaceAbove > 180;

    setPosition({
      top: above ? data.barRect.top - 8 : data.barRect.bottom + 8,
      left: data.barRect.left + data.barRect.width / 2,
      above,
    });
  }, [data]);

  return (
    <div
      ref={tooltipRef}
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 py-2.5 px-3 text-xs min-w-[200px] pointer-events-auto"
      style={{
        left: position.left,
        top: position.top,
        transform: 'translate(-50%, 0)',
      }}
      onMouseEnter={() => {}}
      onMouseLeave={onClose}
    >
      <div className="font-semibold text-gray-900 text-sm mb-2 border-b border-gray-100 pb-1.5">{roomLabel}</div>
      <div className="space-y-1">
        <Row label="Huésped" value={guest.name} />
        <Row label="Check-In" value={guest.checkInDate} />
        <Row label="Check-Out" value={guest.checkOutDate} />
        <Row label="Noches" value={`${nights}`} />
        {pending > 0 && (
          <div className="flex justify-between gap-4 pt-1 border-t border-gray-100 mt-1">
            <span className="text-gray-500">Saldo pendiente</span>
            <span className="font-bold text-red-600">${pending.toFixed(2)}</span>
          </div>
        )}
        <Row label="Método de pago" value={guest.paymentMethod || '—'} />
        <Row
          label="Estado"
          value={interval.type === 'occupied' ? 'Ocupada' : 'Reservada'}
          valueClass={interval.type === 'occupied' ? 'text-blue-600 font-medium' : 'text-amber-600 font-medium'}
        />
      </div>
    </div>
  );
}

function Row({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-500 whitespace-nowrap">{label}</span>
      <span className={`text-gray-900 text-right ${valueClass || ''}`}>{value}</span>
    </div>
  );
}

function CalendarGrid({
  days,
  roomRows,
  onSelectRoom,
}: {
  days: DayInfo[];
  roomRows: RoomRowData[];
  onSelectRoom?: (room: Room) => void;
}) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const hideTimeout = useRef<number | null>(null);

  const showTooltip = useCallback((data: TooltipData) => {
    if (hideTimeout.current) clearTimeout(hideTimeout.current);
    setTooltip(data);
  }, []);

  const hideTooltip = useCallback(() => {
    hideTimeout.current = window.setTimeout(() => setTooltip(null), 100);
  }, []);

  useEffect(() => {
    return () => {
      if (hideTimeout.current) clearTimeout(hideTimeout.current);
    };
  }, []);

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <div
        className="grid gap-0"
        style={{
          gridTemplateColumns: `128px repeat(${days.length}, minmax(24px, 1fr))`,
          minWidth: `${128 + days.length * 24}px`,
        }}
      >
        <div className="sticky left-0 z-20 bg-white px-1.5 py-1.5 text-[9px] font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200 border-r border-gray-100">
          Habitaci\u00f3n
        </div>
        {days.map((day, i) => (
          <div
            key={day.date}
            className={`text-center border-b border-gray-200 py-1 ${day.isToday ? 'bg-indigo-50/50' : ''}`}
            style={{ gridColumn: i + 2, gridRow: 1 }}
          >
            <div className="text-[8px] text-gray-400 leading-tight">{day.dayName}</div>
            <div className={`text-[11px] leading-tight ${day.isToday ? 'font-bold text-indigo-700' : 'text-gray-700'}`}>
              {day.day}
            </div>
          </div>
        ))}

        {roomRows.map((row, ri) => {
          const gridRow = ri + 2;
          if (row.isUniformStatus) {
            const color = row.uniformStatus === 'maintenance' ? 'bg-red-100' : 'bg-gray-100';
            return (
              <React.Fragment key={row.room.id}>
                <RoomLabel label={row.label} gridRow={gridRow} />
                <div className={`h-6 rounded-sm ${color}`} style={{ gridColumn: `2 / ${days.length + 2}`, gridRow }} />
              </React.Fragment>
            );
          }

          return (
            <React.Fragment key={row.room.id}>
              <RoomLabel label={row.label} gridRow={gridRow} />
              {days.map((day, di) => {
                if (isDayCovered(di, row.intervals)) return null;
                const status = getDayStatusForDate(row.room, day.date);
                return (
                  <div
                    key={day.date}
                    className={`h-6 ${getBgClass(status)} border-b border-gray-50`}
                    style={{ gridColumn: di + 2, gridRow }}
                  />
                );
              })}
              {row.intervals.map((inv, ii) => (
                <div
                  key={ii}
                  className={`h-6 rounded-sm cursor-pointer transition-all duration-100 hover:brightness-110 hover:shadow-sm relative z-[1] ${
                    inv.type === 'occupied' ? 'bg-blue-500' : 'bg-amber-400'
                  }`}
                  style={{ gridColumn: `${inv.gridStart} / ${inv.gridEnd}`, gridRow }}
                  onClick={() => onSelectRoom?.(row.room)}
                  onMouseEnter={e => {
                    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                    showTooltip({ interval: inv, roomLabel: row.label, barRect: rect });
                  }}
                  onMouseLeave={hideTooltip}
                />
              ))}
            </React.Fragment>
          );
        })}
      </div>

      {tooltip && (
        <OccupancyTooltip data={tooltip} onClose={() => setTooltip(null)} />
      )}
    </div>
  );
}

function RoomLabel({ label, gridRow }: { label: string; gridRow: number }) {
  return (
    <div
      className="sticky left-0 z-10 bg-white px-1.5 flex items-center text-[11px] font-medium text-gray-900 border-b border-gray-100 border-r border-gray-100"
      style={{ gridColumn: 1, gridRow }}
    >
      {label}
    </div>
  );
}

export function CalendarView({ rooms, onSelectRoom }: CalendarViewProps) {
  const today = new Date();
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [baseDate, setBaseDate] = useState(() => getMonday(today));
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilters, setStatusFilters] = useState<Set<string>>(new Set());

  const { days, roomRows, kpis, periodLabel, totalColumns } = useCalendarData(
    rooms, viewMode, baseDate, searchQuery, statusFilters,
  );

  const handleNavigate = useCallback((dir: 'prev' | 'next' | 'today') => {
    if (dir === 'today') {
      const d = new Date();
      setBaseDate(viewMode === 'week' ? getMonday(d) : new Date(d.getFullYear(), d.getMonth(), 1));
    } else {
      setBaseDate(prev => {
        const d = new Date(prev);
        if (viewMode === 'week') d.setDate(d.getDate() + (dir === 'prev' ? -7 : 7));
        else d.setMonth(d.getMonth() + (dir === 'prev' ? -1 : 1));
        return d;
      });
    }
  }, [viewMode]);

  const handleViewModeChange = useCallback((mode: 'week' | 'month') => {
    setViewMode(mode);
    const d = new Date();
    setBaseDate(mode === 'week' ? getMonday(baseDate) : new Date(baseDate.getFullYear(), baseDate.getMonth(), 1));
  }, [baseDate]);

  const handleDateSelect = useCallback((date: Date) => {
    setBaseDate(viewMode === 'week' ? getMonday(date) : new Date(date.getFullYear(), date.getMonth(), 1));
  }, [viewMode]);

  const toggleFilter = useCallback((status: string) => {
    setStatusFilters(prev => {
      const next = new Set(prev);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      if (next.size === 5) return new Set();
      return next;
    });
  }, []);

  return (
    <div className="space-y-3">
      <CalendarKPI kpis={kpis} />
      <CalendarToolbar
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onNavigate={handleNavigate}
        periodLabel={periodLabel}
        baseDate={baseDate}
        onDateSelect={handleDateSelect}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilters={statusFilters}
        onFilterToggle={toggleFilter}
      />
      <CalendarGrid
        days={days}
        roomRows={roomRows}
        onSelectRoom={onSelectRoom}
      />
      {roomRows.length === 0 && (
        <div className="text-center py-12 text-gray-400 text-sm">
          {searchQuery || statusFilters.size > 0
            ? 'No se encontraron habitaciones con los filtros actuales.'
            : 'No hay habitaciones registradas.'}
        </div>
      )}
    </div>
  );
}
