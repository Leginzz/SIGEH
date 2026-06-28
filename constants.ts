
export const MAX_GUEST_PER_ROOM = 4;
export const BASE_PRICE_PER_NIGHT = 120;

export const DEFAULT_IVA = 16;
export const DEFAULT_CURRENCY = 'MXN';
export const DEFAULT_TIMEZONE = 'America/Mexico_City';
export const DEFAULT_DATE_FORMAT = 'DD/MM/YYYY';
export const DEFAULT_TIME_FORMAT = 'HH:mm';
export const DEFAULT_LANGUAGE = 'es';
export const DEFAULT_COUNTRY = 'México';
export const DEFAULT_CURRENCY_FORMAT = '$#,###.##';
export const DEFAULT_PRIMARY_COLOR = '#4f46e5';

export const DEFAULT_BUILDINGS = [
  { id: 'bld-1', name: 'Edificio Principal', description: 'Edificio central del hotel', active: true },
];

export const DEFAULT_FLOORS = [
  { id: 'fl-1', name: 'Planta Baja', number: 1, buildingId: 'bld-1', active: true },
  { id: 'fl-2', name: 'Primer Piso', number: 2, buildingId: 'bld-1', active: true },
  { id: 'fl-3', name: 'Segundo Piso', number: 3, buildingId: 'bld-1', active: true },
  { id: 'fl-4', name: 'Tercer Piso', number: 4, buildingId: 'bld-1', active: true },
];

export const DEFAULT_ROOM_TYPES = [
  { id: 'rt-1', name: 'Individual', description: 'Habitación individual con cama sencilla', capacity: 2, color: '#10b981', active: true },
  { id: 'rt-2', name: 'Doble', description: 'Habitación con dos camas individuales', capacity: 3, color: '#3b82f6', active: true },
  { id: 'rt-3', name: 'Suite', description: 'Suite con cama king-size y sala de estar', capacity: 4, color: '#f59e0b', active: true },
  { id: 'rt-4', name: 'Suite Premium', description: 'Suite de lujo con jacuzzi y vista panorámica', capacity: 5, color: '#8b5cf6', active: true },
];

export const DEFAULT_RATES = [
  { id: 'rate-1', roomTypeId: 'rt-1', basePrice: 120, weekendPrice: 140, highSeasonPrice: null, lowSeasonPrice: null, active: true },
  { id: 'rate-2', roomTypeId: 'rt-2', basePrice: 130, weekendPrice: 150, highSeasonPrice: null, lowSeasonPrice: null, active: true },
  { id: 'rate-3', roomTypeId: 'rt-3', basePrice: 140, weekendPrice: 170, highSeasonPrice: null, lowSeasonPrice: null, active: true },
  { id: 'rate-4', roomTypeId: 'rt-4', basePrice: 150, weekendPrice: 190, highSeasonPrice: null, lowSeasonPrice: null, active: true },
];

export const DEFAULT_AMENITIES = [
  { id: 'am-1', name: 'WiFi', icon: 'wifi', active: true },
  { id: 'am-2', name: 'TV', icon: 'tv', active: true },
  { id: 'am-3', name: 'Netflix', icon: 'tv', active: true },
  { id: 'am-4', name: 'Minibar', icon: 'cube', active: true },
  { id: 'am-5', name: 'Caja Fuerte', icon: 'lock', active: true },
  { id: 'am-6', name: 'Aire acondicionado', icon: 'snowflake', active: true },
  { id: 'am-7', name: 'Jacuzzi', icon: 'sparkles', active: true },
  { id: 'am-8', name: 'Vista al mar', icon: 'eye', active: true },
];

export const DEFAULT_TAXES = [
  { id: 'tax-1', name: 'IVA', percentage: 16, active: true },
];