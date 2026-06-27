import React from 'react';
import type { Room } from '../../types';

const TYPE_LABELS: Record<string, string> = {
  individual: 'Individual',
  doble: 'Doble',
  suite: 'Suite',
  suite_premium: 'Suite Premium',
};

export function RoomDetails({ room }: { room: Room }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <DetailCard label="Tipo" value={TYPE_LABELS[room.roomType] || room.roomType} />
        <DetailCard label="Piso" value={`${room.floor}`} />
        <DetailCard label="Capacidad" value={`${room.capacity} huéspedes`} />
        <DetailCard label="Precio" value={`$${room.pricePerNight}/noche`} />
      </div>

      {room.amenities.length > 0 && (
        <div>
          <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Amenidades</h4>
          <div className="flex flex-wrap gap-1.5">
            {room.amenities.map(a => (
              <span key={a} className="text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{a}</span>
            ))}
          </div>
        </div>
      )}

      {room.description && (
        <div>
          <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Descripción</h4>
          <p className="text-sm text-gray-700">{room.description}</p>
        </div>
      )}
    </div>
  );
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg px-3 py-2">
      <p className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}
