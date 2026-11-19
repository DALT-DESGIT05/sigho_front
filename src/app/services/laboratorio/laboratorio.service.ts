import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, from, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environments';
import {
  HistorialLaboratorioContexto,
  LaboratorioContexto,
  ResultadosLaboratorioContexto,
} from '../../interfaces/laboratorio/laboratorio.interface';
import { ResponseInteface } from '../../interfaces/response.interface';
import { MOSTRAR_LOADING } from '../../interceptors/loading.interceptor';
import { procesar_error } from '../../utils/http_error.util';

@Injectable({ providedIn: 'root' })
export class LaboratorioService {
  private readonly baseUrl = environment.baseUrl;
  private readonly httpClient = inject(HttpClient);

  obtener_laboratorio(
    atencion_id: number,
    mostrar_loading = false,
  ): Observable<ResponseInteface<LaboratorioContexto>> {
    return this.httpClient
      .get<ResponseInteface<LaboratorioContexto>>(
        `${this.baseUrl}v1/laboratorio/atenciones/laboratorio`,
        {
          params: { atencion_id },
          context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
        },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  obtener_historial_laboratorio(
    atencion_id: number,
    mostrar_loading = false,
  ): Observable<ResponseInteface<HistorialLaboratorioContexto>> {
    return this.httpClient
      .get<ResponseInteface<HistorialLaboratorioContexto>>(
        `${this.baseUrl}v1/laboratorio/atenciones/laboratorio/historial`,
        {
          params: { atencion_id },
          context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
        },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  obtener_resultados_laboratorio(
    atencion_id: number,
    mostrar_loading = false,
  ): Observable<ResponseInteface<ResultadosLaboratorioContexto>> {
    return this.httpClient
      .get<ResponseInteface<ResultadosLaboratorioContexto>>(
        `${this.baseUrl}v1/laboratorio/atenciones/laboratorio/resultados`,
        {
          params: { atencion_id },
          context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
        },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  guardar_laboratorio(
    atencion_id: number,
    prioridad_id: number,
    diagnostico_id: number,
    servicios: string[],
    mostrar_loading = false,
  ): Observable<ResponseInteface<LaboratorioContexto>> {
    return this.httpClient
      .post<ResponseInteface<LaboratorioContexto>>(
        `${this.baseUrl}v1/laboratorio/atenciones/laboratorio`,
        { atencion_id, prioridad_id, diagnostico_id, servicios },
        { context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  eliminar_laboratorio(
    atencion_id: number,
    laboratorio_id: number,
    mostrar_loading = false,
  ): Observable<ResponseInteface<LaboratorioContexto>> {
    return this.httpClient
      .delete<ResponseInteface<LaboratorioContexto>>(
        `${this.baseUrl}v1/laboratorio/atenciones/laboratorio`,
        {
          params: { atencion_id, orden_id: laboratorio_id },
          context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
        },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  descargar_reporte_pdf(atencion_id: number, mostrar_loading = true): Observable<Blob> {
    return this.httpClient
      .get(`${this.baseUrl}v1/reportes/ordenes/laboratorio`, {
        params: { atencion_id },
        responseType: 'blob',
        context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
      })
      .pipe(
        catchError((error: HttpErrorResponse) => {
          if (!(error.error instanceof Blob)) {
            return procesar_error(error);
          }

          return from(error.error.text()).pipe(
            switchMap((body: string) => {
              let response: Record<string, unknown> = {};

              try {
                response = JSON.parse(body) as Record<string, unknown>;
              } catch {
                response = {};
              }

              return throwError(() => ({ ...response, statusCode: error.status }));
            }),
          );
        }),
      );
  }
}
