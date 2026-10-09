import { HttpClient, HttpContext } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../environments/environments';
import { ResponseInteface } from '../../interfaces/response.interface';
import { catchError, map, throwError } from 'rxjs';
import { MOSTRAR_LOADING } from '../../interceptors/loading.interceptor';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private readonly baseUrl: string = environment.baseUrl;
  private httpClient = inject(HttpClient);

  constructor() { }

  change_my_password(ip_usuario: string, contrasena_actual: string, contrasena_nueva: string, contrasena_repetida: string, mostrar_loading = false) {
    const url = this.baseUrl + `v1/usuario/change_my_password`;
    return this.httpClient.patch<ResponseInteface<Array<any>>>(url, { ip_usuario, contrasena_actual, contrasena_nueva, contrasena_repetida }, {context:new HttpContext().set(MOSTRAR_LOADING, mostrar_loading)})
      .pipe(
        map(({ message, data, status }) => {
          return { message, data };
        }),
        catchError((error) => {
          const data_error = { 'data': error.error, 'status': error.status }
          return throwError(() => data_error);
        })
      );
  }
  change_correo(correo: string, contrasena: string, mostrar_loading = false) {
    const url = this.baseUrl + `v1/usuario/change_correo`;
    return this.httpClient.patch<ResponseInteface<Array<any>>>(url, { correo, contrasena }, {context:new HttpContext().set(MOSTRAR_LOADING, mostrar_loading)})
      .pipe(
        map(({ message, data, status }) => {
          return { message, data };
        }),
        catchError((error) => {
          const data_error = { 'data': error.error, 'status': error.status }
          return throwError(() => data_error);
        })
      );
  }
  change_telefono(contrasena: string, telefono: string, mostrar_loading = false) {
    const url = this.baseUrl + `v1/usuario/change_telefono`;
    return this.httpClient.patch<ResponseInteface<Array<any>>>(url, { contrasena, telefono }, {context:new HttpContext().set(MOSTRAR_LOADING, mostrar_loading)})
      .pipe(
        map(({ message, data, status }) => {
          return { message, data };
        }),
        catchError((error) => {
          const data_error = { 'data': error.error, 'status': error.status }
          return throwError(() => data_error);
        })
      );
  }
  change_telefono_paciente(usuario: string, telefono: string, mostrar_loading = false) {
    const url = this.baseUrl + `v1/usuario/change_telefono_por_usuario`;
    return this.httpClient.patch<ResponseInteface<Array<any>>>(url, { usuario, telefono }, {context:new HttpContext().set(MOSTRAR_LOADING, mostrar_loading)})
      .pipe(
        map(({ message, data, status }) => {
          return { message, data };
        }),
        catchError((error) => {
          const data_error = { 'data': error.error, 'status': error.status }
          return throwError(() => data_error);
        })
      );
  }
  change_correo_paciente(usuario: string, correo: string, mostrar_loading = false) {
    const url = this.baseUrl + `v1/usuario/change_correo_por_usuario`;
    return this.httpClient.patch<ResponseInteface<Array<any>>>(url, { usuario, correo }, {context:new HttpContext().set(MOSTRAR_LOADING, mostrar_loading)})
      .pipe(
        map(({ message, data, status }) => {
          return { message, data };
        }),
        catchError((error) => {
          const data_error = { 'data': error.error, 'status': error.status }
          return throwError(() => data_error);
        })
      );
  }

  get_menu(mostrar_loading = false){
    const url=this.baseUrl+'v1/usuario/acceso_v2';
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

}
