import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environments';
import {
  AcompananteBusqueda,
  RegistrarAcompananteRequest,
  RegistrarAcompananteResponse,
} from '../../interfaces/emergencia/acompanante.interface';
import { ResponseInteface } from '../../interfaces/response.interface';
import { MOSTRAR_LOADING } from '../../interceptors/loading.interceptor';
import { procesar_error } from '../../utils/http_error.util';

@Injectable({ providedIn: 'root' })
export class AcompananteService {
  private readonly baseUrl = environment.baseUrl;
  private readonly httpClient = inject(HttpClient);

  buscar(
    termino: string,
    tipoAcompanante: 0 | 1,
    pacienteId: number | null = null,
    mostrar_loading = false,
  ): Observable<ResponseInteface<AcompananteBusqueda[]>> {
    const params: Record<string, string | number> = { termino, tipo_acompanante: tipoAcompanante };
    if (pacienteId !== null) {
      params['paciente_id'] = pacienteId;
    }

    return this.httpClient
      .get<ResponseInteface<AcompananteBusqueda[]>>(`${this.baseUrl}v1/acompanantes/buscar`, {
        params,
        context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
      })
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  registrar(
    request: RegistrarAcompananteRequest,
    mostrar_loading = false,
  ): Observable<ResponseInteface<RegistrarAcompananteResponse>> {
    return this.httpClient
      .post<ResponseInteface<RegistrarAcompananteResponse>>(
        `${this.baseUrl}v1/acompanantes`,
        request,
        { context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }
}
