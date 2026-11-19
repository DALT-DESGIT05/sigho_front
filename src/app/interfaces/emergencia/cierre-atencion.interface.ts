export interface DestinoCierreAtencion {
  id_estado: number;
  cod_estado: string;
  des_estado: string;
}

export interface CierreAtencionEstado {
  puede_cerrar: boolean;
  motivos: string[];
  destinos: DestinoCierreAtencion[];
}
