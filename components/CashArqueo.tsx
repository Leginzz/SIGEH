import React, { useState } from 'react';

interface CashArqueoProps {
  expectedCash: number;
  onClose: (countedCash: number) => void;
}

const CashArqueo: React.FC<CashArqueoProps> = ({ expectedCash, onClose }) => {
  const [countedCash, setCountedCash] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  const counted = parseFloat(countedCash) || 0;
  const difference = counted - expectedCash;
  const isSurplus = difference >= 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Arqueo y Cierre de Caja</h3>

      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Efectivo Esperado</span>
            <span className="font-bold text-gray-900">${expectedCash.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Monto Inicial</span>
            <span className="text-gray-700 font-medium">${expectedCash.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        {!confirmed ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Efectivo Contado (físicamente)</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={countedCash}
                onChange={e => setCountedCash(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 text-lg font-bold"
                autoFocus
              />
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Efectivo Contado</span>
              <span className="font-bold text-gray-900">${counted.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Efectivo Esperado</span>
              <span className="font-bold text-gray-900">${expectedCash.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Diferencia</span>
                <span className={`font-bold text-lg ${isSurplus ? 'text-emerald-600' : 'text-red-600'}`}>
                  {isSurplus ? '+' : ''}{difference.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <p className={`text-xs mt-1 ${isSurplus ? 'text-emerald-600' : 'text-red-600'}`}>
                {isSurplus ? 'Sobrante' : 'Faltante'}
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          {!confirmed ? (
            <button
              onClick={() => setConfirmed(true)}
              disabled={!countedCash || parseFloat(countedCash) <= 0}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
            >
              Calcular Diferencia
            </button>
          ) : (
            <>
              <button
                onClick={() => onClose(counted)}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
              >
                Confirmar y Cerrar Caja
              </button>
              <button
                onClick={() => { setConfirmed(false); setCountedCash(''); }}
                className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Corregir
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CashArqueo;
