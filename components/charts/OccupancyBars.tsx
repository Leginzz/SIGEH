import React from 'react';
import type { Room } from '../../types';

interface OccupancyBarsProps {
  rooms: Room[];
}

const statusColor: Record<string, string> = {
  Ocupada: '#ef4444',
  Disponible: '#10b981',
  'En Limpieza': '#eab308',
  Mantenimiento: '#3b82f6',
  Reservada: '#a855f7',
};

const statusLabel: Record<string, string> = {
  Ocupada: 'Ocup',
  Disponible: 'Disp',
  'En Limpieza': 'Limp',
  Mantenimiento: 'Mant',
  Reservada: 'Resv',
};

const OccupancyBars: React.FC<OccupancyBarsProps> = ({ rooms }) => {
  const sorted = [...rooms].sort((a, b) => a.id - b.id);

  return (
    <div className="w-full">
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
        {sorted.map(room => (
          <div key={room.id} className="flex flex-col items-center">
            <div className="text-xs font-bold text-gray-400 mb-1">#{room.id}</div>
            <div
              className="w-full rounded-lg transition-all duration-300"
              style={{
                backgroundColor: statusColor[room.status] || '#94a3b8',
                height: room.status === 'Ocupada' ? '48px' : room.status === 'Reservada' ? '36px' : '24px',
                opacity: room.status === 'Disponible' ? 0.5 : 1,
              }}
              title={`Habitación ${room.id}: ${room.status}`}
            />
            <div className="text-[10px] text-gray-400 mt-0.5">{statusLabel[room.status] || room.status}</div>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-3 mt-4 justify-center">
        {Object.entries(statusColor).map(([status, color]) => (
          <div key={status} className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            {status}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OccupancyBars;
