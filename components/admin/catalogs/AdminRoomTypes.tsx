import React, { useState } from 'react';
import type { RoomTypeCatalog } from '../../../types/admin';
import { AdminTable, type Column } from '../AdminTable';
import { AdminModal } from '../AdminModal';
import { ConfirmDeleteDialog } from '../ConfirmDeleteDialog';
import { ReusableInput } from '../ReusableInput';

interface Props {
  roomTypes: RoomTypeCatalog[];
  onUpsert: (rt: RoomTypeCatalog) => void;
  onRemove: (id: string) => void;
  onToggleActive: (id: string) => void;
}

export function AdminRoomTypes({ roomTypes, onUpsert, onRemove, onToggleActive }: Props) {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<RoomTypeCatalog | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = roomTypes.filter(rt =>
    rt.name.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<RoomTypeCatalog>[] = [
    { key: 'color', label: '', render: rt => <span className="inline-block w-4 h-4 rounded-full" style={{ backgroundColor: rt.color }} /> },
    { key: 'name', label: 'Nombre', render: rt => <span className="font-medium">{rt.name}</span> },
    { key: 'capacity', label: 'Capacidad', render: rt => `${rt.capacity} huéspedes` },
    { key: 'description', label: 'Descripción', render: rt => rt.description || '—', className: 'text-gray-500' },
    { key: 'active', label: 'Estado', render: rt => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${rt.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {rt.active ? 'Activo' : 'Inactivo'}
      </span>
    )},
  ];

  const handleSave = (data: RoomTypeCatalog) => {
    onUpsert(data);
    setEditing(null);
    setShowNew(false);
  };

  return (
    <>
      <AdminTable
        data={filtered} columns={columns} searchQuery={search} onSearchChange={setSearch}
        onNew={() => setShowNew(true)} newLabel="Nuevo Tipo"
        onEdit={setEditing} onDelete={rt => setDeleteId(rt.id)} onToggleActive={rt => onToggleActive(rt.id)}
        emptyMessage="No hay tipos de habitación" searchPlaceholder="Buscar tipo..."
      />

      {(showNew || editing) && (
        <RoomTypeForm
          roomType={editing}
          onSave={handleSave}
          onClose={() => { setEditing(null); setShowNew(false); }}
        />
      )}

      <ConfirmDeleteDialog
        isOpen={!!deleteId}
        message="¿Estás seguro de eliminar este tipo de habitación?"
        onConfirm={() => { if (deleteId) onRemove(deleteId); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}

function RoomTypeForm({ roomType, onSave, onClose }: { roomType: RoomTypeCatalog | null; onSave: (rt: RoomTypeCatalog) => void; onClose: () => void }) {
  const id = roomType?.id || `rt-${Date.now()}`;
  const [name, setName] = useState(roomType?.name || '');
  const [description, setDescription] = useState(roomType?.description || '');
  const [capacity, setCapacity] = useState(roomType?.capacity || 2);
  const [color, setColor] = useState(roomType?.color || '#10b981');
  const [active, setActive] = useState(roomType?.active ?? true);

  return (
    <AdminModal title={roomType ? 'Editar Tipo' : 'Nuevo Tipo'} onClose={onClose} onSave={() => { if (name.trim()) onSave({ id, name: name.trim(), description: description.trim(), capacity, color, active }); }} saveLabel={roomType ? 'Guardar Cambios' : 'Crear Tipo'}>
      <ReusableInput label="Nombre" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Suite Premium" />
      <ReusableInput label="Descripción" value={description} onChange={e => setDescription(e.target.value)} placeholder="Descripción opcional" />
      <ReusableInput label="Capacidad (huéspedes)" type="number" value={capacity} onChange={e => setCapacity(Number(e.target.value))} />
      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Color</label>
        <div className="flex items-center gap-3">
          <input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-10 h-10 rounded cursor-pointer border border-gray-300" />
          <span className="text-sm text-gray-500">{color}</span>
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
