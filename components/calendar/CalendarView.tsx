import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import type { Room } from '../../types';
import { RoomStatus } from '../../types';
import { useCalendarData, type DayInfo, type RoomRowData, type StayInterval, type KpiData } from './useCalendarData';
import { CalendarToolbar } from './CalendarToolbar';

interface CalendarViewProps {
  rooms: Room[];
  onSelectRoom?: (room: Room) => void;
}

function getMonday(d: Date): Date {
  const r = new Date(d);
  const day = r.getDay();
  r.setDate(r.getDate() + (day === 0 ? -6 : 1 - day));
  return r;
}

function getDayBg(status: string): string {
  const map: Record<string, string> = {
    occupied: 'bg-indigo-100', available: 'bg-emerald-50', reserved: 'bg-amber-100',
    cleaning: 'bg-gray-100', maintenance: 'bg-red-100',
  };
  return map[status] || 'bg-emerald-50';
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

const KPI_ITEMS = (k: KpiData) => [
  { label: 'Ocupadas', value: k.occupied, color: 'text-indigo-700', bg: 'bg-indigo-50' },
  { label: 'Disponibles', value: k.available, color: 'text-emerald-700', bg: 'bg-emerald-50' },
  { label: 'Reservadas', value: k.reserved, color: 'text-amber-700', bg: 'bg-amber-50' },
  { label: 'Mantenimiento', value: k.maintenance, color: 'text-red-700', bg: 'bg-red-50' },
  { label: 'Check-In', value: k.checkInsToday, color: 'text-emerald-700', bg: 'bg-emerald-50' },
  { label: 'Check-Out', value: k.checkOutsToday, color: 'text-orange-700', bg: 'bg-orange-50' },
  { label: 'Ocupación', value: `${k.occupancyRate}%`, color: 'text-indigo-700', bg: 'bg-indigo-50' },
];

function CalendarKPI({ kpis }: { kpis: KpiData }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {KPI_ITEMS(kpis).map(item => (
        <div key={item.label} className={`${item.bg} rounded-lg px-3 py-1.5 flex items-center gap-2`}>
          <span className="text-[10px] font-medium uppercase text-gray-500">{item.label}</span>
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

  const tipRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (!tipRef.current) return;
    const tr = tipRef.current.getBoundingClientRect();
    const above = data.barRect.top > window.innerHeight / 2;
    setPos({
      top: above ? data.barRect.top - tr.height - 8 : data.barRect.bottom + 8,
      left: data.barRect.left + data.barRect.width / 2,
    });
  }, [data]);

  return (
    <div ref={tipRef}
      className="fixed z-50 bg-white rounded-lg border border-gray-200 py-2.5 px-3 text-xs min-w-[180px] pointer-events-auto"
      style={{ left: pos.left, top: pos.top, transform: 'translate(-50%, 0)' }}
      onMouseEnter={() => {}} onMouseLeave={onClose}>
      <div className="font-semibold text-gray-900 text-sm mb-2 border-b border-gray-100 pb-1.5">{roomLabel}</div>
      <div className="space-y-1">
        <Row label="Huésped" value={guest.name} />
        <Row label="Check-In" value={guest.checkInDate} />
        <Row label="Check-Out" value={guest.checkOutDate} />
        <Row label="Noches" value={`${nights}`} />
        {pending > 0 && (
          <div className="flex justify-between pt-1 border-t border-gray-100 mt-1">
            <span className="text-gray-500">Saldo pendiente</span>
            <span className="font-bold text-red-600">${pending.toFixed(2)}</span>
          </div>
        )}
        <Row label="Pago" value={guest.paymentMethod || '—'} />
        <Row label="Estado" value={interval.type === 'occupied' ? 'Ocupada' : 'Reservada'}
          valueClass={interval.type === 'occupied' ? 'text-indigo-600 font-medium' : 'text-amber-600 font-medium'} />
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
  days, roomRows, onSelectRoom,
}: {
  days: DayInfo[];
  roomRows: RoomRowData[];
  onSelectRoom?: (room: Room) => void;
}) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const hideTimeout = useRef<number | null>(null);
  const show = useCallback((d: TooltipData) => { if (hideTimeout.current) clearTimeout(hideTimeout.current); setTooltip(d); }, []);
  const hide = useCallback(() => { hideTimeout.current = window.setTimeout(() => setTooltip(null), 100); }, []);
  useEffect(() => () => { if (hideTimeout.current) clearTimeout(hideTimeout.current); }, []);

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <div className="grid gap-0" style={{ gridTemplateColumns: `100px repeat(${days.length}, minmax(22px, 1fr))`, minWidth: `${100 + days.length * 22}px` }}>
        <div className="sticky left-0 z-20 bg-white px-1.5 py-1 text-[9px] font-semibold text-gray-500 uppercase border-b border-gray-200 border-r border-gray-100">Hab</div>
        {days.map((day, i) => (
          <div key={day.date} className={`text-center border-b border-gray-200 py-0.5 ${day.isToday ? 'bg-indigo-50/50' : ''}`} style={{ gridColumn: i + 2, gridRow: 1 }}>
            <div className="text-[8px] text-gray-400 leading-tight">{day.dayName}</div>
            <div className={`text-[10px] leading-tight ${day.isToday ? 'font-bold text-indigo-700' : 'text-gray-700'}`}>{day.day}</div>
          </div>
        ))}

        {roomRows.map((row, ri) => {
          const gr = ri + 2;
          if (row.isUniformStatus) {
            const color = row.uniformStatus === 'maintenance' ? 'bg-red-100' : 'bg-gray-100';
            return (
              <React.Fragment key={row.room.id}>
                <RoomLabel label={row.label} gridRow={gr} />
                <div className={`h-5 rounded-sm ${color}`} style={{ gridColumn: `2 / ${days.length + 2}`, gridRow: gr }} />
              </React.Fragment>
            );
          }
          return (
            <React.Fragment key={row.room.id}>
              <RoomLabel label={row.label} gridRow={gr} />
              {days.map((day, di) => {
                if (isDayCovered(di, row.intervals)) return null;
                return <div key={day.date} className={`h-5 ${getDayBg(getDayStatusForDate(row.room, day.date))}`} style={{ gridColumn: di + 2, gridRow: gr }} />;
              })}
              {row.intervals.map((inv, ii) => (
                <div key={ii}
                  className={`h-5 rounded-sm cursor-pointer transition-all hover:brightness-110 relative z-[1] ${inv.type === 'occupied' ? 'bg-indigo-500' : 'bg-amber-400'}`}
                  style={{ gridColumn: `${inv.gridStart} / ${inv.gridEnd}`, gridRow: gr }}
                  onClick={() => onSelectRoom?.(row.room)}
                  onMouseEnter={e => show({ interval: inv, roomLabel: row.label, barRect: (e.currentTarget as HTMLElement).getBoundingClientRect() })}
                  onMouseLeave={hide} />
              ))}
            </React.Fragment>
          );
        })}
      </div>
      {tooltip && <OccupancyTooltip data={tooltip} onClose={() => setTooltip(null)} />}
    </div>
  );
}

