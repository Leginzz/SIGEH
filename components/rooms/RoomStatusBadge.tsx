import React from 'react';
import { RoomStatus } from '../../types';

const STYLES: Record<string, { bar: string; text: string; label: string }> = {
  [RoomStatus.Available]: { bar: 'bg-emerald-500', text: 'text-emerald-700 bg-emerald-50', label: 'Disponible' },
  [RoomStatus.Occupied]: { bar: 'bg-blue-500', text: 'text-blue-700 bg-blue-50', label: 'Ocupada' },
  [RoomStatus.Reserved]: { bar: 'bg-amber-400', text: 'text-amber-700 bg-amber-50', label: 'Reservada' },
  [RoomStatus.Cleaning]: { bar: 'bg-gray-400', text: 'text-gray-600 bg-gray-100', label: 'Limpieza' },
  [RoomStatus.Maintenance]: { bar: 'bg-red-500', text: 'text-red-700 bg-red-50', label: 'Mantenimiento' },
};

export function RoomStatusBadge({ status }: { status: RoomStatus }) {
  const s = STYLES[status] || STYLES[RoomStatus.Available];
  return (
    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${s.text}`}>
      {s.label}
    </span>
  );
}

export function RoomTopBar({ status }: { status: RoomStatus }) {
  const s = STYLES[status] || STYLES[RoomStatus.Available];
  return <div className={`h-1 rounded-t-xl ${s.bar}`} />;
}

export function RoomLeftBorder({ status }: { status: RoomStatus }) {
  const s = STYLES[status] || STYLES[RoomStatus.Available];
  return <div className={`w-1 shrink-0 rounded-l-xl ${s.bar}`} />;
}
