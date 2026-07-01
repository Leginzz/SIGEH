import React from 'react';

interface CalendarToolbarProps {
  viewMode: 'week' | 'month';
  onViewModeChange: (mode: 'week' | 'month') => void;
  onNavigate: (dir: 'prev' | 'next' | 'today') => void;
  periodLabel: string;
  baseDate: Date;
  onDateSelect: (date: Date) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilters: Set<string>;
  onFilterToggle: (status: string) => void;
  floorFilter: number | null;
  onFloorFilterChange: (floor: number | null) => void;
  totalFloors: number;
}

const FILTERS = [
  { key: 'available', label: 'Disponibles', dot: 'bg-emerald-400' },
  { key: 'occupied', label: 'Ocupadas', dot: 'bg-indigo-400' },
  { key: 'reserved', label: 'Reservadas', dot: 'bg-amber-400' },
  { key: 'cleaning', label: 'Limpieza', dot: 'bg-gray-300' },
  { key: 'maintenance', label: 'Mantenimiento', dot: 'bg-red-400' },
];

export function CalendarToolbar({ ...p }: CalendarToolbarProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl">
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-1">
            <button onClick={() => p.onNavigate('prev')}
              className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors">←</button>
            <button onClick={() => p.onNavigate('today')}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors">Hoy</button>
            <button onClick={() => p.onNavigate('next')}
              className="px-2 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-600 hover:bg-gray-50 transition-colors">→</button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900">{p.periodLabel}</span>
            <input type="date" value={p.baseDate.toISOString().split('T')[0]}
              onChange={e => { if (e.target.value) p.onDateSelect(new Date(e.target.value + 'T12:00:00')); }}
              className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 text-gray-600" />
          </div>

          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {(['week', 'month'] as const).map(m => (
              <button key={m} onClick={() => p.onViewModeChange(m)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${p.viewMode === m ? 'bg-white text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
                {m === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 py-2.5 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-1 max-w-[220px]">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-gray-400 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input type="text" placeholder="Buscar habitación o huésped..." value={p.searchQuery}
            onChange={e => p.onSearchChange(e.target.value)}
            className="flex-1 text-xs border-0 outline-none bg-transparent text-gray-700 placeholder-gray-400" />
          {p.searchQuery && (
            <button onClick={() => p.onSearchChange('')} className="text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {FILTERS.map(f => {
            const active = p.statusFilters.size === 0 || p.statusFilters.has(f.key);
            return (
              <button key={f.key} onClick={() => p.onFilterToggle(f.key)}
                className={`flex items-center gap-1 text-xs transition-colors ${active ? 'text-gray-600' : 'text-gray-300'}`}>
                <span className={`w-2 h-2 rounded-full ${f.dot} ${active ? '' : 'opacity-30'}`} />
                {f.label}
              </button>
            );
          })}
        </div>

        <select value={p.floorFilter ?? ''}
          onChange={e => p.onFloorFilterChange(e.target.value ? Number(e.target.value) : null)}
          className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 text-gray-600 bg-white">
          <option value="">Todos los pisos</option>
          {Array.from({ length: p.totalFloors }, (_, i) => i + 1).map(f => (
            <option key={f} value={f}>Piso {f}</option>
          ))}
        </select>
      </div>

      <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-4 text-[10px] text-gray-400">
        {[
          { label: 'Disponible', color: 'bg-emerald-200' },
          { label: 'Ocupada', color: 'bg-indigo-200' },
          { label: 'Reservada', color: 'bg-amber-200' },
          { label: 'Limpieza', color: 'bg-gray-200' },
          { label: 'Mantenimiento', color: 'bg-red-200' },
        ].map(l => (
          <span key={l.label} className="flex items-center gap-1"><span className={`w-2 h-2 rounded-sm ${l.color} inline-block`} />{l.label}</span>
        ))}
      </div>
    </div>
  );
}
