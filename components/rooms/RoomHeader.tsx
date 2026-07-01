import React from 'react';
import type { Room } from '../../types';
import { RoomStatusBadge } from './RoomStatusBadge';

const TYPE_LABELS: Record<string, string> = {
  individual: 'Individual',
  doble: 'Doble',
  suite: 'Suite',
  suite_premium: 'Suite Premium',
};

export function RoomHeader({ room }: { room: Room }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-base font-bold text-gray-900">{room.roomNumber}</span>
        <span className="text-[11px] text-gray-400 hidden sm:inline">
          {TYPE_LABELS[room.roomType] || room.roomType}
        </span>
      </div>
      <RoomStatusBadge status={room.status} />
    </div>
  );
}
