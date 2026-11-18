
import { Component, inject, OnInit, output, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { ModalComponent } from '../../../../../components/modal/modal.component';
import { SelectComponent, SelectOption } from '../../../../../components/select/select.component';
import { InputDateComponent } from '../../../../../components/input-date/input-date.component';
import { InputTextComponent } from '../../../../../components/input-text/input-text.component';
import { LabelComponent } from '../../../../../components/label/label.component';
import { ButtonComponent } from '../../../../../components/button/button.component';
import { AlertDialogComponent } from '../../../../../components/alert-dialog/alert-dialog.component';

import { TurnoService } from '../../../../../services/consultorios/turno.service';
import { Turno } from '../../../../../interfaces/consultorios/turno.interface';
import { ActividadMedicaService } from '../../../../../services/consultorios/actividad-medica.service';
import { EspecialidadService } from '../../../../../services/consultorios/especialidad.service';
import { firstValueFrom } from 'rxjs';

import { StoreProgramacionMedico } from '../../../../../interfaces/consultorios/programacion-medicos.interface';
import { ProgramacionMedicosService } from '../../../../../services/consultorios/programacion-medicos.service';

export interface DatosModalProgramacion {
  codigo_especialidad: number;
  nombre_especialidad: string;
  codigo_medico: number;
  nombre_medico: string;
  fecha_inicio: string;
  fecha_termino: string;
}

@Component({
  selector: 'app-modal-programacion',
  standalone: true,
  imports:[
            ReactiveFormsModule,ModalComponent, SelectComponent, InputDateComponent, InputTextComponent, LabelComponent,ButtonComponent,AlertDialogComponent
          ],
  templateUrl: './modal-programacion.component.html',
  styleUrl: './modal-programacion.component.scss'
})
export class ModalProgramacionComponent implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly turnoService = inject(TurnoService);

  readonly modalProgramacion = viewChild<ModalComponent>('modalProgramacion');
  readonly alertaProgramacion = viewChild<AlertDialogComponent>('alertaProgramacion');
  readonly datosProgramacion = signal<DatosModalProgramacion | null>(null);
  readonly turnos = signal<SelectOption[]>([]);
  readonly dataTurnos = signal<Turno[]>([]);
  readonly cargandoTurnos = signal(false);
  private readonly actividadMedicaService = inject(ActividadMedicaService);
  readonly actividadesMedicas = signal<SelectOption[]>([]);
  readonly cargandoActividadesMedicas = signal(false);
  private readonly EspecialidadService = inject(EspecialidadService);
  private readonly programacionMedicosService =inject(ProgramacionMedicosService);
  readonly guardandoProgramacion = signal(false);
  readonly programacionRegistrada = output<void>();
  readonly intervaloAtencion = signal<number | null>(null);
  readonly cargandoIntervalo = signal(false);
  private solicitudIntervalo = 0;



  readonly registroForm = this.fb.group({
    fecha_inicio: ['', Validators.required],
    fecha_termino: ['', Validators.required],
    actividad_medica: [null as number | null, Validators.required],
    turno: [null as number | null, Validators.required],
    hora_inicio: ['', Validators.required],
    hora_termino: ['', Validators.required],
    cupos: [0, Validators.min(1)]
  });

  constructor() {
    this.registroForm.controls.turno.valueChanges.subscribe(
      codigo_turno => this.actualizarHorarioPorTurno(codigo_turno)
    );


    this.registroForm.controls.hora_inicio.valueChanges.subscribe(
      () => this.calcularCupos()
    );

    this.registroForm.controls.hora_termino.valueChanges.subscribe(
      () => this.calcularCupos()
    );
    this.registroForm.controls.actividad_medica.valueChanges.subscribe(
      codigo_actividad => this.cambiarActividadMedica(codigo_actividad)
    );
  }

  ngOnInit(): void {
    this.cargarTurnos();
    this.cargarActividadesMedicas();
  }

  abrir(datos: DatosModalProgramacion): void {
    ++this.solicitudIntervalo;
    this.intervaloAtencion.set(null);
    this.cargandoIntervalo.set(false);
    this.datosProgramacion.set(datos);
    this.registroForm.reset({
      fecha_inicio: datos.fecha_inicio,
      fecha_termino: datos.fecha_termino,
      actividad_medica: null,
      turno: null,
      hora_inicio: '',
      hora_termino: '',
      cupos: 0 });

    this.modalProgramacion()?.open();
  }

  cerrarModalProgramacion(): void {
    this.modalProgramacion()?.close();
  }

  obtenerNombreEspecialidad(): string {
    return this.datosProgramacion()?.nombre_especialidad ?? '';
  }

  obtenerNombreMedico(): string {
    return this.datosProgramacion()?.nombre_medico ?? '';
  }

  cargarTurnos(): void {
    this.cargandoTurnos.set(true);

    this.turnoService.list_turnos().subscribe({
      next: ({ data }) => {
        this.dataTurnos.set(data);

        this.turnos.set(
          data.map(turno => {
            const label = turno.nombre_turno
              // Eliminar códigos numéricos: 03 -, 11 -, 03/11 -
              .replace(/^\s*\d+(?:\s*\/\s*\d+)?\s*-\s*/i, '')

              // Eliminar códigos alfabéticos: Ret_d -, Ret_n -, Vac -
              .replace(/^\s*[a-z]+(?:_[a-z]+)*\s*-\s*/i, '')

              // Eliminar "Turno" únicamente en mañana y tarde
              .replace(/^Turno\s+(?=Mañana|Tarde\b)/i, '')

              // Eliminar (M/T)
              .replace(/\s*\(m\/t\)/gi, '')

              // Formatear duración: (12h) -> (12 h)
              .replace(/\(\s*(\d+)\s*h\s*\)/gi, '($1 h)')

              // Simplificar descanso
              .replace(/Libre\s*\/\s*descanso\s*post[\s-]*guardia/i, 'Descanso postguardia')

              // Normalizar espacios
              .replace(/\s+/g, ' ')
              .trim()
              .toLocaleLowerCase('es-PE')
              .replace(/^./, letra => letra.toLocaleUpperCase('es-PE'));

            return {
              value: turno.codigo_turno,
              label
            };
          })
        );

        this.cargandoTurnos.set(false);
      },
      error: (error) => {
        console.error('Error al cargar turnos:', error);
        this.dataTurnos.set([]);
        this.turnos.set([]);
        this.cargandoTurnos.set(false);
      }
    });
  }

  private actualizarHorarioPorTurno(codigo_turno: number | null): void {
    const turno = this.dataTurnos().find(
      item => item.codigo_turno === codigo_turno
    );

    this.registroForm.patchValue({
      hora_inicio: turno?.hora_inicio?.slice(0, 5) ?? '',
      hora_termino: turno?.hora_fin?.slice(0, 5) ?? ''
    });
  }

  private calcularCupos(): void {
  const { hora_inicio, hora_termino } =this.registroForm.getRawValue();
  const duracion = this.intervaloAtencion() ?? 0;

    if (!duracion || !hora_inicio || !hora_termino) {
      this.registroForm.controls.cupos.setValue(0, {emitEvent: false});
      return;
    }

    const convertirMinutos = (hora: string): number => { const [horas, minutos] = hora.split(':').map(Number); return horas * 60 + minutos;};
    const minutosDisponibles =convertirMinutos(hora_termino) - convertirMinutos(hora_inicio);
    const cupos = minutosDisponibles > 0? Math.floor(minutosDisponibles / duracion) : 0;

    this.registroForm.controls.cupos.setValue(cupos, {
      emitEvent: false
    });
  }

  puedeGuardarProgramacion(): boolean {
    const datos = this.registroForm.getRawValue();

    if (this.registroForm.invalid) return false;
    if (!datos.fecha_inicio || !datos.fecha_termino) return false;
    if (datos.fecha_inicio > datos.fecha_termino) return false;
    if (!datos.hora_inicio || !datos.hora_termino) return false;
    if (datos.hora_inicio >= datos.hora_termino) return false;
    if (this.cargandoIntervalo() || (this.intervaloAtencion() ?? 0) <= 0) {return false; }

    return (datos.cupos ?? 0) > 0;
  }


  async guardarProgramacion(): Promise<void> {

    // Evitar solicitudes duplicadas
    if (this.guardandoProgramacion()) return;

    // Validar formulario
    if (!this.puedeGuardarProgramacion()) {
      this.registroForm.markAllAsTouched();
      return;
    }

    const datos = this.registroForm.getRawValue();
    const seleccion = this.datosProgramacion();

    if (!seleccion || datos.actividad_medica == null || datos.turno == null) {
      return;
    }

    // Preparar los datos para Laravel
    const payload: StoreProgramacionMedico = {
      persona: seleccion.codigo_medico,
      especialidad: seleccion.codigo_especialidad,
      fecha_inicio: datos.fecha_inicio ?? '',
      fecha_fin: datos.fecha_termino ?? '',
      turno: datos.turno,
      actividad_medica_ipress: datos.actividad_medica,
      hora_inicio: datos.hora_inicio ?? '',
      hora_fin: datos.hora_termino ?? ''
    };

    // Iniciar guardado
    this.guardandoProgramacion.set(true);

    try {
      await firstValueFrom(this.programacionMedicosService.store_prog_medico(payload, true));

      // Cerrar únicamente cuando Laravel confirme el registro
        this.cerrarModalProgramacion();
      // Notificar al padre para actualizar la tabla
        this.programacionRegistrada.emit();

      await this.alertaProgramacion()?.open({
        tipo: 'success',
        diseno: 'centrado',
        titulo: 'Programación registrada',
        mensaje: 'La programación médica se registró correctamente.',
        texto_confirmar: 'Aceptar',
        cerrar_fuera: false,
        cerrar_escape: false,
        imagen: 'icono_de_aceptacion'
      });

    } catch (error: any) {
      console.error('Error al registrar programación médica:', error);

      const errorFecha = error?.data?.errors?.fecha_inicio;

      const esErrorFecha = Array.isArray(errorFecha)
        && errorFecha.some((mensaje: string) =>
          mensaje.includes('today')
        );

      await this.alertaProgramacion()?.open({
        tipo: 'error',
        diseno: 'centrado',
        titulo: esErrorFecha ? 'Fecha de programación no permitida': 'Error al registrar',
        mensaje: esErrorFecha
          ? 'No se pueden registrar programaciones en fechas anteriores al día de hoy. Seleccione una fecha válida para continuar.'
          : 'No se pudo registrar la programación médica. Verifique los datos e inténtelo nuevamente.',

        texto_confirmar: 'Aceptar',
        cerrar_fuera: false,
        cerrar_escape: false,
        imagen:'icono_de_no_aceptacion'
      });
    }   finally {
          this.guardandoProgramacion.set(false);
        }
  }

  cargarActividadesMedicas(): void {
    this.cargandoActividadesMedicas.set(true);
    this.actividadMedicaService.list_actmed_by_ipress().subscribe({
      next: ({ data }) => {
        this.actividadesMedicas.set(
          data.map(actividad => ({value: actividad.codigo_actividad_medica_ipress,label: actividad.nombre_actividad_medica}))
        );

        this.cargandoActividadesMedicas.set(false);
      },
      error: (error) => {
        console.error('Error al cargar actividades médicas:', error);

        this.actividadesMedicas.set([]);
        this.cargandoActividadesMedicas.set(false);
      }
    });
  }


  private cambiarActividadMedica(codigo_actividad: number | null): void {
    const solicitud_actual = ++this.solicitudIntervalo;

    this.intervaloAtencion.set(null);
    this.cargandoIntervalo.set(false);
    this.registroForm.controls.cupos.setValue(0, { emitEvent: false });

    const especialidad = this.datosProgramacion()?.codigo_especialidad;

    if (codigo_actividad === null || especialidad == null) return;

    this.cargandoIntervalo.set(true);

    this.EspecialidadService.find_interval(
      codigo_actividad,
      especialidad
    ).subscribe({
      next: ({ data }) => {
        if (solicitud_actual !== this.solicitudIntervalo) return;

        this.intervaloAtencion.set(data.intervalo);
        this.cargandoIntervalo.set(false);
        this.calcularCupos();
      },
      error: (error) => {
        if (solicitud_actual !== this.solicitudIntervalo) return;

        console.error('Error al obtener intervalo:', error);
        this.intervaloAtencion.set(null);
        this.cargandoIntervalo.set(false);
        this.registroForm.controls.cupos.setValue(0, { emitEvent: false });
      }
  });
}

}
