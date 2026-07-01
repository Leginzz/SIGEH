import React, { useState, useMemo, useEffect, useCallback } from 'react';
import type { Guest, Room, PaymentEntry } from '../types';
import { MAX_GUEST_PER_ROOM } from '../constants';
import { IdentificationType, PaymentMethod } from '../types';

interface CheckInFormProps {
  room: Room;
  onConfirm: (guest: Guest) => void;
  onCancel: () => void;
  mode: 'checkin' | 'reservation';
}

const availableMethods = Object.values(PaymentMethod);

const input = "w-full bg-white border border-gray-300 rounded-lg py-2 px-3 text-sm text-gray-900 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none";
const label = "block text-xs font-medium text-gray-600 mb-0.5";

const CheckInForm: React.FC<CheckInFormProps> = ({ room, onConfirm, onCancel, mode }) => {
  const [guest, setGuest] = useState<Omit<Guest, 'id'>>({
    name: '',
    numberOfGuests: 1,
    checkInDate: new Date().toISOString().split('T')[0],
    checkOutDate: '',
    contact: '',
    hasVehicle: false,
    vehicleDetails: '',
    identificationType: IdentificationType.INE,
    identificationNumber: '',
    numberOfTowels: 2,
    notes: '',
    totalAgreedPrice: 0,
    invoiceRequested: false,
  });

  const [payments, setPayments] = useState<PaymentEntry[]>([]);

  const calculatedPrice = useMemo(() => {
    if (!guest.checkInDate || !guest.checkOutDate) return 0;
    const checkIn = new Date(guest.checkInDate);
    const checkOut = new Date(guest.checkOutDate);
    if (checkIn >= checkOut) return 0;
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const nights = Math.max(1, diffDays);
    return nights * room.pricePerNight;
  }, [guest.checkInDate, guest.checkOutDate, room.pricePerNight]);

  useEffect(() => {
    setGuest(prev => ({ ...prev, totalAgreedPrice: calculatedPrice }));
  }, [calculatedPrice]);

  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);
  const pendingBalance = Math.max(0, guest.totalAgreedPrice - totalPaid);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setGuest(prev => ({ ...prev, [name]: checked }));
    } else {
      setGuest(prev => ({ ...prev, [name]: (name === 'numberOfGuests' || name === 'numberOfTowels' || name === 'totalAgreedPrice') ? Number(value) : value }));
    }
  };

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
    const newStartDate = new Date(guest.checkInDate);
    const newEndDate = new Date(guest.checkOutDate);

    const isOverlapping = room.reservations.some(res => {
      const existingStartDate = new Date(res.checkInDate);
      const existingEndDate = new Date(res.checkOutDate);
      return newStartDate < existingEndDate && newEndDate > existingStartDate;
    });

    if (isOverlapping) {
      alert("Error: Las fechas seleccionadas se superponen con una reserva existente en esta habitación.");
      return;
    }

    if (!guest.name || !guest.checkOutDate || !guest.contact || !guest.identificationNumber) {
      alert("Por favor, complete todos los campos requeridos (Nombre, Contacto, Fechas, Identificación).");
      return;
    }

    if (mode === 'checkin' && payments.length === 0) {
      alert("Debe agregar al menos un pago.");
      return;
    }

    if (totalPaid > guest.totalAgreedPrice) {
      alert("El total pagado no puede exceder el total de la estancia.");
      return;
    }

    if (payments.some(p => p.amount <= 0)) {
      alert("Todos los montos de pago deben ser mayores a 0.");
      return;
    }

    onConfirm({ ...guest, id: `${Date.now()}-${room.id}`, payments: mode === 'checkin' ? payments : undefined });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
      <h4 className="text-sm font-semibold text-gray-900 text-center">
        {mode === 'checkin' ? 'Registrar Entrada y Cobro' : 'Crear Nueva Reserva'}
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label htmlFor="name" className={label}>Nombre del Huésped</label>
          <input type="text" name="name" id="name" value={guest.name} onChange={handleChange} required className={input} />
        </div>
        <div>
          <label htmlFor="contact" className={label}>Teléfono o Email</label>
          <input type="text" name="contact" id="contact" value={guest.contact} onChange={handleChange} required className={input} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="identificationType" className={label}>Tipo ID</label>
          <select name="identificationType" id="identificationType" value={guest.identificationType} onChange={handleChange} className={input}>
            {Object.values(IdentificationType).map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="identificationNumber" className={label}>Número ID</label>
          <input type="text" name="identificationNumber" id="identificationNumber" value={guest.identificationNumber} onChange={handleChange} required className={input} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="checkInDate" className={label}>Fecha de Entrada</label>
          <input type="date" name="checkInDate" id="checkInDate" value={guest.checkInDate} min={new Date().toISOString().split('T')[0]} onChange={handleChange} required className={input} />
        </div>
        <div>
          <label htmlFor="checkOutDate" className={label}>Fecha de Salida</label>
          <input type="date" name="checkOutDate" id="checkOutDate" value={guest.checkOutDate} min={guest.checkInDate || new Date().toISOString().split('T')[0]} onChange={handleChange} required className={input} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="numberOfGuests" className={label}>Nº Personas</label>
          <select name="numberOfGuests" id="numberOfGuests" value={guest.numberOfGuests} onChange={handleChange} className={input}>
            {[...Array(MAX_GUEST_PER_ROOM)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="numberOfTowels" className={label}>Nº Toallas</label>
          <input type="number" name="numberOfTowels" id="numberOfTowels" value={guest.numberOfTowels} onChange={handleChange} min="0" className={input} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input id="hasVehicle" name="hasVehicle" type="checkbox" checked={guest.hasVehicle} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
        <label htmlFor="hasVehicle" className="text-sm text-gray-700">¿El huésped tiene vehículo?</label>
      </div>

      {guest.hasVehicle && (
        <div>
          <label htmlFor="vehicleDetails" className={label}>Datos del Vehículo (Modelo, Color, Placas)</label>
          <textarea name="vehicleDetails" id="vehicleDetails" value={guest.vehicleDetails} onChange={handleChange} rows={2} className={input} />
        </div>
      )}

      <div>
        <label htmlFor="notes" className={label}>Notas Adicionales</label>
        <textarea name="notes" id="notes" value={guest.notes} onChange={handleChange} rows={2} className={input} />
      </div>

      <hr className="border-gray-200" />
      <p className="text-xs font-semibold text-gray-700">Detalles del Pago</p>
      <div>
        <label htmlFor="totalAgreedPrice" className={label}>Total de la Estancia</label>
        <input type="number" name="totalAgreedPrice" id="totalAgreedPrice" value={guest.totalAgreedPrice} onChange={handleChange} required className={`${input} font-semibold text-emerald-700`} />
        <p className="text-xs text-gray-400 mt-0.5">Calculado: ${calculatedPrice.toFixed(2)}. Puede modificarlo para aplicar descuentos.</p>
      </div>

      {mode === 'checkin' && (
        <>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-700">Pagos</span>
              <button type="button" onClick={addPayment}
                className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium py-1 px-2.5 rounded-lg transition-colors">
                + Agregar pago
              </button>
            </div>
            {payments.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <select value={p.method} onChange={e => updatePayment(i, 'method', e.target.value as PaymentMethod)} className={`${input} flex-1`}>
                  {availableMethods.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <div className="relative w-28">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input type="number" value={p.amount || ''} onChange={e => updatePayment(i, 'amount', Math.max(0, Number(e.target.value)))} min="0" placeholder="0.00" className={`${input} w-full pl-6`} />
                </div>
                <button type="button" onClick={() => removePayment(i)} className="text-gray-400 hover:text-red-500 text-lg leading-none px-1">&times;</button>
              </div>
            ))}
            {payments.length === 0 && (
              <p className="text-xs text-gray-400">No hay pagos registrados. Agregue al menos uno.</p>
            )}
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Total estancia:</span>
              <span className="font-semibold text-gray-900">${guest.totalAgreedPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-600">Pagado ahora:</span>
              <span className="font-semibold text-emerald-600">-${totalPaid.toFixed(2)}</span>
            </div>
            <div className="border-t border-amber-200 pt-1 mt-1 flex justify-between text-sm font-semibold">
              <span className="text-gray-700">Saldo pendiente:</span>
              <span className={pendingBalance > 0 ? 'text-red-600' : 'text-emerald-600'}>${pendingBalance.toFixed(2)}</span>
            </div>
          </div>
        </>
      )}
      <div className="flex items-center gap-2">
        <input id="invoiceRequested" name="invoiceRequested" type="checkbox" checked={guest.invoiceRequested} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
        <label htmlFor="invoiceRequested" className="text-sm text-gray-700">¿El huésped requiere factura?</label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
          Cancelar
        </button>
        <button type="submit"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors">
          {mode === 'checkin' ? 'Confirmar Check-In' : 'Guardar Reserva'}
        </button>
      </div>
    </form>
  );
};

export default CheckInForm;
