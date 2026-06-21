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
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">Próximas Reservas</h3>
      <div className="overflow-y-auto max-h-[70vh]">
        <table className="w-full text-left">
          <thead className="sticky top-0 bg-slate-800">
            <tr>
              <th className="p-3 text-sm font-semibold text-slate-400">Habitación</th>
              <th className="p-3 text-sm font-semibold text-slate-400">Huésped</th>
              <th className="p-3 text-sm font-semibold text-slate-400">Contacto</th>
              <th className="p-3 text-sm font-semibold text-slate-400">Check-In</th>
              <th className="p-3 text-sm font-semibold text-slate-400">Check-Out</th>
              <th className="p-3 text-sm font-semibold text-slate-400 text-right">Monto Acordado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {allReservations.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center p-6 text-slate-400">
                  No hay reservas programadas.
                </td>
              </tr>
            )}
            {allReservations.map(res => (
              <tr key={res.id} className="hover:bg-slate-700/50">
                <td className="p-3 font-bold">#{res.roomId}</td>
                <td className="p-3 text-slate-300">{res.name}</td>
                <td className="p-3 text-slate-300">{res.contact}</td>
                <td className="p-3 text-slate-300">{new Date(res.checkInDate + 'T00:00:00').toLocaleDateString()}</td>
                <td className="p-3 text-slate-300">{new Date(res.checkOutDate + 'T00:00:00').toLocaleDateString()}</td>
                <td className="p-3 text-green-400 font-semibold text-right">${res.totalAgreedPrice.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReservationsView;
