import React, { useState } from 'react';

export function RoomPrice({ price, onSave }: { price: number; onSave?: (p: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(price);

  if (editing) {
    return (
      <div className="flex items-center gap-1.5">
        <span className="text-[11px] text-gray-400">$</span>
        <input
          type="number"
          value={value}
          onChange={e => setValue(Number(e.target.value))}
          className="w-16 text-xs bg-gray-50 border border-gray-200 rounded px-1 py-0.5"
          autoFocus
          onBlur={() => { onSave?.(value); setEditing(false); }}
          onKeyDown={e => { if (e.key === 'Enter') { onSave?.(value); setEditing(false); } }}
        />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 cursor-pointer" onClick={() => setEditing(true)}>
      <span className="text-xs font-medium text-emerald-600">${price}</span>
      <span className="text-[10px] text-gray-400">/noche</span>
    </div>
  );
}
