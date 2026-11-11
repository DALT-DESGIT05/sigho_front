
import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
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

  readonly actividadesMedicas = signal<SelectOption[]>([
    { value: 1, label: 'CONSULTA MÉDICA' },
    { value: 2, label: 'PROCEDIMIENTOS' },
    { value: 3, label: 'INTERCONSULTA' }
  ]);

  readonly programas = signal<SelectOption[]>([
    { value: 1, label: 'NORMAL (20 min)' },
    { value: 2, label: 'ESPECIAL (30 min)' }
  ]);

  private readonly duracionProgramas: Record<number, number> = {
    1: 20,
    2: 30
  };

  readonly registroForm = this.fb.group({
    fecha_inicio: ['', Validators.required],
    fecha_termino: ['', Validators.required],
    actividad_medica: [null as number | null, Validators.required],
    programa: [null as number | null, Validators.required],
    turno: [null as number | null, Validators.required],
    hora_inicio: ['', Validators.required],
    hora_termino: ['', Validators.required],
    cupos: [0, Validators.min(1)]
  });

  constructor() {
    this.registroForm.controls.turno.valueChanges.subscribe(
      codigo_turno => this.actualizarHorarioPorTurno(codigo_turno)
    );

    this.registroForm.controls.programa.valueChanges.subscribe(
      () => this.calcularCupos()
    );

    this.registroForm.controls.hora_inicio.valueChanges.subscribe(
      () => this.calcularCupos()
    );

    this.registroForm.controls.hora_termino.valueChanges.subscribe(
      () => this.calcularCupos()
    );
  }

  ngOnInit(): void {
    this.cargarTurnos();
  }

  abrir(datos: DatosModalProgramacion): void {
    this.datosProgramacion.set(datos);

    this.registroForm.reset({
      fecha_inicio: datos.fecha_inicio,
      fecha_termino: datos.fecha_termino,
      actividad_medica: null,
      programa: null,
      turno: null,
      hora_inicio: '',
      hora_termino: '',
      cupos: 0
    });

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
          data.map(turno => ({
            value: turno.codigo_turno,
            label: turno.nombre_turno
          }))
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
    const { programa, hora_inicio, hora_termino } =this.registroForm.getRawValue();
    const duracion = programa === null ? 0: this.duracionProgramas[programa] ?? 0;

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

    return (datos.cupos ?? 0) > 0;
  }

  async guardarProgramacion(): Promise<void> {
    if (!this.puedeGuardarProgramacion()) {this.registroForm.markAllAsTouched();
      return;
    }

    const datos = this.registroForm.getRawValue();
    const seleccion = this.datosProgramacion();

    if (!seleccion) return;

    console.log('Programación válida para guardar:', {codigo_especialidad: seleccion.codigo_especialidad, id_medico: seleccion.codigo_medico, });

    // Pendiente: conectar endpoint de registro.
    this.cerrarModalProgramacion();

    const alerta = this.alertaProgramacion();

    if (!alerta) {
      console.error('AlertDialogComponent no está disponible');
      return;
    }

    await alerta.open({
      tipo: 'success',
      diseno: 'centrado',
      titulo: 'Programación registrada',
      mensaje: 'La programación médica se registró correctamente.',
      texto_confirmar: 'Aceptar',
      cerrar_fuera: false,
      cerrar_escape: false,
      imagen: 'assets/images/icono_de_aceptacion.png'
    });
  }
}
