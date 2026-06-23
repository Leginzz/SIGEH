import React, { useState, useMemo } from 'react';
import type { Room } from '../types';
import { UserCircleIcon } from './icons/Icons';

interface CheckOutFormProps {
  room: Room;
  onConfirm: (amountCollected: number) => void;
  onCancel: () => void;
}

const CheckOutForm: React.FC<CheckOutFormProps> = ({ room, onConfirm, onCancel }) => {
  const guest = room.guest!;
  const amountPaidAtCheckIn = guest.amountPaidAtCheckIn ?? guest.totalAgreedPrice;
  const pendingBalance = Math.max(0, guest.totalAgreedPrice - amountPaidAtCheckIn);
  const [amountCollected, setAmountCollected] = useState(pendingBalance);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(amountCollected);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-xl font-semibold text-center text-gray-800">Confirmar Salida</h3>

      <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg text-center space-y-2">
        <UserCircleIcon className="w-12 h-12 mx-auto text-indigo-500" />
        <p className="text-gray-600">¿Confirma la salida del huésped?</p>
        <p className="text-2xl font-bold text-gray-900">{guest.name}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
        <h4 className="font-semibold text-gray-800 text-sm uppercase tracking-wider">Resumen de Pago</h4>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total estancia</span>
          <span className="font-bold text-gray-900">${guest.totalAgreedPrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Pagado en check-in</span>
          <span className="font-medium text-emerald-600">-${amountPaidAtCheckIn.toFixed(2)}</span>
        </div>
        <div className="border-t border-gray-200 pt-2 mt-2">
          <div className="flex justify-between text-sm font-bold">
            <span className="text-gray-700">Saldo pendiente</span>
            <span className={pendingBalance > 0 ? 'text-red-600' : 'text-emerald-600'}>
              ${pendingBalance.toFixed(2)}
            </span>
          </div>
        </div>
        {pendingBalance > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mt-2">Monto a cobrar ahora</label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
              <input type="number" step="0.01" min="0" max={pendingBalance}
                value={amountCollected} onChange={e => setAmountCollected(Number(e.target.value))}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 font-bold text-lg" />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg transition-colors">
          Atrás
        </button>
        <button type="submit" className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          Confirmar Salida
        </button>
      </div>
    </form>
  );
};

export default CheckOutForm;
