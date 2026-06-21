import React from 'react';
import type { Room } from '../types';
import RoomCard from './RoomCard';
import { PlusIcon } from './icons/Icons';

interface RoomGridProps {
  rooms: Room[];
  onSelectRoom: (room: Room) => void;
  onAddRoom: () => void;
}

const RoomGrid: React.FC<RoomGridProps> = ({ rooms, onSelectRoom, onAddRoom }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4 md:gap-6">
      {rooms.map(room => (
        <RoomCard key={room.id} room={room} onSelectRoom={onSelectRoom} />
      ))}
      <div
        onClick={onAddRoom}
        className="relative p-4 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer transition-all duration-300 hover:border-indigo-400 bg-white/50 hover:bg-white flex flex-col items-center justify-center aspect-square shadow-sm hover:shadow-md"
        title="Agregar nueva habitación"
      >
        <PlusIcon className="w-10 h-10 text-gray-400" />
        <span className="mt-2 text-sm font-semibold text-gray-400">Añadir</span>
      </div>
    </div>
  );
};

export default RoomGrid;
