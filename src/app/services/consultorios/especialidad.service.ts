
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environments';
import { Especialidad } from '../../interfaces/consultorios/especialidad.interface';
import { ResponseInteface } from '../../interfaces/response.interface';
import { MOSTRAR_LOADING } from '../../interceptors/loading.interceptor';

@Injectable({
  providedIn: 'root'
})
export class EspecialidadService {
  private readonly baseUrl: string = environment.baseUrl;
  private readonly httpClient = inject(HttpClient);

  list_especialidad_by_enfermera(mostrar_loading = false) {
   const url = this.baseUrl + 'v1/consultorio/especialidad/list_especialidad_by_enfermera';

    return this.httpClient.get<ResponseInteface<Array<Especialidad>>>(url, {
      context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
    }).pipe(
      map(({ message, data }) => ({ message, data })),
      catchError((error) => {
        const data_error = { data: error.error, status: error.status };
        return throwError(() => data_error);
      })
    );
  }
}
