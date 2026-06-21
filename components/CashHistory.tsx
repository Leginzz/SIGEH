import React, { useState } from 'react';
import type { CashClosing } from '../types';

interface CashHistoryProps {
  closings: CashClosing[];
}

const CashHistory: React.FC<CashHistoryProps> = ({ closings }) => {
  const [searchDate, setSearchDate] = useState('');
  const [selectedClosing, setSelectedClosing] = useState<CashClosing | null>(null);

  const filtered = searchDate
    ? closings.filter(c => c.closingDate.includes(searchDate))
    : closings;

  const totalSurplus = closings.reduce((s, c) => c.isSurplus ? s + c.difference : s, 0);
  const totalShortage = closings.reduce((s, c) => !c.isSurplus ? s + Math.abs(c.difference) : s, 0);

  if (selectedClosing) {
    const c = selectedClosing;
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedClosing(null)}
          className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Volver al historial
        </button>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Corte {c.folio}</h3>
          <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Apertura</span><span className="text-gray-700">{c.openingDate} {c.openingTime}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Cierre</span><span className="text-gray-700">{c.closingDate} {c.closingTime}</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Responsable</span><span className="text-gray-700">{c.user}</span></div>
            <div className="border-t border-gray-200 pt-2 mt-2 space-y-1">
              <div className="flex justify-between"><span className="text-gray-500">Monto Inicial</span><span className="text-gray-700">${c.initialAmount.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Ingresos Hospedaje</span><span className="text-emerald-600">+${c.totalIncome.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Ingresos Diversos</span><span className="text-emerald-600">+${c.totalDiverseIncome.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Egresos</span><span className="text-red-600">-${c.totalExpenses.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Retiros</span><span className="text-red-600">-${c.totalWithdrawals.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Ajustes</span><span className="text-yellow-600">{c.totalAdjustments >= 0 ? '+' : ''}{c.totalAdjustments.toFixed(2)}</span></div>
            </div>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between font-medium"><span className="text-gray-700">Efectivo Esperado</span><span className="font-bold">${c.expectedCash.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Efectivo Contado</span><span className="text-gray-900">${c.countedCash.toFixed(2)}</span></div>
              <div className="flex justify-between text-base font-bold pt-1">
                <span>Diferencia</span>
                <span className={c.isSurplus ? 'text-emerald-600' : 'text-red-600'}>
                  {c.isSurplus ? 'Sobrante: +' : 'Faltante: '}${Math.abs(c.difference).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {c.movements.length > 0 && (
            <div className="mt-4">
              <h4 className="font-semibold text-gray-900 mb-2">Movimientos</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left px-3 py-2 font-medium text-gray-500">Hora</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-500">Tipo</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-500">Descripción</th>
                      <th className="text-right px-3 py-2 font-medium text-gray-500">Monto</th>
                      <th className="text-left px-3 py-2 font-medium text-gray-500">Registró</th>
                    </tr>
                  </thead>
                  <tbody>
                    {c.movements.map(m => {
                      const isNeg = m.type === 'expense' || m.type === 'withdrawal';
                      return (
                        <tr key={m.id} className="border-b border-gray-50">
                          <td className="px-3 py-2 text-gray-500">{m.time}</td>
                          <td className="px-3 py-2 text-gray-700">{m.type.replace('_', ' ')}</td>
                          <td className="px-3 py-2 text-gray-700">{m.description}</td>
                          <td className={`px-3 py-2 text-right font-medium ${isNeg ? 'text-red-600' : 'text-emerald-600'}`}>
                            {isNeg ? '-' : '+'}${Math.abs(m.amount).toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-gray-500">{m.user}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {closings.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Sobrantes</p>
            <p className="text-xl font-bold text-emerald-600 mt-1">
              +${totalSurplus.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Faltantes</p>
            <p className="text-xl font-bold text-red-600 mt-1">
              -${totalShortage.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182.95-.715 2.386-.715 3.336 0l.879.659" />
            </svg>
            <h3 className="font-semibold text-gray-900">Historial de Cortes</h3>
            <div className="ml-auto">
              <input
                type="date"
                value={searchDate}
                onChange={e => setSearchDate(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-700 focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-3 text-gray-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0l-3-3m3 3l3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
            </svg>
            <p className="text-sm">{searchDate ? 'No hay cortes en esta fecha' : 'No hay cortes registrados'}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map(c => (
              <button
                key={c.folio}
                onClick={() => setSelectedClosing(c)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#4f46e5" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{c.folio}</p>
                    <p className="text-xs text-gray-500">{c.closingDate} — {c.user}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">${c.expectedCash.toFixed(2)}</p>
                  <p className={`text-xs ${c.isSurplus ? 'text-emerald-600' : 'text-red-600'}`}>
                    {c.isSurplus ? `+${c.difference.toFixed(2)}` : `${c.difference.toFixed(2)}`}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CashHistory;
