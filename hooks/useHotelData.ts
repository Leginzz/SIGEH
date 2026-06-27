import { useState, useEffect, useCallback } from 'react';
import type { Room, RoomType, BookingRecord, Guest, DailyReport, CashTransaction, CashRegister, CashMovement, CashClosing, PaymentEntry, DenominationCount } from '../types';
import { RoomStatus, PaymentMethod, denomTotal } from '../types';
import { BASE_PRICE_PER_NIGHT } from '../constants';

const LOCAL_STORAGE_KEY = 'hotelManagementData_v5';

interface HotelData {
  rooms: Room[];
  bookingHistory: BookingRecord[];
  dailyReports: DailyReport[];
  cashTransactions: CashTransaction[];
  cashRegister: CashRegister;
}

function getRoomTypeFromId(id: number): RoomType {
  const types: RoomType[] = ['individual', 'doble', 'suite', 'suite_premium'];
  return types[(id - 1) % 4];
}

function getFloorFromId(id: number): number {
  return Math.ceil(id / 4);
}

function getCapacityFromId(id: number): number {
  const t = getRoomTypeFromId(id);
  if (t === 'suite_premium') return 5;
  if (t === 'suite') return 4;
  if (t === 'doble') return 3;
  return 2;
}

function getAmenitiesFromId(id: number): string[] {
  const base = ['WiFi', 'TV'];
  const t = getRoomTypeFromId(id);
  if (t === 'suite_premium') return [...base, 'Aire acondicionado', 'Mini bar', 'Caja fuerte', 'Jacuzzi', 'Vista al mar'];
  if (t === 'suite') return [...base, 'Aire acondicionado', 'Mini bar', 'Caja fuerte'];
  if (t === 'doble') return [...base, 'Aire acondicionado'];
  return base;
}

function migrateRoom(r: any): Room {
  return {
    ...r,
    roomNumber: r.roomNumber ?? `10${r.id}`,
    roomType: r.roomType ?? getRoomTypeFromId(r.id),
    floor: r.floor ?? getFloorFromId(r.id),
    capacity: r.capacity ?? getCapacityFromId(r.id),
    amenities: r.amenities ?? getAmenitiesFromId(r.id),
    description: r.description ?? '',
    images: r.images ?? [],
  };
}

function createDefaultRoom(id: number): Room {
  return {
    id,
    roomNumber: `${getFloorFromId(id)}0${id}`,
    roomType: getRoomTypeFromId(id),
    floor: getFloorFromId(id),
    capacity: getCapacityFromId(id),
    pricePerNight: BASE_PRICE_PER_NIGHT + ((id - 1) % 4) * 10,
    amenities: getAmenitiesFromId(id),
    description: '',
    images: [],
    status: RoomStatus.Available,
    guest: null,
    reservations: [],
  };
}

const initializeHotelData = (): HotelData => {
  const rooms: Room[] = [];
  for (let i = 1; i <= 16; i++) rooms.push(createDefaultRoom(i));
  return { rooms, bookingHistory: [], dailyReports: [], cashTransactions: [], cashRegister: { isOpen: false, openingDate: '', openingTime: '', initialAmount: 0, user: '', movements: [], closings: [] } };
};

