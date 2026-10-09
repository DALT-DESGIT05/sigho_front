import { Usuario } from './usuario.interface';

export interface RolInterface {
  [key: string]: unknown;
}

export interface AuthInteface{
  usuario:Usuario;
  token:string;
  nsa:string;
  roles: Array<string | RolInterface>;
  permisos:string[],
  unidad: string;
  nombre_unidad: string;
  es_ipress: boolean;
  telefono: boolean;
  email: boolean;
  expiracion:Date;
}
