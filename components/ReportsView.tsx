import React, { useState } from 'react';
import { PaymentMethod } from '../types';
import type { DailyReport } from '../types';
import { XMarkIcon, CalendarIcon, CurrencyDollarIcon, BanknotesIcon, WalletIcon, DocumentTextIcon } from './icons/Icons';

interface ReportsViewProps {
  reports: DailyReport[];
}

const ReportModal: React.FC<{ report: DailyReport, onClose: () => void }> = ({ report, onClose }) => {
  const cashIn = report.cashTransactionsIncluded.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const cashOut = report.cashTransactionsIncluded.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const initialFund = report.cashTransactionsIncluded.find(t => t.type === 'initial')?.amount || 0;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-3xl m-4 p-6 border border-gray-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-indigo-600">
            Detalle del Corte del {new Date(report.date + 'T00:00:00').toLocaleDateString()}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-8 h-8" /></button>
        </div>
        <div className="flex flex-col space-y-8 max-h-[70vh] overflow-y-auto pr-2">
          <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">Resumen General</h3>
            <div className="flex justify-between items-center">
              <p className="text-gray-600">Ingreso Total (Todas las formas de pago)</p>
              <p className="text-3xl font-bold text-green-600">${report.totalIncome.toFixed(2)}</p>
            </div>
            <hr className="border-gray-200 my-3" />
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between"><span>Efectivo:</span> <span className="font-mono font-semibold">${report.breakdown[PaymentMethod.Cash].toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Tarjeta:</span> <span className="font-mono font-semibold">${report.breakdown[PaymentMethod.Card].toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Transferencia:</span> <span className="font-mono font-semibold">${report.breakdown[PaymentMethod.Transfer].toFixed(2)}</span></div>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4 text-lg">Resumen de Caja del Período</h3>
            <div className="space-y-3 text-gray-700">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 text-blue-600"><WalletIcon className="w-5 h-5" /><span>Fondo Inicial:</span></div>
                <span className="font-semibold font-mono">${initialFund.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 text-green-600"><CurrencyDollarIcon className="w-5 h-5" /><span>Ingresos en Efectivo:</span></div>
                <span className="font-semibold font-mono">+ ${cashIn.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 text-red-600"><BanknotesIcon className="w-5 h-5" /><span>Gastos en Efectivo:</span></div>
                <span className="font-semibold font-mono">- ${cashOut.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Reservas Incluidas ({report.bookingsIncluded.length})</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-sm font-semibold text-gray-500">Hab.</th>
                    <th className="p-3 text-sm font-semibold text-gray-500">Huésped</th>
                    <th className="p-3 text-sm font-semibold text-gray-500">Método</th>
                    <th className="p-3 text-sm font-semibold text-gray-500 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {report.bookingsIncluded.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="p-3 font-bold text-gray-800">#{b.roomId}</td>
                      <td className="p-3 text-gray-700 truncate" title={b.guestName}>{b.guestName}</td>
                      <td className="p-3 text-gray-700">{b.paymentMethod}</td>
                      <td className="p-3 text-green-600 font-semibold text-right font-mono">${b.totalIncome.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Movimientos de Caja ({report.cashTransactionsIncluded.length})</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 text-sm font-semibold text-gray-500">Descripción</th>
                    <th className="p-3 text-sm font-semibold text-gray-500 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {report.cashTransactionsIncluded.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="p-3 text-gray-700">{t.description}</td>
                      <td className={`p-3 font-semibold text-right font-mono ${t.type === 'income' ? 'text-green-600' : t.type === 'expense' ? 'text-red-600' : 'text-blue-600'}`}>
                        {t.type === 'expense' ? '-' : ''}${t.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportsView: React.FC<ReportsViewProps> = ({ reports }) => {
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Historial de Cortes de Caja</h3>
      <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
        {reports.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <DocumentTextIcon className="w-12 h-12 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-500">No hay cortes de caja</p>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              Los cortes de caja se generan automáticamente al cerrar la caja registradora.
            </p>
          </div>
        )}
        {reports.map(report => (
          <div key={report.id} onClick={() => setSelectedReport(report)} className="bg-white border border-gray-200 hover:border-indigo-300 rounded-lg p-4 flex justify-between items-center cursor-pointer transition-colors">
            <div className="flex items-center gap-4">
              <CalendarIcon className="w-6 h-6 text-indigo-500" />
              <div>
                <p className="font-bold text-gray-800">Corte del {new Date(report.date + 'T00:00:00').toLocaleDateString()}</p>
                <p className="text-sm text-gray-500">{report.bookingsIncluded.length} transacciones</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-green-600">
              <CurrencyDollarIcon className="w-6 h-6" />
              <span className="text-xl font-bold font-mono">${report.totalIncome.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
      {selectedReport && <ReportModal report={selectedReport} onClose={() => setSelectedReport(null)} />}
    </div>
  );
};

export default ReportsView;
