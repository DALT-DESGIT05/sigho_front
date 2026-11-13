import { HttpClient, HttpContext, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environments';
import {
  ApoyoDiagnosticoContexto,
  ServicioImagen,
} from '../../interfaces/emergencia/triaje.interface';
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
        `${this.baseUrl}v1/emergencia/atenciones/${atencion_id}/apoyo-diagnostico`,
        { context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  buscar_servicios_imagen(
    termino: string,
    mostrar_loading = false,
  ): Observable<ResponseInteface<ServicioImagen[]>> {
    const params = new HttpParams().set('termino', termino);

    return this.httpClient
      .get<ResponseInteface<ServicioImagen[]>>(
        `${this.baseUrl}v1/emergencia/apoyo-diagnostico/servicios-imagen`,
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
        `${this.baseUrl}v1/emergencia/atenciones/${atencion_id}/apoyo-diagnostico/imagenes`,
        {
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
    const url = imagen_id
      ? `${this.baseUrl}v1/emergencia/atenciones/${atencion_id}/reporte-orden-imagen/${imagen_id}`
      : `${this.baseUrl}v1/emergencia/atenciones/${atencion_id}/reporte-orden-imagen`;

    return this.httpClient
      .get(url, {
        responseType: 'blob',
        context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
      })
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }
}
