import React, { useMemo, useState } from 'react';
import type { CashTransaction } from '../types';
import { CurrencyDollarIcon, BanknotesIcon, DocumentTextIcon, PlusIcon, WalletIcon } from './icons/Icons';

interface DashboardProps {
  cashTransactions: CashTransaction[];
  onGenerateReport: () => void;
  onAddCashTransaction: (transaction: Omit<CashTransaction, 'id' | 'date' | 'reportId'>) => void;
}

const colorBgMap: Record<string, string> = {
  blue: 'bg-blue-500/20',
  green: 'bg-green-500/20',
  red: 'bg-red-500/20',
  yellow: 'bg-yellow-500/20',
};

const StatCard: React.FC<{ title: string; value: string; icon: React.ReactNode; color: string }> = ({ title, value, icon, color }) => (
  <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 flex items-center space-x-4">
    <div className={`${colorBgMap[color] || 'bg-slate-500/20'} p-3 rounded-full`}>
      {icon}
    </div>
    <div>
      <p className="text-slate-400 text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
  </div>
);

const AddCashForm: React.FC<{onAddCash: (amount: number, description: string) => void}> = ({ onAddCash }) => {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(Number(amount) > 0 && description) {
            onAddCash(Number(amount), description);
            setAmount('');
            setDescription('');
        }
    }
    
    return (
        <form onSubmit={handleSubmit} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-3">
            <h4 className="font-semibold text-white">Registrar Ingreso en Efectivo</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                    type="number"
                    placeholder="Monto"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    required
                    min="0.01"
                    step="0.01"
                    className="sm:col-span-1 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                    type="text"
                    placeholder="Descripción (ej. Venta miscelánea)"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                    className="sm:col-span-2 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>
            <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                <PlusIcon className="w-5 h-5"/> Registrar Ingreso
            </button>
        </form>
    );
}

const AddExpenseForm: React.FC<{onAddExpense: (amount: number, description: string) => void}> = ({ onAddExpense }) => {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(Number(amount) > 0 && description) {
            onAddExpense(Number(amount), description);
            setAmount('');
            setDescription('');
        }
    }
    
    return (
        <form onSubmit={handleSubmit} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-3">
            <h4 className="font-semibold text-white">Registrar Gasto en Efectivo</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                    type="number"
                    placeholder="Monto"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    required
                    min="0.01"
                    step="0.01"
                    className="sm:col-span-1 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                    type="text"
                    placeholder="Descripción (ej. Compra de insumos)"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    required
                    className="sm:col-span-2 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>
            <button type="submit" className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                <PlusIcon className="w-5 h-5"/> Registrar Gasto
            </button>
        </form>
    );
}

const SetInitialFundForm: React.FC<{onSetFund: (amount: number) => void}> = ({ onSetFund }) => {
    const [amount, setAmount] = useState('');
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const fundAmount = Number(amount);
        if(!isNaN(fundAmount) && fundAmount >= 0) {
            onSetFund(fundAmount);
            setAmount('');
        }
    }
    
    return (
        <form onSubmit={handleSubmit} className="p-4 bg-slate-900/50 rounded-lg border border-slate-700 space-y-3">
            <h4 className="font-semibold text-white">Establecer Fondo de Caja</h4>
             <div className="flex items-center gap-3">
                <input
                    type="number"
                    placeholder="Monto inicial"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                    required
                    min="0"
                    step="0.01"
                    className="flex-grow bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                    <WalletIcon className="w-5 h-5"/> Guardar
                </button>
            </div>
        </form>
    );
}

const Dashboard: React.FC<DashboardProps> = ({ cashTransactions, onGenerateReport, onAddCashTransaction }) => {

  const currentPeriodTransactions = useMemo(() => {
    return cashTransactions.filter(t => !t.reportId);
  }, [cashTransactions]);

  const stats = useMemo(() => {
    const cashIn = currentPeriodTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const cashOut = currentPeriodTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const initialFund = currentPeriodTransactions.find(t => t.type === 'initial')?.amount || 0;
    const expectedInBox = initialFund + cashIn - cashOut;
    
    return { cashIn, cashOut, initialFund, expectedInBox };
  }, [currentPeriodTransactions]);

  const handleAddCashIncome = (amount: number, description: string) => {
    onAddCashTransaction({ type: 'income', amount, description });
  }
  
  const handleAddExpense = (amount: number, description: string) => {
    onAddCashTransaction({ type: 'expense', amount, description });
  }
  
  const handleSetInitial = (amount: number) => {
    onAddCashTransaction({ type: 'initial', amount, description: 'Fondo de caja inicial' });
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-white">Control de Caja del Período</h2>
        <button 
            onClick={onGenerateReport}
            disabled={currentPeriodTransactions.length === 0}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
            <DocumentTextIcon className="w-5 h-5"/>
            Generar Corte de Caja
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            title="Fondo Inicial" 
            value={`$${stats.initialFund.toFixed(2)}`} 
            icon={<CurrencyDollarIcon className="w-6 h-6 text-blue-400"/>} 
            color="blue"
        />
        <StatCard 
            title="Ingresos (Efectivo)" 
            value={`$${stats.cashIn.toFixed(2)}`} 
            icon={<CurrencyDollarIcon className="w-6 h-6 text-green-400"/>}
            color="green"
        />
        <StatCard 
            title="Gastos (Efectivo)" 
            value={`$${stats.cashOut.toFixed(2)}`} 
            icon={<BanknotesIcon className="w-6 h-6 text-red-400"/>}
            color="red"
        />
        <StatCard 
            title="Total Esperado en Caja" 
            value={`$${stats.expectedInBox.toFixed(2)}`} 
            icon={<CurrencyDollarIcon className="w-6 h-6 text-yellow-400"/>}
            color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Movimientos de Caja del Período</h3>
             {currentPeriodTransactions.length === 0 && (
                <div className="text-center p-6 text-slate-400">
                    <p>No hay movimientos de caja para este período.</p>
                </div>
             )}
            <div className="overflow-y-auto max-h-96">
                <table className="w-full text-left">
                    <tbody className="divide-y divide-slate-700">
                        {currentPeriodTransactions.map(t => (
                            <tr key={t.id} className="hover:bg-slate-700/50">
                                <td className="p-3">
                                    <p className={`font-semibold ${t.type === 'income' ? 'text-green-400' : t.type === 'expense' ? 'text-red-400' : 'text-blue-400'}`}>
                                        {t.type === 'income' ? (t.description.startsWith('Check-In') ? 'Ingreso (Check-In)' : 'Ingreso (Manual)') : t.type === 'expense' ? 'Gasto' : 'Fondo Inicial'}
                                    </p>
                                    <p className="text-sm text-slate-300">{t.description}</p>
                                </td>
                                <td className={`p-3 font-semibold text-right ${t.type === 'income' ? 'text-green-400' : t.type === 'expense' ? 'text-red-400' : 'text-blue-400'}`}>
                                    {t.type === 'expense' ? '-' : ''}${t.amount.toFixed(2)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
        <div className="space-y-4">
            <SetInitialFundForm onSetFund={handleSetInitial} />
            <AddCashForm onAddCash={handleAddCashIncome} />
            <AddExpenseForm onAddExpense={handleAddExpense} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;