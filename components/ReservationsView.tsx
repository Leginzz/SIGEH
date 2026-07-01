import React, { useMemo } from 'react';
import type { Room } from '../types';
import { BookmarkSquareIcon } from './icons/Icons';

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
    <div className="bg-white border border-gray-200 rounded-xl">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700">Próximas Reservas</h3>
      </div>
      {allReservations.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <BookmarkSquareIcon className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-500">No hay reservas programadas</p>
          <p className="text-xs text-gray-400 mt-1 max-w-xs">
            Las nuevas reservas aparecerán aquí. Selecciona una habitación disponible para crear una.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Hab</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Huésped</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Contacto</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Check-In</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Check-Out</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {allReservations.map(res => (
                <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-gray-900">#{res.roomId}</td>
                  <td className="px-4 py-3 text-gray-700">{res.name}</td>
                  <td className="px-4 py-3 text-gray-500">{res.contact}</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(res.checkInDate + 'T00:00:00').toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-gray-600">{new Date(res.checkOutDate + 'T00:00:00').toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-emerald-600 font-semibold text-right">${res.totalAgreedPrice.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReservationsView;
