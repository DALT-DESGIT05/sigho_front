import { HttpClient, HttpContext, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environments';
import { ProcedEnfContexto } from '../../interfaces/emergencia/procedimiento-enfermeria.interface';
import { ResponseInteface } from '../../interfaces/response.interface';
import { MOSTRAR_LOADING } from '../../interceptors/loading.interceptor';
import { procesar_error } from '../../utils/http_error.util';

@Injectable({ providedIn: 'root' })
export class ProcedimientoEnfermeriaService {
  private readonly baseUrl = environment.baseUrl;
  private readonly httpClient = inject(HttpClient);

  obtener_procedimientos_enfermeria(
    atencion_id: number,
    mostrar_loading = false,
  ): Observable<ResponseInteface<ProcedEnfContexto>> {
    const params = new HttpParams().set('atencion_id', atencion_id.toString());

    return this.httpClient
      .get<ResponseInteface<ProcedEnfContexto>>(
        `${this.baseUrl}v1/emergencia/atenciones/procedimientos-enfermeria`,
        {
          params,
          context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
        },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  guardar_procedimiento_enfermeria(
    atencion_id: number,
    prioridad_id: number,
    servicios: Array<{ codigo: string; indicaciones?: string | null }>,
    mostrar_loading = false,
  ): Observable<ResponseInteface<ProcedEnfContexto>> {
    return this.httpClient
      .post<ResponseInteface<ProcedEnfContexto>>(
        `${this.baseUrl}v1/emergencia/atenciones/procedimientos-enfermeria`,
        {
          atencion_id,
          prioridad_id,
          servicios: servicios.map((s) => ({
            codigo: s.codigo,
            indicaciones: s.indicaciones?.trim() || null,
          })),
        },
        { context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  eliminar_procedimiento_enfermeria(
    atencion_id: number,
    procedimiento_id: number,
    mostrar_loading = false,
  ): Observable<ResponseInteface<ProcedEnfContexto>> {
    const params = new HttpParams()
      .set('atencion_id', atencion_id.toString())
      .set('procedimiento_id', procedimiento_id.toString());

    return this.httpClient
      .delete<ResponseInteface<ProcedEnfContexto>>(
        `${this.baseUrl}v1/emergencia/atenciones/procedimientos-enfermeria`,
        {
          params,
          body: { atencion_id, procedimiento_id },
          context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
        },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }
}
