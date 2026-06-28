import React, { useState } from 'react';
import type { Tax } from '../../../types/admin';
import { AdminTable, type Column } from '../AdminTable';
import { AdminModal } from '../AdminModal';
import { ConfirmDeleteDialog } from '../ConfirmDeleteDialog';
import { ReusableInput } from '../ReusableInput';

interface Props {
  taxes: Tax[];
  onUpsert: (t: Tax) => void;
  onRemove: (id: string) => void;
  onToggleActive: (id: string) => void;
}

export function AdminTaxes({ taxes, onUpsert, onRemove, onToggleActive }: Props) {
  const [editing, setEditing] = useState<Tax | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const columns: Column<Tax>[] = [
    { key: 'name', label: 'Nombre', render: t => <span className="font-medium">{t.name}</span> },
    { key: 'percentage', label: 'Porcentaje', render: t => `${t.percentage}%` },
    { key: 'active', label: 'Estado', render: t => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${t.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {t.active ? 'Activo' : 'Inactivo'}
      </span>
    )},
  ];

  return (
    <>
      <AdminTable
        data={taxes} columns={columns} searchQuery="" onSearchChange={() => {}}
        onNew={() => setShowNew(true)} newLabel="Nuevo Impuesto"
        onEdit={setEditing} onDelete={t => setDeleteId(t.id)} onToggleActive={t => onToggleActive(t.id)}
        emptyMessage="No hay impuestos registrados"
      />

      {(showNew || editing) && (
        <TaxForm tax={editing} onSave={t => { onUpsert(t); setEditing(null); setShowNew(false); }} onClose={() => { setEditing(null); setShowNew(false); }} />
      )}

      <ConfirmDeleteDialog
        isOpen={!!deleteId}
        message="¿Estás seguro de eliminar este impuesto?"
        onConfirm={() => { if (deleteId) onRemove(deleteId); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}

function TaxForm({ tax, onSave, onClose }: { tax: Tax | null; onSave: (t: Tax) => void; onClose: () => void }) {
  const id = tax?.id || `tax-${Date.now()}`;
  const [name, setName] = useState(tax?.name || '');
  const [percentage, setPercentage] = useState(tax?.percentage || 16);
  const [active, setActive] = useState(tax?.active ?? true);

  return (
    <AdminModal title={tax ? 'Editar Impuesto' : 'Nuevo Impuesto'} onClose={onClose} onSave={() => { if (name.trim()) onSave({ id, name: name.trim(), percentage, active }); }} saveLabel={tax ? 'Guardar Cambios' : 'Crear Impuesto'}>
      <ReusableInput label="Nombre" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: IVA" />
      <ReusableInput label="Porcentaje (%)" type="number" value={percentage} onChange={e => setPercentage(Number(e.target.value))} />
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
