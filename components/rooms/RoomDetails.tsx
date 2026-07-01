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
      <div className="grid grid-cols-2 gap-2">
        <DetailItem label="Tipo" value={TYPE_LABELS[room.roomType] || room.roomType} />
        <DetailItem label="Piso" value={`${room.floor}`} />
        <DetailItem label="Capacidad" value={`${room.capacity} huéspedes`} />
        <DetailItem label="Precio" value={`$${room.pricePerNight}/noche`} />
      </div>

      {room.amenities.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 mb-1.5">Amenidades</p>
          <div className="flex flex-wrap gap-1.5">
            {room.amenities.map(a => (
              <span key={a} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{a}</span>
            ))}
          </div>
        </div>
      )}

      {room.description && (
        <div>
          <p className="text-xs font-semibold text-gray-400 mb-1">Descripción</p>
          <p className="text-sm text-gray-600">{room.description}</p>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg px-3 py-2">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  );
}
