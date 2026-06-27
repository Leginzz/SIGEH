import React, { useState, useEffect } from 'react';
import type { User, CreateUserInput } from './types';
import type { Role, Permission } from './types';
import { getUsersList, createUser, updateUser, deleteUser, toggleUserActive } from './UserService';
import { UserForm } from './UserForm';
import { PencilSquareIcon, TrashIcon, XCircleIcon, CheckCircleIcon, PlusIcon } from '../components/icons/Icons';

export const UsersView: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [resetPasswordId, setResetPasswordId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  const loadUsers = () => setUsers(getUsersList());

  useEffect(loadUsers, []);

  const handleCreate = async (data: CreateUserInput) => {
    await createUser(data);
    loadUsers();
  };

  const handleEdit = async (data: {
    nombre: string;
    usuario: string;
    password: string;
    rol: Role;
    permisosExtra: Permission[];
    activo: boolean;
  }) => {
    if (!editingUser) return;
    await updateUser(editingUser.id, data);
    loadUsers();
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    if (deleteConfirm === users.find(u => u.rol === 'admin')?.id) {
      alert('No puedes eliminar al administrador principal');
      setDeleteConfirm(null);
      return;
    }
    deleteUser(deleteConfirm);
    loadUsers();
    setDeleteConfirm(null);
  };

  const handleToggleActive = (id: string) => {
    toggleUserActive(id);
    loadUsers();
  };

  const handleResetPassword = async () => {
    if (!resetPasswordId || !newPassword) return;
    await updateUser(resetPasswordId, { password: newPassword });
    setResetPasswordId(null);
    setNewPassword('');
    loadUsers();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-gray-500 text-sm">{users.length} usuario{users.length !== 1 ? 's' : ''} registrado{users.length !== 1 ? 's' : ''}</p>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium">
          <PlusIcon className="w-4 h-4" /> Nuevo Usuario
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-3 text-sm font-semibold text-gray-500">Nombre</th>
              <th className="p-3 text-sm font-semibold text-gray-500">Usuario</th>
              <th className="p-3 text-sm font-semibold text-gray-500">Rol</th>
              <th className="p-3 text-sm font-semibold text-gray-500">Estado</th>
              <th className="p-3 text-sm font-semibold text-gray-500 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.length === 0 && (
              <tr><td colSpan={5} className="p-8 text-center text-gray-400">No hay usuarios registrados</td></tr>
            )}
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="p-3 font-medium text-gray-900">{u.nombre}</td>
                <td className="p-3 text-gray-600 font-mono text-sm">{u.usuario}</td>
                <td className="p-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${u.rol === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                    {u.rol === 'admin' ? 'Admin' : 'Recepción'}
                  </span>
                </td>
                <td className="p-3">
                  <span className={`inline-flex items-center gap-1 text-sm ${u.activo ? 'text-green-600' : 'text-red-500'}`}>
                    {u.activo ? <CheckCircleIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
                    {u.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => setEditingUser(u)} title="Editar"
                      className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>
                    <button onClick={() => setResetPasswordId(u.id)} title="Restablecer contraseña"
                      className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors text-xs font-medium">
                      🔑
                    </button>
                    <button onClick={() => handleToggleActive(u.id)} title={u.activo ? 'Desactivar' : 'Activar'}
                      className={`p-1.5 rounded-lg transition-colors ${u.activo ? 'text-gray-400 hover:text-red-600 hover:bg-red-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`}>
                      {u.activo ? <XCircleIcon className="w-4 h-4" /> : <CheckCircleIcon className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setDeleteConfirm(u.id)} title="Eliminar"
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <UserForm user={null} onSave={async (data) => { await handleCreate(data as CreateUserInput); setShowCreate(false); }} onClose={() => setShowCreate(false)} />
      )}

      {editingUser && (
        <UserForm user={editingUser} onSave={handleEdit} onClose={() => setEditingUser(null)} />
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm m-4 p-6 border border-gray-200" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Confirmar eliminación</h3>
            <p className="text-sm text-gray-500 mb-6">¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">Cancelar</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">Eliminar</button>
            </div>
          </div>
        </div>
      )}

      {resetPasswordId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-50" onClick={() => { setResetPasswordId(null); setNewPassword(''); }}>
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm m-4 p-6 border border-gray-200" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Restablecer Contraseña</h3>
            <p className="text-sm text-gray-500 mb-4">Ingresa la nueva contraseña para este usuario.</p>
            <input type="text" value={newPassword} onChange={e => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none mb-4"
              placeholder="Nueva contraseña" autoFocus />
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setResetPasswordId(null); setNewPassword(''); }} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">Cancelar</button>
              <button onClick={handleResetPassword} disabled={!newPassword}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