export function useHotelData() {
  const [hotelData, setHotelData] = useState<HotelData>(() => {
    try {
      const storedData = window.localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        if (!parsedData.cashTransactions) {
          parsedData.cashTransactions = [];
        }
        if (!parsedData.cashRegister) {
          parsedData.cashRegister = { isOpen: false, openingDate: '', openingTime: '', initialAmount: 0, user: '', movements: [], closings: [] };
        }
        if (parsedData.rooms && parsedData.rooms.length > 0 && !parsedData.rooms[0].roomNumber) {
          parsedData.rooms = parsedData.rooms.map(migrateRoom);
        }
        return parsedData;
      }
    } catch (error) {
      console.error("Error reading from localStorage", error);
      window.alert("Error al leer datos guardados. Se inicializarán datos nuevos.");
    }
    return initializeHotelData();
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(hotelData));
    } catch (error) {
      console.error("Error writing to localStorage", error);
      window.alert("Error al guardar datos en el navegador. Verifique el espacio de almacenamiento.");
    }
  }, [hotelData]);
  
  const addCashTransaction = useCallback((transaction: Omit<CashTransaction, 'id' | 'date' | 'time' | 'reportId' | 'origin'>) => {
      setHotelData(prevData => {
          const now = new Date();
          const newTransaction: CashTransaction = {
              ...transaction,
              id: `${Date.now()}`,
              date: now.toISOString().split('T')[0],
              time: now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }),
              origin: 'manual',
              registerSessionId: prevData.cashRegister.isOpen ? prevData.cashRegister.sessionId : undefined,
          };
          
          if(transaction.type === 'initial') {
              const updatedTransactions = prevData.cashTransactions.filter(t => t.type !== 'initial' || !!t.reportId);
              return {
                  ...prevData,
                  cashTransactions: [newTransaction, ...updatedTransactions],
              };
          }

          return {
              ...prevData,
              cashTransactions: [newTransaction, ...prevData.cashTransactions],
          };
      });
  }, []);

  const openRegister = useCallback((initialAmount: number, user: string) => {
    const sessionId = `REG-${Date.now()}`;
    setHotelData(prevData => {
      const now = new Date();
      const initialTx: CashTransaction = {
        id: `${Date.now()}-init`,
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }),
        type: 'initial',
        amount: initialAmount,
        description: 'Apertura de caja',
        origin: 'manual',
        registerSessionId: sessionId,
      };
      return {
        ...prevData,
        cashTransactions: [initialTx, ...prevData.cashTransactions],
        cashRegister: {
          isOpen: true,
          sessionId,
          openingDate: now.toISOString().split('T')[0],
          openingTime: now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }),
          initialAmount,
          user,
          movements: [],
          closings: prevData.cashRegister.closings,
        },
      };
    });
  }, []);

  const addCashMovement = useCallback((movement: Omit<CashMovement, 'id' | 'date' | 'time'>) => {
    setHotelData(prevData => {
      if (!prevData.cashRegister.isOpen) return prevData;
      const newMovement: CashMovement = {
        ...movement,
        id: `${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }),
      };
      return {
        ...prevData,
        cashRegister: {
          ...prevData.cashRegister,
          movements: [...prevData.cashRegister.movements, newMovement],
        },
      };
    });
  }, []);

  const closeRegisterWithArqueo = useCallback((denominations: DenominationCount) => {
    const countedCash = denomTotal(denominations);
    setHotelData(prevData => {
      if (!prevData.cashRegister.isOpen) return prevData;
      const reg = prevData.cashRegister;

      const sessionTxs = prevData.cashTransactions.filter(t => t.registerSessionId === reg.sessionId);
      const hasSessionData = sessionTxs.length > 0;

      let totalIncome = 0, totalDiverseIncome = 0, totalExpenses = 0, totalWithdrawals = 0, totalAdjustments = 0;

      if (hasSessionData && reg.sessionId) {
        totalIncome = sessionTxs.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
        totalExpenses = sessionTxs.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0);
        totalWithdrawals = sessionTxs.filter(t => t.type === 'expense' && t.description.startsWith('Retiro:')).reduce((s, t) => s + Math.abs(t.amount), 0);
        totalAdjustments = sessionTxs.filter(t => t.type === 'income' && t.description.startsWith('Ajuste:')).reduce((s, t) => s + t.amount, 0);
        totalIncome -= totalAdjustments;
        totalExpenses -= totalWithdrawals;
      } else {
        totalIncome = reg.movements.filter(m => m.type === 'income').reduce((s, m) => s + m.amount, 0);
        totalDiverseIncome = reg.movements.filter(m => m.type === 'diverse_income').reduce((s, m) => s + m.amount, 0);
        totalExpenses = reg.movements.filter(m => m.type === 'expense').reduce((s, m) => s + Math.abs(m.amount), 0);
        totalWithdrawals = reg.movements.filter(m => m.type === 'withdrawal').reduce((s, m) => s + Math.abs(m.amount), 0);
        totalAdjustments = reg.movements.filter(m => m.type === 'adjustment').reduce((s, m) => s + m.amount, 0);
      }

      const expectedCash = reg.initialAmount + totalIncome + totalDiverseIncome - totalExpenses - totalWithdrawals + totalAdjustments;
      const difference = countedCash - expectedCash;
      const now = new Date();
      const folio = `CJ-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${String(prevData.cashRegister.closings.length + 1).padStart(3, '0')}`;
      const closing: CashClosing = {
        folio,
        openingDate: reg.openingDate,
        openingTime: reg.openingTime,
        closingDate: now.toISOString().split('T')[0],
        closingTime: now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }),
        user: reg.user,
        initialAmount: reg.initialAmount,
        totalIncome,
        totalDiverseIncome,
        totalExpenses,
        totalWithdrawals,
        totalAdjustments,
        expectedCash,
        countedCash,
        difference,
        isSurplus: difference >= 0,
        movements: reg.movements,
        denominations,
        registerSessionId: reg.sessionId,
      };
      return {
        ...prevData,
        cashRegister: {
          isOpen: false,
          openingDate: '',
          openingTime: '',
          initialAmount: 0,
          user: '',
          sessionId: undefined,
          movements: [],
          closings: [closing, ...prevData.cashRegister.closings],
        },
      };
    });
  }, []);

  const updateRoom = useCallback((updatedRoom: Room) => {
    setHotelData(prevData => ({
      ...prevData,
      rooms: prevData.rooms.map(room => (room.id === updatedRoom.id ? updatedRoom : room)),
    }));
  }, []);

  const addRoom = useCallback(() => {
    setHotelData(prevData => {
      const newRoomId = prevData.rooms.length > 0 ? Math.max(...prevData.rooms.map(r => r.id)) + 1 : 1;
      const newRoom = createDefaultRoom(newRoomId);
      return {
        ...prevData,
        rooms: [...prevData.rooms, newRoom],
      };
    });
  }, []);

  const deleteRoom = useCallback((roomId: number) => {
    setHotelData(prevData => {
      const roomToDelete = prevData.rooms.find(r => r.id === roomId);
      if (!roomToDelete || roomToDelete.status === RoomStatus.Occupied || roomToDelete.reservations.length > 0) {
        // Safety check
        return prevData;
      }
      return {
        ...prevData,
        rooms: prevData.rooms.filter(room => room.id !== roomId),
      }
    });
  }, []);
  
  const addReservation = useCallback((roomId: number, reservationDetails: Guest) => {
      setHotelData(prevData => {
          const rooms = prevData.rooms.map(room => {
              if (room.id === roomId) {
                  const newStatus = room.status === RoomStatus.Available ? RoomStatus.Reserved : room.status;
                  return {
                      ...room,
                      status: newStatus,
                      reservations: [...room.reservations, reservationDetails].sort((a,b) => new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime()),
                  };
              }
              return room;
          });

          const now = new Date();
          const deposit = reservationDetails.depositAmount || 0;
          let newCashTransactions = prevData.cashTransactions;
          if (deposit > 0) {
              const newTransaction: CashTransaction = {
                  id: `${Date.now()}-res`,
                  date: now.toISOString().split('T')[0],
                  time: now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }),
                  type: 'income',
                  amount: deposit,
                  description: `Anticipo Reserva Hab. ${roomId} (${reservationDetails.name})`,
                  origin: 'reservation',
                  roomId,
                  guestName: reservationDetails.name,
                  paymentMethod: reservationDetails.paymentMethod,
                  registerSessionId: prevData.cashRegister.isOpen ? prevData.cashRegister.sessionId : undefined,
              };
              newCashTransactions = [newTransaction, ...prevData.cashTransactions];
          }

          return { ...prevData, rooms, cashTransactions: newCashTransactions };
      });
  }, []);

  const cancelReservation = useCallback((roomId: number, reservationId: string) => {
    setHotelData(prevData => {
        const rooms = prevData.rooms.map(room => {
            if (room.id === roomId) {
                const remainingReservations = room.reservations.filter(r => r.id !== reservationId);
                let newStatus = room.status;
                if (remainingReservations.length === 0 && room.status === RoomStatus.Reserved) {
                    newStatus = RoomStatus.Available;
                }
                return {
                    ...room,
                    status: newStatus,
                    reservations: remainingReservations,
                };
            }
            return room;
        });
        return { ...prevData, rooms };
    });
  }, []);
  
  const checkIn = useCallback((roomId: number, guestDetails: Guest) => {
      setHotelData(prevData => {
          const rooms = prevData.rooms.map(room => {
              if (room.id === roomId) {
                  return { ...room, status: RoomStatus.Occupied, guest: guestDetails };
              }
              return room;
          });

          const now = new Date();
          const paymentsToRecord = guestDetails.payments && guestDetails.payments.length > 0
              ? guestDetails.payments
              : (guestDetails.amountPaidAtCheckIn ?? 0) > 0
                  ? [{ method: guestDetails.paymentMethod || PaymentMethod.Cash, amount: guestDetails.amountPaidAtCheckIn! }]
                  : [];

          let newCashTransactions = prevData.cashTransactions;
          paymentsToRecord.forEach(p => {
              const newTransaction: CashTransaction = {
                  id: `${Date.now()}-ci-${Math.random().toString(36).slice(2, 8)}`,
                  date: now.toISOString().split('T')[0],
                  time: now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }),
                  type: 'income',
                  amount: p.amount,
                  description: `Check-In Hab. ${roomId} (${guestDetails.name})`,
                  origin: 'checkin',
                  roomId,
                  guestName: guestDetails.name,
                  paymentMethod: p.method,
                  registerSessionId: prevData.cashRegister.isOpen ? prevData.cashRegister.sessionId : undefined,
              };
              newCashTransactions = [newTransaction, ...newCashTransactions];
          });

          return { ...prevData, rooms, cashTransactions: newCashTransactions };
      });
  }, []);

  const checkInFromReservation = useCallback((roomId: number, reservationId: string) => {
      setHotelData(prevData => {
          let guestDetails: Guest | undefined;
          const rooms = prevData.rooms.map(room => {
              if (room.id === roomId) {
                  const reservationToCheckIn = room.reservations.find(r => r.id === reservationId);
                  const remainingReservations = room.reservations.filter(r => r.id !== reservationId);
                  
                  if (!reservationToCheckIn) return room;
                  guestDetails = reservationToCheckIn;

                  return {
                      ...room,
                      status: RoomStatus.Occupied,
                      guest: reservationToCheckIn,
                      reservations: remainingReservations,
                  };
              }
              return room;
          });

          const now = new Date();
          const paymentsToRecord = guestDetails?.payments && guestDetails.payments.length > 0
              ? guestDetails.payments
              : (guestDetails?.amountPaidAtCheckIn ?? 0) > 0
                  ? [{ method: guestDetails!.paymentMethod || PaymentMethod.Cash, amount: guestDetails!.amountPaidAtCheckIn! }]
                  : [];

          let newCashTransactions = prevData.cashTransactions;
          paymentsToRecord.forEach(p => {
              const newTransaction: CashTransaction = {
                  id: `${Date.now()}-ci-${Math.random().toString(36).slice(2, 8)}`,
                  date: now.toISOString().split('T')[0],
                  time: now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }),
                  type: 'income',
                  amount: p.amount,
                  description: `Check-In Hab. ${roomId} (${guestDetails!.name})`,
                  origin: 'checkin',
                  roomId,
                  guestName: guestDetails!.name,
                  paymentMethod: p.method,
                  reservationId: guestDetails!.id,
                  registerSessionId: prevData.cashRegister.isOpen ? prevData.cashRegister.sessionId : undefined,
              };
              newCashTransactions = [newTransaction, ...newCashTransactions];
          });

          return { ...prevData, rooms, cashTransactions: newCashTransactions };
      });
  }, []);

  const checkOutAndRecordBooking = useCallback((
    roomToCheckOut: Room,
    checkoutPayments: PaymentEntry[] = []
  ) => {
    if (!roomToCheckOut.guest) return;

    const { guest, id: roomId } = roomToCheckOut;

    const checkIn = new Date(guest.checkInDate);
    const finalCheckOutDate = new Date();
    
    const diffTime = Math.abs(finalCheckOutDate.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const numberOfNights = Math.max(1, diffDays);

    const totalCollected = checkoutPayments.reduce((s, p) => s + p.amount, 0);
    const checkInTotal = guest.payments ? guest.payments.reduce((s, p) => s + p.amount, 0) : (guest.amountPaidAtCheckIn ?? 0);
    const paymentMethods = [...new Set([...(guest.payments || []).map(p => p.method), ...checkoutPayments.map(p => p.method)])];

    const newBookingRecord: BookingRecord = {
      id: `${Date.now()}-${roomId}`,
      roomId,
      guestName: guest.name,
      checkInDate: guest.checkInDate,
      checkOutDate: finalCheckOutDate.toISOString().split('T')[0],
      numberOfNights,
      totalIncome: guest.totalAgreedPrice,
      paymentMethod: paymentMethods[0] || guest.paymentMethod || PaymentMethod.Cash,
      invoiceRequested: guest.invoiceRequested,
    };
    
    const newStatus = roomToCheckOut.reservations.length > 0 ? RoomStatus.Reserved : RoomStatus.Cleaning;
    const updatedRoom: Room = { ...roomToCheckOut, status: newStatus, guest: null };

    const now = new Date();

    setHotelData(prevData => {
      let updatedTransactions = prevData.cashTransactions;
      checkoutPayments.forEach(p => {
        const checkoutTransaction: CashTransaction = {
          id: `${Date.now()}-co-${Math.random().toString(36).slice(2, 8)}`,
          date: now.toISOString().split('T')[0],
          time: now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false }),
          type: 'income',
          amount: p.amount,
          description: `Check-Out Hab. ${roomId} (${guest.name}) - ${numberOfNights} noches`,
          origin: 'checkout',
          roomId,
          guestName: guest.name,
          paymentMethod: p.method,
          registerSessionId: prevData.cashRegister.isOpen ? prevData.cashRegister.sessionId : undefined,
          numberOfNights,
          checkInDate: guest.checkInDate,
        };
        updatedTransactions = [checkoutTransaction, ...updatedTransactions];
      });
      return {
        ...prevData,
        rooms: prevData.rooms.map(room => (room.id === updatedRoom.id ? updatedRoom : room)),
        bookingHistory: [newBookingRecord, ...prevData.bookingHistory],
        cashTransactions: updatedTransactions,
      };
    });

  }, []);

  return { ...hotelData, updateRoom, checkOutAndRecordBooking, addRoom, deleteRoom, addReservation, cancelReservation, checkIn, checkInFromReservation, addCashTransaction, openRegister, addCashMovement, closeRegisterWithArqueo };
}