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

const BG_CLASSES: Record<string, string> = {
  [RoomStatus.Available]: 'hover:border-emerald-300',
  [RoomStatus.Occupied]: 'hover:border-blue-300',
  [RoomStatus.Reserved]: 'hover:border-amber-300',
  [RoomStatus.Cleaning]: 'hover:border-gray-300',
  [RoomStatus.Maintenance]: 'hover:border-red-300',
};

const RoomCard: React.FC<RoomCardProps> = ({ room, onSelectRoom }) => {
  return (
    <div
      onClick={() => onSelectRoom(room)}
      className={`bg-white rounded-xl border border-gray-200 transition-all duration-200 cursor-pointer overflow-hidden ${BG_CLASSES[room.status] || ''}`}
    >
      <RoomTopBar status={room.status} />
      <div className="p-3 space-y-2.5">
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
