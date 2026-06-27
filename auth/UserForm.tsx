import React, { useState, useEffect } from 'react';
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
    setPermisosExtra(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!nombre.trim() || !usuario.trim()) {
      setError('Nombre y usuario son obligatorios');
      return;
    }
    if (!isEdit && !password) {
      setError('La contraseña es obligatoria');
      return;
    }
    setSaving(true);
    try {
      await onSave({ nombre: nombre.trim(), usuario: usuario.trim(), password, rol, permisosExtra, activo });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg m-4 p-6 border border-gray-200 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">{isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-6 h-6" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input type="text" value={nombre} onChange={e => setNombre(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <input type="text" value={usuario} onChange={e => setUsuario(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña {isEdit && <span className="text-gray-400 font-normal">(dejar vacío para mantener)</span>}
            </label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select value={rol} onChange={e => { setRol(e.target.value as Role); if (e.target.value === 'admin') setPermisosExtra([]); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none">
              <option value="admin">Administrador</option>
              <option value="recepcion">Recepción</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700">Estado</label>
            <button type="button" onClick={() => setActivo(!activo)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${activo ? 'bg-green-500' : 'bg-gray-300'}`}>
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${activo ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <span className={`text-sm font-medium ${activo ? 'text-green-600' : 'text-red-500'}`}>
              {activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>

          {isRecepcion && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Permisos Extra</label>
              <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                {ALL_PERMISSIONS.filter(p => !['dashboard', 'habitaciones', 'calendario', 'reservas', 'caja', 'checkin', 'checkout'].includes(p)).map(perm => (
                  <label key={perm} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-50 p-1 rounded">
                    <input type="checkbox" checked={permisosExtra.includes(perm)} onChange={() => togglePermiso(perm)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500" />
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

          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg p-3">{error}</div>}

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">Cancelar</button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              {saving ? 'Guardando...' : isEdit ? 'Guardar Cambios' : 'Crear Usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
