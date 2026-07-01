import React from 'react';
import { RoomStatus } from '../../types';

const STYLES: Record<string, { bar: string; badge: string; label: string }> = {
  [RoomStatus.Available]: { bar: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700', label: 'Disponible' },
  [RoomStatus.Occupied]: { bar: 'bg-blue-500', badge: 'bg-blue-50 text-blue-700', label: 'Ocupada' },
  [RoomStatus.Reserved]: { bar: 'bg-amber-400', badge: 'bg-amber-50 text-amber-700', label: 'Reservada' },
  [RoomStatus.Cleaning]: { bar: 'bg-gray-400', badge: 'bg-gray-100 text-gray-600', label: 'Limpieza' },
  [RoomStatus.Maintenance]: { bar: 'bg-red-500', badge: 'bg-red-50 text-red-700', label: 'Mantenimiento' },
};

export function RoomStatusBadge({ status }: { status: RoomStatus }) {
  const s = STYLES[status] || STYLES[RoomStatus.Available];
  return (
    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${s.badge}`}>
      {s.label}
    </span>
  );
}

export function RoomTopBar({ status }: { status: RoomStatus }) {
  const s = STYLES[status] || STYLES[RoomStatus.Available];
  return <div className={`h-1 ${s.bar}`} />;
}
