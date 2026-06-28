import React from 'react';
import type { HotelSettings } from '../../../types/admin';
import { ReusableInput, ReusableSelect } from '../ReusableInput';

interface Props {
  settings: HotelSettings;
  onSave: (s: HotelSettings) => void;
}

const TIMEZONES = [
  'America/Mexico_City', 'America/New_York', 'America/Chicago', 'America/Denver', 'America/Los_Angeles',
  'America/Argentina/Buenos_Aires', 'America/Sao_Paulo', 'America/Bogota', 'America/Lima',
  'Europe/Madrid', 'Europe/London', 'Europe/Paris', 'Europe/Berlin',
];

const COUNTRIES = ['México', 'Argentina', 'Colombia', 'Perú', 'Chile', 'España', 'Estados Unidos', 'Brasil'];

export function AdminGeneral({ settings, onSave }: Props) {
  const [form, setForm] = React.useState(settings);
  const [dirty, setDirty] = React.useState(false);

  const set = (k: keyof HotelSettings, v: any) => {
    setForm(prev => ({ ...prev, [k]: v }));
    setDirty(true);
  };

  const handleSave = () => {
    onSave(form);
    setDirty(false);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Información del Hotel</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ReusableInput label="Nombre del hotel" value={form.hotelName} onChange={e => set('hotelName', e.target.value)} />
          <ReusableInput label="Logo (URL)" value={form.logo} onChange={e => set('logo', e.target.value)} placeholder="https://..." />
          <div className="sm:col-span-2">
            <ReusableInput label="Dirección" value={form.address} onChange={e => set('address', e.target.value)} />
          </div>
          <ReusableInput label="Ciudad" value={form.city} onChange={e => set('city', e.target.value)} />
          <ReusableInput label="Estado" value={form.state} onChange={e => set('state', e.target.value)} />
          <ReusableSelect label="País" value={form.country} onChange={e => set('country', e.target.value)} options={COUNTRIES.map(c => ({ value: c, label: c }))} />
          <ReusableInput label="Código Postal" value={form.zipCode} onChange={e => set('zipCode', e.target.value)} />
          <ReusableInput label="Teléfono" value={form.phone} onChange={e => set('phone', e.target.value)} />
          <ReusableInput label="Correo electrónico" type="email" value={form.email} onChange={e => set('email', e.target.value)} />
          <ReusableInput label="Sitio web" value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://..." />
          <ReusableInput label="RFC" value={form.rfc} onChange={e => set('rfc', e.target.value)} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Configuración Regional</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ReusableInput label="Moneda" value={form.currency} onChange={e => set('currency', e.target.value)} />
          <ReusableInput label="IVA (%)" type="number" value={form.iva} onChange={e => set('iva', Number(e.target.value))} />
          <ReusableSelect label="Zona Horaria" value={form.timezone} onChange={e => set('timezone', e.target.value)} options={TIMEZONES.map(t => ({ value: t, label: t }))} />
          <ReusableInput label="Formato de fecha" value={form.dateFormat} onChange={e => set('dateFormat', e.target.value)} />
          <ReusableInput label="Formato de hora" value={form.timeFormat} onChange={e => set('timeFormat', e.target.value)} />
        </div>
      </div>

      {dirty && (
        <div className="flex justify-end">
          <button onClick={handleSave} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors">
            Guardar Cambios
          </button>
        </div>
      )}
    </div>
  );
}
