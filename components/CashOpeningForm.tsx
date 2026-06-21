import React, { useState } from 'react';

interface CashOpeningFormProps {
  onOpen: (initialAmount: number, user: string) => void;
}

const CashOpeningForm: React.FC<CashOpeningFormProps> = ({ onOpen }) => {
  const [initialAmount, setInitialAmount] = useState('');
  const [user, setUser] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(initialAmount);
    if (isNaN(amount) || amount < 0 || !user.trim()) return;
    onOpen(amount, user.trim());
    setInitialAmount('');
    setUser('');
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#059669" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182.95-.715 2.386-.715 3.336 0l.879.659" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900">Apertura de Caja</h3>
          <p className="text-gray-500 mt-1">Registra el monto inicial para comenzar la operación</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monto Inicial</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={initialAmount}
                onChange={e => setInitialAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Responsable</label>
            <input
              type="text"
              value={user}
              onChange={e => setUser(e.target.value)}
              placeholder="Nombre del cajero"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            />
          </div>

          <button
            type="submit"
            disabled={!initialAmount || !user.trim()}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
          >
            Abrir Caja
          </button>
        </form>
      </div>
    </div>
  );
};

export default CashOpeningForm;
