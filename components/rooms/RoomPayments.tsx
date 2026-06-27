import React from 'react';
import type { Guest } from '../../types';

export function RoomPayments({ guest }: { guest: Guest }) {
  const paid = guest.payments?.reduce((s, p) => s + p.amount, 0) ?? guest.amountPaidAtCheckIn ?? 0;
  const pending = Math.max(0, guest.totalAgreedPrice - paid);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
        <span className="text-sm text-gray-500">Total</span>
        <span className="font-bold text-gray-900">${guest.totalAgreedPrice.toFixed(2)}</span>
      </div>
      {guest.payments?.map((p, i) => (
        <div key={i} className="flex justify-between items-center py-1">
          <span className="text-sm text-gray-500">{p.method}</span>
          <span className="text-sm font-medium text-emerald-600">-${p.amount.toFixed(2)}</span>
        </div>
      ))}
      {guest.amountPaidAtCheckIn && !guest.payments && (
        <div className="flex justify-between items-center py-1">
          <span className="text-sm text-gray-500">Pagado en check-in</span>
          <span className="text-sm font-medium text-emerald-600">-${guest.amountPaidAtCheckIn.toFixed(2)}</span>
        </div>
      )}
      <div className="flex justify-between items-center pt-1.5 border-t border-gray-100">
        <span className="text-sm font-medium text-gray-600">Pagado</span>
        <span className="text-sm font-bold text-emerald-600">${paid.toFixed(2)}</span>
      </div>
      {pending > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-600">Saldo pendiente</span>
          <span className="text-sm font-bold text-red-600">${pending.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}
