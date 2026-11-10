import { HttpClient, HttpContext, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environments';
import {
  AntecedentesFamiliaresContexto,
  RegistrarAntecedenteFamiliarRequest,
} from '../../interfaces/emergencia/triaje.interface';
import { ResponseInteface } from '../../interfaces/response.interface';
import { MOSTRAR_LOADING } from '../../interceptors/loading.interceptor';
import { procesar_error } from '../../utils/http_error.util';

@Injectable({ providedIn: 'root' })
export class AntFamiliarService {
  private readonly baseUrl = environment.baseUrl;
  private readonly httpClient = inject(HttpClient);

  obtener_antecedentes_familiares(
    atencion_id: number,
    mostrar_loading = false,
  ): Observable<ResponseInteface<AntecedentesFamiliaresContexto>> {
    const params = new HttpParams().set('atencion_id', atencion_id);

    return this.httpClient
      .get<ResponseInteface<AntecedentesFamiliaresContexto>>(
        `${this.baseUrl}v1/emergencia/antecedentes-familiares`,
        { params, context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  guardar_antecedente_familiar(
    request: RegistrarAntecedenteFamiliarRequest,
    mostrar_loading = false,
  ): Observable<ResponseInteface<AntecedentesFamiliaresContexto>> {
    return this.httpClient
      .post<ResponseInteface<AntecedentesFamiliaresContexto>>(
        `${this.baseUrl}v1/emergencia/antecedentes-familiares`,
        request,
        { context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }
}
