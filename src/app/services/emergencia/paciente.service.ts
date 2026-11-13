import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environments';
import { procesar_error } from '../../utils/http_error.util';
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
} from '../../interfaces/emergencia/paciente.interface';
import { ResponseInteface } from '../../interfaces/response.interface';
import { MOSTRAR_LOADING } from '../../interceptors/loading.interceptor';

@Injectable({ providedIn: 'root' })
export class PacienteService {
  private readonly baseUrl = environment.baseUrl;
  private readonly httpClient = inject(HttpClient);

  buscarPorTermino(
    termino: string,
    tipoPaciente?: 'FAP' | 'EXTRAFAP',
  ): Observable<ResponseInteface<PacienteBusqueda[]>> {
    const url = `${this.baseUrl}v1/pacientes/buscar`;
    const params: Record<string, string> = { termino };
    if (tipoPaciente) {
      params['tipo_paciente'] = tipoPaciente;
    }

    return this.httpClient
      .get<ResponseInteface<PacienteBusqueda[]>>(url, {
        params,
      })
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  actualizarContacto(
    request: ActualizarContactoPacienteRequest,
  ): Observable<ResponseInteface<ActualizarContactoPacienteResponse>> {
    return this.httpClient
      .patch<ResponseInteface<ActualizarContactoPacienteResponse>>(
        `${this.baseUrl}v1/pacientes/contacto`,
        request,
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  registrarNn(
    request: RegistrarPacienteNnRequest,
  ): Observable<ResponseInteface<RegistrarPacienteNnResponse>> {
    return this.httpClient
      .post<ResponseInteface<RegistrarPacienteNnResponse>>(
        `${this.baseUrl}v1/pacientes/nn`,
        request,
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  registrarExtrafap(
    request: RegistrarPacienteExtrafapRequest,
  ): Observable<ResponseInteface<RegistrarPacienteExtrafapResponse>> {
    return this.httpClient
      .post<ResponseInteface<RegistrarPacienteExtrafapResponse>>(
        `${this.baseUrl}v1/pacientes/extrafap`,
        request,
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  registrarFap(
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
}
