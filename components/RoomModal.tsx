import React, { useState } from 'react';
import type { Room, Guest, PaymentEntry } from '../types';
import { RoomStatus } from '../types';
import CheckInForm from './CheckInForm';
import CheckOutForm from './CheckOutForm';
import { RoomTopBar } from './rooms/RoomStatusBadge';
import { RoomHeader } from './rooms/RoomHeader';
import { RoomGuestInfo } from './rooms/RoomGuestInfo';
import { RoomPayments } from './rooms/RoomPayments';
import { RoomDetails } from './rooms/RoomDetails';
import { RoomPrice } from './rooms/RoomPrice';
import { XMarkIcon, TrashIcon, ArrowRightIcon } from './icons/Icons';

interface RoomModalProps {
  room: Room;
  onClose: () => void;
  onUpdateRoom: (room: Room) => void;
  onCheckOutAndRecord: (room: Room, payments: PaymentEntry[]) => void;
  onDeleteRoom: (roomId: number) => void;
  onAddReservation: (roomId: number, guest: Guest) => void;
  onCancelReservation: (roomId: number, reservationId: string) => void;
  onCheckIn: (roomId: number, guest: Guest) => void;
  onCheckInFromReservation: (roomId: number, reservationId: string) => void;
}

type ModalView = 'main' | 'checkin' | 'reservation' | 'checkout';

const RoomModal: React.FC<RoomModalProps> = (props) => {
  const { room, onClose, onUpdateRoom, onCheckOutAndRecord, onDeleteRoom, onAddReservation, onCancelReservation, onCheckIn, onCheckInFromReservation } = props;

  const [modalView, setModalView] = useState<ModalView>('main');

  const isDeletable = room.status !== RoomStatus.Occupied && room.reservations.length === 0;

  const fire = (action: (...args: any[]) => void, ...args: any[]) => {
    action(...args);
    if (action === onCheckOutAndRecord) onClose();
    setModalView('main');
  };

  const confirmCancel = (reservationId: string) => {
    if (window.confirm("¿Está seguro de que desea cancelar esta reserva?")) {
      onCancelReservation(room.id, reservationId);
    }
  };

  const setStatus = (status: RoomStatus) => {
    onUpdateRoom({ ...room, status, guest: room.status === RoomStatus.Occupied ? room.guest : null });
    onClose();
  };

  const handleSavePrice = (price: number) => {
    onUpdateRoom({ ...room, pricePerNight: Number(price) });
  };

  const handleDelete = () => {
    if (isDeletable && window.confirm(`¿Está seguro de que desea eliminar la habitación ${room.roomNumber}? Esta acción es permanente.`)) {
      onDeleteRoom(room.id);
    }
  };

  const renderContent = () => {
    if (modalView === 'checkin' || modalView === 'reservation') {
      return <CheckInForm
        room={room}
        onCancel={() => setModalView('main')}
        onConfirm={(guest) => fire(modalView === 'checkin' ? onCheckIn : onAddReservation, room.id, guest)}
        mode={modalView}
      />;
    }

    if (modalView === 'checkout') {
      return <CheckOutForm room={room} onConfirm={(payments) => fire(onCheckOutAndRecord, room, payments)} onCancel={() => setModalView('main')} />;
    }

    switch (room.status) {
      case RoomStatus.Available:
        return (
          <div className="space-y-4">
            <RoomDetails room={room} />
            <div className="pt-2 border-t border-gray-100">
              <p className="text-sm text-gray-500 mb-4 text-center">Lista para nuevo huésped</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setModalView('checkin')} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                  Check-In
                </button>
                <button onClick={() => setModalView('reservation')} className="bg-amber-400 hover:bg-amber-300 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                  Reservar
                </button>
              </div>
              <div className="flex gap-3 mt-3">
                <button onClick={() => setStatus(RoomStatus.Maintenance)} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded-lg transition-colors text-sm">
                  Mantenimiento
                </button>
                <button onClick={handleDelete} disabled={!isDeletable}
                  title={!isDeletable ? "No se puede eliminar: tiene reservas futuras." : "Eliminar habitación"}
                  className="flex-1 bg-red-700 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-2 px-3 rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
                  <TrashIcon className="w-4 h-4" /> Eliminar
                </button>
              </div>
            </div>
          </div>
        );

      case RoomStatus.Reserved:
        return (
          <div className="space-y-4">
            <RoomDetails room={room} />
            <div className="border-t border-gray-100 pt-3">
              <h4 className="text-sm font-semibold text-gray-500 mb-3">Reservas</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {room.reservations.map(r => (
                  <div key={r.id} className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{r.name}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(r.checkInDate + 'T00:00:00').toLocaleDateString()} - {new Date(r.checkOutDate + 'T00:00:00').toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-1.5 shrink-0">
                        <button onClick={() => confirmCancel(r.id)} className="text-red-400 hover:text-red-500 p-1" title="Cancelar">
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                        <button onClick={() => fire(onCheckInFromReservation, room.id, r.id)}
                          className="bg-green-600 hover:bg-green-500 text-white text-xs font-semibold py-1 px-2 rounded-md transition-colors">
                          Check-In
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {room.reservations.length === 0 && <p className="text-sm text-gray-400 text-center py-3">Sin reservas</p>}
              <button onClick={() => setModalView('reservation')} className="mt-3 w-full bg-amber-400 hover:bg-amber-300 text-white font-bold py-2.5 px-4 rounded-lg transition-colors text-sm">
                Nueva Reserva
              </button>
            </div>
          </div>
        );

      case RoomStatus.Occupied:
        return room.guest ? (
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <RoomGuestInfo guest={room.guest} />
            <div className="border-t border-gray-100 pt-3">
              <h4 className="text-sm font-semibold text-gray-500 mb-2">Resumen de Pagos</h4>
              <RoomPayments guest={room.guest} />
            </div>
            <button onClick={() => setModalView('checkout')}
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
              <ArrowRightIcon className="w-5 h-5" /> Registrar Salida
            </button>
          </div>
        ) : null;

      case RoomStatus.Cleaning:
      case RoomStatus.Maintenance:
        return (
          <div className="space-y-4">
            <RoomDetails room={room} />
            <div className="border-t border-gray-100 pt-3">
              <p className="text-sm text-gray-500 mb-4 text-center">
                {room.status === RoomStatus.Cleaning ? 'Habitación en limpieza' : 'Habitación en mantenimiento'}
              </p>
              <button onClick={() => setStatus(RoomStatus.Available)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                Marcar Disponible
              </button>
              <button onClick={handleDelete} disabled={!isDeletable}
                className="mt-2 w-full bg-red-700 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm flex items-center justify-center gap-2">
                <TrashIcon className="w-4 h-4" /> Eliminar
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg m-4 border border-gray-200 overflow-hidden" onClick={e => e.stopPropagation()}>
        <RoomTopBar status={room.status} />
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold text-gray-900">{room.roomNumber}</h2>
                <span className="text-xs text-gray-400 uppercase tracking-wider">
                  {(room.roomType === 'suite_premium' ? 'Suite Premium' :
                    room.roomType === 'suite' ? 'Suite' :
                    room.roomType === 'doble' ? 'Doble' : 'Individual')}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-gray-400">Piso {room.floor}</span>
                <RoomPrice price={room.pricePerNight} onSave={handleSavePrice} />
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default RoomModal;
