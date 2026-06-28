import React, { useState } from 'react';
import type { Rate, RoomTypeCatalog } from '../../../types/admin';
import { AdminTable, type Column } from '../AdminTable';
import { AdminModal } from '../AdminModal';
import { ConfirmDeleteDialog } from '../ConfirmDeleteDialog';
import { ReusableInput, ReusableSelect } from '../ReusableInput';

interface Props {
  rates: Rate[];
  roomTypes: RoomTypeCatalog[];
  onUpsert: (r: Rate) => void;
  onRemove: (id: string) => void;
  onToggleActive: (id: string) => void;
}

export function AdminRates({ rates, roomTypes, onUpsert, onRemove, onToggleActive }: Props) {
  const [editing, setEditing] = useState<Rate | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const activeRoomTypes = roomTypes.filter(rt => rt.active);
  const typeMap = Object.fromEntries(roomTypes.map(rt => [rt.id, rt.name]));

  const filtered = rates.filter(r =>
    (typeMap[r.roomTypeId] || '').toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<Rate>[] = [
    { key: 'roomTypeId', label: 'Tipo de Habitación', render: r => typeMap[r.roomTypeId] || '—', className: 'font-medium' },
    { key: 'basePrice', label: 'Precio Base', render: r => `$${r.basePrice.toFixed(2)}` },
    { key: 'weekendPrice', label: 'Fin de Semana', render: r => r.weekendPrice ? `$${r.weekendPrice.toFixed(2)}` : '—', className: 'text-gray-500' },
    { key: 'active', label: 'Estado', render: r => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${r.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {r.active ? 'Activo' : 'Inactivo'}
      </span>
    )},
  ];

  const handleSave = (data: Rate) => {
    onUpsert(data);
    setEditing(null);
    setShowNew(false);
  };

  return (
    <>
      <AdminTable
        data={filtered} columns={columns} searchQuery={search} onSearchChange={setSearch}
        onNew={() => setShowNew(true)} newLabel="Nueva Tarifa"
        onEdit={setEditing} onDelete={r => setDeleteId(r.id)} onToggleActive={r => onToggleActive(r.id)}
        emptyMessage="No hay tarifas registradas" searchPlaceholder="Buscar por tipo..."
      />

      {(showNew || editing) && (
        <RateForm
          rate={editing}
          roomTypes={activeRoomTypes}
          onSave={handleSave}
          onClose={() => { setEditing(null); setShowNew(false); }}
        />
      )}

      <ConfirmDeleteDialog
        isOpen={!!deleteId}
        message="¿Estás seguro de eliminar esta tarifa?"
        onConfirm={() => { if (deleteId) onRemove(deleteId); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}

function RateForm({ rate, roomTypes, onSave, onClose }: { rate: Rate | null; roomTypes: RoomTypeCatalog[]; onSave: (r: Rate) => void; onClose: () => void }) {
  const id = rate?.id || `rate-${Date.now()}`;
  const [roomTypeId, setRoomTypeId] = useState(rate?.roomTypeId || roomTypes[0]?.id || '');
  const [basePrice, setBasePrice] = useState(rate?.basePrice || 0);
  const [weekendPrice, setWeekendPrice] = useState<number | null>(rate?.weekendPrice ?? null);
  const [active, setActive] = useState(rate?.active ?? true);

  return (
    <AdminModal title={rate ? 'Editar Tarifa' : 'Nueva Tarifa'} onClose={onClose} onSave={() => onSave({ id, roomTypeId, basePrice, weekendPrice, highSeasonPrice: null, lowSeasonPrice: null, active })} saveLabel={rate ? 'Guardar Cambios' : 'Crear Tarifa'}>
      <ReusableSelect label="Tipo de Habitación" value={roomTypeId} onChange={e => setRoomTypeId(e.target.value)} options={roomTypes.map(rt => ({ value: rt.id, label: rt.name }))} />
      <ReusableInput label="Precio Base ($)" type="number" value={basePrice} onChange={e => setBasePrice(Number(e.target.value))} />
      <ReusableInput label="Precio Fin de Semana ($)" type="number" value={weekendPrice ?? ''} onChange={e => setWeekendPrice(e.target.value ? Number(e.target.value) : null)} placeholder="Opcional" />
      <div className="text-xs text-gray-400 italic">Precio temporada alta/baja: preparado para futura implementación.</div>
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
