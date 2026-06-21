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
        setGuest(prev => ({...prev, [name]: checked}));
    } else {
        setGuest(prev => ({ ...prev, [name]: (name === 'numberOfGuests' || name === 'numberOfTowels' || name === 'totalAgreedPrice') ? Number(value) : value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // --- Overlap Validation ---
    const newStartDate = new Date(guest.checkInDate);
    const newEndDate = new Date(guest.checkOutDate);

    const isOverlapping = room.reservations.some(res => {
        const existingStartDate = new Date(res.checkInDate);
        const existingEndDate = new Date(res.checkOutDate);
        // Overlap condition: (StartA < EndB) and (EndA > StartB)
        return newStartDate < existingEndDate && newEndDate > existingStartDate;
    });

    if (isOverlapping) {
        alert("Error: Las fechas seleccionadas se superponen con una reserva existente en esta habitación.");
        return; // Stop submission
    }
    // --- End Validation ---

    if (guest.name && guest.checkOutDate && guest.contact && guest.identificationNumber) {
      onConfirm({ ...guest, id: `${Date.now()}-${room.id}` });
    } else {
      alert("Por favor, complete todos los campos requeridos (Nombre, Contacto, Fechas, Identificación).");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
      <h3 className="text-xl font-semibold text-center text-slate-200 mb-4">
        {mode === 'checkin' ? 'Registrar Entrada y Cobro' : 'Crear Nueva Reserva'}
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-slate-300">Nombre del Huésped</label>
          <input type="text" name="name" id="name" value={guest.name} onChange={handleChange} required className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label htmlFor="contact" className="block text-sm font-medium text-slate-300">Teléfono o Email</label>
          <input type="text" name="contact" id="contact" value={guest.contact} onChange={handleChange} required className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="identificationType" className="block text-sm font-medium text-slate-300">Tipo ID</label>
          <select name="identificationType" id="identificationType" value={guest.identificationType} onChange={handleChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
            {Object.values(IdentificationType).map(type => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>
        <div>
            <label htmlFor="identificationNumber" className="block text-sm font-medium text-slate-300">Número ID</label>
            <input type="text" name="identificationNumber" id="identificationNumber" value={guest.identificationNumber} onChange={handleChange} required className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="checkInDate" className="block text-sm font-medium text-slate-300">Fecha de Entrada</label>
          <input type="date" name="checkInDate" id="checkInDate" value={guest.checkInDate} min={new Date().toISOString().split('T')[0]} onChange={handleChange} required className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
        <div>
          <label htmlFor="checkOutDate" className="block text-sm font-medium text-slate-300">Fecha de Salida</label>
          <input type="date" name="checkOutDate" id="checkOutDate" value={guest.checkOutDate} min={guest.checkInDate || new Date().toISOString().split('T')[0]} onChange={handleChange} required className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="numberOfGuests" className="block text-sm font-medium text-slate-300">Nº Personas</label>
          <select name="numberOfGuests" id="numberOfGuests" value={guest.numberOfGuests} onChange={handleChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
            {[...Array(MAX_GUEST_PER_ROOM)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="numberOfTowels" className="block text-sm font-medium text-slate-300">Nº Toallas</label>
          <input type="number" name="numberOfTowels" id="numberOfTowels" value={guest.numberOfTowels} onChange={handleChange} min="0" className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
      </div>
       
       <div className="flex items-center">
        <input id="hasVehicle" name="hasVehicle" type="checkbox" checked={guest.hasVehicle} onChange={handleChange} className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-indigo-600 focus:ring-indigo-500" />
        <label htmlFor="hasVehicle" className="ml-2 block text-sm text-slate-300">¿El huésped tiene vehículo?</label>
      </div>

      {guest.hasVehicle && (
        <div>
            <label htmlFor="vehicleDetails" className="block text-sm font-medium text-slate-300">Datos del Vehículo (Modelo, Color, Placas)</label>
            <textarea name="vehicleDetails" id="vehicleDetails" value={guest.vehicleDetails} onChange={handleChange} rows={2} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
        </div>
      )}

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-slate-300">Notas Adicionales</label>
        <textarea name="notes" id="notes" value={guest.notes} onChange={handleChange} rows={2} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
      </div>

       <hr className="border-slate-700"/>
       <h4 className="text-lg font-semibold text-slate-200">Detalles del Pago</h4>
       <div>
          <label htmlFor="totalAgreedPrice" className="block text-sm font-medium text-slate-300">Precio Total Acordado ($)</label>
          <input type="number" name="totalAgreedPrice" id="totalAgreedPrice" value={guest.totalAgreedPrice} onChange={handleChange} required className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 font-bold text-lg text-green-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
          <p className="text-xs text-slate-400 mt-1">Calculado: ${calculatedPrice.toFixed(2)}. Puede modificarlo para aplicar descuentos.</p>
       </div>
       <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">Método de Pago</label>
        <select name="paymentMethod" value={guest.paymentMethod} onChange={handleChange} className="mt-1 block w-full bg-slate-700 border border-slate-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
            {Object.values(PaymentMethod).map(method => <option key={method} value={method}>{method}</option>)}
        </select>
      </div>
      <div className="flex items-center">
        <input id="invoiceRequested" name="invoiceRequested" type="checkbox" checked={guest.invoiceRequested} onChange={handleChange} className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-indigo-600 focus:ring-indigo-500" />
        <label htmlFor="invoiceRequested" className="ml-2 block text-sm text-slate-300">¿El huésped requiere factura?</label>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onCancel} className="bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
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