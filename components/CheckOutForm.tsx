import React from 'react';
import type { Room } from '../types';
import { UserCircleIcon } from './icons/Icons';

interface CheckOutFormProps {
  room: Room;
  onConfirm: () => void;
  onCancel: () => void;
}

const CheckOutForm: React.FC<CheckOutFormProps> = ({ room, onConfirm, onCancel }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="text-xl font-semibold text-center text-gray-800">Confirmar Salida</h3>

      <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg text-center space-y-2">
        <UserCircleIcon className="w-12 h-12 mx-auto text-indigo-500" />
        <p className="text-gray-600">¿Confirma la salida del huésped?</p>
        <p className="text-2xl font-bold text-gray-900">{room.guest?.name}</p>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded-lg transition-colors">
          Atrás
        </button>
        <button type="submit" className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition-colors">
          Confirmar Salida
        </button>
      </div>
    </form>
  );
};

export default CheckOutForm;
