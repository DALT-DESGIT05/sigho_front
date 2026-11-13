import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environments';
import {
  ControlVitalHistorial,
  RegistrarSignosVitalesRequest,
  TriajeDetalleRequest,
} from '../../interfaces/emergencia/triaje.interface';
import { ResponseInteface } from '../../interfaces/response.interface';
import { MOSTRAR_LOADING } from '../../interceptors/loading.interceptor';
import { procesar_error } from '../../utils/http_error.util';

@Injectable({ providedIn: 'root' })
export class SignosVitalesService {
  private readonly baseUrl = environment.baseUrl;
  private readonly httpClient = inject(HttpClient);

  obtener_signos_vitales(
    atencion_id: number,
    mostrar_loading = false,
  ): Observable<ResponseInteface<ControlVitalHistorial[]>> {
    return this.httpClient
      .get<ResponseInteface<ControlVitalHistorial[]>>(
        `${this.baseUrl}v1/emergencia/atenciones/${atencion_id}/signos-vitales`,
        { context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  guardar_signos_vitales(
    atencion_id: number,
    detalles: TriajeDetalleRequest[],
    observaciones: string | null = null,
    mostrar_loading = false,
  ): Observable<ResponseInteface<ControlVitalHistorial[]>> {
    const request: RegistrarSignosVitalesRequest = { observaciones, detalles };

    return this.httpClient
      .post<ResponseInteface<ControlVitalHistorial[]>>(
        `${this.baseUrl}v1/emergencia/atenciones/${atencion_id}/signos-vitales`,
        request,
        { context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }
}
