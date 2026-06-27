export type Role = 'admin' | 'recepcion';

export type Permission =
  | 'dashboard' | 'habitaciones' | 'calendario' | 'reservas' | 'caja'
  | 'checkin' | 'checkout' | 'informes' | 'usuarios' | 'configuracion'
  | 'tarifas' | 'respaldos' | 'exportarPDF' | 'exportarExcel'
  | 'cerrarCaja' | 'reabrirCaja' | 'descuentos' | 'mantenimiento'
  | 'limpieza' | 'logs';

export interface User {
  id: string;
  nombre: string;
  usuario: string;
  passwordHash: string;
  rol: Role;
  permisosExtra: Permission[];
  activo: boolean;
}

export interface AuthSession {
  userId: string;
  usuario: string;
  nombre: string;
  rol: Role;
  permisos: Permission[];
  loginTime: string;
}

export interface CreateUserInput {
  nombre: string;
  usuario: string;
  password: string;
  rol: Role;
  permisosExtra: Permission[];
  activo: boolean;
}

export type LoginResult = { success: true } | { success: false; error: string };
