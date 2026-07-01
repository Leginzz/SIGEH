import React, { useState } from 'react';
import type { User, Role, Permission } from './types';
import { ALL_PERMISSIONS } from './roles';
import { XMarkIcon } from '../components/icons/Icons';

interface UserFormProps {
  user: User | null;
  onSave: (data: {
    nombre: string;
    usuario: string;
    password: string;
    rol: Role;
    permisosExtra: Permission[];
    activo: boolean;
  }) => Promise<void>;
  onClose: () => void;
}

const input = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none";

export const UserForm: React.FC<UserFormProps> = ({ user, onSave, onClose }) => {
  const isEdit = !!user;
  const [nombre, setNombre] = useState(user?.nombre || '');
  const [usuario, setUsuario] = useState(user?.usuario || '');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<Role>(user?.rol || 'recepcion');
  const [activo, setActivo] = useState(user?.activo ?? true);
  const [permisosExtra, setPermisosExtra] = useState<Permission[]>(user?.permisosExtra || []);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const isRecepcion = rol === 'recepcion';
  const togglePermiso = (perm: Permission) => {
    setPermisosExtra(prev => prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!nombre.trim() || !usuario.trim()) { setError('Nombre y usuario son obligatorios'); return; }
    if (!isEdit && !password) { setError('La contraseña es obligatoria'); return; }
    setSaving(true);
    try { await onSave({ nombre: nombre.trim(), usuario: usuario.trim(), password, rol, permisosExtra, activo }); onClose(); }
    catch (err: unknown) { setError(err instanceof Error ? err.message : 'Error al guardar'); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-gray-200" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-900">{isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1"><XMarkIcon className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Nombre</label>
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)} className={input} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Usuario</label>
            <input type="text" value={usuario} onChange={e => setUsuario(e.target.value)} className={input} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Contraseña {isEdit && <span className="text-gray-400 font-normal">(dejar vacío para mantener)</span>}
            </label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className={input} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Rol</label>
            <select value={rol} onChange={e => { setRol(e.target.value as Role); if (e.target.value === 'admin') setPermisosExtra([]); }} className={input}>
              <option value="admin">Administrador</option>
              <option value="recepcion">Recepción</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-gray-600">Estado</span>
            <button type="button" onClick={() => setActivo(!activo)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${activo ? 'bg-emerald-500' : 'bg-gray-300'}`}>
              <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${activo ? 'translate-x-[18px]' : 'translate-x-1'}`} />
            </button>
            <span className={`text-xs font-medium ${activo ? 'text-emerald-600' : 'text-red-500'}`}>{activo ? 'Activo' : 'Inactivo'}</span>
          </div>

          {isRecepcion && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Permisos Extra</label>
              <div className="grid grid-cols-2 gap-1 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                {ALL_PERMISSIONS.filter(p => !['dashboard', 'habitaciones', 'calendario', 'reservas', 'caja', 'checkin', 'checkout'].includes(p)).map(perm => (
                  <label key={perm} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input type="checkbox" checked={permisosExtra.includes(perm)} onChange={() => togglePermiso(perm)} className="w-3.5 h-3.5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
                    {perm === 'informes' && 'Informes'}
                    {perm === 'usuarios' && 'Usuarios'}
                    {perm === 'configuracion' && 'Configuración'}
                    {perm === 'tarifas' && 'Tarifas'}
                    {perm === 'respaldos' && 'Respaldos'}
                    {perm === 'exportarPDF' && 'Exportar PDF'}
                    {perm === 'exportarExcel' && 'Exportar Excel'}
                    {perm === 'cerrarCaja' && 'Cerrar Caja'}
                    {perm === 'reabrirCaja' && 'Reabrir Caja'}
                    {perm === 'descuentos' && 'Descuentos'}
                    {perm === 'mantenimiento' && 'Mantenimiento'}
                    {perm === 'limpieza' && 'Limpieza'}
                    {perm === 'logs' && 'Logs'}
                  </label>
                ))}
              </div>
            </div>
          )}

          {error && <div className="bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg p-3">{error}</div>}

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">Cancelar</button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {saving ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
