import { HttpClient, HttpContext, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environments';
import { InterconsultaContexto } from '../../interfaces/emergencia/interconsulta.interface';
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
    const params = new HttpParams().set('atencion_id', atencion_id.toString());

    return this.httpClient
      .get<ResponseInteface<InterconsultaContexto>>(
        `${this.baseUrl}v1/emergencia/atenciones/interconsultas`,
        {
          params,
          context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
        },
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
        `${this.baseUrl}v1/emergencia/atenciones/interconsultas`,
        {
          atencion_id,
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
    const params = new HttpParams()
      .set('atencion_id', atencion_id.toString())
      .set('interconsulta_id', interconsulta_id.toString());

    return this.httpClient
      .delete<ResponseInteface<InterconsultaContexto>>(
        `${this.baseUrl}v1/emergencia/atenciones/interconsultas`,
        {
          params,
          body: { atencion_id, interconsulta_id },
          context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
        },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  descargar_reporte_pdf(
    atencion_id: number,
    interconsulta_id?: number | null,
    mostrar_loading = true,
  ): Observable<Blob> {
    let params = new HttpParams().set('atencion_id', atencion_id.toString());
    if (interconsulta_id) {
      params = params.set('interconsulta_id', interconsulta_id.toString());
    }

    return this.httpClient
      .get(`${this.baseUrl}v1/emergencia/atenciones/reporte-orden-interconsulta`, {
        params,
        responseType: 'blob',
        context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
      })
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }
}
