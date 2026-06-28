import React, { useState } from 'react';
import type { Room } from '../../../types';
import type { Floor, RoomTypeCatalog, Amenity, Rate, Building } from '../../../types/admin';
import { AdminTable, type Column } from '../AdminTable';
import { AdminModal } from '../AdminModal';
import { ConfirmDeleteDialog } from '../ConfirmDeleteDialog';
import { ReusableInput, ReusableSelect } from '../ReusableInput';

interface Props {
  rooms: Room[];
  floors: Floor[];
  roomTypes: RoomTypeCatalog[];
  amenities: Amenity[];
  rates: Rate[];
  buildings: Building[];
  onUpdateRoom: (room: Room) => void;
  onAddRoom: () => void;
  onDeleteRoom: (id: number) => void;
}

const STATUS_LABELS: Record<string, string> = {
  Disponible: 'Disponible',
  Ocupada: 'Ocupada',
  Reservada: 'Reservada',
  'En Limpieza': 'Limpieza',
  Mantenimiento: 'Mantenimiento',
};

const STATUS_COLORS: Record<string, string> = {
  Disponible: 'text-emerald-600 bg-emerald-50',
  Ocupada: 'text-blue-600 bg-blue-50',
  Reservada: 'text-amber-600 bg-amber-50',
  'En Limpieza': 'text-gray-600 bg-gray-100',
  Mantenimiento: 'text-red-600 bg-red-50',
};

export function AdminRooms({ rooms, floors, roomTypes, amenities, rates, buildings, onUpdateRoom, onAddRoom, onDeleteRoom }: Props) {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Room | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const activeRoomTypes = roomTypes.filter(rt => rt.active);
  const activeFloors = floors.filter(f => f.active);
  const activeAmenities = amenities.filter(a => a.active);
  const activeRates = rates.filter(r => r.active);

  const filtered = rooms.filter(r =>
    r.roomNumber.toLowerCase().includes(search.toLowerCase()) ||
    (r.guest?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<Room & { active: boolean }>[] = [
    { key: 'roomNumber', label: 'Habitación', render: r => <span className="font-bold">{r.roomNumber}</span> },
    { key: 'roomType', label: 'Tipo', render: r => roomTypes.find(rt => rt.name.toLowerCase() === r.roomType.toLowerCase())?.name || r.roomType },
    { key: 'floor', label: 'Piso', render: r => `Piso ${r.floor}` },
    { key: 'capacity', label: 'Cap.', render: r => `${r.capacity}` },
    { key: 'pricePerNight', label: 'Precio', render: r => `$${r.pricePerNight.toFixed(2)}` },
    { key: 'status', label: 'Estado', render: r => (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[r.status] || 'text-gray-500 bg-gray-50'}`}>
        {STATUS_LABELS[r.status] || r.status}
      </span>
    )},
  ];

  const handleEditSave = (updated: Room) => {
    onUpdateRoom(updated);
    setEditing(null);
  };

  return (
    <>
      <div className="mb-3 text-xs text-gray-400">
        Catálogo de configuración de habitaciones. La vista operativa está en <strong>Habitaciones</strong>.
      </div>
      <AdminTable
        data={filtered as (Room & { active: boolean })[]} columns={columns} searchQuery={search} onSearchChange={setSearch}
        onNew={onAddRoom} newLabel="Agregar Habitación"
        onEdit={setEditing} onDelete={r => setDeleteId(r.id)}
        emptyMessage="No hay habitaciones registradas" searchPlaceholder="Buscar habitación..."
        extraActions={r => (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${(r as any).active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {(r as any).active !== false ? 'Operativa' : 'Inactiva'}
          </span>
        )}
      />

      {editing && (
        <RoomConfigForm
          room={editing}
          roomTypes={activeRoomTypes}
          floors={activeFloors}
          amenities={activeAmenities}
          rates={activeRates}
          onSave={handleEditSave}
          onClose={() => setEditing(null)}
        />
      )}

      <ConfirmDeleteDialog
        isOpen={deleteId !== null}
        message="¿Estás seguro de eliminar esta habitación? Esta acción no se puede deshacer."
        onConfirm={() => { if (deleteId !== null) onDeleteRoom(deleteId); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}

function RoomConfigForm({ room, roomTypes, floors, amenities, rates, onSave, onClose }: {
  room: Room; roomTypes: RoomTypeCatalog[]; floors: Floor[]; amenities: Amenity[]; rates: Rate[];
  onSave: (r: Room) => void; onClose: () => void;
}) {
  const [number, setNumber] = useState(room.roomNumber);
  const [typeId, setTypeId] = useState(roomTypes.find(rt => rt.name.toLowerCase() === room.roomType.toLowerCase())?.id || roomTypes[0]?.id || '');
  const [floorId, setFloorId] = useState(floors.find(f => f.number === room.floor)?.id || floors[0]?.id || '');
  const [capacity, setCapacity] = useState(room.capacity);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(room.amenities);
  const [rateId, setRateId] = useState(rates.find(r => r.basePrice === room.pricePerNight)?.id || '');

  const selectedType = roomTypes.find(rt => rt.id === typeId);
  const selectedFloor = floors.find(f => f.id === floorId);
  const selectedRate = rates.find(r => r.id === rateId);

  const toggleAmenity = (id: string) => {
    setSelectedAmenities(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    const amenityNames = amenities.filter(a => selectedAmenities.includes(a.id)).map(a => a.name);
    const price = selectedRate?.basePrice ?? room.pricePerNight;
    onSave({
      ...room,
      roomNumber: number,
      roomType: (selectedType?.name.toLowerCase() as any) || room.roomType,
      floor: selectedFloor?.number || room.floor,
      capacity: selectedType?.capacity || capacity,
      pricePerNight: price,
      amenities: amenityNames,
    });
  };

  return (
    <AdminModal title={`Configurar Habitación ${room.roomNumber}`} onClose={onClose} onSave={handleSave} saveLabel="Guardar Cambios" size="lg">
      <div className="grid grid-cols-2 gap-4">
        <ReusableInput label="Número de habitación" value={number} onChange={e => setNumber(e.target.value)} />
        <ReusableSelect label="Tipo" value={typeId} onChange={e => setTypeId(e.target.value)} options={roomTypes.map(rt => ({ value: rt.id, label: `${rt.name} (cap. ${rt.capacity})` }))} />
        <ReusableSelect label="Piso" value={floorId} onChange={e => setFloorId(e.target.value)} options={floors.map(f => ({ value: f.id, label: `${f.name} (Piso ${f.number})` }))} />
        <ReusableInput label="Capacidad" type="number" value={selectedType?.capacity || capacity} onChange={e => setCapacity(Number(e.target.value))} />
        <ReusableSelect label="Tarifa" value={rateId} onChange={e => setRateId(e.target.value)} options={rates.map(r => {
          const t = roomTypes.find(rt => rt.id === r.roomTypeId);
          return { value: r.id, label: `${t?.name || ''} - $${r.basePrice.toFixed(2)}` };
        })} />
      </div>

      <div className="space-y-1">
        <label className="block text-sm font-medium text-gray-700">Amenidades</label>
        <div className="flex flex-wrap gap-2 border border-gray-200 rounded-lg p-3 max-h-32 overflow-y-auto">
          {amenities.map(a => (
            <button key={a.id} type="button" onClick={() => toggleAmenity(a.id)}
              className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${selectedAmenities.includes(a.id) ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'}`}>
              {a.name}
            </button>
          ))}
        </div>
      </div>
    </AdminModal>
  );
}
