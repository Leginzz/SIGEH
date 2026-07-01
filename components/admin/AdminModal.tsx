import React from 'react';
import { XMarkIcon } from '../icons/Icons';
import { ReusableButton } from './ReusableButton';

interface AdminModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  onSave?: () => void;
  saving?: boolean;
  saveLabel?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SIZES: Record<string, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

export function AdminModal({ title, children, onClose, onSave, saving, saveLabel = 'Guardar', size = 'md' }: AdminModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
      <div className={`bg-white rounded-2xl w-full ${SIZES[size]} m-4 border border-gray-200 max-h-[90vh] overflow-y-auto`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><XMarkIcon className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-4">
          {children}
        </div>
        {onSave && (
          <div className="flex justify-end gap-3 p-5 border-t border-gray-100">
            <ReusableButton variant="outline" onClick={onClose}>Cancelar</ReusableButton>
            <ReusableButton onClick={onSave} loading={saving}>{saveLabel}</ReusableButton>
          </div>
        )}
      </div>
    </div>
  );
}
