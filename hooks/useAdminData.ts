import { useState, useEffect, useCallback } from 'react';
import type { HotelSettings, Building, Floor, RoomTypeCatalog, Rate, Amenity, Tax, SystemConfig } from '../types/admin';
import {
  DEFAULT_IVA, DEFAULT_CURRENCY, DEFAULT_TIMEZONE, DEFAULT_DATE_FORMAT, DEFAULT_TIME_FORMAT,
  DEFAULT_LANGUAGE, DEFAULT_COUNTRY, DEFAULT_CURRENCY_FORMAT, DEFAULT_PRIMARY_COLOR,
  DEFAULT_BUILDINGS, DEFAULT_FLOORS, DEFAULT_ROOM_TYPES, DEFAULT_RATES, DEFAULT_AMENITIES, DEFAULT_TAXES,
} from '../constants';

const ADMIN_KEY = 'sigeh_admin_v1';

interface AdminData {
  hotelSettings: HotelSettings;
  buildings: Building[];
  floors: Floor[];
  roomTypes: RoomTypeCatalog[];
  rates: Rate[];
  amenities: Amenity[];
  taxes: Tax[];
  systemConfig: SystemConfig;
}

function createDefaultHotelSettings(): HotelSettings {
  return {
    hotelName: 'Mi Hotel',
    logo: '',
    address: '',
    city: '',
    state: '',
    country: DEFAULT_COUNTRY,
    zipCode: '',
    phone: '',
    email: '',
    website: '',
    rfc: '',
    currency: DEFAULT_CURRENCY,
    iva: DEFAULT_IVA,
    timezone: DEFAULT_TIMEZONE,
    dateFormat: DEFAULT_DATE_FORMAT,
    timeFormat: DEFAULT_TIME_FORMAT,
  };
}

function createDefaultSystemConfig(): SystemConfig {
  return {
    currencyFormat: DEFAULT_CURRENCY_FORMAT,
    language: DEFAULT_LANGUAGE,
    primaryColor: DEFAULT_PRIMARY_COLOR,
    autoNumbering: true,
  };
}

function initializeAdminData(): AdminData {
  return {
    hotelSettings: createDefaultHotelSettings(),
    buildings: DEFAULT_BUILDINGS,
    floors: DEFAULT_FLOORS,
    roomTypes: DEFAULT_ROOM_TYPES,
    rates: DEFAULT_RATES,
    amenities: DEFAULT_AMENITIES,
    taxes: DEFAULT_TAXES,
    systemConfig: createDefaultSystemConfig(),
  };
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useAdminData() {
  const [data, setData] = useState<AdminData>(() => {
    try {
      const stored = localStorage.getItem(ADMIN_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.hotelSettings && parsed.buildings) return parsed;
      }
    } catch { /* ignore */ }
    return initializeAdminData();
  });

  useEffect(() => {
    try { localStorage.setItem(ADMIN_KEY, JSON.stringify(data)); } catch { /* ignore */ }
  }, [data]);

  const upsert = useCallback(<T extends { id: string }>(items: T[], item: T): T[] => {
    const exists = items.some(i => i.id === item.id);
    return exists ? items.map(i => i.id === item.id ? item : i) : [...items, item];
  }, []);

  const remove = useCallback(<T extends { id: string }>(items: T[], id: string): T[] => {
    return items.filter(i => i.id !== id);
  }, []);

  const toggle = useCallback(<T extends { id: string; active: boolean }>(items: T[], id: string): T[] => {
    return items.map(i => i.id === id ? { ...i, active: !i.active } : i);
  }, []);

  const setHotelSettings = useCallback((s: HotelSettings) => {
    setData(prev => ({ ...prev, hotelSettings: s }));
  }, []);

  const upsertBuilding = useCallback((b: Building) => {
    setData(prev => ({ ...prev, buildings: upsert(prev.buildings, b) }));
  }, [upsert]);
  const removeBuilding = useCallback((id: string) => {
    setData(prev => ({ ...prev, buildings: remove(prev.buildings, id) }));
  }, [remove]);
  const toggleBuildingActive = useCallback((id: string) => {
    setData(prev => ({ ...prev, buildings: toggle(prev.buildings, id) }));
  }, [toggle]);

  const upsertFloor = useCallback((f: Floor) => {
    setData(prev => ({ ...prev, floors: upsert(prev.floors, f) }));
  }, [upsert]);
  const removeFloor = useCallback((id: string) => {
    setData(prev => ({ ...prev, floors: remove(prev.floors, id) }));
  }, [remove]);
  const toggleFloorActive = useCallback((id: string) => {
    setData(prev => ({ ...prev, floors: toggle(prev.floors, id) }));
  }, [toggle]);

  const upsertRoomType = useCallback((rt: RoomTypeCatalog) => {
    setData(prev => ({ ...prev, roomTypes: upsert(prev.roomTypes, rt) }));
  }, [upsert]);
  const removeRoomType = useCallback((id: string) => {
    setData(prev => ({ ...prev, roomTypes: remove(prev.roomTypes, id) }));
  }, [remove]);
  const toggleRoomTypeActive = useCallback((id: string) => {
    setData(prev => ({ ...prev, roomTypes: toggle(prev.roomTypes, id) }));
  }, [toggle]);

  const upsertRate = useCallback((r: Rate) => {
    setData(prev => ({ ...prev, rates: upsert(prev.rates, r) }));
  }, [upsert]);
  const removeRate = useCallback((id: string) => {
    setData(prev => ({ ...prev, rates: remove(prev.rates, id) }));
  }, [remove]);
  const toggleRateActive = useCallback((id: string) => {
    setData(prev => ({ ...prev, rates: toggle(prev.rates, id) }));
  }, [toggle]);

  const upsertAmenity = useCallback((a: Amenity) => {
    setData(prev => ({ ...prev, amenities: upsert(prev.amenities, a) }));
  }, [upsert]);
  const removeAmenity = useCallback((id: string) => {
    setData(prev => ({ ...prev, amenities: remove(prev.amenities, id) }));
  }, [remove]);
  const toggleAmenityActive = useCallback((id: string) => {
    setData(prev => ({ ...prev, amenities: toggle(prev.amenities, id) }));
  }, [toggle]);

  const upsertTax = useCallback((t: Tax) => {
    setData(prev => ({ ...prev, taxes: upsert(prev.taxes, t) }));
  }, [upsert]);
  const removeTax = useCallback((id: string) => {
    setData(prev => ({ ...prev, taxes: remove(prev.taxes, id) }));
  }, [remove]);
  const toggleTaxActive = useCallback((id: string) => {
    setData(prev => ({ ...prev, taxes: toggle(prev.taxes, id) }));
  }, [toggle]);

  const setSystemConfig = useCallback((sc: SystemConfig) => {
    setData(prev => ({ ...prev, systemConfig: sc }));
  }, []);

  return {
    ...data,
    generateId,
    setHotelSettings,
    upsertBuilding, removeBuilding, toggleBuildingActive,
    upsertFloor, removeFloor, toggleFloorActive,
    upsertRoomType, removeRoomType, toggleRoomTypeActive,
    upsertRate, removeRate, toggleRateActive,
    upsertAmenity, removeAmenity, toggleAmenityActive,
    upsertTax, removeTax, toggleTaxActive,
    setSystemConfig,
  };
}
