import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environments';
import { List_afiliados_by_text, Ficha_afiliado, Find_afiliado } from '../../interfaces/citas/afiliado.interface';
import { ErrorResponseInterface, ResponseInteface } from '../../interfaces/response.interface';
import { MOSTRAR_LOADING } from '../../interceptors/loading.interceptor';

@Injectable({
  providedIn: 'root'
})
export class AfiliadoService {
  private readonly baseUrl: string = environment.baseUrl;
  private readonly httpClient = inject(HttpClient);

  list_afiliados_by_text(historia: string, codigo_afiliado: string, dni: string, nombre_completo: string, mostrar_loading = false) {
    const url = this.baseUrl + 'v1/personal/afiliado/list_afiliados_by_text';

    return this.httpClient.get<ResponseInteface<Array<List_afiliados_by_text>>>(url, {
      params: { historia, codigo_afiliado, dni, nombre_completo },
      context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
    }).pipe(
      map(({ message, data }) => ({ message, data })),
      catchError((error) => {
        const data_error = { data: error.error, status: error.status };
        return throwError(() => data_error);
      })
    );
  }

  ficha_afiliado(codigo_afiliado: string, mostrar_loading = false) {
    const url = this.baseUrl + 'v1/personal/afiliado/ficha_afiliado';

    return this.httpClient.get<ResponseInteface<Ficha_afiliado>>(url, {
      params: { codigo_afiliado },
      context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
    }).pipe(
      map(({ message, data }) => ({ message, data })),
      catchError((error) => {
        const data_error = { data: error.error, status: error.status };
        return throwError(() => data_error);
      })
    );
  }

  find_afiliado(codigo_afiliado: string, mostrar_loading = false) {
    const url = this.baseUrl + 'v1/personal/afiliado/find_afiliado';

    return this.httpClient.get<ResponseInteface<Find_afiliado>>(url, {
      params: { codigo_afiliado },
      context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
    }).pipe(
      map(({ message, data }) => ({ message, data })),
      catchError((error: HttpErrorResponse) => {
        const errorResponse = { ...(error.error as ErrorResponseInterface), statusCode: error.status };
        return throwError(() => errorResponse);
      })
    );
  }


}
