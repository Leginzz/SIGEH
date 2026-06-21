import React from 'react';
import type { Room } from '../types';
import { RoomStatus } from '../types';
import { BedIcon, DoorOpenIcon, SparklesIcon, WrenchIcon, UserGroupIcon, BookmarkSquareIcon } from './icons/Icons';

interface RoomCardProps {
  room: Room;
  onSelectRoom: (room: Room) => void;
}

const statusConfig = {
  [RoomStatus.Available]: {
    bg: 'bg-green-50 border-green-200',
    textColor: 'text-green-600',
    icon: <DoorOpenIcon className="w-8 h-8" />,
    hover: 'hover:border-green-400 hover:shadow-green-200',
  },
  [RoomStatus.Occupied]: {
    bg: 'bg-red-50 border-red-200',
    textColor: 'text-red-600',
    icon: <BedIcon className="w-8 h-8" />,
    hover: 'hover:border-red-400 hover:shadow-red-200',
  },
  [RoomStatus.Cleaning]: {
    bg: 'bg-yellow-50 border-yellow-200',
    textColor: 'text-yellow-600',
    icon: <SparklesIcon className="w-8 h-8" />,
    hover: 'hover:border-yellow-400 hover:shadow-yellow-200',
  },
  [RoomStatus.Maintenance]: {
    bg: 'bg-blue-50 border-blue-200',
    textColor: 'text-blue-600',
    icon: <WrenchIcon className="w-8 h-8" />,
    hover: 'hover:border-blue-400 hover:shadow-blue-200',
  },
  [RoomStatus.Reserved]: {
    bg: 'bg-purple-50 border-purple-200',
    textColor: 'text-purple-600',
    icon: <BookmarkSquareIcon className="w-8 h-8" />,
    hover: 'hover:border-purple-400 hover:shadow-purple-200',
  },
};

const RoomCard: React.FC<RoomCardProps> = ({ room, onSelectRoom }) => {
  const config = statusConfig[room.status];

  return (
    <div
      onClick={() => onSelectRoom(room)}
      className={`relative p-4 rounded-lg border cursor-pointer transition-all duration-300 bg-white shadow-sm ${config.bg} ${config.hover} hover:shadow-md hover:scale-[1.03]`}
    >
      <div className="flex flex-col items-center justify-center h-full aspect-square">
        <div className={`mb-1 ${config.textColor}`}>{config.icon}</div>
        <div className="text-2xl font-bold text-gray-800">{room.id}</div>
        <div className={`text-xs font-semibold ${config.textColor}`}>{room.status}</div>
      </div>
      {room.status === RoomStatus.Occupied && room.guest && (
        <div className="absolute bottom-2 right-2 flex items-center text-xs text-gray-500 bg-white/80 px-2 py-1 rounded-full shadow-sm">
          <UserGroupIcon className="w-3 h-3 mr-1" />
          <span>{room.guest.numberOfGuests}</span>
        </div>
      )}
      {room.status === RoomStatus.Reserved && room.reservations.length > 0 && (
        <div className="absolute bottom-2 right-2 flex items-center text-xs text-gray-500 bg-white/80 px-2 py-1 rounded-full shadow-sm">
          <UserGroupIcon className="w-3 h-3 mr-1" />
          <span>{room.reservations[0].numberOfGuests}</span>
        </div>
      )}
    </div>
  );
};

export default RoomCard;
