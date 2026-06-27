import type { Role, Permission } from './types';

export const ROLE_BASE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    'dashboard', 'habitaciones', 'calendario', 'reservas', 'caja',
    'checkin', 'checkout', 'informes', 'usuarios', 'configuracion',
    'tarifas', 'respaldos', 'exportarPDF', 'exportarExcel',
    'cerrarCaja', 'reabrirCaja', 'descuentos', 'mantenimiento',
    'limpieza', 'logs',
  ],
  recepcion: [
    'dashboard', 'habitaciones', 'calendario', 'reservas', 'caja',
    'checkin', 'checkout',
  ],
};

export const ALL_PERMISSIONS: Permission[] = ROLE_BASE_PERMISSIONS.admin;

export function calculatePermissions(rol: Role, permisosExtra: Permission[]): Permission[] {
  const base = [...ROLE_BASE_PERMISSIONS[rol]];
  const extra = permisosExtra.filter(p => ROLE_BASE_PERMISSIONS.admin.includes(p));
  return [...new Set([...base, ...extra])];
}
