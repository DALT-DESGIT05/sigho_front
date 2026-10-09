import { Injectable, inject} from '@angular/core';
import { environment } from '../../../environments/environments';
import { HttpClient, HttpContext } from '@angular/common/http';
import { ResponseInteface } from '../../interfaces/response.interface';
import { catchError, map, Observable, throwError } from 'rxjs';
import { MOSTRAR_LOADING } from '../../interceptors/loading.interceptor';


@Injectable({
  providedIn: 'root'
})

export class MailService {
  private readonly baseUrl:string=environment.baseUrl;
  private httpClient=inject(HttpClient);

  constructor() {

  }

  list_dominios(mostrar_loading = false){
    const url=this.baseUrl+'v1/variado/list_dominio_correo_personal';
    return this.httpClient.get<ResponseInteface<Array<any>>>(url,{context:new HttpContext().set(MOSTRAR_LOADING, mostrar_loading)})
    .pipe(
      map(({message,data,status})=>{
        return data;
      }),
      catchError((error)=>{
        const data_error={'data':error.error,'status':error.status}
        return throwError( ()=>data_error);
      })
    );
  }

  validar_correo(usuario: string, correo: string, dominio: number, ip_usuario: string, recaptcha:string, mostrar_loading = false): Observable<boolean> {
    const url = this.baseUrl + 'v1/usuario/validar_correo';
    const body = { usuario, correo, dominio, ip_usuario,'g-recaptcha-response': recaptcha };
    return this.httpClient.post<ResponseInteface<any>>(url, body,{context:new HttpContext().set(MOSTRAR_LOADING, mostrar_loading)})
      .pipe(
        map(({ message, data, status }) => {
          return data.message;
        }),
        map(() => true),
        catchError(error => {
          const data_error = { 'data': error.error, 'status': error.status }
          return throwError(() => data_error);
        })
      );
  }

  restablecer_by_correo(
    contrasena_nueva: string,
    contrasena_repetida: string,
    codigo_restablecimiento: string,
    usuario: string,
    correo: string,
    dominio: number,
    ip_usuario: string,
    mostrar_loading = false
  ): Observable<boolean> {
    const url = this.baseUrl + 'v1/usuario/restablecer_by_correo';
    const body = {
      contrasena_nueva,
      contrasena_repetida,
      codigo_restablecimiento,
      usuario,
      correo,
      dominio,
      ip_usuario
    };
    return this.httpClient.put<ResponseInteface<any>>(url, body,{context:new HttpContext().set(MOSTRAR_LOADING, mostrar_loading)})
      .pipe(
        map(({ message, data, status }) => {
          return data;
        }),
        map(() => true),
        catchError(error => {
          const data_error = { 'data': error.error, 'status': error.status }
          return throwError(() => data_error);
        })
      );
  }

  send_mensaje(telefono:string,mensaje:string, mostrar_loading = false){
    const url=this.baseUrl+`v1/sms/send_mensaje`;

    return this.httpClient.post<ResponseInteface<Array<any>>>(url,{telefono,mensaje},{context:new HttpContext().set(MOSTRAR_LOADING, mostrar_loading)})
    .pipe(
      map(({message,data,status})=>{
        return {message,data};
      }),
      catchError((error)=>{
        const data_error={'data':error.error,'status':error.status}
        return throwError( ()=>data_error);
      })
    );
  }
}
