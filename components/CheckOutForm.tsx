import React, { useState, useMemo, useCallback } from 'react';
import type { Room, PaymentEntry } from '../types';
import { PaymentMethod } from '../types';
import { UserCircleIcon } from './icons/Icons';

interface CheckOutFormProps {
  room: Room;
  onConfirm: (payments: PaymentEntry[]) => void;
  onCancel: () => void;
}

const availableMethods = Object.values(PaymentMethod);

const CheckOutForm: React.FC<CheckOutFormProps> = ({ room, onConfirm, onCancel }) => {
  const guest = room.guest!;
  const checkInTotal = guest.payments ? guest.payments.reduce((s, p) => s + p.amount, 0) : (guest.amountPaidAtCheckIn ?? 0);
  const pendingBalance = Math.max(0, guest.totalAgreedPrice - checkInTotal);
  const [payments, setPayments] = useState<PaymentEntry[]>(pendingBalance > 0 ? [{ method: PaymentMethod.Cash, amount: pendingBalance }] : []);

  const totalCollected = payments.reduce((s, p) => s + p.amount, 0);

  const addPayment = useCallback(() => {
    const usedMethods = payments.map(p => p.method);
    const nextMethod = availableMethods.find(m => !usedMethods.includes(m)) || PaymentMethod.Cash;
    setPayments(prev => [...prev, { method: nextMethod, amount: 0 }]);
  }, [payments]);

  const updatePayment = useCallback((index: number, field: keyof PaymentEntry, value: PaymentMethod | number) => {
    setPayments(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p));
  }, []);

  const removePayment = useCallback((index: number) => {
    setPayments(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (payments.some(p => p.amount <= 0)) {
      alert("Todos los montos de pago deben ser mayores a 0.");
      return;
    }

    if (totalCollected > pendingBalance) {
      alert("El total cobrado no puede exceder el saldo pendiente.");
      return;
    }

    onConfirm(payments);
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

        {guest.payments && guest.payments.length > 0 && (
          <div className="border-t border-gray-100 pt-1">
            <p className="text-xs text-gray-500 mb-1">Pagado en check-in:</p>
            {guest.payments.map((p, i) => (
              <div key={i} className="flex justify-between text-xs ml-2">
                <span className="text-gray-500">{p.method}</span>
                <span className="font-medium text-emerald-600">-${p.amount.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-gray-200 pt-2 mt-2">
          <div className="flex justify-between text-sm font-bold">
            <span className="text-gray-700">Saldo pendiente</span>
            <span className={pendingBalance > 0 ? 'text-red-600' : 'text-emerald-600'}>
              ${pendingBalance.toFixed(2)}
            </span>
          </div>
        </div>

        {pendingBalance > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mt-2">
              <label className="text-sm font-medium text-gray-700">Cobrar ahora</label>
              <button type="button" onClick={addPayment} className="text-sm bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-medium py-1 px-3 rounded transition-colors">
                + Dividir pago
              </button>
            </div>
            {payments.map((p, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-50 p-2 rounded border border-gray-200">
                <select value={p.method} onChange={e => updatePayment(i, 'method', e.target.value as PaymentMethod)} className="bg-white border border-gray-300 rounded-md py-1.5 px-2 text-sm text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                  {availableMethods.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <div className="relative flex-1">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <input type="number" value={p.amount || ''} onChange={e => updatePayment(i, 'amount', Math.max(0, Number(e.target.value)))} min="0" placeholder="0.00" className="w-full bg-white border border-gray-300 rounded-md py-1.5 pl-6 pr-2 text-sm text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                </div>
                <button type="button" onClick={() => removePayment(i)} className="text-red-500 hover:text-red-700 text-lg leading-none px-1" title="Quitar pago">&times;</button>
              </div>
            ))}
            <div className="flex justify-between text-sm font-medium pt-1">
              <span className="text-gray-600">Total a cobrar</span>
              <span className={totalCollected !== pendingBalance ? 'text-amber-600' : 'text-emerald-600'}>
                ${totalCollected.toFixed(2)} {totalCollected < pendingBalance ? `(faltan $${(pendingBalance - totalCollected).toFixed(2)})` : ''}
              </span>
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
