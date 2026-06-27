import { createContext } from 'react';
import type { LoginResult } from './types';
import type { Permission } from './types';

export interface AuthContextType {
  user: { id: string; nombre: string; usuario: string; rol: 'admin' | 'recepcion'; permisosExtra: Permission[]; activo: boolean } | null;
  session: { userId: string; usuario: string; nombre: string; rol: 'admin' | 'recepcion'; permisos: Permission[]; loginTime: string } | null;
  login: (username: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
  isAdmin: boolean;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);
