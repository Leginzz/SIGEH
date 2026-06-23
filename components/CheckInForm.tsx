import React, { useState, useMemo, useEffect } from 'react';
import type { Guest, Room } from '../types';
import { MAX_GUEST_PER_ROOM } from '../constants';
import { IdentificationType, PaymentMethod } from '../types';

interface CheckInFormProps {
  room: Room;
  onConfirm: (guest: Guest) => void;
  onCancel: () => void;
  mode: 'checkin' | 'reservation';
}

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
    paymentMethod: PaymentMethod.Card,
    invoiceRequested: false,
  });

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setGuest(prev => ({ ...prev, [name]: checked }));
    } else {
      setGuest(prev => ({ ...prev, [name]: (name === 'numberOfGuests' || name === 'numberOfTowels' || name === 'totalAgreedPrice') ? Number(value) : value }));
    }
  };

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

    if (guest.name && guest.checkOutDate && guest.contact && guest.identificationNumber) {
      onConfirm({ ...guest, id: `${Date.now()}-${room.id}` });
    } else {
      alert("Por favor, complete todos los campos requeridos (Nombre, Contacto, Fechas, Identificación).");
    }
  };

  const inputClass = "mt-1 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500";
  const labelClass = "block text-sm font-medium text-gray-700";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <h3 className="text-xl font-semibold text-center text-gray-800 mb-4">
        {mode === 'checkin' ? 'Registrar Entrada y Cobro' : 'Crear Nueva Reserva'}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className={labelClass}>Nombre del Huésped</label>
          <input type="text" name="name" id="name" value={guest.name} onChange={handleChange} required className={inputClass} />
        </div>
        <div>
          <label htmlFor="contact" className={labelClass}>Teléfono o Email</label>
          <input type="text" name="contact" id="contact" value={guest.contact} onChange={handleChange} required className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="identificationType" className={labelClass}>Tipo ID</label>
          <select name="identificationType" id="identificationType" value={guest.identificationType} onChange={handleChange} className={inputClass}>
            {Object.values(IdentificationType).map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="identificationNumber" className={labelClass}>Número ID</label>
          <input type="text" name="identificationNumber" id="identificationNumber" value={guest.identificationNumber} onChange={handleChange} required className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="checkInDate" className={labelClass}>Fecha de Entrada</label>
          <input type="date" name="checkInDate" id="checkInDate" value={guest.checkInDate} min={new Date().toISOString().split('T')[0]} onChange={handleChange} required className={inputClass} />
        </div>
        <div>
          <label htmlFor="checkOutDate" className={labelClass}>Fecha de Salida</label>
          <input type="date" name="checkOutDate" id="checkOutDate" value={guest.checkOutDate} min={guest.checkInDate || new Date().toISOString().split('T')[0]} onChange={handleChange} required className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="numberOfGuests" className={labelClass}>Nº Personas</label>
          <select name="numberOfGuests" id="numberOfGuests" value={guest.numberOfGuests} onChange={handleChange} className={inputClass}>
            {[...Array(MAX_GUEST_PER_ROOM)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="numberOfTowels" className={labelClass}>Nº Toallas</label>
          <input type="number" name="numberOfTowels" id="numberOfTowels" value={guest.numberOfTowels} onChange={handleChange} min="0" className={inputClass} />
        </div>
      </div>

      <div className="flex items-center">
        <input id="hasVehicle" name="hasVehicle" type="checkbox" checked={guest.hasVehicle} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
        <label htmlFor="hasVehicle" className="ml-2 block text-sm text-gray-700">¿El huésped tiene vehículo?</label>
      </div>

      {guest.hasVehicle && (
        <div>
          <label htmlFor="vehicleDetails" className={labelClass}>Datos del Vehículo (Modelo, Color, Placas)</label>
          <textarea name="vehicleDetails" id="vehicleDetails" value={guest.vehicleDetails} onChange={handleChange} rows={2} className={inputClass} />
        </div>
      )}

      <div>
        <label htmlFor="notes" className={labelClass}>Notas Adicionales</label>
        <textarea name="notes" id="notes" value={guest.notes} onChange={handleChange} rows={2} className={inputClass} />
      </div>

      <hr className="border-gray-200" />
      <h4 className="text-lg font-semibold text-gray-800">Detalles del Pago</h4>
      {mode === 'checkin' && (
        <>
          <div>
            <label htmlFor="totalAgreedPrice" className={labelClass}>Total de la Estancia ($)</label>
            <input type="number" name="totalAgreedPrice" id="totalAgreedPrice" value={guest.totalAgreedPrice} onChange={handleChange} required className={`${inputClass} font-bold text-lg text-green-700`} />
            <p className="text-xs text-gray-500 mt-1">Calculado: ${calculatedPrice.toFixed(2)}. Puede modificarlo para aplicar descuentos.</p>
          </div>
          <div>
            <label htmlFor="amountPaidAtCheckIn" className={labelClass}>Monto Pagado Ahora ($)</label>
            <input type="number" name="amountPaidAtCheckIn" id="amountPaidAtCheckIn" value={guest.amountPaidAtCheckIn ?? guest.totalAgreedPrice} onChange={e => setGuest(prev => ({ ...prev, amountPaidAtCheckIn: Number(e.target.value) }))} min="0" max={guest.totalAgreedPrice} className={`${inputClass} font-bold text-lg text-blue-700`} />
            <p className="text-xs text-gray-500 mt-1">Monto que el huésped paga en este momento.</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total estancia:</span>
              <span className="font-semibold text-gray-900">${guest.totalAgreedPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pagado ahora:</span>
              <span className="font-semibold text-emerald-600">-${(guest.amountPaidAtCheckIn ?? guest.totalAgreedPrice).toFixed(2)}</span>
            </div>
            <div className="border-t border-amber-200 pt-1 mt-1 flex justify-between font-bold">
              <span className="text-gray-700">Saldo pendiente:</span>
              <span className={guest.totalAgreedPrice - (guest.amountPaidAtCheckIn ?? guest.totalAgreedPrice) > 0 ? 'text-red-600' : 'text-emerald-600'}>
                ${Math.max(0, guest.totalAgreedPrice - (guest.amountPaidAtCheckIn ?? guest.totalAgreedPrice)).toFixed(2)}
              </span>
            </div>
          </div>
        </>
      )}
      {mode === 'reservation' && (
        <div>
          <label htmlFor="totalAgreedPrice" className={labelClass}>Precio Total Acordado ($)</label>
          <input type="number" name="totalAgreedPrice" id="totalAgreedPrice" value={guest.totalAgreedPrice} onChange={handleChange} required className={`${inputClass} font-bold text-lg text-green-700`} />
          <p className="text-xs text-gray-500 mt-1">Calculado: ${calculatedPrice.toFixed(2)}. Puede modificarlo para aplicar descuentos.</p>
        </div>
      )}
      <div>
        <label className={labelClass + " mb-2"}>Método de Pago</label>
        <select name="paymentMethod" value={guest.paymentMethod} onChange={handleChange} className={inputClass}>
          {Object.values(PaymentMethod).map(method => <option key={method} value={method}>{method}</option>)}
        </select>
      </div>
      <div className="flex items-center">
        <input id="invoiceRequested" name="invoiceRequested" type="checkbox" checked={guest.invoiceRequested} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
        <label htmlFor="invoiceRequested" className="ml-2 block text-sm text-gray-700">¿El huésped requiere factura?</label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg transition-colors">
          Cancelar
        </button>
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          {mode === 'checkin' ? 'Confirmar Check-In' : 'Guardar Reserva'}
        </button>
      </div>
    </form>
  );
};

export default CheckInForm;
