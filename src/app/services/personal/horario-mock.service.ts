import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, tap } from 'rxjs';
import { environment } from '../../../environments/environments';
import {
  PersonalHorario,
  ProgramacionHorario,
  TurnoHorario,
} from '../../interfaces/personal/horario.interface';
import { ResponseInteface } from '../../interfaces/response.interface';
import { procesar_error } from '../../utils/http_error.util';

@Injectable({ providedIn: 'root' })
export class HorarioMockService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  readonly personal = signal<PersonalHorario[]>([]);
  readonly turnos = signal<TurnoHorario[]>([]);
  readonly programaciones = signal<ProgramacionHorario[]>([]);
  readonly totalPublicadas = computed(() => this.programaciones().filter((item) => item.estado === 'PUBLICADO').length);

  cargarTurnos(): Observable<TurnoHorario[]> {
    return this.http.get<ResponseInteface<TurnoHorario[]>>(`${this.baseUrl}v1/personal/turnos`).pipe(
      map((res) => res.data ?? []),
      tap((turnos) => this.turnos.set(turnos)),
      catchError((error: HttpErrorResponse) => procesar_error(error)),
    );
  }

  cargarPersonal(tipo?: string, busqueda?: string): Observable<PersonalHorario[]> {
    let params: Record<string, string> = {};
    if (tipo) params['tipo_personal'] = tipo;
    if (busqueda) params['busqueda'] = busqueda;

    return this.http.get<ResponseInteface<PersonalHorario[]>>(`${this.baseUrl}v1/personal/programables`, { params }).pipe(
      map((res) => res.data ?? []),
      tap((personas) => this.personal.set(personas)),
      catchError((error: HttpErrorResponse) => procesar_error(error)),
    );
  }

  cargarMatriz(periodo: string): Observable<ProgramacionHorario[]> {
    return this.http.get<ResponseInteface<ProgramacionHorario[]>>(`${this.baseUrl}v1/personal/programacion/matriz`, {
      params: { periodo },
    }).pipe(
      map((res) => res.data ?? []),
      tap((prog) => this.programaciones.set(prog)),
      catchError((error: HttpErrorResponse) => procesar_error(error)),
    );
  }

  guardarProgramacion(
    personalId: number,
    fecha: string,
    turnoId: number,
    observacion: string,
  ): void {
    const payload = {
      personal_id: personalId,
      fecha,
      turno_id: turnoId,
      observacion,
    };

    this.http.post<ResponseInteface<{ id: number; mensaje: string }>>(`${this.baseUrl}v1/personal/programacion/asignar`, payload)
      .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)))
      .subscribe(() => {
        this.programaciones.update((items) => {
          const existente = items.find((item) => item.personalId === personalId && item.fecha === fecha);
          if (existente) {
            return items.map((item) => item.id === existente.id
              ? { ...item, turnoId, observacion, estado: 'BORRADOR' }
              : item);
          }
          return [...items, { id: Date.now(), personalId, turnoId, fecha, observacion, estado: 'BORRADOR' }];
        });
      });
  }

  publicarBorradores(periodo?: string): void {
    const p = periodo || this.periodoActual();
    this.http.post<ResponseInteface<{ programaciones_publicadas: number }>>(`${this.baseUrl}v1/personal/programacion/publicar`, {
      periodo: p,
    }).pipe(catchError((error: HttpErrorResponse) => procesar_error(error)))
      .subscribe(() => {
        this.programaciones.update((items) => items.map((item) =>
          item.fecha.startsWith(p) && item.estado === 'BORRADOR'
            ? { ...item, estado: 'PUBLICADO' }
            : item,
        ));
      });
  }

  guardarTurno(turno: Omit<TurnoHorario, 'id'> & { id?: number }): void {
    const payload = {
      descripcion: turno.nombre,
      hora_inicio: turno.horaInicio,
      hora_fin: turno.horaFin,
      duracion_horas: turno.horas,
    };

    if (turno.id) {
      this.http.put<ResponseInteface<{ id: number }>>(`${this.baseUrl}v1/personal/turnos/${turno.id}`, payload)
        .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)))
        .subscribe(() => this.cargarTurnos().subscribe());
    } else {
      this.http.post<ResponseInteface<{ id: number }>>(`${this.baseUrl}v1/personal/turnos`, payload)
        .pipe(catchError((error: HttpErrorResponse) => procesar_error(error)))
        .subscribe(() => this.cargarTurnos().subscribe());
    }
  }

  periodoActual(): string {
    const hoy = new Date();
    return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;
  }
}
