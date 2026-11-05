export interface Afiliado{
  cod_afiliado:string;
  nombres:string;
  nsa:string;
  cod_paren:String;
  cod_situ:string;
  dni:string;
  nombre_parentesco:string;
  des_motex:string|null;
}

export interface AfiliadoPaciente {
  historia: string;
  tarifa: string;
  paciente: string;
  edad: string;
  sexo: string;
  estado_civil: string;
  grupo_sanquineo: string;
  dni: string;
  nombre_titular: string;
  cod_afiliado: string;
}

export interface List_afiliados_by_text{
  historia:string;
  codigo_afiliado:string;
  apellidos:string;
  nombres:string;
}

export interface Ficha_afiliado {
  cod_afiliado: string;
  dni: string;
  historia: string;
  parentesco: string;
  telefono: string | null;
  telefonos: string [];
  correo: string | null;
  situacion: string;
  apellido_paterno: string;
  apellido_materno: string;
  nombres: string;
}

export interface Find_afiliado {
  historia: string;
  tarifa: string | null;
  paciente: string;
  edad: number;
  sexo: string;
  estado_civil: string | null;
  grupo_sanquineo: string | null;
  dni: string;
  nombre_titular: string;
  codigo_afiliado: string;
  plan_salud: string | null;
  tarifa_pago: string | null;
  forma_pago: string | null;
  unidad: string | null;
  telefono: string | null;
  email: string | null;
  estado: string | null;
  codigo_pago: string | null;
}
export interface AfiliadoReserva {
  codigo: string;
  nombreCompleto: string;
  dni: string;
  fotoUrl: string | null;
}
