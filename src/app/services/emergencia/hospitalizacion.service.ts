import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environments';
import { HospitalizacionContexto } from '../../interfaces/emergencia/triaje.interface';
import { ResponseInteface } from '../../interfaces/response.interface';
import { MOSTRAR_LOADING } from '../../interceptors/loading.interceptor';
import { procesar_error } from '../../utils/http_error.util';

@Injectable({ providedIn: 'root' })
export class HospitalizacionService {
  private readonly baseUrl = environment.baseUrl;
  private readonly httpClient = inject(HttpClient);

  obtener_hospitalizacion(
    atencion_id: number,
    mostrar_loading = false,
  ): Observable<ResponseInteface<HospitalizacionContexto>> {
    return this.httpClient
      .get<ResponseInteface<HospitalizacionContexto>>(
        `${this.baseUrl}v1/emergencia/atenciones/${atencion_id}/hospitalizacion`,
        { context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  guardar_hospitalizacion(
    atencion_id: number,
    diagnostico_id: number,
    motivo_id: number,
    observacion: string,
    mostrar_loading = false,
  ): Observable<ResponseInteface<HospitalizacionContexto>> {
    return this.httpClient
      .post<ResponseInteface<HospitalizacionContexto>>(
        `${this.baseUrl}v1/emergencia/atenciones/${atencion_id}/hospitalizacion`,
        { diagnostico_id, motivo_id, observacion },
        { context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  eliminar_hospitalizacion(
    atencion_id: number,
    orden_hospitalizacion_id: number,
    mostrar_loading = false,
  ): Observable<ResponseInteface<HospitalizacionContexto>> {
    return this.httpClient
      .delete<ResponseInteface<HospitalizacionContexto>>(
        `${this.baseUrl}v1/emergencia/atenciones/${atencion_id}/hospitalizacion/${orden_hospitalizacion_id}`,
        { context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }
}
