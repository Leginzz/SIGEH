import React from 'react';
import type { Guest } from '../../types';

export function RoomPayments({ guest }: { guest: Guest }) {
  const paid = guest.payments?.reduce((s, p) => s + p.amount, 0) ?? guest.amountPaidAtCheckIn ?? 0;
  const pending = Math.max(0, guest.totalAgreedPrice - paid);

  return (
    <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-500">Total</span>
        <span className="font-semibold text-gray-900">${guest.totalAgreedPrice.toFixed(2)}</span>
      </div>
      {guest.payments?.map((p, i) => (
        <div key={i} className="flex justify-between items-center text-sm">
          <span className="text-gray-500 pl-2">{p.method}</span>
          <span className="font-medium text-emerald-600">-${p.amount.toFixed(2)}</span>
        </div>
      ))}
      {guest.amountPaidAtCheckIn && !guest.payments && (
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500 pl-2">Pagado en check-in</span>
          <span className="font-medium text-emerald-600">-${guest.amountPaidAtCheckIn.toFixed(2)}</span>
        </div>
      )}
      <div className="border-t border-gray-200 pt-1.5 mt-1.5">
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium text-gray-600">Pagado</span>
          <span className="font-bold text-emerald-600">${paid.toFixed(2)}</span>
        </div>
        {pending > 0 && (
          <div className="flex justify-between items-center text-sm mt-1">
            <span className="font-medium text-gray-600">Saldo pendiente</span>
            <span className="font-bold text-red-600">${pending.toFixed(2)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
