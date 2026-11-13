import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environments';
import {
  EvaluacionMedicaData,
  EvaluacionMedicaResponse,
  ExamenRegional,
  ExamenRegionalContexto,
  FuncionBiologica,
} from '../../interfaces/emergencia/triaje.interface';
import { ResponseInteface } from '../../interfaces/response.interface';
import { MOSTRAR_LOADING } from '../../interceptors/loading.interceptor';
import { procesar_error } from '../../utils/http_error.util';

@Injectable({ providedIn: 'root' })
export class EvaluacionService {
  private readonly baseUrl = environment.baseUrl;
  private readonly httpClient = inject(HttpClient);

  obtener_evaluacion(
    atencion_id: number,
    mostrar_loading = false,
  ): Observable<ResponseInteface<EvaluacionMedicaResponse | null>> {
    return this.httpClient
      .get<ResponseInteface<EvaluacionMedicaResponse | null>>(
        `${this.baseUrl}v1/emergencia/atenciones/${atencion_id}/evaluacion`,
        { context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  obtener_funciones_biologicas(
    atencion_id: number,
    mostrar_loading = false,
  ): Observable<ResponseInteface<FuncionBiologica[]>> {
    return this.httpClient
      .get<ResponseInteface<FuncionBiologica[]>>(
        `${this.baseUrl}v1/emergencia/atenciones/${atencion_id}/funciones-biologicas`,
        { context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  obtener_examenes_regionales(
    atencion_id: number,
    mostrar_loading = false,
  ): Observable<ResponseInteface<ExamenRegionalContexto>> {
    return this.httpClient
      .get<ResponseInteface<ExamenRegionalContexto>>(
        `${this.baseUrl}v1/emergencia/atenciones/${atencion_id}/examenes-regionales`,
        { context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  guardar_evaluacion(
    atencion_id: number,
    evaluacion: EvaluacionMedicaData,
    funciones_biologicas: readonly FuncionBiologica[] = [],
    examenes_regionales: readonly ExamenRegional[] = [],
    mostrar_loading = false,
  ): Observable<ResponseInteface<EvaluacionMedicaResponse>> {
    return this.httpClient
      .post<ResponseInteface<EvaluacionMedicaResponse>>(
        `${this.baseUrl}v1/emergencia/atenciones/${atencion_id}/evaluacion`,
        {
          evaluacion,
          funciones_biologicas: funciones_biologicas.map(
            ({ funcion_id, estado_codigo, observacion }) => ({
              funcion_id,
              estado_codigo,
              observacion,
            }),
          ),
          examenes_regionales: examenes_regionales.map(({ examen_id, estado_id, observacion }) => ({
            examen_id,
            estado_id,
            observacion,
          })),
        },
        { context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  descargar_hoja_atencion(atencion_id: number, mostrar_loading = true): Observable<Blob> {
    return this.httpClient
      .get(`${this.baseUrl}v1/emergencia/atenciones/${atencion_id}/reporte-hoja-atencion`, {
        responseType: 'blob',
        context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
      })
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }
}

