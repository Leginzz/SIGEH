import React from 'react';
import type { Room } from '../types';
import { RoomTopBar } from './rooms/RoomStatusBadge';
import { RoomHeader } from './rooms/RoomHeader';
import { RoomQuickInfo } from './rooms/RoomQuickInfo';
import { RoomActions } from './rooms/RoomActions';
import { RoomStatus } from '../types';

interface RoomCardProps {
  room: Room;
  onSelectRoom: (room: Room) => void;
}

const HOVER_CLASSES: Record<string, string> = {
  [RoomStatus.Available]: 'hover:border-emerald-300 hover:bg-emerald-50/30',
  [RoomStatus.Occupied]: 'hover:border-blue-300 hover:bg-blue-50/30',
  [RoomStatus.Reserved]: 'hover:border-amber-300 hover:bg-amber-50/30',
  [RoomStatus.Cleaning]: 'hover:border-gray-300 hover:bg-gray-50',
  [RoomStatus.Maintenance]: 'hover:border-red-300 hover:bg-red-50/30',
};

const RoomCard: React.FC<RoomCardProps> = ({ room, onSelectRoom }) => {
  return (
    <div
      onClick={() => onSelectRoom(room)}
      className={`bg-white rounded-xl border border-gray-200 transition-all duration-200 cursor-pointer overflow-hidden ${HOVER_CLASSES[room.status] || ''}`}
    >
      <RoomTopBar status={room.status} />
      <div className="p-3 space-y-2">
        <RoomHeader room={room} />
        <RoomQuickInfo room={room} />
        <div onClick={e => e.stopPropagation()}>
          <RoomActions room={room} onAction={() => onSelectRoom(room)} />
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
