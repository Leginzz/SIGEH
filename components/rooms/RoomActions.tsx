import React from 'react';
import type { Room, Guest } from '../../types';
import { RoomStatus } from '../../types';

interface RoomActionsProps {
  room: Room;
  onAction: (action: string, ...args: any[]) => void;
}

export function RoomActions({ room, onAction }: RoomActionsProps) {
  if (room.status === RoomStatus.Available) {
    return (
      <div className="flex gap-1.5">
        <button onClick={() => onAction('checkin')}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-medium py-1.5 px-2 rounded-md transition-colors">
          Check-In
        </button>
        <button onClick={() => onAction('reservation')}
          className="flex-1 bg-amber-400 hover:bg-amber-300 text-white text-[11px] font-medium py-1.5 px-2 rounded-md transition-colors">
          Reservar
        </button>
      </div>
    );
  }

  if (room.status === RoomStatus.Occupied) {
    return (
      <div className="flex gap-1.5">
        <button onClick={() => onAction('view')}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-medium py-1.5 px-2 rounded-md transition-colors">
          Ver Estancia
        </button>
        <button onClick={() => onAction('checkout')}
          className="flex-1 bg-red-600 hover:bg-red-500 text-white text-[11px] font-medium py-1.5 px-2 rounded-md transition-colors">
          Registrar Salida
        </button>
      </div>
    );
  }

  if (room.status === RoomStatus.Reserved) {
    const res = room.reservations[0];
    return (
      <div className="flex gap-1.5">
        <button onClick={() => onAction('checkin_from_reservation', res?.id)}
          className="flex-1 bg-green-600 hover:bg-green-500 text-white text-[11px] font-medium py-1.5 px-2 rounded-md transition-colors">
          Check-In
        </button>
        <button onClick={() => onAction('cancel_reservation', res?.id)}
          className="flex-1 bg-red-600 hover:bg-red-500 text-white text-[11px] font-medium py-1.5 px-2 rounded-md transition-colors">
          Cancelar
        </button>
      </div>
    );
  }

  if (room.status === RoomStatus.Cleaning) {
    return (
      <button onClick={() => onAction('mark_available')}
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-medium py-1.5 px-2 rounded-md transition-colors">
        Marcar Lista
      </button>
    );
  }

  if (room.status === RoomStatus.Maintenance) {
    return (
      <button onClick={() => onAction('mark_available')}
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-medium py-1.5 px-2 rounded-md transition-colors">
        Finalizar Mantenimiento
      </button>
    );
  }

  return null;
}
