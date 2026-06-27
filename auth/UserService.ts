import type { User, CreateUserInput, Permission } from './types';

const USERS_KEY = 'sigeh_users_v1';

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function getUsers(): User[] {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export async function initUsers(): Promise<void> {
  const users = getUsers();
  if (users.length === 0) {
    const passwordHash = await hashPassword('admin123');
    users.push({
      id: crypto.randomUUID(),
      nombre: 'Administrador',
      usuario: 'admin',
      passwordHash,
      rol: 'admin',
      permisosExtra: [],
      activo: true,
    });
    saveUsers(users);
  }
}

export async function validateCredentials(username: string, password: string): Promise<User | null> {
  const users = getUsers();
  const user = users.find(u => u.usuario === username && u.activo);
  if (!user) return null;
  const hash = await hashPassword(password);
  return hash === user.passwordHash ? { ...user } : null;
}

export function getUserById(id: string): User | undefined {
  return getUsers().find(u => u.id === id);
}

export function getUsersList(): User[] {
  return getUsers();
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const users = getUsers();
  if (users.some(u => u.usuario === input.usuario)) {
    throw new Error('El nombre de usuario ya existe');
  }
  const passwordHash = await hashPassword(input.password);
  const user: User = {
    id: crypto.randomUUID(),
    nombre: input.nombre,
    usuario: input.usuario,
    passwordHash,
    rol: input.rol,
    permisosExtra: input.permisosExtra,
    activo: input.activo,
  };
  users.push(user);
  saveUsers(users);
  return { ...user };
}

export async function updateUser(id: string, data: Partial<{
  nombre: string;
  usuario: string;
  password: string;
  rol: 'admin' | 'recepcion';
  permisosExtra: Permission[];
  activo: boolean;
}>): Promise<User> {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) throw new Error('Usuario no encontrado');

  if (data.usuario && data.usuario !== users[index].usuario && users.some(u => u.usuario === data.usuario)) {
    throw new Error('El nombre de usuario ya existe');
  }

  if (data.nombre !== undefined) users[index].nombre = data.nombre;
  if (data.usuario !== undefined) users[index].usuario = data.usuario;
  if (data.rol !== undefined) users[index].rol = data.rol;
  if (data.permisosExtra !== undefined) users[index].permisosExtra = data.permisosExtra;
  if (data.activo !== undefined) users[index].activo = data.activo;
  if (data.password) {
    users[index].passwordHash = await hashPassword(data.password);
  }

  saveUsers(users);
  return { ...users[index] };
}

export function deleteUser(id: string): void {
  const users = getUsers().filter(u => u.id !== id);
  saveUsers(users);
}

export function toggleUserActive(id: string): User {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  if (index === -1) throw new Error('Usuario no encontrado');
  users[index].activo = !users[index].activo;
  saveUsers(users);
  return { ...users[index] };
}
