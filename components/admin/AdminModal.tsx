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
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className={`bg-white rounded-xl w-full ${SIZES[size]} max-h-[90vh] overflow-y-auto border border-gray-200`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><XMarkIcon className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">{children}</div>
        {onSave && (
          <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-100">
            <ReusableButton variant="outline" onClick={onClose}>Cancelar</ReusableButton>
            <ReusableButton onClick={onSave} loading={saving}>{saveLabel}</ReusableButton>
          </div>
        )}
      </div>
    </div>
  );
}
