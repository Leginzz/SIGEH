import React, { useState } from 'react';
import type { DailyReport, PaymentMethod } from '../types';
import { XMarkIcon, CalendarIcon, CurrencyDollarIcon, BanknotesIcon, WalletIcon } from './icons/Icons';

interface ReportsViewProps {
  reports: DailyReport[];
}

const ReportModal: React.FC<{ report: DailyReport, onClose: () => void }> = ({ report, onClose }) => {
    const cashIn = report.cashTransactionsIncluded.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const cashOut = report.cashTransactionsIncluded.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const initialFund = report.cashTransactionsIncluded.find(t => t.type === 'initial')?.amount || 0;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-slate-800 rounded-2xl shadow-xl w-full max-w-3xl m-4 p-6 border border-slate-700" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
                        Detalle del Corte del {new Date(report.date + 'T00:00:00').toLocaleDateString()}
                    </h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><XMarkIcon className="w-8 h-8"/></button>
                </div>
                <div className="flex flex-col space-y-8 max-h-[70vh] overflow-y-auto pr-2">
                    
                    {/* General Summary */}
                    <div className="bg-slate-700/50 p-6 rounded-lg">
                        <h3 className="font-semibold text-white mb-4 text-lg">Resumen General</h3>
                        <div className="flex justify-between items-center">
                            <p className="text-slate-300">Ingreso Total (Todas las formas de pago)</p>
                            <p className="text-3xl font-bold text-green-400">${report.totalIncome.toFixed(2)}</p>
                        </div>
                        <hr className="border-slate-600 my-3"/>
                        <div className="space-y-2 text-sm text-slate-300">
                            <div className="flex justify-between"><span>Efectivo:</span> <span className="font-mono">${report.breakdown.Efectivo.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Tarjeta:</span> <span className="font-mono">${report.breakdown.Tarjeta.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Transferencia:</span> <span className="font-mono">${report.breakdown.Transferencia.toFixed(2)}</span></div>
                        </div>
                    </div>

                    {/* Cash Summary */}
                    <div className="bg-slate-700/50 p-6 rounded-lg">
                        <h3 className="font-semibold text-white mb-4 text-lg">Resumen de Caja del Período</h3>
                        <div className="space-y-3 text-slate-200">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3 text-blue-400"><WalletIcon className="w-5 h-5"/><span>Fondo Inicial:</span></div>
                                <span className="font-semibold font-mono">${initialFund.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center">
                               <div className="flex items-center gap-3 text-green-400"><CurrencyDollarIcon className="w-5 h-5"/><span>Ingresos en Efectivo:</span></div>
                                <span className="font-semibold font-mono">+ ${cashIn.toFixed(2)}</span>
                            </div>
                             <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3 text-red-400"><BanknotesIcon className="w-5 h-5"/><span>Gastos en Efectivo:</span></div>
                                <span className="font-semibold font-mono">- ${cashOut.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Included Bookings */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Reservas Incluidas ({report.bookingsIncluded.length})</h3>
                         <div className="border border-slate-700 rounded-lg overflow-hidden">
                             <table className="w-full text-left">
                                <thead className="bg-slate-900/50">
                                    <tr>
                                        <th className="p-3 text-sm font-semibold text-slate-400">Hab.</th>
                                        <th className="p-3 text-sm font-semibold text-slate-400">Huésped</th>
                                        <th className="p-3 text-sm font-semibold text-slate-400">Método</th>
                                        <th className="p-3 text-sm font-semibold text-slate-400 text-right">Monto</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {report.bookingsIncluded.map(b => (
                                        <tr key={b.id} className="hover:bg-slate-700/40">
                                            <td className="p-3 font-bold">#{b.roomId}</td>
                                            <td className="p-3 text-slate-300 truncate" title={b.guestName}>{b.guestName}</td>
                                            <td className="p-3 text-slate-300">{b.paymentMethod}</td>
                                            <td className="p-3 text-green-400 font-semibold text-right font-mono">${b.totalIncome.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         </div>
                    </div>
                    
                     {/* Cash Transactions */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-3">Movimientos de Caja ({report.cashTransactionsIncluded.length})</h3>
                        <div className="border border-slate-700 rounded-lg overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-900/50">
                                    <tr>
                                        <th className="p-3 text-sm font-semibold text-slate-400">Descripción</th>
                                        <th className="p-3 text-sm font-semibold text-slate-400 text-right">Monto</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {report.cashTransactionsIncluded.map(t => (
                                        <tr key={t.id} className="hover:bg-slate-700/40">
                                            <td className="p-3 text-slate-300">{t.description}</td>
                                            <td className={`p-3 font-semibold text-right font-mono ${t.type === 'income' ? 'text-green-400' : t.type === 'expense' ? 'text-red-400' : 'text-blue-400'}`}>
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
}


const ReportsView: React.FC<ReportsViewProps> = ({ reports }) => {
    const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <h3 className="text-xl font-bold text-white mb-4">Historial de Cortes de Caja</h3>
       <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
           {reports.length === 0 && (
               <p className="text-center p-6 text-slate-400">No se ha generado ningún corte de caja todavía.</p>
           )}
           {reports.map(report => (
               <div key={report.id} onClick={() => setSelectedReport(report)} className="bg-slate-700/50 hover:bg-slate-700 rounded-lg p-4 flex justify-between items-center cursor-pointer transition-colors">
                   <div className="flex items-center gap-4">
                        <CalendarIcon className="w-6 h-6 text-indigo-400" />
                        <div>
                            <p className="font-bold text-white">Corte del {new Date(report.date + 'T00:00:00').toLocaleDateString()}</p>
                            <p className="text-sm text-slate-400">{report.bookingsIncluded.length} transacciones</p>
                        </div>
                   </div>
                   <div className="flex items-center gap-2 text-green-400">
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
