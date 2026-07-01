import React from 'react';
import type { Room } from '../../types';
import { RoomStatus } from '../../types';

interface RoomActionsProps {
  room: Room;
  onAction: (action: string, ...args: any[]) => void;
}

const btn = (label: string, color: string, onClick: () => void) => (
  <button onClick={onClick}
    className={`flex-1 text-white text-xs font-medium py-1.5 px-2 rounded-md transition-colors ${color}`}>
    {label}
  </button>
);

export function RoomActions({ room, onAction }: RoomActionsProps) {
  if (room.status === RoomStatus.Available) {
    return (
      <div className="flex gap-1.5">
        {btn('Check-In', 'bg-indigo-600 hover:bg-indigo-500', () => onAction('checkin'))}
        {btn('Reservar', 'bg-amber-400 hover:bg-amber-300', () => onAction('reservation'))}
      </div>
    );
  }

  if (room.status === RoomStatus.Occupied) {
    return (
      <div className="flex gap-1.5">
        {btn('Ver Estancia', 'bg-indigo-600 hover:bg-indigo-500', () => onAction('view'))}
        {btn('Registrar Salida', 'bg-red-600 hover:bg-red-500', () => onAction('checkout'))}
      </div>
    );
  }

  if (room.status === RoomStatus.Reserved) {
    const res = room.reservations[0];
    return (
      <div className="flex gap-1.5">
        {btn('Check-In', 'bg-emerald-600 hover:bg-emerald-500', () => onAction('checkin_from_reservation', res?.id))}
        {btn('Cancelar', 'bg-red-600 hover:bg-red-500', () => onAction('cancel_reservation', res?.id))}
      </div>
    );
  }

  if (room.status === RoomStatus.Cleaning || room.status === RoomStatus.Maintenance) {
    return btn(
      room.status === RoomStatus.Cleaning ? 'Marcar Lista' : 'Finalizar Mantenimiento',
      'bg-emerald-600 hover:bg-emerald-500',
      () => onAction('mark_available')
    );
  }

  return null;
}
