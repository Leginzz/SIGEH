import React, { useState } from 'react';

export function RoomPrice({ price, onSave }: { price: number; onSave?: (p: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(price);

  if (editing) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-400">$</span>
        <input
          type="number"
          value={value}
          onChange={e => setValue(Number(e.target.value))}
          className="w-16 text-xs border border-gray-300 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          autoFocus
          onBlur={() => { onSave?.(value); setEditing(false); }}
          onKeyDown={e => { if (e.key === 'Enter') { onSave?.(value); setEditing(false); } }}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 cursor-pointer hover:opacity-70" onClick={() => setEditing(true)} title="Editar precio">
      <span className="text-xs font-medium text-emerald-600">${price}</span>
      <span className="text-xs text-gray-400">/noche</span>
    </div>
  );
}
