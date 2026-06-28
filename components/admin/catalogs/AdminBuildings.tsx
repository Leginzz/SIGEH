import React, { useState } from 'react';
import type { Building } from '../../../types/admin';
import { AdminTable, type Column } from '../AdminTable';
import { AdminModal } from '../AdminModal';
import { ConfirmDeleteDialog } from '../ConfirmDeleteDialog';
import { ReusableInput } from '../ReusableInput';

interface Props {
  buildings: Building[];
  onUpsert: (b: Building) => void;
  onRemove: (id: string) => void;
  onToggleActive: (id: string) => void;
}

export function AdminBuildings({ buildings, onUpsert, onRemove, onToggleActive }: Props) {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Building | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = buildings.filter(b =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<Building>[] = [
    { key: 'name', label: 'Nombre' },
    { key: 'description', label: 'Descripción', render: b => b.description || '—', className: 'text-gray-500' },
    { key: 'active', label: 'Estado', render: b => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${b.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {b.active ? 'Activo' : 'Inactivo'}
      </span>
    )},
  ];

  const handleSave = (data: Building) => {
    onUpsert(data);
    setEditing(null);
    setShowNew(false);
  };

  return (
    <>
      <AdminTable
        data={filtered} columns={columns} searchQuery={search} onSearchChange={setSearch}
        onNew={() => setShowNew(true)} newLabel="Nuevo Edificio"
        onEdit={setEditing} onDelete={b => setDeleteId(b.id)} onToggleActive={b => onToggleActive(b.id)}
        emptyMessage="No hay edificios registrados" searchPlaceholder="Buscar edificio..."
      />

      {(showNew || editing) && (
        <BuildingForm
          building={editing}
          onSave={handleSave}
          onClose={() => { setEditing(null); setShowNew(false); }}
        />
      )}

      <ConfirmDeleteDialog
        isOpen={!!deleteId}
        message="¿Estás seguro de eliminar este edificio? Esta acción no se puede deshacer."
        onConfirm={() => { if (deleteId) onRemove(deleteId); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}

function BuildingForm({ building, onSave, onClose }: { building: Building | null; onSave: (b: Building) => void; onClose: () => void }) {
  const id = building?.id || `bld-${Date.now()}`;
  const [name, setName] = React.useState(building?.name || '');
  const [description, setDescription] = React.useState(building?.description || '');
  const [active, setActive] = React.useState(building?.active ?? true);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({ id, name: name.trim(), description: description.trim(), active });
  };

  return (
    <AdminModal title={building ? 'Editar Edificio' : 'Nuevo Edificio'} onClose={onClose} onSave={handleSave} saveLabel={building ? 'Guardar Cambios' : 'Crear Edificio'}>
      <ReusableInput label="Nombre" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Edificio Principal" />
      <ReusableInput label="Descripción" value={description} onChange={e => setDescription(e.target.value)} placeholder="Descripción opcional" />
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
