import { HttpClient, HttpContext, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environments';
import {
  HabitosContexto,
  RegistrarHabitoRequest,
} from '../../interfaces/emergencia/triaje.interface';
import { ResponseInteface } from '../../interfaces/response.interface';
import { MOSTRAR_LOADING } from '../../interceptors/loading.interceptor';
import { procesar_error } from '../../utils/http_error.util';

@Injectable({ providedIn: 'root' })
export class AntHabitoService {
  private readonly baseUrl = environment.baseUrl;
  private readonly httpClient = inject(HttpClient);

  obtener_habitos(
    atencion_id: number,
    mostrar_loading = false,
  ): Observable<ResponseInteface<HabitosContexto>> {
    const params = new HttpParams().set('atencion_id', atencion_id);

    return this.httpClient
      .get<ResponseInteface<HabitosContexto>>(`${this.baseUrl}v1/emergencia/antecedentes-habitos`, {
        params,
        context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
      })
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  guardar_habito(
    request: RegistrarHabitoRequest,
    mostrar_loading = false,
  ): Observable<ResponseInteface<HabitosContexto>> {
    return this.httpClient
      .post<ResponseInteface<HabitosContexto>>(
        `${this.baseUrl}v1/emergencia/antecedentes-habitos`,
        request,
        { context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }
}
