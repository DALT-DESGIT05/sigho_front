import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environments';
import { MOSTRAR_LOADING } from '../../interceptors/loading.interceptor';
import {
  Dosis,
  Farmacia,
  Frecuencia,
  HistorialReceta,
  HistorialRecetaDetalle,
  Medicamento,
  PayloadStoreMedicamento,
  PayloadUpdateMedicamento,
  RecetaMedicaMedicamento,
  RecetaResponse,
  ViaAdministracion,
} from '../../interfaces/farmacia/medicamento.interface';
import { ResponseInteface } from '../../interfaces/response.interface';
import { procesar_error } from '../../utils/http_error.util';

@Injectable({
  providedIn: 'root',
})
export class MedicamentoService {
  private readonly baseUrl = environment.baseUrl;
  private readonly httpClient = inject(HttpClient);

  list_farmacias(
    codigo_consultorio?: string | null,
    mostrar_loading = false,
  ): Observable<ResponseInteface<Farmacia[]>> {
    const url = `${this.baseUrl}v1/farmacia/medicamento/list_farmacias`;
    return this.httpClient
      .get<ResponseInteface<Farmacia[]>>(url, {
        params: codigo_consultorio ? { codigo_consultorio } : {},
        context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
      })
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  list_medicamentos_by_texto(
    nombre_medicamento: string,
    codigo_farmacia: number,
    mostrar_loading = false,
  ): Observable<ResponseInteface<Medicamento[]>> {
    const url = `${this.baseUrl}v1/farmacia/medicamento/list_medicamentos_by_texto`;
    return this.httpClient
      .get<ResponseInteface<Medicamento[]>>(url, {
        params: { nombre_medicamento, codigo_farmacia: codigo_farmacia.toString() },
        context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
      })
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  list_dosis(mostrar_loading = false): Observable<ResponseInteface<Dosis[]>> {
    const url = `${this.baseUrl}v1/farmacia/medicamento/list_dosis`;
    return this.httpClient
      .get<ResponseInteface<Dosis[]>>(url, {
        context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
      })
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  list_frecuencia(mostrar_loading = false): Observable<ResponseInteface<Frecuencia[]>> {
    const url = `${this.baseUrl}v1/farmacia/medicamento/list_frecuencia`;
    return this.httpClient
      .get<ResponseInteface<Frecuencia[]>>(url, {
        context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
      })
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  list_via_administracion(
    mostrar_loading = false,
  ): Observable<ResponseInteface<ViaAdministracion[]>> {
    const url = `${this.baseUrl}v1/farmacia/medicamento/list_via_administracion`;
    return this.httpClient
      .get<ResponseInteface<ViaAdministracion[]>>(url, {
        context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
      })
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  list_receta(
    atencion_id: number | string,
    codigo_farmacia: number,
    fecha_atencion?: string | null,
    mostrar_loading = false,
  ): Observable<ResponseInteface<RecetaResponse>> {
    const url = `${this.baseUrl}v1/farmacia/medicamento/list_receta`;
    return this.httpClient
      .get<ResponseInteface<RecetaResponse>>(url, {
        params: {
          codigo_cita: atencion_id.toString(),
          codigo_farmacia: codigo_farmacia.toString(),
          ...(fecha_atencion ? { fecha_cita: fecha_atencion } : {}),
        },
        context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
      })
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  store_medicamento(
    payload: PayloadStoreMedicamento,
    mostrar_loading = false,
  ): Observable<ResponseInteface<any>> {
    const url = `${this.baseUrl}v1/farmacia/medicamento/store_medicamento`;
    return this.httpClient
      .post<ResponseInteface<any>>(
        url,
        {
          codigo_cita: payload.atencion_id.toString(),
          codigo_diagnostico: payload.codigo_diagnostico,
          codigo_medicamento: payload.codigo_medicamento,
          duracion: payload.duracion,
          dosis: payload.dosis,
          frecuencia: payload.frecuencia,
          cantidad: payload.cantidad,
          indicacion: payload.indicacion,
          via_administracion: payload.via_administracion,
          codigo_farmacia: payload.codigo_farmacia,
        },
        { context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  update_medicamento(
    idtemrec: number,
    payload: PayloadStoreMedicamento,
    mostrar_loading = false,
  ): Observable<ResponseInteface<any>> {
    const url = `${this.baseUrl}v1/farmacia/medicamento/udpate_medicamento`;
    return this.httpClient
      .put<ResponseInteface<any>>(
        url,
        {
          idtemrec,
          codigo_cita: payload.atencion_id.toString(),
          codigo_diagnostico: payload.codigo_diagnostico,
          codigo_medicamento: payload.codigo_medicamento,
          duracion: payload.duracion,
          dosis: payload.dosis,
          frecuencia: payload.frecuencia,
          cantidad: payload.cantidad,
          indicacion: payload.indicacion,
          via_administracion: payload.via_administracion,
          codigo_farmacia: payload.codigo_farmacia,
        },
        { context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  get_receta_medicamento(
    idtemrec: number,
    mostrar_loading = false,
  ): Observable<ResponseInteface<RecetaMedicaMedicamento>> {
    const url = `${this.baseUrl}v1/farmacia/medicamento/get_receta_medicamento`;
    return this.httpClient
      .get<ResponseInteface<RecetaMedicaMedicamento>>(url, {
        params: { idtemrec: idtemrec.toString() },
        context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
      })
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  eliminar_medicamento(
    idtemrec: number,
    mostrar_loading = false,
  ): Observable<ResponseInteface<any>> {
    const url = `${this.baseUrl}v1/farmacia/medicamento/eliminar_medicamento`;
    return this.httpClient
      .delete<ResponseInteface<any>>(url, {
        params: { idtemrec: idtemrec.toString() },
        context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
      })
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  insertar_receta(
    atencion_id: number | string,
    mostrar_loading = false,
  ): Observable<ResponseInteface<any>> {
    const url = `${this.baseUrl}v1/farmacia/medicamento/insertar_receta`;
    return this.httpClient
      .post<ResponseInteface<any>>(
        url,
        { codigo_cita: atencion_id.toString() },
        { context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  verificar_receta(
    atencion_id: number | string,
    codigo_farmacia: number,
    fecha_atencion?: string | null,
    mostrar_loading = false,
  ): Observable<ResponseInteface<any>> {
    const url = `${this.baseUrl}v1/farmacia/medicamento/verificar_receta`;
    return this.httpClient
      .get<ResponseInteface<any>>(url, {
        params: {
          codigo_cita: atencion_id.toString(),
          codigo_farmacia: codigo_farmacia.toString(),
          ...(fecha_atencion ? { fecha_cita: fecha_atencion } : {}),
        },
        context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
      })
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  enable_editing_receta(
    atencion_id: number | string,
    codigo_farmacia: number,
    fecha_atencion?: string | null,
    mostrar_loading = false,
  ): Observable<ResponseInteface<any>> {
    const url = `${this.baseUrl}v1/farmacia/medicamento/enable_editing_receta`;
    return this.httpClient
      .put<ResponseInteface<any>>(
        url,
        {
          codigo_cita: atencion_id.toString(),
          codigo_farmacia,
          ...(fecha_atencion ? { fecha_cita: fecha_atencion } : {}),
        },
        { context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  add_indicacion_general(
    atencion_id: number | string,
    codigo_farmacia: number,
    indicaciones_generales: string,
    fecha_atencion?: string | null,
    mostrar_loading = false,
  ): Observable<ResponseInteface<any>> {
    const url = `${this.baseUrl}v1/farmacia/medicamento/add_indicacion_general`;
    return this.httpClient
      .post<ResponseInteface<any>>(
        url,
        {
          codigo_cita: atencion_id.toString(),
          codigo_farmacia,
          indicaciones_generales,
          ...(fecha_atencion ? { fecha_cita: fecha_atencion } : {}),
        },
        { context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  list_prescriptions_previous(
    atencion_id: number | string,
    codigo_farmacia: number,
    mostrar_loading = false,
  ): Observable<ResponseInteface<HistorialReceta[]>> {
    const url = `${this.baseUrl}v1/farmacia/medicamento/list_prescriptions_previous`;
    return this.httpClient
      .get<ResponseInteface<HistorialReceta[]>>(url, {
        params: {
          codigo_cita: atencion_id.toString(),
          codigo_farmacia: codigo_farmacia.toString(),
        },
        context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
      })
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  get_prescriptions_info(
    codigo_receta_atencion: string,
    codigo_farmacia: number,
    fecha_atencion?: string | null,
    mostrar_loading = false,
  ): Observable<ResponseInteface<HistorialRecetaDetalle[]>> {
    const url = `${this.baseUrl}v1/farmacia/medicamento/get_prescriptions_info`;
    return this.httpClient
      .get<ResponseInteface<HistorialRecetaDetalle[]>>(url, {
        params: {
          codigo_cita: codigo_receta_atencion,
          codigo_farmacia: codigo_farmacia.toString(),
          ...(fecha_atencion ? { fecha_cita: fecha_atencion } : {}),
        },
        context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading),
      })
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  store_receta_from_previous(
    codigo_receta: number,
    atencion_id: number | string,
    codigo_farmacia: number,
    mostrar_loading = false,
  ): Observable<ResponseInteface<any>> {
    const url = `${this.baseUrl}v1/farmacia/medicamento/store_receta_from_previous`;
    return this.httpClient
      .put<ResponseInteface<any>>(
        url,
        {
          codigo_receta,
          codigo_cita: atencion_id.toString(),
          codigo_farmacia,
        },
        { context: new HttpContext().set(MOSTRAR_LOADING, mostrar_loading) },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  imprimir_receta(
    atencion_id: number | string,
    codigo_farmacia: number,
    fecha_atencion?: string | null,
  ): Observable<Blob> {
    const url = `${this.baseUrl}v1/farmacia/pdf/receta_medica`;
    return this.httpClient.get(url, {
      responseType: 'blob',
      params: {
        codigo_cita: atencion_id.toString(),
        codigo_farmacia: codigo_farmacia.toString(),
        ...(fecha_atencion ? { fecha_cita: fecha_atencion } : {}),
      },
    });
  }
}
