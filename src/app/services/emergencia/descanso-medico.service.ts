import { HttpClient, HttpContext, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environments';
import {
  DescansoMedicoData,
  RegistrarDescansoMedicoRequest,
} from '../../interfaces/emergencia/descanso-medico.interface';
import { ResponseInteface } from '../../interfaces/response.interface';
import { MOSTRAR_LOADING } from '../../interceptors/loading.interceptor';
import { procesar_error } from '../../utils/http_error.util';

@Injectable({ providedIn: 'root' })
export class DescansoMedicoService {
  private readonly baseUrl = environment.baseUrl;
  private readonly httpClient = inject(HttpClient);

  obtener_descansos(
    atencion_id: number,
    mostrar_loading = false,
  ): Observable<ResponseInteface<DescansoMedicoData>> {
    const params = new HttpParams().set('atencion_id', atencion_id.toString());

    return this.httpClient
      .get<ResponseInteface<DescansoMedicoData>>(
        `${this.baseUrl}v1/emergencia/atenciones/descansos-medicos`,
        {
          params,
          context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
        },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  registrar_descanso(
    atencion_id: number,
    request: RegistrarDescansoMedicoRequest,
    mostrar_loading = false,
  ): Observable<ResponseInteface<DescansoMedicoData>> {
    return this.httpClient
      .post<ResponseInteface<DescansoMedicoData>>(
        `${this.baseUrl}v1/emergencia/atenciones/descansos-medicos`,
        { atencion_id, ...request },
        { context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  obtener_pdf_url(atencion_id: number, descanso_id?: number): string {
    const query = descanso_id
      ? `?atencion_id=${atencion_id}&descanso_id=${descanso_id}`
      : `?atencion_id=${atencion_id}`;
    return `${this.baseUrl}v1/emergencia/atenciones/reporte-descanso-medico${query}`;
  }

  descargar_pdf_descanso(
    atencion_id: number,
    descanso_id?: number,
    mostrar_loading = true,
  ): Observable<Blob> {
    let params = new HttpParams().set('atencion_id', atencion_id.toString());
    if (descanso_id) {
      params = params.set('descanso_id', descanso_id.toString());
    }

    return this.httpClient
      .get(
        `${this.baseUrl}v1/emergencia/atenciones/reporte-descanso-medico`,
        {
          params,
          responseType: 'blob',
          context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
        },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }
}
