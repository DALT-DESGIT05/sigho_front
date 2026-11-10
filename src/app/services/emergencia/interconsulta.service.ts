import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environments';
import { InterconsultaContexto } from '../../interfaces/emergencia/triaje.interface';
import { ResponseInteface } from '../../interfaces/response.interface';
import { MOSTRAR_LOADING } from '../../interceptors/loading.interceptor';
import { procesar_error } from '../../utils/http_error.util';

@Injectable({ providedIn: 'root' })
export class InterconsultaService {
  private readonly baseUrl = environment.baseUrl;
  private readonly httpClient = inject(HttpClient);

  obtener_interconsultas(
    atencion_id: number,
    mostrar_loading = false,
  ): Observable<ResponseInteface<InterconsultaContexto>> {
    return this.httpClient
      .get<ResponseInteface<InterconsultaContexto>>(
        `${this.baseUrl}v1/emergencia/atenciones/${atencion_id}/interconsultas`,
        { context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  guardar_interconsulta(
    atencion_id: number,
    prioridad_id: number,
    diagnostico_id: number,
    especialidad_id: number,
    area_id: number,
    programacion_personal_id: number,
    que_solicita: string,
    observaciones: string,
    mostrar_loading = false,
  ): Observable<ResponseInteface<InterconsultaContexto>> {
    return this.httpClient
      .post<ResponseInteface<InterconsultaContexto>>(
        `${this.baseUrl}v1/emergencia/atenciones/${atencion_id}/interconsultas`,
        {
          prioridad_id,
          diagnostico_id,
          especialidad_id,
          area_id,
          programacion_personal_id,
          que_solicita,
          observaciones,
        },
        { context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  eliminar_interconsulta(
    atencion_id: number,
    interconsulta_id: number,
    mostrar_loading = false,
  ): Observable<ResponseInteface<InterconsultaContexto>> {
    return this.httpClient
      .delete<ResponseInteface<InterconsultaContexto>>(
        `${this.baseUrl}v1/emergencia/atenciones/${atencion_id}/interconsultas/${interconsulta_id}`,
        { context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }
}
