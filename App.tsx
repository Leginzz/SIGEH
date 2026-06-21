import React, { useState, useEffect } from 'react';
import RoomGrid from './components/RoomGrid';
import RoomModal from './components/RoomModal';
import Dashboard from './components/Dashboard';
import ReservationsView from './components/ReservationsView';
import ReportsView from './components/ReportsView';
import { useHotelData } from './hooks/useHotelData';
import type { Room } from './types';
import { BedIcon, ChartBarIcon, BookmarkSquareIcon, ArchiveBoxIcon } from './components/icons/Icons';

type View = 'rooms' | 'dashboard' | 'reservations' | 'reports';

function App() {
  const { 
    rooms, 
    bookingHistory,
    dailyReports,
    cashTransactions,
    updateRoom, 
    checkOutAndRecordBooking, 
    addRoom, 
    deleteRoom, 
    addReservation,
    cancelReservation,
    checkIn, 
    checkInFromReservation,
    generateDailyReport,
    addCashTransaction,
  } = useHotelData();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [activeView, setActiveView] = useState<View>('rooms');

  useEffect(() => {
    // Keep selectedRoom in sync with the main rooms list
    // This fixes UI not updating after deleting a room or cancelling a reservation
    if (selectedRoom) {
      const freshRoomData = rooms.find(r => r.id === selectedRoom.id);
      setSelectedRoom(freshRoomData || null);
    }
  }, [rooms]);

  const handleSelectRoom = (room: Room) => {
    setSelectedRoom(room);
  };

  const handleCloseModal = () => {
    setSelectedRoom(null);
  };

  const NavButton: React.FC<{view: View, label: string, icon: React.ReactNode}> = ({ view, label, icon }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex items-center space-x-2 px-3 py-2 text-sm sm:px-4 sm:py-2 rounded-lg transition-all duration-300 ${
        activeView === view
          ? 'bg-indigo-600 text-white shadow-lg'
          : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/80 hover:text-white'
      }`}
    >
      {icon}
      <span className="font-semibold hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-6 lg:p-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
          SIGEH - Sistema de Gestión Hotelera
        </h1>
        <p className="text-slate-400 mt-2 max-w-2xl mx-auto">
          {
            {
              rooms: `Gestionando ${rooms.length} habitaciones en tiempo real.`,
              dashboard: 'Control de caja y análisis de ingresos del período actual.',
              reservations: 'Vista y gestión de futuras reservas.',
              reports: 'Historial de cortes de caja e informes financieros.'
            }[activeView]
          }
        </p>
      </header>

      <nav className="flex justify-center items-center mb-8 bg-slate-800/30 backdrop-blur-sm p-2 rounded-xl max-w-md sm:max-w-lg mx-auto">
        <div className="flex space-x-2">
            <NavButton view="rooms" label="Habitaciones" icon={<BedIcon className="w-5 h-5"/>} />
            <NavButton view="dashboard" label="Caja" icon={<ChartBarIcon className="w-5 h-5" />} />
            <NavButton view="reservations" label="Reservas" icon={<BookmarkSquareIcon className="w-5 h-5" />} />
            <NavButton view="reports" label="Informes" icon={<ArchiveBoxIcon className="w-5 h-5" />} />
        </div>
      </nav>
      
      <main>
        {activeView === 'rooms' && <RoomGrid rooms={rooms} onSelectRoom={handleSelectRoom} onAddRoom={addRoom} />}
        {activeView === 'dashboard' && <Dashboard cashTransactions={cashTransactions} onGenerateReport={generateDailyReport} onAddCashTransaction={addCashTransaction} />}
        {activeView === 'reservations' && <ReservationsView rooms={rooms} />}
        {activeView === 'reports' && <ReportsView reports={dailyReports} />}
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

      <footer className="text-center mt-12 text-slate-500 text-sm">
        <p>Desarrollado con tecnología de vanguardia para una gestión hotelera superior — SIGEH</p>
      </footer>
    </div>
  );
}

export default App;