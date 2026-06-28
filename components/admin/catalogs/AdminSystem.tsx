import React from 'react';
import type { SystemConfig } from '../../../types/admin';
import { ReusableInput } from '../ReusableInput';

interface Props {
  config: SystemConfig;
  onSave: (c: SystemConfig) => void;
}

export function AdminSystem({ config, onSave }: Props) {
  const [form, setForm] = React.useState(config);
  const [dirty, setDirty] = React.useState(false);

  const set = (k: keyof SystemConfig, v: any) => {
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
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Configuración del Sistema</h3>
        <div className="text-xs text-gray-400 mb-2">Estas opciones preparan la personalización del sistema. La lógica se implementará en versiones futuras.</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ReusableInput label="Formato de moneda" value={form.currencyFormat} onChange={e => set('currencyFormat', e.target.value)} />
          <ReusableInput label="Idioma" value={form.language} onChange={e => set('language', e.target.value)} />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Color principal</label>
            <div className="flex items-center gap-3">
              <input type="color" value={form.primaryColor} onChange={e => set('primaryColor', e.target.value)} className="w-10 h-10 rounded cursor-pointer border border-gray-300" />
              <span className="text-sm text-gray-500">{form.primaryColor}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 pt-6">
            <span className="text-sm font-medium text-gray-700">Numeración automática</span>
            <button type="button" onClick={() => set('autoNumbering', !form.autoNumbering)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.autoNumbering ? 'bg-green-500' : 'bg-gray-300'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.autoNumbering ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
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
