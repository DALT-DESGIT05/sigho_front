import { HttpClient, HttpContext, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environments';
import {
  AtencionLesionPayload,
  AtencionLesionResponse,
  CatalogosLesionesResponse,
} from '../../interfaces/emergencia/lesion.interface';
import { ResponseInteface } from '../../interfaces/response.interface';
import { MOSTRAR_LOADING } from '../../interceptors/loading.interceptor';
import { procesar_error } from '../../utils/http_error.util';

@Injectable({ providedIn: 'root' })
export class LesionService {
  private readonly baseUrl = environment.baseUrl;
  private readonly httpClient = inject(HttpClient);

  obtener_catalogos(
    mostrar_loading = false,
  ): Observable<ResponseInteface<CatalogosLesionesResponse>> {
    return this.httpClient
      .get<ResponseInteface<CatalogosLesionesResponse>>(
        `${this.baseUrl}v1/emergencia/catalogos/lesiones`,
        { context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  obtener_lesiones(
    atencion_id: number,
    mostrar_loading = false,
  ): Observable<ResponseInteface<AtencionLesionResponse | null>> {
    const params = new HttpParams().set('atencion_id', atencion_id.toString());

    return this.httpClient
      .get<ResponseInteface<AtencionLesionResponse | null>>(
        `${this.baseUrl}v1/emergencia/atenciones/lesiones`,
        {
          params,
          context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
        },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  guardar_lesiones(
    atencion_id: number,
    payload: AtencionLesionPayload,
    mostrar_loading = false,
  ): Observable<ResponseInteface<AtencionLesionResponse>> {
    return this.httpClient
      .post<ResponseInteface<AtencionLesionResponse>>(
        `${this.baseUrl}v1/emergencia/atenciones/lesiones`,
        { atencion_id, ...payload },
        { context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }
}
