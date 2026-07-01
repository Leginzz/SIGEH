import React, { useMemo } from 'react';
import type { Room } from '../types';
import RoomCard from './RoomCard';
import { PlusIcon } from './icons/Icons';

interface RoomGridProps {
  rooms: Room[];
  onSelectRoom: (room: Room) => void;
  onAddRoom: () => void;
}

const RoomGrid: React.FC<RoomGridProps> = ({ rooms, onSelectRoom, onAddRoom }) => {
  const byFloor = useMemo(() => {
    const map = new Map<number, Room[]>();
    for (const r of rooms) {
      const f = r.floor;
      if (!map.has(f)) map.set(f, []);
      map.get(f)!.push(r);
    }
    return [...map.entries()].sort(([a], [b]) => a - b);
  }, [rooms]);

  return (
    <div className="space-y-6">
      {byFloor.map(([floor, floorRooms]) => {
        const available = floorRooms.filter(r => r.status === 'Available').length;
        return (
          <section key={floor}>
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Piso {floor}</h3>
              <div className="h-px flex-1 bg-gray-100" />
              {available > 0 && (
                <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  {available} disponible{available !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {floorRooms.map(room => (
                <RoomCard key={room.id} room={room} onSelectRoom={onSelectRoom} />
              ))}
            </div>
          </section>
        );
      })}
      <button
        onClick={onAddRoom}
        className="w-full rounded-xl border-2 border-dashed border-gray-200 cursor-pointer transition-all duration-200 hover:border-indigo-300 hover:bg-indigo-50/30 flex items-center justify-center gap-2 py-4"
        title="Agregar nueva habitación"
      >
        <PlusIcon className="w-5 h-5 text-gray-300" />
        <span className="text-sm font-medium text-gray-400">Añadir habitación</span>
      </button>
    </div>
  );
};

export default RoomGrid;
