import React, { useState, useEffect, useMemo } from 'react';
import RoomGrid from './components/RoomGrid';
import RoomModal from './components/RoomModal';
import ReservationsView from './components/ReservationsView';
import ReportsView from './components/ReportsView';
import ExecutiveDashboard from './components/ExecutiveDashboard';
import CashView from './components/CashView';
import { CalendarView } from './components/calendar/CalendarView';
import { AdminView } from './components/admin/AdminView';
import { useHotelData } from './hooks/useHotelData';
import { useAdminData } from './hooks/useAdminData';
import { AuthProvider } from './auth/AuthProvider';
import { useAuth } from './auth/useAuth';
import { ProtectedRoute } from './auth/ProtectedRoute';
import { LoginScreen } from './auth/LoginScreen';
import type { Room } from './types';
import type { Permission } from './auth/types';
import { BedIcon, BookmarkSquareIcon, ArchiveBoxIcon, PresentationChartIcon, CurrencyDollarIcon, CalendarDaysIcon, CogIcon } from './components/icons/Icons';

type View = 'rooms' | 'reservations' | 'reports' | 'executive' | 'cash' | 'calendar' | 'admin';

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
  { view: 'admin', label: 'Administración', icon: <CogIcon className="w-5 h-5" />, permission: 'configuracion' },
];

const descriptions: Record<string, string> = {
  executive: 'Métricas clave, gráficas y rendimiento del hotel en tiempo real.',
  rooms: 'Gestión de habitaciones en tiempo real.',
  calendar: 'Calendario de ocupación visual por día. Consulta disponibilidad, reservas y ocupación.',
  cash: 'Centro financiero unificado. Apertura, movimientos, arqueo, cierre e historial.',
  reservations: 'Vista y gestión de futuras reservas.',
  reports: 'Historial de cortes de caja e informes financieros.',
  admin: 'Configuración general del hotel, catálogos y usuarios.',
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
  const adminData = useAdminData();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [activeView, setActiveView] = useState<View>('executive');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (selectedRoom) {
      const freshRoomData = rooms.find(r => r.id === selectedRoom.id);
      setSelectedRoom(freshRoomData || null);
    }
  }, [rooms]);

  useEffect(() => {
    setSidebarOpen(false);
  }, [activeView]);

  const handleSelectRoom = (room: Room) => setSelectedRoom(room);
  const handleCloseModal = () => setSelectedRoom(null);

  const permittedNavItems = useMemo(
    () => navItems.filter(item => hasPermission(item.permission)),
    [hasPermission]
  );

  useEffect(() => {
    if (!permittedNavItems.find(n => n.view === activeView)) {
      setActiveView(permittedNavItems[0]?.view || 'executive');
    }
  }, [permittedNavItems, activeView]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 text-sm">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen onLogin={login} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className={`fixed inset-0 bg-black/40 z-20 transition-opacity duration-200 lg:hidden ${sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)} />

      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white flex flex-col transition-transform duration-200 ease-out lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>

        <div className="p-5 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <img src="logo.png" alt="SIGEH" className="h-10 w-auto" />
            <div>
              <p className="text-sm font-bold text-white">SIGEH</p>
              <p className="text-[11px] text-slate-400">Sistema de Gestión Hotelera</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {permittedNavItems.map(item => (
            <button
              key={item.view}
              onClick={() => setActiveView(item.view)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeView === item.view
                    ? 'bg-indigo-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className={`${activeView === item.view ? 'text-white' : 'text-slate-400'}`}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="border-t border-slate-700 p-3">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
              {user.nombre.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.nombre}</p>
              <p className="text-[11px] text-slate-400">{user.rol === 'admin' ? 'Administrador' : 'Recepción'}</p>
            </div>
            <button onClick={logout} title="Cerrar sesión"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      <main className="lg:ml-64 min-h-screen flex flex-col">
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 lg:px-6 h-14 flex items-center gap-3">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-1.5 text-gray-500 hover:text-gray-700 -ml-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 truncate">
              {navItems.find(n => n.view === activeView)?.label}
            </h1>
            <p className="text-xs text-gray-500 truncate">{descriptions[activeView]}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400">
              <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                {user.nombre.charAt(0).toUpperCase()}
              </div>
              <span className="text-gray-600">{user.nombre}</span>
            </div>
          </div>
        </header>

        <div className="flex-1 p-4 lg:p-6">
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
              <CalendarView rooms={rooms} onSelectRoom={handleSelectRoom} />
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
          {activeView === 'admin' && (
            <ProtectedRoute permission="configuracion">
              <AdminView
                hotelSettings={adminData.hotelSettings}
                buildings={adminData.buildings}
                floors={adminData.floors}
                roomTypes={adminData.roomTypes}
                rates={adminData.rates}
                amenities={adminData.amenities}
                taxes={adminData.taxes}
                systemConfig={adminData.systemConfig}
                rooms={rooms}
                onSetHotelSettings={adminData.setHotelSettings}
                onUpsertBuilding={adminData.upsertBuilding}
                onRemoveBuilding={adminData.removeBuilding}
                onToggleBuildingActive={adminData.toggleBuildingActive}
                onUpsertFloor={adminData.upsertFloor}
                onRemoveFloor={adminData.removeFloor}
                onToggleFloorActive={adminData.toggleFloorActive}
                onUpsertRoomType={adminData.upsertRoomType}
                onRemoveRoomType={adminData.removeRoomType}
                onToggleRoomTypeActive={adminData.toggleRoomTypeActive}
                onUpsertRate={adminData.upsertRate}
                onRemoveRate={adminData.removeRate}
                onToggleRateActive={adminData.toggleRateActive}
                onUpsertAmenity={adminData.upsertAmenity}
                onRemoveAmenity={adminData.removeAmenity}
                onToggleAmenityActive={adminData.toggleAmenityActive}
                onUpsertTax={adminData.upsertTax}
                onRemoveTax={adminData.removeTax}
                onToggleTaxActive={adminData.toggleTaxActive}
                onSetSystemConfig={adminData.setSystemConfig}
                onUpdateRoom={updateRoom}
                onAddRoom={addRoom}
                onDeleteRoom={deleteRoom}
              />
            </ProtectedRoute>
          )}
        </div>
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
