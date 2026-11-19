import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environments';
import {
  AltaPacienteCatalogos,
  RegistrarAltaPacienteRequest,
} from '../../interfaces/hospitalizacion/alta-paciente.interface';
import { ResponseInteface } from '../../interfaces/response.interface';
import { MOSTRAR_LOADING } from '../../interceptors/loading.interceptor';
import { procesar_error } from '../../utils/http_error.util';

@Injectable({ providedIn: 'root' })
export class AltaPacienteService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  catalogos(atencion_id?: number): Observable<ResponseInteface<AltaPacienteCatalogos>> {
    const params: Record<string, string> = atencion_id ? { atencion_id: atencion_id.toString() } : {};
    return this.http
      .get<ResponseInteface<AltaPacienteCatalogos>>(`${this.baseUrl}v1/hospitalizacion/alta/catalogos`, { params })
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  registrar(
    atencion_id: number,
    request: RegistrarAltaPacienteRequest,
    mostrar_loading = true,
  ): Observable<ResponseInteface<Record<string, unknown>>> {
    return this.http
      .post<ResponseInteface<Record<string, unknown>>>(
        `${this.baseUrl}v1/hospitalizacion/alta`,
        {
          atencion_id,
          ...request,
        },
        { context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }
}
