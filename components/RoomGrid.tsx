
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
        className="relative p-4 rounded-lg border-2 border-dashed border-slate-600 cursor-pointer transition-all duration-300 ease-in-out transform hover:scale-105 hover:bg-slate-800 hover:border-indigo-500 flex flex-col items-center justify-center aspect-square"
        title="Agregar nueva habitación"
      >
        <PlusIcon className="w-10 h-10 text-slate-500 group-hover:text-indigo-400 transition-colors" />
        <span className="mt-2 text-sm font-semibold text-slate-500 group-hover:text-indigo-400 transition-colors">Añadir</span>
      </div>
    </div>
  );
};

export default RoomGrid;