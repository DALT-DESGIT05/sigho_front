import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { environment } from '../../../environments/environments';
import { ProgramacionPersonalApi } from '../../interfaces/personal/programacion-personal.interface';
import { TurnoPersonalApi } from '../../interfaces/personal/turno-personal.interface';
import { ResponseInteface } from '../../interfaces/response.interface';
import { procesar_error } from '../../utils/http_error.util';

@Injectable({ providedIn: 'root' })
export class ProgramacionPersonalService {
  private readonly httpClient = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  listar(mes?: string): Observable<ResponseInteface<ProgramacionPersonalApi[]>> {
    let params = new HttpParams();
    if (mes) params = params.set('mes', mes);

    return this.httpClient
      .get<ResponseInteface<ProgramacionPersonalApi[]>>(
        `${this.baseUrl}v1/personal/programaciones`,
        { params },
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  listarTurnos(): Observable<ResponseInteface<TurnoPersonalApi[]>> {
    return this.httpClient
      .get<ResponseInteface<TurnoPersonalApi[]>>(`${this.baseUrl}v1/personal/turnos`)
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  crearTurno(payload: CrearTurnoPersonalRequest): Observable<ResponseInteface<{ id_horario_turno: number }>> {
    return this.httpClient
      .post<ResponseInteface<{ id_horario_turno: number }>>(`${this.baseUrl}v1/personal/turnos`, payload)
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  actualizarTurno(idTurno: number, payload: CrearTurnoPersonalRequest): Observable<ResponseInteface<never[]>> {
    return this.httpClient
      .put<ResponseInteface<never[]>>(`${this.baseUrl}v1/personal/turnos/${idTurno}`, payload)
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  crearHorario(payload: CrearHorarioPersonalRequest): Observable<ResponseInteface<{ id_horario: number }>> {
    return this.httpClient
      .post<ResponseInteface<{ id_horario: number }>>(`${this.baseUrl}v1/personal/horarios`, payload)
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  crearProgramacion(
    idHorario: number,
    payload: CrearProgramacionPersonalRequest,
  ): Observable<ResponseInteface<{ id_prog_per: number }>> {
    return this.httpClient
      .post<ResponseInteface<{ id_prog_per: number }>>(
        `${this.baseUrl}v1/personal/horarios/${idHorario}/programaciones`,
        payload,
      )
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }

  actualizarEstado(idHorario: number, idEstado: number): Observable<ResponseInteface<never[]>> {
    return this.httpClient
      .patch<ResponseInteface<never[]>>(`${this.baseUrl}v1/personal/horarios/${idHorario}/estado`, { id_estado: idEstado })
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)));
  }
}

export interface CrearHorarioPersonalRequest {
  id_persona_personal: number;
  id_especialidad: number;
  id_am_ipress: number;
  id_estado: number;
  hor_mes: number;
  hor_dia: number;
  hor_objetivo: number;
}

export interface CrearProgramacionPersonalRequest {
  id_persona_personal: number;
  id_horario_turno: number;
  id_especialidad: number;
  hor_fecha: string;
  hor_hora: number;
  hor_obs?: string;
  nro_consul?: string;
  cant_cupos?: number;
  intervalos?: number;
  canti_adi?: number;
}

export interface CrearTurnoPersonalRequest {
  turno_hora_inicio: string;
  turno_hora_fin: string;
  turno_hora_duracion?: number;
  turno_desc?: string;
}