function RoomLabel({ label, gridRow }: { label: string; gridRow: number }) {
  return (
    <div className="sticky left-0 z-10 bg-white px-1.5 flex items-center text-[11px] font-medium text-gray-900 border-b border-gray-100 border-r border-gray-100"
      style={{ gridColumn: 1, gridRow }}>
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
  const [floorFilter, setFloorFilter] = useState<number | null>(null);

  const totalFloors = useMemo(() => rooms.reduce((m, r) => Math.max(m, r.floor), 0), [rooms]);

  const { days, roomRows, kpis, periodLabel } = useCalendarData(rooms, viewMode, baseDate, searchQuery, statusFilters, floorFilter);

  const handleNavigate = useCallback((dir: 'prev' | 'next' | 'today') => {
    if (dir === 'today') { const d = new Date(); setBaseDate(viewMode === 'week' ? getMonday(d) : new Date(d.getFullYear(), d.getMonth(), 1)); }
    else setBaseDate(prev => { const d = new Date(prev); viewMode === 'week' ? d.setDate(d.getDate() + (dir === 'prev' ? -7 : 7)) : d.setMonth(d.getMonth() + (dir === 'prev' ? -1 : 1)); return d; });
  }, [viewMode]);

  const handleViewModeChange = useCallback((mode: 'week' | 'month') => { setViewMode(mode); setBaseDate(mode === 'week' ? getMonday(baseDate) : new Date(baseDate.getFullYear(), baseDate.getMonth(), 1)); }, [baseDate]);

  const handleDateSelect = useCallback((date: Date) => { setBaseDate(viewMode === 'week' ? getMonday(date) : new Date(date.getFullYear(), date.getMonth(), 1)); }, [viewMode]);

  const toggleFilter = useCallback((status: string) => {
    setStatusFilters(prev => { const n = new Set(prev); n.has(status) ? n.delete(status) : n.add(status); if (n.size === 5) return new Set(); return n; });
  }, []);

  return (
    <div className="space-y-3">
      <CalendarKPI kpis={kpis} />
      <CalendarToolbar viewMode={viewMode} onViewModeChange={handleViewModeChange} onNavigate={handleNavigate}
        periodLabel={periodLabel} baseDate={baseDate} onDateSelect={handleDateSelect}
        searchQuery={searchQuery} onSearchChange={setSearchQuery} statusFilters={statusFilters}
        onFilterToggle={toggleFilter} floorFilter={floorFilter} onFloorFilterChange={setFloorFilter} totalFloors={totalFloors} />
      {roomRows.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm border border-gray-200 rounded-xl bg-white">
          {searchQuery || statusFilters.size > 0 ? 'No se encontraron habitaciones con los filtros actuales.' : 'No hay habitaciones registradas.'}
        </div>
      ) : <CalendarGrid days={days} roomRows={roomRows} onSelectRoom={onSelectRoom} />}
    </div>
  );
}