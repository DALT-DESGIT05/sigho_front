import { HttpClient, HttpContext, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environments';
import { AlergiaContexto, RegistrarAlergiaRequest } from '../../interfaces/emergencia/alergia.interface';
import { ResponseInteface } from '../../interfaces/response.interface';
import { MOSTRAR_LOADING } from '../../interceptors/loading.interceptor';
import { procesar_error } from '../../utils/http_error.util';

@Injectable({ providedIn: 'root' })
export class AlergiaService {
  private readonly baseUrl = environment.baseUrl;
  private readonly httpClient = inject(HttpClient);

  obtener_alergias(
    atencion_id: number,
    mostrar_loading = false,
  ): Observable<ResponseInteface<AlergiaContexto>> {
    const params = new HttpParams().set('atencion_id', atencion_id);

    return this.httpClient
      .get<ResponseInteface<AlergiaContexto>>(`${this.baseUrl}v1/emergencia/alergias`, {
        params,
        context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
      })
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  guardar_alergia(
    request: RegistrarAlergiaRequest,
    mostrar_loading = false,
  ): Observable<ResponseInteface<AlergiaContexto>> {
    return this.httpClient
      .post<ResponseInteface<AlergiaContexto>>(`${this.baseUrl}v1/emergencia/alergias`, request, {
        context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
      })
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  actualizar_alergia(
    request: RegistrarAlergiaRequest & { alergia_id: number },
    mostrar_loading = false,
  ): Observable<ResponseInteface<AlergiaContexto>> {
    return this.httpClient
      .put<ResponseInteface<AlergiaContexto>>(`${this.baseUrl}v1/emergencia/alergias`, request, {
        context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
      })
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  eliminar_alergia(
    atencion_id: number,
    alergia_id: number,
    mostrar_loading = false,
  ): Observable<ResponseInteface<AlergiaContexto>> {
    return this.httpClient
      .delete<ResponseInteface<AlergiaContexto>>(`${this.baseUrl}v1/emergencia/alergias`, {
        body: { atencion_id, alergia_id },
        context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
      })
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }
}
