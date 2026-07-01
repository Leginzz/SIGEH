import React from 'react';
import { RoomStatus } from '../../types';
import type { Room } from '../../types';

interface OccupancyBarsProps {
  rooms: Room[];
}

const STATUS_CFG: Record<string, { color: string; label: string; h: string }> = {
  [RoomStatus.Occupied]:    { color: '#6366f1', label: 'Ocup', h: '36px' },
  [RoomStatus.Available]:   { color: '#10b981', label: 'Disp', h: '20px' },
  [RoomStatus.Cleaning]:    { color: '#eab308', label: 'Limp', h: '20px' },
  [RoomStatus.Maintenance]: { color: '#f97316', label: 'Mant', h: '20px' },
  [RoomStatus.Reserved]:    { color: '#a855f7', label: 'Resv', h: '28px' },
};

const OccupancyBars: React.FC<OccupancyBarsProps> = ({ rooms }) => {
  const sorted = [...rooms].sort((a, b) => a.id - b.id);

  return (
    <div className="w-full">
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {sorted.map(room => {
          const cfg = STATUS_CFG[room.status] || { color: '#94a3b8', label: '?', h: '20px' };
          return (
            <div key={room.id} className="flex flex-col items-center">
              <div className="text-[11px] font-semibold text-gray-500 mb-1">{room.roomNumber}</div>
              <div className="w-full rounded-md transition-all duration-300" style={{
                backgroundColor: cfg.color,
                height: cfg.h,
                opacity: room.status === RoomStatus.Available ? 0.4 : 0.85,
              }} title={`Habitación ${room.roomNumber}: ${room.status}`} />
              <div className="text-[10px] text-gray-400 mt-1">{cfg.label}</div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3 mt-4 justify-center">
        {Object.entries(STATUS_CFG).map(([status, cfg]) => (
          <div key={status} className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
            {status}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OccupancyBars;
