import React, { useMemo } from 'react';
import type { Room } from '../types';

interface ReservationsViewProps {
  rooms: Room[];
}

const ReservationsView: React.FC<ReservationsViewProps> = ({ rooms }) => {
  const allReservations = useMemo(() => {
    return rooms
      .flatMap(room => room.reservations.map(res => ({ ...res, roomId: room.id })))
      .sort((a, b) => new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime());
  }, [rooms]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Próximas Reservas</h3>
      <div className="overflow-y-auto max-h-[70vh]">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-gray-50">
            <tr>
              <th className="p-3 text-sm font-semibold text-gray-500">Habitación</th>
              <th className="p-3 text-sm font-semibold text-gray-500">Huésped</th>
              <th className="p-3 text-sm font-semibold text-gray-500">Contacto</th>
              <th className="p-3 text-sm font-semibold text-gray-500">Check-In</th>
              <th className="p-3 text-sm font-semibold text-gray-500">Check-Out</th>
              <th className="p-3 text-sm font-semibold text-gray-500 text-right">Monto Acordado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {allReservations.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center p-6 text-gray-400">
                  No hay reservas programadas.
                </td>
              </tr>
            )}
            {allReservations.map(res => (
              <tr key={res.id} className="hover:bg-gray-50">
                <td className="p-3 font-bold text-gray-800">#{res.roomId}</td>
                <td className="p-3 text-gray-700">{res.name}</td>
                <td className="p-3 text-gray-700">{res.contact}</td>
                <td className="p-3 text-gray-700">{new Date(res.checkInDate + 'T00:00:00').toLocaleDateString()}</td>
                <td className="p-3 text-gray-700">{new Date(res.checkOutDate + 'T00:00:00').toLocaleDateString()}</td>
                <td className="p-3 text-green-600 font-semibold text-right">${res.totalAgreedPrice.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReservationsView;
