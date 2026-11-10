import { HttpClient, HttpContext, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environments';
import {
  CrearAtencionRequest,
  CrearAtencionResponse,
  DetalleAtencionResponse,
  FiltrosSeguimientoTriaje,
  RegistrarTriajeRequest,
  RegistrarTriajeResponse,
  PersonalProgramadoEmergencia,
  SeguimientoTriaje,
  TriajeTicket,
} from '../../interfaces/emergencia/triaje.interface';
import { ResponseInteface } from '../../interfaces/response.interface';
import { MOSTRAR_LOADING } from '../../interceptors/loading.interceptor';
import { procesar_error } from '../../utils/http_error.util';

@Injectable({ providedIn: 'root' })
export class TriajeService {
  private readonly baseUrl = environment.baseUrl;
  private readonly httpClient = inject(HttpClient);

  crearAtencion(
    request: CrearAtencionRequest,
    mostrar_loading = false,
  ): Observable<ResponseInteface<CrearAtencionResponse>> {
    return this.httpClient
      .post<ResponseInteface<CrearAtencionResponse>>(
        `${this.baseUrl}v1/emergencia/atenciones`,
        request,
        { context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  registrar(
    request: RegistrarTriajeRequest,
    mostrar_loading = false,
  ): Observable<ResponseInteface<RegistrarTriajeResponse>> {
    return this.httpClient
      .post<ResponseInteface<RegistrarTriajeResponse>>(
        `${this.baseUrl}v1/emergencia/triajes`,
        request,
        { context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  obtener_ticket(
    atencion_id: number,
    mostrar_loading = false,
  ): Observable<ResponseInteface<TriajeTicket>> {
    const params = new HttpParams().set('atencion_id', atencion_id);

    return this.httpClient
      .get<ResponseInteface<TriajeTicket>>(`${this.baseUrl}v1/emergencia/triajes/ticket`, {
        params,
        context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
      })
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  obtener_contexto_medico(
    atencion_id: number,
    mostrar_loading = false,
  ): Observable<ResponseInteface<DetalleAtencionResponse>> {
    return this.httpClient
      .get<ResponseInteface<DetalleAtencionResponse>>(
        `${this.baseUrl}v1/emergencia/atenciones/${atencion_id}/contexto-medico`,
        { context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  iniciar_atencion(
    atencion_id: number,
    mostrar_loading = false,
  ): Observable<ResponseInteface<{ atencion_id: number; iniciada: boolean }>> {
    return this.httpClient
      .post<ResponseInteface<{ atencion_id: number; iniciada: boolean }>>(
        `${this.baseUrl}v1/emergencia/atenciones/${atencion_id}/iniciar`,
        {},
        { context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  seguimiento(
    filtros: FiltrosSeguimientoTriaje,
    mostrar_loading = false,
  ): Observable<ResponseInteface<SeguimientoTriaje[]>> {
    let params = new HttpParams();

    for (const campo of [
      'documento',
      'motivo_consulta',
      'estado',
      'prioridad',
      'personal',
    ] as const) {
      const valor = filtros[campo].trim();
      if (valor) params = params.set(campo, valor);
    }

    if (filtros.limite) params = params.set('limite', filtros.limite);

    return this.httpClient
      .get<ResponseInteface<SeguimientoTriaje[]>>(
        `${this.baseUrl}v1/emergencia/atenciones/seguimiento`,
        { params, context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  cola_medica(
    filtros: FiltrosSeguimientoTriaje,
    mostrar_loading = false,
  ): Observable<ResponseInteface<SeguimientoTriaje[]>> {
    let params = new HttpParams();

    for (const campo of ['documento', 'prioridad'] as const) {
      const valor = filtros[campo].trim();
      if (valor) params = params.set(campo, valor);
    }

    return this.httpClient
      .get<ResponseInteface<SeguimientoTriaje[]>>(`${this.baseUrl}v1/emergencia/cola-medica`, {
        params,
        context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
      })
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  personal_programado(
    atencion_id: number,
  ): Observable<ResponseInteface<PersonalProgramadoEmergencia[]>> {
    const params = new HttpParams().set('atencion_id', atencion_id);

    return this.httpClient
      .get<ResponseInteface<PersonalProgramadoEmergencia[]>>(
        `${this.baseUrl}v1/emergencia/atenciones/personal-programado`,
        { params },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }
}
