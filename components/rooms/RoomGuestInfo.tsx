import React from 'react';
import type { Guest } from '../../types';

export function RoomGuestInfo({ guest }: { guest: Guest }) {
  const paid = guest.payments?.reduce((s, p) => s + p.amount, 0) ?? guest.amountPaidAtCheckIn ?? 0;
  const pending = Math.max(0, guest.totalAgreedPrice - paid);

  const nights = Math.max(1, Math.round((new Date(guest.checkOutDate).getTime() - new Date(guest.checkInDate).getTime()) / 86400000));

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold text-gray-400 mb-2">Datos del Huésped</p>
        <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
          <InfoRow label="Nombre" value={guest.name} />
          <InfoRow label="Personas" value={`${guest.numberOfGuests}`} />
          <InfoRow label="Contacto" value={guest.contact} />
          <InfoRow label="Identificación" value={`${guest.identificationType} - ${guest.identificationNumber}`} />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-400 mb-2">Información de la Estancia</p>
        <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
          <InfoRow label="Check-In" value={new Date(guest.checkInDate + 'T00:00:00').toLocaleDateString()} />
          <InfoRow label="Check-Out" value={new Date(guest.checkOutDate + 'T00:00:00').toLocaleDateString()} />
          <InfoRow label="Noches" value={`${nights}`} />
          <InfoRow label="Toallas" value={`${guest.numberOfTowels}`} />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-gray-400 mb-2">Pago</p>
        <div className="bg-gray-50 rounded-lg p-3 space-y-1.5">
          <InfoRow label="Total acordado" value={`$${guest.totalAgreedPrice.toFixed(2)}`} />
          <InfoRow label="Pagado" value={`-$${paid.toFixed(2)}`} valueClass="text-emerald-600 font-medium" />
          {pending > 0 && (
            <div className="flex justify-between items-center text-sm pt-1.5 border-t border-gray-200">
              <span className="font-medium text-gray-600">Saldo pendiente</span>
              <span className="font-bold text-red-600">${pending.toFixed(2)}</span>
            </div>
          )}
          {guest.paymentMethod && <InfoRow label="Método de pago" value={guest.paymentMethod} />}
        </div>
      </div>

      {guest.hasVehicle && (
        <div>
          <p className="text-xs font-semibold text-gray-400 mb-2">Vehículo</p>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-700">{guest.vehicleDetails || 'Sí'}</p>
          </div>
        </div>
      )}

      {guest.notes && (
        <div>
          <p className="text-xs font-semibold text-gray-400 mb-2">Observaciones</p>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-600">{guest.notes}</p>
          </div>
        </div>
      )}

      {guest.invoiceRequested && (
        <div className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          Factura solicitada
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`font-medium text-gray-900 ${valueClass || ''}`}>{value}</span>
    </div>
  );
}
