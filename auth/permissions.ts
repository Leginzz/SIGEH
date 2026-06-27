import type { Permission } from './types';
import { calculatePermissions } from './roles';
import type { User } from './types';

export function hasPermission(user: User, permission: Permission): boolean {
  if (user.rol === 'admin') return true;
  const perms = calculatePermissions(user.rol, user.permisosExtra);
  return perms.includes(permission);
}
