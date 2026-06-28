export interface HotelSettings {
  hotelName: string;
  logo: string;
  address: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  phone: string;
  email: string;
  website: string;
  rfc: string;
  currency: string;
  iva: number;
  timezone: string;
  dateFormat: string;
  timeFormat: string;
}

export interface Building {
  id: string;
  name: string;
  description: string;
  active: boolean;
}

export interface Floor {
  id: string;
  name: string;
  number: number;
  buildingId: string;
  active: boolean;
}

export interface RoomTypeCatalog {
  id: string;
  name: string;
  description: string;
  capacity: number;
  color: string;
  active: boolean;
}

export interface Rate {
  id: string;
  roomTypeId: string;
  basePrice: number;
  weekendPrice: number | null;
  highSeasonPrice: number | null;
  lowSeasonPrice: number | null;
  active: boolean;
}

export interface Amenity {
  id: string;
  name: string;
  icon: string;
  active: boolean;
}

export interface Tax {
  id: string;
  name: string;
  percentage: number;
  active: boolean;
}

export interface SystemConfig {
  currencyFormat: string;
  language: string;
  primaryColor: string;
  autoNumbering: boolean;
}
