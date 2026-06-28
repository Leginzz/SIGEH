import React, { useState } from 'react';
import type { Amenity } from '../../../types/admin';
import { AdminTable, type Column } from '../AdminTable';
import { AdminModal } from '../AdminModal';
import { ConfirmDeleteDialog } from '../ConfirmDeleteDialog';
import { ReusableInput } from '../ReusableInput';

interface Props {
  amenities: Amenity[];
  onUpsert: (a: Amenity) => void;
  onRemove: (id: string) => void;
  onToggleActive: (id: string) => void;
}

const ICONS = ['wifi', 'tv', 'cube', 'lock', 'snowflake', 'sparkles', 'eye', 'star', 'heart', 'home', 'bell', 'phone'];

export function AdminAmenities({ amenities, onUpsert, onRemove, onToggleActive }: Props) {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Amenity | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = amenities.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<Amenity>[] = [
    { key: 'icon', label: 'Icono', render: a => <span className="text-base">{iconSymbol(a.icon)}</span> },
    { key: 'name', label: 'Nombre', render: a => <span className="font-medium">{a.name}</span> },
    { key: 'active', label: 'Estado', render: a => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${a.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {a.active ? 'Activo' : 'Inactivo'}
      </span>
    )},
  ];

  const handleSave = (data: Amenity) => {
    onUpsert(data);
    setEditing(null);
    setShowNew(false);
  };

  return (
    <>
      <AdminTable
        data={filtered} columns={columns} searchQuery={search} onSearchChange={setSearch}
        onNew={() => setShowNew(true)} newLabel="Nueva Amenidad"
        onEdit={setEditing} onDelete={a => setDeleteId(a.id)} onToggleActive={a => onToggleActive(a.id)}
        emptyMessage="No hay amenidades registradas" searchPlaceholder="Buscar amenidad..."
      />

      {(showNew || editing) && (
        <AmenityForm
          amenity={editing}
          onSave={handleSave}
          onClose={() => { setEditing(null); setShowNew(false); }}
        />
      )}

      <ConfirmDeleteDialog
        isOpen={!!deleteId}
        message="¿Estás seguro de eliminar esta amenidad?"
        onConfirm={() => { if (deleteId) onRemove(deleteId); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}

function iconSymbol(icon: string): string {
  const map: Record<string, string> = {
    wifi: '📶', tv: '📺', cube: '📦', lock: '🔒', snowflake: '❄️',
    sparkles: '✨', eye: '👁️', star: '⭐', heart: '❤️', home: '🏠',
    bell: '🔔', phone: '📞',
  };
  return map[icon] || '📌';
}

function AmenityForm({ amenity, onSave, onClose }: { amenity: Amenity | null; onSave: (a: Amenity) => void; onClose: () => void }) {
  const id = amenity?.id || `am-${Date.now()}`;
  const [name, setName] = useState(amenity?.name || '');
  const [icon, setIcon] = useState(amenity?.icon || 'wifi');
  const [active, setActive] = useState(amenity?.active ?? true);

  return (
    <AdminModal title={amenity ? 'Editar Amenidad' : 'Nueva Amenidad'} onClose={onClose} onSave={() => { if (name.trim()) onSave({ id, name: name.trim(), icon, active }); }} saveLabel={amenity ? 'Guardar Cambios' : 'Crear Amenidad'}>
      <ReusableInput label="Nombre" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: WiFi" />
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Icono</label>
        <div className="flex flex-wrap gap-2">
          {ICONS.map(ic => (
            <button key={ic} type="button" onClick={() => setIcon(ic)}
              className={`w-9 h-9 flex items-center justify-center rounded-lg border text-lg transition-colors ${icon === ic ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'}`}>
              {iconSymbol(ic)}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-700">Activo</span>
        <button type="button" onClick={() => setActive(!active)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${active ? 'bg-green-500' : 'bg-gray-300'}`}>
          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${active ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
      </div>
    </AdminModal>
  );
}
