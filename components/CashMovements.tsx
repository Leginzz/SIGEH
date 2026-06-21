import React, { useState } from 'react';
import type { CashMovement } from '../types';

interface CashMovementsProps {
  movements: CashMovement[];
  onAddMovement: (movement: Omit<CashMovement, 'id' | 'date' | 'time'>) => void;
}

const movementTypeConfig: Record<string, { label: string; color: string; bg: string }> = {
  income: { label: 'Ingreso Hospedaje', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  diverse_income: { label: 'Ingreso Diverso', color: 'text-indigo-700', bg: 'bg-indigo-50' },
  expense: { label: 'Egreso', color: 'text-red-700', bg: 'bg-red-50' },
  withdrawal: { label: 'Retiro', color: 'text-orange-700', bg: 'bg-orange-50' },
  adjustment: { label: 'Ajuste', color: 'text-yellow-700', bg: 'bg-yellow-50' },
};

const CashMovements: React.FC<CashMovementsProps> = ({ movements, onAddMovement }) => {
  const [showForm, setShowForm] = useState(false);
  const [type, setType] = useState<'income' | 'diverse_income' | 'expense' | 'withdrawal' | 'adjustment'>('income');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [user, setUser] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0 || !description.trim() || !user.trim()) return;
    onAddMovement({ type, amount: numAmount, description: description.trim(), user: user.trim() });
    setAmount('');
    setDescription('');
    setShowForm(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">Movimientos</h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-sm bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo Movimiento
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 border-b border-gray-100 bg-gray-50 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tipo</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as typeof type)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="income">Ingreso Hospedaje</option>
                <option value="diverse_income">Ingreso Diverso</option>
                <option value="expense">Egreso</option>
                <option value="withdrawal">Retiro</option>
                <option value="adjustment">Ajuste</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Monto</label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Descripción</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Descripción del movimiento"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Registró</label>
            <input
              type="text"
              value={user}
              onChange={e => setUser(e.target.value)}
              placeholder="Nombre de quien registra"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!amount || !description.trim() || !user.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Registrar
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-gray-600 hover:text-gray-800 text-sm font-medium px-4 py-2 rounded-lg border border-gray-300 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto">
        {movements.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-3 text-gray-300">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            <p className="text-sm">No hay movimientos registrados</p>
            <p className="text-xs mt-1">Agrega el primer movimiento usando el botón "Nuevo Movimiento"</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-4 py-3 font-medium text-gray-500">Hora</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Tipo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Descripción</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Monto</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Registró</th>
              </tr>
            </thead>
            <tbody>
              {[...movements].reverse().map(m => {
                const cfg = movementTypeConfig[m.type];
                const isExpenseOrWithdrawal = m.type === 'expense' || m.type === 'withdrawal';
                return (
                  <tr key={m.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{m.time}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${cfg.bg} ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-700">{m.description}</td>
                    <td className={`px-4 py-3 text-right font-medium whitespace-nowrap ${isExpenseOrWithdrawal ? 'text-red-600' : 'text-emerald-600'}`}>
                      {isExpenseOrWithdrawal ? '-' : '+'}${m.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{m.user}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default CashMovements;
