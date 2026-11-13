import { HttpClient, HttpContext, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environments';
import {
  RegistrarRepSexRequest,
  RepSexContexto,
} from '../../interfaces/emergencia/triaje.interface';
import { ResponseInteface } from '../../interfaces/response.interface';
import { MOSTRAR_LOADING } from '../../interceptors/loading.interceptor';
import { procesar_error } from '../../utils/http_error.util';

@Injectable({ providedIn: 'root' })
export class AntRepSexService {
  private readonly baseUrl = environment.baseUrl;
  private readonly httpClient = inject(HttpClient);

  obtener_rep_sex(
    atencion_id: number,
    mostrar_loading = false,
  ): Observable<ResponseInteface<RepSexContexto>> {
    const params = new HttpParams().set('atencion_id', atencion_id);

    return this.httpClient
      .get<ResponseInteface<RepSexContexto>>(`${this.baseUrl}v1/emergencia/antecedentes-rep-sex`, {
        params,
        context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
      })
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  guardar_rep_sex(
    request: RegistrarRepSexRequest,
    mostrar_loading = false,
  ): Observable<ResponseInteface<RepSexContexto>> {
    return this.httpClient
      .post<ResponseInteface<RepSexContexto>>(
        `${this.baseUrl}v1/emergencia/antecedentes-rep-sex`,
        request,
        { context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }
}
