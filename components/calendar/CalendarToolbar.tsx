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
  { key: 'available', label: 'Disponibles', color: 'bg-emerald-400' },
  { key: 'occupied', label: 'Ocupadas', color: 'bg-blue-400' },
  { key: 'reserved', label: 'Reservadas', color: 'bg-amber-400' },
  { key: 'cleaning', label: 'Limpieza', color: 'bg-gray-300' },
  { key: 'maintenance', label: 'Mantenimiento', color: 'bg-red-400' },
];

export function CalendarToolbar({
  viewMode,
  onViewModeChange,
  onNavigate,
  periodLabel,
  baseDate,
  onDateSelect,
  searchQuery,
  onSearchChange,
  statusFilters,
  onFilterToggle,
  floorFilter,
  onFloorFilterChange,
  totalFloors,
}: CalendarToolbarProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <button onClick={() => onNavigate('prev')}
            className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-700 hover:bg-gray-50 transition-colors">
            ←
          </button>
          <button onClick={() => onNavigate('today')}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors">
            Hoy
          </button>
          <button onClick={() => onNavigate('next')}
            className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-700 hover:bg-gray-50 transition-colors">
            →
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">{periodLabel}</span>
          <input
            type="date"
            value={baseDate.toISOString().split('T')[0]}
            onChange={e => {
              if (e.target.value) {
                const d = new Date(e.target.value + 'T12:00:00');
                onDateSelect(d);
              }
            }}
            className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 text-gray-600 hover:border-gray-400 transition-colors"
          />
        </div>

        <div className="flex bg-gray-100 rounded-lg p-0.5">
          <button onClick={() => onViewModeChange('week')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${viewMode === 'week' ? 'bg-white text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            Semana
          </button>
          <button onClick={() => onViewModeChange('month')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${viewMode === 'month' ? 'bg-white text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>
            Mes
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-gray-400 shrink-0">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar habitaci\u00f3n o hu\u00e9sped..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="flex-1 text-xs border-0 outline-none bg-transparent text-gray-700 placeholder-gray-400"
          />
          {searchQuery && (
            <button onClick={() => onSearchChange('')} className="text-gray-400 hover:text-gray-600">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {FILTERS.map(f => {
            const active = statusFilters.size === 0 || statusFilters.has(f.key);
            return (
              <button
                key={f.key}
                onClick={() => onFilterToggle(f.key)}
                className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg transition-colors ${
                  active ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-300 hover:text-gray-500'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${f.color} ${active ? '' : 'opacity-30'}`} />
                {f.label}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-gray-400">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6h16.5M3.75 12h16.5M3.75 18h16.5" />
          </svg>
          <select
            value={floorFilter ?? ''}
            onChange={e => onFloorFilterChange(e.target.value ? Number(e.target.value) : null)}
            className="text-xs border border-gray-300 rounded-lg px-2 py-1.5 text-gray-600 bg-white hover:border-gray-400 transition-colors"
          >
            <option value="">Todos los pisos</option>
            {Array.from({ length: totalFloors }, (_, i) => i + 1).map(f => (
              <option key={f} value={f}>Piso {f}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-4 text-[10px] text-gray-400">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-200 inline-block" /> Disponible</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-blue-200 inline-block" /> Ocupada</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-200 inline-block" /> Reservada</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-gray-200 inline-block" /> Limpieza</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-200 inline-block" /> Mantenimiento</span>
      </div>
    </div>
  );
}
