import React from 'react';
import { RoomStatus } from '../../types';
import type { Room } from '../../types';

interface OccupancyBarsProps {
  rooms: Room[];
}

const statusColor: Record<string, string> = {
  [RoomStatus.Occupied]: '#ef4444',
  [RoomStatus.Available]: '#10b981',
  [RoomStatus.Cleaning]: '#eab308',
  [RoomStatus.Maintenance]: '#3b82f6',
  [RoomStatus.Reserved]: '#a855f7',
};

const statusLabel: Record<string, string> = {
  [RoomStatus.Occupied]: 'Ocup',
  [RoomStatus.Available]: 'Disp',
  [RoomStatus.Cleaning]: 'Limp',
  [RoomStatus.Maintenance]: 'Mant',
  [RoomStatus.Reserved]: 'Resv',
};

const OccupancyBars: React.FC<OccupancyBarsProps> = ({ rooms }) => {
  const sorted = [...rooms].sort((a, b) => a.id - b.id);

  return (
    <div className="w-full">
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
        {sorted.map(room => (
          <div key={room.id} className="flex flex-col items-center">
            <div className="text-xs font-bold text-gray-400 mb-1">{room.roomNumber}</div>
            <div
              className="w-full rounded-lg transition-all duration-300"
              style={{
                backgroundColor: statusColor[room.status] || '#94a3b8',
                height: room.status === RoomStatus.Occupied ? '48px' : room.status === RoomStatus.Reserved ? '36px' : '24px',
                opacity: room.status === RoomStatus.Available ? 0.5 : 1,
              }}
              title={`Habitación ${room.roomNumber}: ${room.status}`}
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
