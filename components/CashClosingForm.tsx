import React from 'react';
import type { CashClosing } from '../types';

interface CashClosingFormProps {
  closing: CashClosing;
  onDone: () => void;
}

const CashClosingForm: React.FC<CashClosingFormProps> = ({ closing, onDone }) => {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#059669" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">Cierre Exitoso</h3>
          <p className="text-gray-500 mt-1">Corte de caja registrado correctamente</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-5 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-gray-200">
            <span className="text-sm text-gray-500">Folio</span>
            <span className="text-sm font-bold text-indigo-600">{closing.folio}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Apertura</span>
            <span className="text-gray-700">{closing.openingDate} {closing.openingTime}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Cierre</span>
            <span className="text-gray-700">{closing.closingDate} {closing.closingTime}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Responsable</span>
            <span className="text-gray-700">{closing.user}</span>
          </div>
          <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Monto Inicial</span>
              <span className="text-gray-700">${closing.initialAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Ingresos Hospedaje</span>
              <span className="text-emerald-600 font-medium">+${closing.totalIncome.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Ingresos Diversos</span>
              <span className="text-emerald-600 font-medium">+${closing.totalDiverseIncome.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Egresos</span>
              <span className="text-red-600 font-medium">-${closing.totalExpenses.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Retiros</span>
              <span className="text-red-600 font-medium">-${closing.totalWithdrawals.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Ajustes</span>
              <span className="text-yellow-600 font-medium">{closing.totalAdjustments >= 0 ? '+' : ''}{closing.totalAdjustments.toFixed(2)}</span>
            </div>
          </div>
          <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-gray-700">Efectivo Esperado</span>
              <span className="text-gray-900 font-bold">${closing.expectedCash.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Efectivo Contado</span>
              <span className="text-gray-900">${closing.countedCash.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-1">
              <span className="text-gray-700">Diferencia</span>
              <span className={closing.isSurplus ? 'text-emerald-600' : 'text-red-600'}>
                {closing.isSurplus ? 'Sobrante: +' : 'Faltante: '}${Math.abs(closing.difference).toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onDone}
          className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
        >
          Continuar
        </button>
      </div>
    </div>
  );
};

export default CashClosingForm;
