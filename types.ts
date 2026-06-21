export enum RoomStatus {
  Available = 'Disponible',
  Occupied = 'Ocupada',
  Cleaning = 'En Limpieza',
  Maintenance = 'Mantenimiento',
  Reserved = 'Reservada',
}

export enum PaymentMethod {
  Cash = 'Efectivo',
  Card = 'Tarjeta',
  Transfer = 'Transferencia',
}

export enum IdentificationType {
    INE = 'INE',
    License = 'Licencia de Conducir',
    Passport = 'Pasaporte',
    Other = 'Otro',
}

export interface Guest {
  id: string; // Unique ID for each guest stay/reservation
  name: string;
  numberOfGuests: number;
  checkInDate: string;
  checkOutDate: string;
  contact: string;
  hasVehicle: boolean;
  vehicleDetails?: string;
  identificationType: IdentificationType;
  identificationNumber: string;
  numberOfTowels: number;
  notes?: string;
  totalAgreedPrice: number;
  paymentMethod: PaymentMethod;
  invoiceRequested: boolean;
  depositAmount?: number;
}

export interface Room {
  id: number;
  status: RoomStatus;
  pricePerNight: number;
  guest?: Guest | null;
  reservations: Guest[];
}

export interface BookingRecord {
  id: string;
  roomId: number;
  guestName: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfNights: number;
  totalIncome: number;
  paymentMethod: PaymentMethod;
  invoiceRequested: boolean;
  reportId?: string; // To link to a daily report
}

export type CashTransactionOrigin = 'reservation' | 'checkin' | 'checkout' | 'sale' | 'adjustment' | 'withdrawal' | 'expense' | 'manual';

export interface CashTransaction {
    id: string;
    type: 'income' | 'expense' | 'initial';
    amount: number;
    description: string;
    date: string;
    time?: string;
    reportId?: string;
    origin?: CashTransactionOrigin;
    roomId?: number;
    guestName?: string;
    reservationId?: string;
    paymentMethod?: PaymentMethod;
}

export interface DailyReport {
    id: string; // Typically the date of the report
    date: string;
    totalIncome: number;
    bookingsIncluded: BookingRecord[];
    cashTransactionsIncluded: CashTransaction[];
    breakdown: {
        [PaymentMethod.Cash]: number;
        [PaymentMethod.Card]: number;
        [PaymentMethod.Transfer]: number;
    };
}

export interface CashMovement {
  id: string;
  date: string;
  time: string;
  type: 'income' | 'diverse_income' | 'expense' | 'withdrawal' | 'adjustment';
  amount: number;
  description: string;
  user: string;
}

export interface CashClosing {
  folio: string;
  openingDate: string;
  openingTime: string;
  closingDate: string;
  closingTime: string;
  user: string;
  initialAmount: number;
  totalIncome: number;
  totalDiverseIncome: number;
  totalExpenses: number;
  totalWithdrawals: number;
  totalAdjustments: number;
  expectedCash: number;
  countedCash: number;
  difference: number;
  isSurplus: boolean;
  movements: CashMovement[];
}

export interface CashRegister {
  isOpen: boolean;
  openingDate: string;
  openingTime: string;
  initialAmount: number;
  user: string;
  movements: CashMovement[];
  closings: CashClosing[];
}