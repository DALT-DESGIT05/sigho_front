import { HttpClient, HttpContext, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environments';
import {
  ApoyoDiagnosticoContexto,
  ServicioImagen,
} from '../../interfaces/imagenologia/imagen.interface';
import { ResponseInteface } from '../../interfaces/response.interface';
import { MOSTRAR_LOADING } from '../../interceptors/loading.interceptor';
import { procesar_error } from '../../utils/http_error.util';

@Injectable({ providedIn: 'root' })
export class ImagenService {
  private readonly baseUrl = environment.baseUrl;
  private readonly httpClient = inject(HttpClient);

  obtener_apoyos_diagnosticos(
    atencion_id: number,
    mostrar_loading = false,
  ): Observable<ResponseInteface<ApoyoDiagnosticoContexto>> {
    return this.httpClient
      .get<ResponseInteface<ApoyoDiagnosticoContexto>>(
        `${this.baseUrl}v1/emergencia/atenciones/apoyo-diagnostico`,
        {
          params: { atencion_id },
          context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
        },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  buscar_servicios_imagen(
    termino: string,
    area_codigo?: string,
    mostrar_loading = false,
  ): Observable<ResponseInteface<ServicioImagen[]>> {
    let params = new HttpParams().set('termino', termino);
    if (area_codigo) {
      params = params.set('area_codigo', area_codigo);
    }

    return this.httpClient
      .get<ResponseInteface<ServicioImagen[]>>(
        `${this.baseUrl}v1/imagenologia/servicios`,
        {
          params,
          context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
        },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  guardar_apoyo_imagen(
    atencion_id: number,
    prioridad_id: number,
    diagnostico_id: number,
    servicio_codigo: string,
    requiere_contraste: boolean,
    datos_clinicos: string,
    observacion: string,
    mostrar_loading = false,
  ): Observable<ResponseInteface<ApoyoDiagnosticoContexto>> {
    return this.httpClient
      .post<ResponseInteface<ApoyoDiagnosticoContexto>>(
        `${this.baseUrl}v1/imagenologia/atenciones/apoyo-diagnostico/imagenes`,
        {
          atencion_id,
          prioridad_id,
          diagnostico_id,
          servicio_codigo,
          requiere_contraste,
          datos_clinicos,
          observacion,
        },
        { context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  descargar_reporte_pdf(atencion_id: number, imagen_id?: number | null, mostrar_loading = true): Observable<Blob> {
    const params: Record<string, string | number> = { atencion_id };
    if (imagen_id !== null && imagen_id !== undefined) {
      params['imagen_id'] = imagen_id;
    }

    return this.httpClient
      .get(`${this.baseUrl}v1/reportes/ordenes/imagen`, {
        params,
        responseType: 'blob',
        context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
      })
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }
}
