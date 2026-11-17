import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';

import { environment } from '../../../environments/environments';
import { ResponseInteface } from '../../interfaces/response.interface';
import { MOSTRAR_LOADING } from '../../interceptors/loading.interceptor';
import { StoreProgramacionMedico, ProgramacionMedicoMes,FiltrosProgramacionMedicoMes, } from '../../interfaces/consultorios/programacion-medicos.interface';


@Injectable({
  providedIn: 'root'
})
export class ProgramacionMedicosService {
  private readonly baseUrl: string = environment.baseUrl;
  private readonly httpClient = inject(HttpClient);

  store_prog_medico(datos: StoreProgramacionMedico, mostrar_loading = false) {
    const url = this.baseUrl + 'v1/consultorio/programacion_medicos/store_prog_medico';

    return this.httpClient.post<ResponseInteface<unknown>>(url, datos, {
      context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
    }).pipe(
      map(({ message, data }) => ({ message, data })),
      catchError((error) => {
        const data_error = { data: error.error, status: error.status };
        return throwError(() => data_error);
      })
    );
  }

  list_prog_medico_by_mes(
  filtros: FiltrosProgramacionMedicoMes,
  mostrar_loading = false
) {
  const url = this.baseUrl +
    'v1/consultorio/programacion_medicos/list_prog_medico_by_mes';

  const params = new HttpParams()
    .set('persona', filtros.persona)
    .set('mes', filtros.mes)
    .set('anio', filtros.anio);

  return this.httpClient.get<ResponseInteface<ProgramacionMedicoMes[]>>(
    url,
    {
      params,
      context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
    }
  ).pipe(
    map(({ message, data }) => ({ message, data })),
    catchError((error) => {
      const data_error = {
        data: error.error,
        status: error.status
      };

      return throwError(() => data_error);
    })
  );
}
}
