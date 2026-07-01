import React, { useState } from 'react';
import type { Room } from '../../types';
import { UsersView } from '../../auth/UsersView';
import { AdminGeneral } from './catalogs/AdminGeneral';
import { AdminBuildings } from './catalogs/AdminBuildings';
import { AdminFloors } from './catalogs/AdminFloors';
import { AdminRoomTypes } from './catalogs/AdminRoomTypes';
import { AdminRates } from './catalogs/AdminRates';
import { AdminAmenities } from './catalogs/AdminAmenities';
import { AdminRooms } from './catalogs/AdminRooms';
import { AdminTaxes } from './catalogs/AdminTaxes';
import { AdminSystem } from './catalogs/AdminSystem';
import type {
  HotelSettings, Building, Floor, RoomTypeCatalog, Rate, Amenity, Tax, SystemConfig,
} from '../../types/admin';

interface AdminViewProps {
  hotelSettings: HotelSettings;
  buildings: Building[];
  floors: Floor[];
  roomTypes: RoomTypeCatalog[];
  rates: Rate[];
  amenities: Amenity[];
  taxes: Tax[];
  systemConfig: SystemConfig;
  rooms: Room[];
  onSetHotelSettings: (s: HotelSettings) => void;
  onUpsertBuilding: (b: Building) => void;
  onRemoveBuilding: (id: string) => void;
  onToggleBuildingActive: (id: string) => void;
  onUpsertFloor: (f: Floor) => void;
  onRemoveFloor: (id: string) => void;
  onToggleFloorActive: (id: string) => void;
  onUpsertRoomType: (rt: RoomTypeCatalog) => void;
  onRemoveRoomType: (id: string) => void;
  onToggleRoomTypeActive: (id: string) => void;
  onUpsertRate: (r: Rate) => void;
  onRemoveRate: (id: string) => void;
  onToggleRateActive: (id: string) => void;
  onUpsertAmenity: (a: Amenity) => void;
  onRemoveAmenity: (id: string) => void;
  onToggleAmenityActive: (id: string) => void;
  onUpsertTax: (t: Tax) => void;
  onRemoveTax: (id: string) => void;
  onToggleTaxActive: (id: string) => void;
  onSetSystemConfig: (c: SystemConfig) => void;
  onUpdateRoom: (room: Room) => void;
  onAddRoom: () => void;
  onDeleteRoom: (id: number) => void;
}

type AdminTab = 'general' | 'buildings' | 'floors' | 'roomtypes' | 'rates' | 'amenities' | 'rooms' | 'taxes' | 'system' | 'users';

const TABS: { key: AdminTab; label: string }[] = [
  { key: 'general', label: 'General' },
  { key: 'buildings', label: 'Edificios' },
  { key: 'floors', label: 'Pisos' },
  { key: 'roomtypes', label: 'Tipos' },
  { key: 'rates', label: 'Tarifas' },
  { key: 'amenities', label: 'Amenidades' },
  { key: 'rooms', label: 'Habitaciones' },
  { key: 'taxes', label: 'Impuestos' },
  { key: 'system', label: 'Sistema' },
  { key: 'users', label: 'Usuarios' },
];

export function AdminView(props: AdminViewProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>('general');

  const renderTab = () => {
    switch (activeTab) {
      case 'general': return <AdminGeneral settings={props.hotelSettings} onSave={props.onSetHotelSettings} />;
      case 'buildings': return <AdminBuildings buildings={props.buildings} onUpsert={props.onUpsertBuilding} onRemove={props.onRemoveBuilding} onToggleActive={props.onToggleBuildingActive} />;
      case 'floors': return <AdminFloors floors={props.floors} buildings={props.buildings} onUpsert={props.onUpsertFloor} onRemove={props.onRemoveFloor} onToggleActive={props.onToggleFloorActive} />;
      case 'roomtypes': return <AdminRoomTypes roomTypes={props.roomTypes} onUpsert={props.onUpsertRoomType} onRemove={props.onRemoveRoomType} onToggleActive={props.onToggleRoomTypeActive} />;
      case 'rates': return <AdminRates rates={props.rates} roomTypes={props.roomTypes} onUpsert={props.onUpsertRate} onRemove={props.onRemoveRate} onToggleActive={props.onToggleRateActive} />;
      case 'amenities': return <AdminAmenities amenities={props.amenities} onUpsert={props.onUpsertAmenity} onRemove={props.onRemoveAmenity} onToggleActive={props.onToggleAmenityActive} />;
      case 'rooms': return <AdminRooms rooms={props.rooms} floors={props.floors} roomTypes={props.roomTypes} amenities={props.amenities} rates={props.rates} buildings={props.buildings} onUpdateRoom={props.onUpdateRoom} onAddRoom={props.onAddRoom} onDeleteRoom={props.onDeleteRoom} />;
      case 'taxes': return <AdminTaxes taxes={props.taxes} onUpsert={props.onUpsertTax} onRemove={props.onRemoveTax} onToggleActive={props.onToggleTaxActive} />;
      case 'system': return <AdminSystem config={props.systemConfig} onSave={props.onSetSystemConfig} />;
      case 'users': return <UsersView />;
    }
  };

  return (
    <div className="space-y-5">
      <div className="border-b border-gray-200 overflow-x-auto">
        <div className="flex gap-0 min-w-max">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.key ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div>{renderTab()}</div>
    </div>
  );
}
