import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environments';
import { CierreAtencionEstado } from '../../interfaces/emergencia/triaje.interface';
import { ResponseInteface } from '../../interfaces/response.interface';
import { MOSTRAR_LOADING } from '../../interceptors/loading.interceptor';
import { procesar_error } from '../../utils/http_error.util';

@Injectable({ providedIn: 'root' })
export class CierreAtencionService {
  private readonly baseUrl = environment.baseUrl;
  private readonly httpClient = inject(HttpClient);

  obtener_cierre_atencion(
    atencion_id: number,
    mostrar_loading = false,
  ): Observable<ResponseInteface<CierreAtencionEstado>> {
    return this.httpClient
      .get<ResponseInteface<CierreAtencionEstado>>(
        `${this.baseUrl}v1/emergencia/atenciones/${atencion_id}/cierre`,
        { context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  cerrar_atencion(
    atencion_id: number,
    destino_codigo: string,
    mostrar_loading = false,
  ): Observable<ResponseInteface<CierreAtencionEstado>> {
    return this.httpClient
      .post<ResponseInteface<CierreAtencionEstado>>(
        `${this.baseUrl}v1/emergencia/atenciones/${atencion_id}/cierre`,
        { destino_codigo },
        { context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }
}
