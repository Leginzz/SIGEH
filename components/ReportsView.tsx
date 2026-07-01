import React, { useState } from 'react';
import { PaymentMethod } from '../types';
import type { DailyReport } from '../types';
import { XMarkIcon, CalendarIcon, CurrencyDollarIcon, BanknotesIcon, WalletIcon, DocumentTextIcon } from './icons/Icons';

interface ReportsViewProps {
  reports: DailyReport[];
}

// --- Report Modal ---
const ModalSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <h4 className="text-sm font-semibold text-gray-700 mb-3">{title}</h4>
    {children}
  </div>
);

const ReportModal: React.FC<{ report: DailyReport, onClose: () => void }> = ({ report, onClose }) => {
  const cashIn = report.cashTransactionsIncluded.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const cashOut = report.cashTransactionsIncluded.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const initialFund = report.cashTransactionsIncluded.find(t => t.type === 'initial')?.amount || 0;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto border border-gray-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">
            Corte del {new Date(report.date + 'T00:00:00').toLocaleDateString()}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><XMarkIcon className="w-5 h-5" /></button>
        </div>
        <div className="p-5 space-y-6">
          <ModalSection title="Resumen General">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Ingreso Total</span>
                <span className="text-xl font-bold text-emerald-600">${report.totalIncome.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Efectivo:</span> <span className="font-mono font-semibold text-gray-900">${report.breakdown[PaymentMethod.Cash].toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Tarjeta:</span> <span className="font-mono font-semibold text-gray-900">${report.breakdown[PaymentMethod.Card].toFixed(2)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Transferencia:</span> <span className="font-mono font-semibold text-gray-900">${report.breakdown[PaymentMethod.Transfer].toFixed(2)}</span></div>
              </div>
            </div>
          </ModalSection>

          <ModalSection title="Resumen de Caja">
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Fondo Inicial</span><span className="font-semibold text-gray-900">${initialFund.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Ingresos en Efectivo</span><span className="font-semibold text-emerald-600">+${cashIn.toFixed(2)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Gastos en Efectivo</span><span className="font-semibold text-red-600">-${cashOut.toFixed(2)}</span></div>
            </div>
          </ModalSection>

          <ModalSection title={`Reservas Incluidas (${report.bookingsIncluded.length})`}>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-xs font-semibold text-gray-500 text-left">Hab</th>
                    <th className="px-3 py-2 text-xs font-semibold text-gray-500 text-left">Huésped</th>
                    <th className="px-3 py-2 text-xs font-semibold text-gray-500 text-left">Método</th>
                    <th className="px-3 py-2 text-xs font-semibold text-gray-500 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {report.bookingsIncluded.map(b => (
                    <tr key={b.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-semibold text-gray-900">#{b.roomId}</td>
                      <td className="px-3 py-2 text-gray-700 truncate max-w-[160px]" title={b.guestName}>{b.guestName}</td>
                      <td className="px-3 py-2 text-gray-500">{b.paymentMethod}</td>
                      <td className="px-3 py-2 text-emerald-600 font-semibold text-right">${b.totalIncome.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ModalSection>

          <ModalSection title={`Movimientos de Caja (${report.cashTransactionsIncluded.length})`}>
            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-xs font-semibold text-gray-500 text-left">Descripción</th>
                    <th className="px-3 py-2 text-xs font-semibold text-gray-500 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {report.cashTransactionsIncluded.map(t => (
                    <tr key={t.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-700">{t.description}</td>
                      <td className={`px-3 py-2 font-semibold text-right ${t.type === 'income' ? 'text-emerald-600' : t.type === 'expense' ? 'text-red-600' : 'text-blue-600'}`}>
                        {t.type === 'expense' ? '-' : ''}${t.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ModalSection>
        </div>
      </div>
    </div>
  );
};

// --- Reports List ---
const ReportsView: React.FC<ReportsViewProps> = ({ reports }) => {
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);

  return (
    <div className="bg-white border border-gray-200 rounded-xl">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700">Historial de Cortes de Caja</h3>
      </div>
      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <DocumentTextIcon className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-500">No hay cortes de caja</p>
          <p className="text-xs text-gray-400 mt-1 max-w-xs">
            Los cortes de caja se generan automáticamente al cerrar la caja registradora.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {reports.map(report => (
            <button key={report.id} onClick={() => setSelectedReport(report)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors text-left">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center shrink-0">
                  <CalendarIcon className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900">Corte del {new Date(report.date + 'T00:00:00').toLocaleDateString()}</p>
                  <p className="text-xs text-gray-500">{report.bookingsIncluded.length} transacciones</p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className="text-base font-bold text-emerald-600">${report.totalIncome.toFixed(2)}</p>
              </div>
            </button>
          ))}
        </div>
      )}
      {selectedReport && <ReportModal report={selectedReport} onClose={() => setSelectedReport(null)} />}
    </div>
  );
};

export default ReportsView;
