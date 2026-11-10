
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environments';
import { Medico } from '../../interfaces/consultorios/medico.interface';
import { ResponseInteface } from '../../interfaces/response.interface';
import { MOSTRAR_LOADING } from '../../interceptors/loading.interceptor';

@Injectable({
  providedIn: 'root'
})
export class PersonalService {
  private readonly baseUrl: string = environment.baseUrl;
  private readonly httpClient = inject(HttpClient);

  find_medico_by_especialidad(especialidad: number, mostrar_loading = false) {
  const url = this.baseUrl + 'v1/personal/personal/find_medico_by_especialidad';
    return this.httpClient.get<ResponseInteface<Array<Medico>>>(url, {
      params: { especialidad },
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
