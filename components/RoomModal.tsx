import React, { useState, useMemo } from 'react';
import type { Room, Guest } from '../types';
import { RoomStatus } from '../types';
import CheckInForm from './CheckInForm';
import CheckOutForm from './CheckOutForm';
import { CalendarIcon, UserCircleIcon, PhoneIcon, UserGroupIcon, XMarkIcon, CurrencyDollarIcon, PencilSquareIcon, CheckCircleIcon, TrashIcon, TruckIcon, TagIcon, BookmarkSquareIcon, IdentificationIcon, XCircleIcon } from './icons/Icons';

interface RoomModalProps {
  room: Room;
  onClose: () => void;
  onUpdateRoom: (room: Room) => void;
  onCheckOutAndRecord: (room: Room) => void;
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
    // For actions that don't auto-close the modal via state updates (like checkout)
    if (action === onCheckOutAndRecord) {
        onClose();
    }
  };
  
  const handleCancelReservation = (reservationId: string) => {
      if (window.confirm("¿Está seguro de que desea cancelar esta reserva?")) {
          onCancelReservation(room.id, reservationId);
      }
  }

  const handleSetStatus = (status: RoomStatus) => {
    onUpdateRoom({ ...room, status, guest: room.status === RoomStatus.Occupied ? room.guest : null });
    onClose();
  }

  const handleSavePrice = () => {
    onUpdateRoom({ ...room, pricePerNight: Number(editablePrice) });
    setIsEditingPrice(false);
  };
  
  const handleDelete = () => {
    if (isDeletable && window.confirm(`¿Está seguro de que desea eliminar la habitación ${room.id}? Esta acción es permanente y no se puede deshacer.`)) {
        onDeleteRoom(room.id);
        // The useEffect in App.tsx will handle closing the modal by setting selectedRoom to null
    }
  }

  const PriceDisplay = () => (
    <div className="flex items-center justify-center text-lg text-green-400 mb-6 bg-green-500/10 py-2 px-4 rounded-lg">
      <CurrencyDollarIcon className="w-6 h-6 mr-2" />
      {isEditingPrice ? (
         <div className="flex items-center gap-2">
            <span className="font-semibold">Precio: $</span>
            <input
                type="number"
                value={editablePrice}
                onChange={(e) => setEditablePrice(Number(e.target.value))}
                className="bg-slate-700 text-white w-24 rounded px-2 py-1 focus:ring-indigo-500 focus:border-indigo-500"
                autoFocus
            />
            <button onClick={handleSavePrice} className="text-green-400 hover:text-green-300"><CheckCircleIcon className="w-6 h-6"/></button>
         </div>
      ) : (
        <>
          <span>Precio por noche: <strong>${room.pricePerNight}</strong></span>
          <button onClick={() => setIsEditingPrice(true)} className="ml-3 text-slate-400 hover:text-white">
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
        return <CheckOutForm room={room} onConfirm={() => handleAction(onCheckOutAndRecord, room)} onCancel={() => setModalView('main')} />;
    }

    switch (room.status) {
      case RoomStatus.Available:
        return (
          <div>
            <PriceDisplay />
            <p className="text-slate-300 text-center mb-6">Esta habitación está lista para un nuevo huésped.</p>
            <div className="grid grid-cols-2 gap-4">
               <button onClick={() => setModalView('checkin')} className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                  Check-In
               </button>
               <button onClick={() => setModalView('reservation')} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                  Reservar
               </button>
            </div>
            <div className="mt-4 flex justify-center space-x-4">
                <button onClick={() => handleSetStatus(RoomStatus.Maintenance)} className="flex-1 bg-slate-600 hover:bg-slate-500 text-white font-bold py-2 px-3 rounded-lg transition-colors text-sm">
                  Mantenimiento
                </button>
                <button 
                  onClick={handleDelete} 
                  disabled={!isDeletable}
                  title={!isDeletable ? "No se puede eliminar: la habitación tiene reservas futuras." : "Eliminar habitación"}
                  className="flex-1 bg-red-800 hover:bg-red-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-2 px-3 rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <TrashIcon className="w-4 h-4" /> Eliminar
                </button>
            </div>
          </div>
        );
      case RoomStatus.Reserved:
        return (
          <div>
            <h4 className="text-lg font-semibold text-purple-400 mb-4 text-center">Reservas Programadas</h4>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {room.reservations.map(res => (
                    <div key={res.id} className="bg-slate-700/50 p-3 rounded-lg">
                       <div className="flex justify-between items-center">
                           <div>
                               <p className="font-bold text-white">{res.name}</p>
                               <p className="text-sm text-slate-300">
                                {new Date(res.checkInDate + 'T00:00:00').toLocaleDateString()} - {new Date(res.checkOutDate + 'T00:00:00').toLocaleDateString()}
                               </p>
                           </div>
                           <div className="flex items-center gap-2">
                                <button onClick={() => handleCancelReservation(res.id)} className="text-red-400 hover:text-red-300" title="Cancelar Reserva">
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
             {room.reservations.length === 0 && <p className="text-center text-slate-400">No hay reservas para esta habitación.</p>}
            <button onClick={() => setModalView('reservation')} className="mt-6 w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                <BookmarkSquareIcon className="w-5 h-5"/> Añadir Otra Reserva
            </button>
          </div>
        )
      case RoomStatus.Occupied:
        return room.guest ? (
          <div className="max-h-[70vh] overflow-y-auto pr-2">
             <div className="space-y-3 text-slate-300">
               <div className="flex items-center"><UserCircleIcon className="w-5 h-5 mr-3 text-indigo-400" /> <strong>Huésped:</strong> <span className="ml-auto text-slate-100 font-semibold">{room.guest.name}</span></div>
               <div className="flex items-center"><UserGroupIcon className="w-5 h-5 mr-3 text-indigo-400" /> <strong>Personas:</strong> <span className="ml-auto text-slate-100">{room.guest.numberOfGuests}</span></div>
               <div className="flex items-center"><PhoneIcon className="w-5 h-5 mr-3 text-indigo-400" /> <strong>Contacto:</strong> <span className="ml-auto text-slate-100">{room.guest.contact}</span></div>
               <div className="flex items-center"><IdentificationIcon className="w-5 h-5 mr-3 text-indigo-400" /> <strong>ID:</strong> <span className="ml-auto text-slate-100">{room.guest.identificationType} - {room.guest.identificationNumber}</span></div>
               <div className="flex items-center"><CalendarIcon className="w-5 h-5 mr-3 text-indigo-400" /> <strong>Check-in:</strong> <span className="ml-auto text-slate-100">{new Date(room.guest.checkInDate + 'T00:00:00').toLocaleDateString()}</span></div>
               <div className="flex items-center"><CalendarIcon className="w-5 h-5 mr-3 text-indigo-400" /> <strong>Check-out:</strong> <span className="ml-auto text-slate-100">{new Date(room.guest.checkOutDate + 'T00:00:00').toLocaleDateString()}</span></div>
               <div className="flex items-center"><TagIcon className="w-5 h-5 mr-3 text-indigo-400" /> <strong>Toallas:</strong> <span className="ml-auto text-slate-100">{room.guest.numberOfTowels}</span></div>
                {room.guest.hasVehicle && <div className="flex items-start"><TruckIcon className="w-5 h-5 mr-3 text-indigo-400 mt-1" /> <strong>Vehículo:</strong> <span className="ml-auto text-slate-100 text-right">{room.guest.vehicleDetails || 'Sí'}</span></div>}
               {room.guest.notes && <div className="text-sm pt-2"><strong>Notas:</strong> {room.guest.notes}</div>}
               <hr className="border-slate-700 my-3" />
               <div className="flex items-center text-lg"><CurrencyDollarIcon className="w-5 h-5 mr-3 text-green-400" /> <strong>Total Pagado:</strong> <span className="ml-auto text-green-300 font-bold">${room.guest.totalAgreedPrice.toFixed(2)}</span></div>
               <div className="text-sm text-slate-400 text-right">Pagado con {room.guest.paymentMethod}</div>
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
            <p className="text-slate-300 text-center mb-6">{room.status === RoomStatus.Cleaning ? 'Esta habitación necesita limpieza.' : 'Esta habitación está en mantenimiento.'}</p>
            <div className="flex justify-center space-x-4">
              <button onClick={() => handleSetStatus(RoomStatus.Available)} className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                Marcar como Disponible
              </button>
              <button 
                onClick={handleDelete}
                disabled={!isDeletable}
                title={!isDeletable ? "No se puede eliminar: la habitación tiene actividad futura." : "Eliminar habitación"}
                className="bg-red-800 hover:bg-red-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                  <TrashIcon className="w-4 h-4" />
                </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-slate-800 rounded-2xl shadow-xl w-full max-w-md m-4 p-6 border border-slate-700" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
            Habitación {room.id}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
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
