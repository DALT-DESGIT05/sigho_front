export interface MotivoHospitalizacion {
  motivo_id: number;
  codigo: string;
  nombre: string;
}

export interface OrdenHospitalizacion {
  orden_hospitalizacion_id: number;
  diagnostico_id: number;
  diagnostico_codigo: string;
  diagnostico_nombre: string;
  motivo_id: number;
  motivo_codigo: string;
  motivo_nombre: string;
  observacion: string | null;
  fecha_registro: string | null;
}

export interface HospitalizacionContexto {
  ordenes: OrdenHospitalizacion[];
  motivos: MotivoHospitalizacion[];
}
