import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environments';
import { MOSTRAR_LOADING } from '../../interceptors/loading.interceptor';
import {
  ActualizarContactoPacienteRequest,
  ActualizarContactoPacienteResponse,
  PacienteBusqueda,
  RegistrarPacienteExtrafapRequest,
  RegistrarPacienteExtrafapResponse,
  RegistrarPacienteFapRequest,
  RegistrarPacienteFapResponse,
  RegistrarPacienteNnRequest,
  RegistrarPacienteNnResponse,
} from '../../interfaces/pacientes/paciente.interface';
import { ResponseInteface } from '../../interfaces/response.interface';
import { procesar_error } from '../../utils/http_error.util';

@Injectable({ providedIn: 'root' })
export class PacienteService {
  private readonly baseUrl = environment.baseUrl;
  private readonly httpClient = inject(HttpClient);

  buscar_por_termino(
    termino: string,
    tipo_paciente?: 'FAP' | 'EXTRAFAP',
  ): Observable<ResponseInteface<PacienteBusqueda[]>> {
    const url = `${this.baseUrl}v1/pacientes/buscar`;
    const params: Record<string, string> = { termino };
    if (tipo_paciente) {
      params['tipo_paciente'] = tipo_paciente;
    }

    return this.httpClient
      .get<ResponseInteface<PacienteBusqueda[]>>(url, { params })
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  buscarPorTermino(
    termino: string,
    tipoPaciente?: 'FAP' | 'EXTRAFAP',
  ): Observable<ResponseInteface<PacienteBusqueda[]>> {
    return this.buscar_por_termino(termino, tipoPaciente);
  }

  actualizar_contacto(
    request: ActualizarContactoPacienteRequest,
  ): Observable<ResponseInteface<ActualizarContactoPacienteResponse>> {
    return this.httpClient
      .patch<ResponseInteface<ActualizarContactoPacienteResponse>>(
        `${this.baseUrl}v1/pacientes/contacto`,
        request,
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  actualizarContacto(
    request: ActualizarContactoPacienteRequest,
  ): Observable<ResponseInteface<ActualizarContactoPacienteResponse>> {
    return this.actualizar_contacto(request);
  }

  registrar_nn(
    request: RegistrarPacienteNnRequest,
  ): Observable<ResponseInteface<RegistrarPacienteNnResponse>> {
    return this.httpClient
      .post<ResponseInteface<RegistrarPacienteNnResponse>>(
        `${this.baseUrl}v1/pacientes/nn`,
        request,
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  registrarNn(
    request: RegistrarPacienteNnRequest,
  ): Observable<ResponseInteface<RegistrarPacienteNnResponse>> {
    return this.registrar_nn(request);
  }

  registrar_extrafap(
    request: RegistrarPacienteExtrafapRequest,
  ): Observable<ResponseInteface<RegistrarPacienteExtrafapResponse>> {
    return this.httpClient
      .post<ResponseInteface<RegistrarPacienteExtrafapResponse>>(
        `${this.baseUrl}v1/pacientes/extrafap`,
        request,
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  registrarExtrafap(
    request: RegistrarPacienteExtrafapRequest,
  ): Observable<ResponseInteface<RegistrarPacienteExtrafapResponse>> {
    return this.registrar_extrafap(request);
  }

  registrar_fap(
    request: RegistrarPacienteFapRequest,
    mostrar_loading = false,
  ): Observable<ResponseInteface<RegistrarPacienteFapResponse>> {
    return this.httpClient
      .post<ResponseInteface<RegistrarPacienteFapResponse>>(
        `${this.baseUrl}v1/pacientes/fap`,
        request,
        { context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  registrarFap(
    request: RegistrarPacienteFapRequest,
    mostrar_loading = false,
  ): Observable<ResponseInteface<RegistrarPacienteFapResponse>> {
    return this.registrar_fap(request, mostrar_loading);
  }
}
