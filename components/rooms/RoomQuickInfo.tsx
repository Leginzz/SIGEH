import React from 'react';
import type { Room } from '../../types';
import { RoomStatus } from '../../types';

function nights(checkIn: string, checkOut: string): number {
  return Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000));
}

function pending(room: Room): number {
  if (!room.guest) return 0;
  const paid = room.guest.payments?.reduce((s, p) => s + p.amount, 0) ?? room.guest.amountPaidAtCheckIn ?? 0;
  return Math.max(0, room.guest.totalAgreedPrice - paid);
}

export function RoomQuickInfo({ room }: { room: Room }) {
  if (room.status === RoomStatus.Occupied && room.guest) {
    return (
      <div className="space-y-0.5 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{room.guest.name}</p>
        <p className="text-xs text-gray-500">
          Salida: {new Date(room.guest.checkOutDate + 'T00:00:00').toLocaleDateString()}
        </p>
        {pending(room) > 0 && (
          <p className="text-xs font-semibold text-red-500">${pending(room).toFixed(2)} pendiente</p>
        )}
      </div>
    );
  }

  if (room.status === RoomStatus.Reserved) {
    const r = room.reservations[0];
    if (r) {
      return (
        <div className="space-y-0.5 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{r.name}</p>
          <p className="text-xs text-gray-500">
            Llega: {new Date(r.checkInDate + 'T00:00:00').toLocaleDateString()}
          </p>
          <p className="text-xs text-gray-400">
            {nights(r.checkInDate, r.checkOutDate)} noches
          </p>
        </div>
      );
    }
  }

  if (room.status === RoomStatus.Available) {
    return (
      <div className="space-y-0.5 min-w-0">
        <p className="text-xs text-gray-500">${room.pricePerNight} / noche</p>
        <p className="text-xs text-gray-400">{room.capacity} huéspedes · Piso {room.floor}</p>
      </div>
    );
  }

  if (room.status === RoomStatus.Cleaning) {
    return (
      <div className="space-y-0.5 min-w-0">
        <p className="text-xs text-gray-500">En limpieza</p>
        <p className="text-xs text-gray-400">Tiempo estimado: 15 min</p>
      </div>
    );
  }

  if (room.status === RoomStatus.Maintenance) {
    return (
      <div className="space-y-0.5 min-w-0">
        <p className="text-xs text-gray-500">En mantenimiento</p>
        <p className="text-xs text-gray-400">{new Date().toLocaleDateString()}</p>
      </div>
    );
  }

  return null;
}
