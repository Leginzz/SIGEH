import React from 'react';
import type { Guest } from '../../types';

export function RoomGuestInfo({ guest }: { guest: Guest }) {
  const paid = guest.payments?.reduce((s, p) => s + p.amount, 0) ?? guest.amountPaidAtCheckIn ?? 0;
  const pending = Math.max(0, guest.totalAgreedPrice - paid);

  return (
    <div className="space-y-3">
      <Section title="Datos del Huésped">
        <Row label="Nombre" value={guest.name} />
        <Row label="Personas" value={`${guest.numberOfGuests}`} />
        <Row label="Contacto" value={guest.contact} />
        <Row label="Identificación" value={`${guest.identificationType} - ${guest.identificationNumber}`} />
      </Section>

      <Section title="Información de la Estancia">
        <Row label="Check-In" value={new Date(guest.checkInDate + 'T00:00:00').toLocaleDateString()} />
        <Row label="Check-Out" value={new Date(guest.checkOutDate + 'T00:00:00').toLocaleDateString()} />
        <Row label="Noches" value={`${Math.max(1, Math.round((new Date(guest.checkOutDate).getTime() - new Date(guest.checkInDate).getTime()) / 86400000))}`} />
        <Row label="Toallas" value={`${guest.numberOfTowels}`} />
      </Section>

      <Section title="Pago">
        <Row label="Total acordado" value={`$${guest.totalAgreedPrice.toFixed(2)}`} />
        <Row label="Pagado" value={`-$${paid.toFixed(2)}`} valueClass="text-emerald-600" />
        {pending > 0 && (
          <Row label="Saldo pendiente" value={`$${pending.toFixed(2)}`} valueClass="text-red-600 font-bold" />
        )}
        {guest.paymentMethod && (
          <Row label="Método de pago" value={guest.paymentMethod} />
        )}
      </Section>

      {guest.hasVehicle && (
        <Section title="Vehículo">
          <Row label="Vehículo" value={guest.vehicleDetails || 'Sí'} />
        </Section>
      )}

      {guest.notes && (
        <Section title="Observaciones">
          <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">{guest.notes}</p>
        </Section>
      )}

      {guest.invoiceRequested && (
        <div className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
          Factura solicitada
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2">{title}</h4>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Row({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={`font-medium text-gray-900 ${valueClass || ''}`}>{value}</span>
    </div>
  );
}
