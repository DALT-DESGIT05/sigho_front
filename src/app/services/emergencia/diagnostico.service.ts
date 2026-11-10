import { HttpClient, HttpContext, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environments';
import {
  DiagnosticoCatalogo,
  DiagnosticoContexto,
} from '../../interfaces/emergencia/triaje.interface';
import { ResponseInteface } from '../../interfaces/response.interface';
import { MOSTRAR_LOADING } from '../../interceptors/loading.interceptor';
import { procesar_error } from '../../utils/http_error.util';

@Injectable({ providedIn: 'root' })
export class DiagnosticoService {
  private readonly baseUrl = environment.baseUrl;
  private readonly httpClient = inject(HttpClient);

  obtener_diagnosticos(
    atencion_id: number,
    mostrar_loading = false,
  ): Observable<ResponseInteface<DiagnosticoContexto>> {
    return this.httpClient
      .get<ResponseInteface<DiagnosticoContexto>>(
        `${this.baseUrl}v1/emergencia/atenciones/${atencion_id}/diagnosticos`,
        { context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  buscar_diagnosticos(
    termino: string,
    mostrar_loading = false,
  ): Observable<ResponseInteface<DiagnosticoCatalogo[]>> {
    const params = new HttpParams().set('termino', termino);

    return this.httpClient
      .get<ResponseInteface<DiagnosticoCatalogo[]>>(`${this.baseUrl}v1/emergencia/diagnosticos`, {
        params,
        context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
      })
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  guardar_diagnostico(
    atencion_id: number,
    cie10_id: number,
    tipo_id: number,
    observacion: string,
    mostrar_loading = false,
  ): Observable<ResponseInteface<DiagnosticoContexto>> {
    return this.httpClient
      .post<ResponseInteface<DiagnosticoContexto>>(
        `${this.baseUrl}v1/emergencia/atenciones/${atencion_id}/diagnosticos`,
        { cie10_id, tipo_id, observacion },
        { context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  eliminar_diagnostico(
    atencion_id: number,
    diagnostico_id: number,
    mostrar_loading = false,
  ): Observable<ResponseInteface<DiagnosticoContexto>> {
    return this.httpClient
      .delete<ResponseInteface<DiagnosticoContexto>>(
        `${this.baseUrl}v1/emergencia/atenciones/${atencion_id}/diagnosticos/${diagnostico_id}`,
        { context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }
}
