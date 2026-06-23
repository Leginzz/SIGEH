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

export interface PaymentEntry {
  method: PaymentMethod;
  amount: number;
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
  payments?: PaymentEntry[];
  amountPaidAtCheckIn?: number;
  paymentMethod?: PaymentMethod;
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
    registerSessionId?: string;
    numberOfNights?: number;
    checkInDate?: string;
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

export interface DenominationCount {
  bill1000: number;
  bill500: number;
  bill200: number;
  bill100: number;
  bill50: number;
  bill20: number;
  coin20: number;
  coin10: number;
  coin5: number;
  coin2: number;
  coin1: number;
  coin050: number;
}

export const DEFAULT_DENOMINATIONS: DenominationCount = {
  bill1000: 0, bill500: 0, bill200: 0, bill100: 0, bill50: 0, bill20: 0,
  coin20: 0, coin10: 0, coin5: 0, coin2: 0, coin1: 0, coin050: 0,
};

export const DENOMINATION_VALUES: Record<keyof DenominationCount, number> = {
  bill1000: 1000, bill500: 500, bill200: 200, bill100: 100, bill50: 50, bill20: 20,
  coin20: 20, coin10: 10, coin5: 5, coin2: 2, coin1: 1, coin050: 0.50,
};

export function denomTotal(d: DenominationCount): number {
  return (Object.keys(DENOMINATION_VALUES) as (keyof DenominationCount)[]).reduce((s, k) => s + d[k] * DENOMINATION_VALUES[k], 0);
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
  denominations?: DenominationCount;
  registerSessionId?: string;
}

export interface CashRegister {
  isOpen: boolean;
  sessionId?: string;
  openingDate: string;
  openingTime: string;
  initialAmount: number;
  user: string;
  movements: CashMovement[];
  closings: CashClosing[];
}