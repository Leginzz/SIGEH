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
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/50',
    textColor: 'text-green-400',
    icon: <DoorOpenIcon className="w-8 h-8" />,
  },
  [RoomStatus.Occupied]: {
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/50',
    textColor: 'text-red-400',
    icon: <BedIcon className="w-8 h-8" />,
  },
  [RoomStatus.Cleaning]: {
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/50',
    textColor: 'text-yellow-400',
    icon: <SparklesIcon className="w-8 h-8" />,
  },
  [RoomStatus.Maintenance]: {
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/50',
    textColor: 'text-blue-400',
    icon: <WrenchIcon className="w-8 h-8" />,
  },
  [RoomStatus.Reserved]: {
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/50',
    textColor: 'text-purple-400',
    icon: <BookmarkSquareIcon className="w-8 h-8" />,
  },
};

const RoomCard: React.FC<RoomCardProps> = ({ room, onSelectRoom }) => {
  const config = statusConfig[room.status];

  return (
    <div
      onClick={() => onSelectRoom(room)}
      className={`relative p-4 rounded-lg border cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-2xl hover:shadow-indigo-500/30 ${config.bgColor} ${config.borderColor}`}
    >
      <div className="flex flex-col items-center justify-center h-full aspect-square">
        <div className={`mb-2 ${config.textColor}`}>{config.icon}</div>
        <div className="text-2xl font-bold text-slate-100">{room.id}</div>
        <div className={`text-xs font-semibold ${config.textColor}`}>{room.status}</div>
      </div>
       {room.status === RoomStatus.Occupied && room.guest && (
         <div className="absolute bottom-2 right-2 flex items-center text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded-full">
            <UserGroupIcon className="w-3 h-3 mr-1" />
            <span>{room.guest.numberOfGuests}</span>
         </div>
       )}
       {room.status === RoomStatus.Reserved && room.reservations.length > 0 && (
         <div className="absolute bottom-2 right-2 flex items-center text-xs text-slate-400 bg-slate-800/50 px-2 py-1 rounded-full">
            <UserGroupIcon className="w-3 h-3 mr-1" />
            <span>{room.reservations[0].numberOfGuests}</span>
         </div>
       )}
    </div>
  );
};

export default RoomCard;