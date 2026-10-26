import { Usuario } from './usuario.interface';

export interface RolInterface {
  [key: string]: unknown;
}

export interface AuthInteface{
  usuario:Usuario;
  token:string;
  roles: Array<string | RolInterface>;
  permisos: Array<string | RolInterface>;
  last_activity: string;
  fecha_expiracion: string;
  ipress_sigla: string | null;
  contrasena_cambiada: number;
}
