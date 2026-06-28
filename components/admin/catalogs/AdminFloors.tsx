import React, { useState } from 'react';
import type { Floor, Building } from '../../../types/admin';
import { AdminTable, type Column } from '../AdminTable';
import { AdminModal } from '../AdminModal';
import { ConfirmDeleteDialog } from '../ConfirmDeleteDialog';
import { ReusableInput, ReusableSelect } from '../ReusableInput';

interface Props {
  floors: Floor[];
  buildings: Building[];
  onUpsert: (f: Floor) => void;
  onRemove: (id: string) => void;
  onToggleActive: (id: string) => void;
}

export function AdminFloors({ floors, buildings, onUpsert, onRemove, onToggleActive }: Props) {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Floor | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const activeBuildings = buildings.filter(b => b.active);
  const buildingMap = Object.fromEntries(buildings.map(b => [b.id, b.name]));

  const filtered = floors.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    (buildingMap[f.buildingId] || '').toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<Floor>[] = [
    { key: 'name', label: 'Nombre' },
    { key: 'number', label: 'Número', render: f => `Piso ${f.number}` },
    { key: 'buildingId', label: 'Edificio', render: f => buildingMap[f.buildingId] || '—' },
    { key: 'active', label: 'Estado', render: f => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${f.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {f.active ? 'Activo' : 'Inactivo'}
      </span>
    )},
  ];

  const handleSave = (data: Floor) => {
    onUpsert(data);
    setEditing(null);
    setShowNew(false);
  };

  return (
    <>
      <AdminTable
        data={filtered} columns={columns} searchQuery={search} onSearchChange={setSearch}
        onNew={() => setShowNew(true)} newLabel="Nuevo Piso"
        onEdit={setEditing} onDelete={b => setDeleteId(b.id)} onToggleActive={b => onToggleActive(b.id)}
        emptyMessage="No hay pisos registrados" searchPlaceholder="Buscar piso..."
      />

      {(showNew || editing) && (
        <FloorForm
          floor={editing}
          buildings={activeBuildings}
          onSave={handleSave}
          onClose={() => { setEditing(null); setShowNew(false); }}
        />
      )}

      <ConfirmDeleteDialog
        isOpen={!!deleteId}
        message="¿Estás seguro de eliminar este piso?"
        onConfirm={() => { if (deleteId) onRemove(deleteId); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}

function FloorForm({ floor, buildings, onSave, onClose }: { floor: Floor | null; buildings: Building[]; onSave: (f: Floor) => void; onClose: () => void }) {
  const id = floor?.id || `fl-${Date.now()}`;
  const [name, setName] = useState(floor?.name || '');
  const [number, setNumber] = useState(floor?.number || 1);
  const [buildingId, setBuildingId] = useState(floor?.buildingId || buildings[0]?.id || '');
  const [active, setActive] = useState(floor?.active ?? true);

  return (
    <AdminModal title={floor ? 'Editar Piso' : 'Nuevo Piso'} onClose={onClose} onSave={() => { if (name.trim()) onSave({ id, name: name.trim(), number, buildingId, active }); }} saveLabel={floor ? 'Guardar Cambios' : 'Crear Piso'}>
      <ReusableInput label="Nombre" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Planta Baja" />
      <ReusableInput label="Número de piso" type="number" value={number} onChange={e => setNumber(Number(e.target.value))} />
      <ReusableSelect label="Edificio" value={buildingId} onChange={e => setBuildingId(e.target.value)} options={buildings.map(b => ({ value: b.id, label: b.name }))} />
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
