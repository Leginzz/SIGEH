import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AuthContext, AuthContextType } from './AuthContext';
import type { AuthSession, LoginResult } from './types';
import type { Permission } from './types';
import { initUsers, validateCredentials, getUsersList } from './UserService';
import { calculatePermissions } from './roles';

const SESSION_KEY = 'sigeh_auth_session';

function getSavedSession(): AuthSession | null {
  try {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

function saveSession(session: AuthSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await initUsers();
      const savedSession = getSavedSession();
      if (savedSession) {
        const users = getUsersList();
        const currentUser = users.find(u => u.id === savedSession.userId && u.activo);
        if (currentUser) {
          setUser(currentUser);
          setSession(savedSession);
        } else {
          clearSession();
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<LoginResult> => {
    const validUser = await validateCredentials(username, password);
    if (!validUser) {
      return { success: false, error: 'Credenciales inválidas' };
    }
    const permisos = calculatePermissions(validUser.rol, validUser.permisosExtra);
    const newSession: AuthSession = {
      userId: validUser.id,
      usuario: validUser.usuario,
      nombre: validUser.nombre,
      rol: validUser.rol,
      permisos,
      loginTime: new Date().toISOString(),
    };
    setSession(newSession);
    setUser(validUser);
    saveSession(newSession);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setSession(null);
    clearSession();
  }, []);

  const hasPermissionFn = useCallback((permission: Permission): boolean => {
    if (!session) return false;
    if (session.rol === 'admin') return true;
    return session.permisos.includes(permission);
  }, [session]);

  const value = useMemo(() => ({
    user,
    session,
    login,
    logout,
    hasPermission: hasPermissionFn,
    isAdmin: session?.rol === 'admin',
    loading,
  }), [user, session, login, logout, hasPermissionFn, loading]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
