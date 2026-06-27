import React from 'react';
import { useAuth } from './useAuth';
import type { Permission } from './types';
import { LockClosedIcon } from '../components/icons/Icons';

interface ProtectedRouteProps {
  permission: Permission;
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ permission, children }) => {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <LockClosedIcon className="w-16 h-16 mb-4" />
        <h3 className="text-xl font-semibold text-gray-500 mb-2">Sin acceso</h3>
        <p className="text-sm">No tienes permisos para acceder a este módulo.</p>
      </div>
    );
  }

  return <>{children}</>;
};
