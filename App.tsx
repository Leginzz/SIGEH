import React, { useState, useEffect } from 'react';
import RoomGrid from './components/RoomGrid';
import RoomModal from './components/RoomModal';
import ReservationsView from './components/ReservationsView';
import ReportsView from './components/ReportsView';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import CashView from './components/CashView';
import { useHotelData } from './hooks/useHotelData';
import type { Room } from './types';
import { BedIcon, BookmarkSquareIcon, ArchiveBoxIcon, PresentationChartIcon, CurrencyDollarIcon } from './components/icons/Icons';

type View = 'rooms' | 'reservations' | 'reports' | 'executive' | 'cash';

const navItems: { view: View; label: string; icon: React.ReactNode }[] = [
  { view: 'executive', label: 'Dashboard', icon: <PresentationChartIcon className="w-5 h-5" /> },
  { view: 'rooms', label: 'Habitaciones', icon: <BedIcon className="w-5 h-5" /> },
  { view: 'cash', label: 'Caja', icon: <CurrencyDollarIcon className="w-5 h-5" /> },
  { view: 'reservations', label: 'Reservas', icon: <BookmarkSquareIcon className="w-5 h-5" /> },
  { view: 'reports', label: 'Informes', icon: <ArchiveBoxIcon className="w-5 h-5" /> },
];

const descriptions: Record<View, string> = {
  executive: 'Métricas clave, gráficas y rendimiento del hotel en tiempo real.',
  rooms: 'Gestión de habitaciones en tiempo real.',
  cash: 'Centro financiero unificado. Apertura, movimientos, arqueo, cierre e historial.',
  reservations: 'Vista y gestión de futuras reservas.',
  reports: 'Historial de cortes de caja e informes financieros.',
};

function App() {
  const {
    rooms, bookingHistory, dailyReports, cashTransactions, cashRegister,
    updateRoom, checkOutAndRecordBooking, addRoom, deleteRoom,
    addReservation, cancelReservation, checkIn, checkInFromReservation,
    addCashTransaction, openRegister, closeRegisterWithArqueo,
  } = useHotelData();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [activeView, setActiveView] = useState<View>('executive');

  useEffect(() => {
    if (selectedRoom) {
      const freshRoomData = rooms.find(r => r.id === selectedRoom.id);
      setSelectedRoom(freshRoomData || null);
    }
  }, [rooms]);

  const handleSelectRoom = (room: Room) => setSelectedRoom(room);
  const handleCloseModal = () => setSelectedRoom(null);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 min-h-screen flex flex-col">
        <div className="p-5 border-b border-slate-700 flex flex-col items-center">
          <img src="/logo.png" alt="SIGEH" className="h-12 w-auto" />
          <p className="text-xs text-slate-400 mt-1">Sistema de Gestión Hotelera</p>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(item => (
            <button
              key={item.view}
              onClick={() => setActiveView(item.view)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                activeView === item.view
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 text-xs text-slate-600 border-t border-slate-800">
          v0.1.0
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {navItems.find(n => n.view === activeView)?.label}
          </h2>
          <p className="text-gray-500 mt-1">{descriptions[activeView]}</p>
        </div>

        {activeView === 'rooms' && (
          <RoomGrid rooms={rooms} onSelectRoom={handleSelectRoom} onAddRoom={addRoom} />
        )}
        {activeView === 'cash' && (
          <CashView
            rooms={rooms}
            bookingHistory={bookingHistory}
            cashTransactions={cashTransactions}
            cashRegister={cashRegister}
            onOpenRegister={openRegister}
            onAddCashTransaction={addCashTransaction}
            onCloseRegister={closeRegisterWithArqueo}
          />
        )}
        {activeView === 'reservations' && <ReservationsView rooms={rooms} />}
        {activeView === 'reports' && <ReportsView reports={dailyReports} />}
        {activeView === 'executive' && (
          <ExecutiveDashboard
            rooms={rooms}
            bookingHistory={bookingHistory}
            cashTransactions={cashTransactions}
            dailyReports={dailyReports}
          />
        )}
      </main>

      {selectedRoom && (
        <RoomModal
          room={selectedRoom}
          onClose={handleCloseModal}
          onUpdateRoom={updateRoom}
          onCheckOutAndRecord={checkOutAndRecordBooking}
          onDeleteRoom={deleteRoom}
          onAddReservation={addReservation}
          onCancelReservation={cancelReservation}
          onCheckIn={checkIn}
          onCheckInFromReservation={checkInFromReservation}
        />
      )}
    </div>
  );
}

export default App;
