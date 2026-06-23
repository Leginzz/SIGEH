import React, { useState } from 'react';
import type { Room, Guest, PaymentEntry } from '../types';
import { RoomStatus } from '../types';
import CheckInForm from './CheckInForm';
import CheckOutForm from './CheckOutForm';
import { CalendarIcon, UserCircleIcon, PhoneIcon, UserGroupIcon, XMarkIcon, CurrencyDollarIcon, PencilSquareIcon, CheckCircleIcon, TrashIcon, TruckIcon, TagIcon, BookmarkSquareIcon, IdentificationIcon, XCircleIcon } from './icons/Icons';

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
  const [isEditingPrice, setIsEditingPrice] = useState(false);
  const [editablePrice, setEditablePrice] = useState(room.pricePerNight);

  const isDeletable = room.status !== RoomStatus.Occupied && room.reservations.length === 0;

  const handleAction = (action: (...args: any[]) => void, ...args: any[]) => {
    action(...args);
    setModalView('main');
    if (action === onCheckOutAndRecord) onClose();
  };

  const handleCancelReservation = (reservationId: string) => {
    if (window.confirm("¿Está seguro de que desea cancelar esta reserva?")) {
      onCancelReservation(room.id, reservationId);
    }
  };

  const handleSetStatus = (status: RoomStatus) => {
    onUpdateRoom({ ...room, status, guest: room.status === RoomStatus.Occupied ? room.guest : null });
    onClose();
  };

  const handleSavePrice = () => {
    onUpdateRoom({ ...room, pricePerNight: Number(editablePrice) });
    setIsEditingPrice(false);
  };

  const handleDelete = () => {
    if (isDeletable && window.confirm(`¿Está seguro de que desea eliminar la habitación ${room.id}? Esta acción es permanente y no se puede deshacer.`)) {
      onDeleteRoom(room.id);
    }
  };

  const PriceDisplay = () => (
    <div className="flex items-center justify-center text-lg text-green-600 mb-6 bg-green-50 py-2 px-4 rounded-lg">
      <CurrencyDollarIcon className="w-6 h-6 mr-2" />
      {isEditingPrice ? (
        <div className="flex items-center gap-2">
          <span className="font-semibold">Precio: $</span>
          <input
            type="number"
            value={editablePrice}
            onChange={(e) => setEditablePrice(Number(e.target.value))}
            className="bg-white text-gray-900 border border-gray-300 w-24 rounded px-2 py-1 focus:ring-indigo-500 focus:border-indigo-500"
            autoFocus
          />
          <button onClick={handleSavePrice} className="text-green-600 hover:text-green-500"><CheckCircleIcon className="w-6 h-6"/></button>
        </div>
      ) : (
        <>
          <span>Precio por noche: <strong>${room.pricePerNight}</strong></span>
          <button onClick={() => setIsEditingPrice(true)} className="ml-3 text-gray-400 hover:text-gray-600">
            <PencilSquareIcon className="w-5 h-5"/>
          </button>
        </>
      )}
    </div>
  );

  const renderContent = () => {
    if (modalView === 'checkin' || modalView === 'reservation') {
      return <CheckInForm
        room={room}
        onCancel={() => setModalView('main')}
        onConfirm={(guest) => handleAction(modalView === 'checkin' ? onCheckIn : onAddReservation, room.id, guest)}
        mode={modalView}
      />;
    }

    if (modalView === 'checkout') {
      return <CheckOutForm room={room} onConfirm={(payments) => handleAction(onCheckOutAndRecord, room, payments)} onCancel={() => setModalView('main')} />;
    }

    switch (room.status) {
      case RoomStatus.Available:
        return (
          <div>
            <PriceDisplay />
            <p className="text-gray-600 text-center mb-6">Esta habitación está lista para un nuevo huésped.</p>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setModalView('checkin')} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                Check-In
              </button>
              <button onClick={() => setModalView('reservation')} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                Reservar
              </button>
            </div>
            <div className="mt-4 flex justify-center space-x-4">
              <button onClick={() => handleSetStatus(RoomStatus.Maintenance)} className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-3 rounded-lg transition-colors text-sm">
                Mantenimiento
              </button>
              <button
                onClick={handleDelete}
                disabled={!isDeletable}
                title={!isDeletable ? "No se puede eliminar: la habitación tiene reservas futuras." : "Eliminar habitación"}
                className="flex-1 bg-red-700 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-2 px-3 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
              >
                <TrashIcon className="w-4 h-4" /> Eliminar
              </button>
            </div>
          </div>
        );
      case RoomStatus.Reserved:
        return (
          <div>
            <h4 className="text-lg font-semibold text-purple-600 mb-4 text-center">Reservas Programadas</h4>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {room.reservations.map(res => (
                <div key={res.id} className="bg-purple-50 border border-purple-200 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold text-gray-800">{res.name}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(res.checkInDate + 'T00:00:00').toLocaleDateString()} - {new Date(res.checkOutDate + 'T00:00:00').toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleCancelReservation(res.id)} className="text-red-500 hover:text-red-400" title="Cancelar Reserva">
                        <XCircleIcon className="w-6 h-6"/>
                      </button>
                      <button
                        onClick={() => handleAction(onCheckInFromReservation, room.id, res.id)}
                        className="bg-green-600 hover:bg-green-500 text-white font-semibold py-1 px-3 rounded-md text-sm transition-colors"
                      >
                        Check-In
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {room.reservations.length === 0 && <p className="text-center text-gray-400">No hay reservas para esta habitación.</p>}
            <button onClick={() => setModalView('reservation')} className="mt-6 w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
              <BookmarkSquareIcon className="w-5 h-5"/> Añadir Otra Reserva
            </button>
          </div>
        );
      case RoomStatus.Occupied:
        return room.guest ? (
          <div className="max-h-[70vh] overflow-y-auto pr-2">
            <div className="space-y-3 text-gray-700">
              <div className="flex items-center"><UserCircleIcon className="w-5 h-5 mr-3 text-indigo-500" /> <strong>Huésped:</strong> <span className="ml-auto text-gray-900 font-semibold">{room.guest.name}</span></div>
              <div className="flex items-center"><UserGroupIcon className="w-5 h-5 mr-3 text-indigo-500" /> <strong>Personas:</strong> <span className="ml-auto text-gray-900">{room.guest.numberOfGuests}</span></div>
              <div className="flex items-center"><PhoneIcon className="w-5 h-5 mr-3 text-indigo-500" /> <strong>Contacto:</strong> <span className="ml-auto text-gray-900">{room.guest.contact}</span></div>
              <div className="flex items-center"><IdentificationIcon className="w-5 h-5 mr-3 text-indigo-500" /> <strong>ID:</strong> <span className="ml-auto text-gray-900">{room.guest.identificationType} - {room.guest.identificationNumber}</span></div>
              <div className="flex items-center"><CalendarIcon className="w-5 h-5 mr-3 text-indigo-500" /> <strong>Check-in:</strong> <span className="ml-auto text-gray-900">{new Date(room.guest.checkInDate + 'T00:00:00').toLocaleDateString()}</span></div>
              <div className="flex items-center"><CalendarIcon className="w-5 h-5 mr-3 text-indigo-500" /> <strong>Check-out:</strong> <span className="ml-auto text-gray-900">{new Date(room.guest.checkOutDate + 'T00:00:00').toLocaleDateString()}</span></div>
              <div className="flex items-center"><TagIcon className="w-5 h-5 mr-3 text-indigo-500" /> <strong>Toallas:</strong> <span className="ml-auto text-gray-900">{room.guest.numberOfTowels}</span></div>
              {room.guest.hasVehicle && <div className="flex items-start"><TruckIcon className="w-5 h-5 mr-3 text-indigo-500 mt-1" /> <strong>Vehículo:</strong> <span className="ml-auto text-gray-900 text-right">{room.guest.vehicleDetails || 'Sí'}</span></div>}
              {room.guest.notes && <div className="text-sm pt-2"><strong>Notas:</strong> {room.guest.notes}</div>}
              <hr className="border-gray-200 my-3" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total estancia</span>
                <span className="font-semibold text-gray-900">${room.guest.totalAgreedPrice.toFixed(2)}</span>
              </div>
              {room.guest.payments && room.guest.payments.length > 0 ? (
                <div className="space-y-0.5">
                  {room.guest.payments.map((p, i) => (
                    <div key={i} className="flex justify-between text-xs ml-2">
                      <span className="text-gray-500">{p.method}</span>
                      <span className="font-medium text-emerald-600">-${p.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pagado en check-in</span>
                  <span className="font-medium text-emerald-600">-${(room.guest.amountPaidAtCheckIn ?? room.guest.totalAgreedPrice).toFixed(2)}</span>
                </div>
              )}
              {(() => {
                const paidTotal = room.guest.payments?.reduce((s, p) => s + p.amount, 0) ?? room.guest.amountPaidAtCheckIn ?? room.guest.totalAgreedPrice;
                return paidTotal < room.guest.totalAgreedPrice && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Saldo pendiente</span>
                    <span className="font-bold text-red-600">${(room.guest.totalAgreedPrice - paidTotal).toFixed(2)}</span>
                  </div>
                );
              })()}
              {room.guest.paymentMethod && !room.guest.payments && (
                <div className="text-sm text-gray-400 text-right mt-1">Pagado con {room.guest.paymentMethod}</div>
              )}
            </div>
            <button onClick={() => setModalView('checkout')} className="mt-6 w-full bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-lg transition-colors">
              Registrar Salida
            </button>
          </div>
        ) : null;
      case RoomStatus.Cleaning:
      case RoomStatus.Maintenance:
        return (
          <div>
            <PriceDisplay />
            <p className="text-gray-600 text-center mb-6">{room.status === RoomStatus.Cleaning ? 'Esta habitación necesita limpieza.' : 'Esta habitación está en mantenimiento.'}</p>
            <div className="flex justify-center space-x-4">
              <button onClick={() => handleSetStatus(RoomStatus.Available)} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                Marcar como Disponible
              </button>
              <button
                onClick={handleDelete}
                disabled={!isDeletable}
                title={!isDeletable ? "No se puede eliminar: la habitación tiene actividad futura." : "Eliminar habitación"}
                className="bg-red-700 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md m-4 p-6 border border-gray-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
            Habitación {room.id}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="w-8 h-8"/>
          </button>
        </div>
        <div>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default RoomModal;
