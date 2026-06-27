import React, { useState, useEffect, useMemo } from 'react';
import RoomGrid from './components/RoomGrid';
import RoomModal from './components/RoomModal';
import ReservationsView from './components/ReservationsView';
import ReportsView from './components/ReportsView';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import CashView from './components/CashView';
import OccupancyCalendarView from './components/OccupancyCalendarView';
import { useHotelData } from './hooks/useHotelData';
import { AuthProvider } from './auth/AuthProvider';
import { useAuth } from './auth/useAuth';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { LoginScreen } from './auth/LoginScreen';
import { UsersView } from './auth/UsersView';
import type { Room } from './types';
import type { Permission } from './auth/types';
import { BedIcon, BookmarkSquareIcon, ArchiveBoxIcon, PresentationChartIcon, CurrencyDollarIcon, CalendarDaysIcon, UserCircleIcon } from './components/icons/Icons';

type View = 'rooms' | 'reservations' | 'reports' | 'executive' | 'cash' | 'calendar' | 'users';

interface NavItem {
  view: View;
  label: string;
  icon: React.ReactNode;
  permission: Permission;
}

const navItems: NavItem[] = [
  { view: 'executive', label: 'Dashboard', icon: <PresentationChartIcon className="w-5 h-5" />, permission: 'dashboard' },
  { view: 'rooms', label: 'Habitaciones', icon: <BedIcon className="w-5 h-5" />, permission: 'habitaciones' },
  { view: 'calendar', label: 'Calendario', icon: <CalendarDaysIcon className="w-5 h-5" />, permission: 'calendario' },
  { view: 'cash', label: 'Caja', icon: <CurrencyDollarIcon className="w-5 h-5" />, permission: 'caja' },
  { view: 'reservations', label: 'Reservas', icon: <BookmarkSquareIcon className="w-5 h-5" />, permission: 'reservas' },
  { view: 'reports', label: 'Informes', icon: <ArchiveBoxIcon className="w-5 h-5" />, permission: 'informes' },
  { view: 'users', label: 'Usuarios', icon: <UserCircleIcon className="w-5 h-5" />, permission: 'usuarios' },
];

const descriptions: Record<string, string> = {
  executive: 'Métricas clave, gráficas y rendimiento del hotel en tiempo real.',
  rooms: 'Gestión de habitaciones en tiempo real.',
  calendar: 'Calendario de ocupación visual por día. Consulta disponibilidad, reservas y ocupación.',
  cash: 'Centro financiero unificado. Apertura, movimientos, arqueo, cierre e historial.',
  reservations: 'Vista y gestión de futuras reservas.',
  reports: 'Historial de cortes de caja e informes financieros.',
  users: 'Administración de usuarios del sistema.',
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, login, logout, hasPermission, loading } = useAuth();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={login} />;
  }

  const permittedNavItems = useMemo(
    () => navItems.filter(item => hasPermission(item.permission)),
    [hasPermission]
  );

  useEffect(() => {
    if (!permittedNavItems.find(n => n.view === activeView)) {
      setActiveView(permittedNavItems[0]?.view || 'executive');
    }
  }, [permittedNavItems, activeView]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0 min-h-screen flex flex-col">
        <div className="p-5 border-b border-slate-700 flex flex-col items-center">
          <img src="logo.png" alt="SIGEH" className="h-24 w-auto" />
          <p className="text-xs text-slate-400 mt-1">Sistema de Gestión Hotelera</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {permittedNavItems.map(item => (
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
        <div className="border-t border-slate-700 p-4 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white">
              {user.nombre.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.nombre}</p>
              <p className="text-xs text-slate-400">{user.rol === 'admin' ? 'Admin' : 'Recepción'}</p>
            </div>
          </div>
          <button onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Cerrar Sesión
          </button>
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
          <ProtectedRoute permission="habitaciones">
            <RoomGrid rooms={rooms} onSelectRoom={handleSelectRoom} onAddRoom={addRoom} />
          </ProtectedRoute>
        )}
        {activeView === 'cash' && (
          <ProtectedRoute permission="caja">
            <CashView
              rooms={rooms}
              cashTransactions={cashTransactions}
              cashRegister={cashRegister}
              onOpenRegister={openRegister}
              onAddCashTransaction={addCashTransaction}
              onCloseRegister={closeRegisterWithArqueo}
            />
          </ProtectedRoute>
        )}
        {activeView === 'reservations' && (
          <ProtectedRoute permission="reservas">
            <ReservationsView rooms={rooms} />
          </ProtectedRoute>
        )}
        {activeView === 'reports' && (
          <ProtectedRoute permission="informes">
            <ReportsView reports={dailyReports} />
          </ProtectedRoute>
        )}
        {activeView === 'calendar' && (
          <ProtectedRoute permission="calendario">
            <OccupancyCalendarView rooms={rooms} />
          </ProtectedRoute>
        )}
        {activeView === 'executive' && (
          <ProtectedRoute permission="dashboard">
            <ExecutiveDashboard
              rooms={rooms}
              cashTransactions={cashTransactions}
              dailyReports={dailyReports}
            />
          </ProtectedRoute>
        )}
        {activeView === 'users' && (
          <ProtectedRoute permission="usuarios">
            <UsersView />
          </ProtectedRoute>
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
