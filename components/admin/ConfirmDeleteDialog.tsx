import React from 'react';
import { ReusableButton } from './ReusableButton';

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDeleteDialog({ isOpen, title = 'Confirmar eliminación', message, onConfirm, onCancel }: ConfirmDeleteDialogProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50" onClick={onCancel}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm m-4 p-6 border border-gray-200" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <ReusableButton variant="outline" onClick={onCancel}>Cancelar</ReusableButton>
          <ReusableButton variant="danger" onClick={onConfirm}>Eliminar</ReusableButton>
        </div>
      </div>
    </div>
  );
}
