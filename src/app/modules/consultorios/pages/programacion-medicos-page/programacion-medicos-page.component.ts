
import { Component, computed, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardGeneralComponent } from '../../../../components/card-general/card-general.component';
import { SelectComponent, SelectOption } from '../../../../components/select/select.component';
import { InputDateComponent } from '../../../../components/input-date/input-date.component';
import { ButtonComponent } from '../../../../components/button/button.component';
import { TableComponent } from '../../../../components/table/table.component';
import { ModalComponent } from '../../../../components/modal/modal.component';
import { LabelComponent } from '../../../../components/label/label.component';
import { InputTextComponent } from '../../../../components/input-text/input-text.component';
import { AlertDialogComponent } from '../../../../components/alert-dialog/alert-dialog.component';


interface Medico {
  id: number;
  nombre: string;
  id_consultorio: number;
}

interface ProgramacionMedico {
  id: number;
  id_medico: number;
  id_consultorio: number;
  fecha: string;
  turno: string;
  actividad_medica: string;
  hora_inicio: string;
  hora_termino: string;
  cupos: number;
  reservados: number;
  adicionales: number;
  disponibles: number;
}

@Component({
  selector: 'app-programacion-medicos-page',
  standalone: true,
  imports:[ ReactiveFormsModule,CardGeneralComponent,SelectComponent, InputDateComponent,ButtonComponent,TableComponent,ModalComponent
            ,LabelComponent,InputTextComponent,AlertDialogComponent
          ],
  templateUrl: './programacion-medicos-page.component.html',
  styleUrl: './programacion-medicos-page.component.scss'
})
export class ProgramacionMedicosPage {

  constructor() {
    this.filtrosForm.controls.consultorio.valueChanges.subscribe(
      idConsultorio => this.cambiarConsultorio(idConsultorio)
    );
    this.filtrosForm.valueChanges.subscribe(() => {
      this.consultaRealizada.set(false);
      this.programaciones.set([]);
    });
    this.registroForm.controls.turno.valueChanges.subscribe(idTurno => {
      this.actualizarHorarioPorTurno(idTurno);
    });

    this.registroForm.controls.programa.valueChanges.subscribe(() => {
      this.calcularCupos();
    });

    this.registroForm.controls.hora_inicio.valueChanges.subscribe(() => {
      this.calcularCupos();
    });

    this.registroForm.controls.hora_termino.valueChanges.subscribe(() => {
      this.calcularCupos();
    });
  }

  readonly modalProgramacion =viewChild<ModalComponent>('modalProgramacion');

  abrirModalProgramacion(): void {
    if (!this.consultaRealizada()) return;

    this.registroForm.reset({
      fecha_inicio: this.filtrosForm.controls.fecha_inicio.value ?? '',
      fecha_termino: this.filtrosForm.controls.fecha_termino.value ?? '',
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

  private readonly fb = new FormBuilder();
  readonly programaciones = signal<ProgramacionMedico[]>([]);
  readonly consultaRealizada = signal(false);

  // Datos simulados de consultorios
  readonly consultorios = signal<SelectOption[]>([
    { value: 1, label: 'CARDIOLOGÍA' },
    { value: 2, label: 'MEDICINA GENERAL' },
    { value: 3, label: 'TRAUMATOLOGÍA' },
    { value: 4, label: 'PEDIATRÍA' }
  ]);

  // Datos simulados de médicos
  private readonly medicosMock: Medico[] = [
    { id: 1, nombre: 'MÉDICO DEMO 01', id_consultorio: 1 },
    { id: 2, nombre: 'MÉDICO DEMO 02', id_consultorio: 1 },
    { id: 3, nombre: 'MÉDICO DEMO 03', id_consultorio: 2 },
    { id: 4, nombre: 'MÉDICO DEMO 04', id_consultorio: 3 },
    { id: 5, nombre: 'MÉDICO DEMO 05', id_consultorio: 4 }
  ];

  readonly medicos = signal<SelectOption[]>([]);
  readonly cargandoMedicos = signal(false);
  readonly alertaProgramacion =viewChild<AlertDialogComponent>('alertaProgramacion');  readonly filtrosForm = this.fb.group({
    consultorio: [null as number | null, Validators.required],
    medico: [{ value: null as number | null, disabled: true }, Validators.required],  fecha_inicio: ['', Validators.required],fecha_termino: ['', Validators.required]
  });



  cambiarConsultorio(idConsultorio: number | null): void {
    const controlMedico = this.filtrosForm.controls.medico;

    controlMedico.reset(null, { emitEvent: false });
    this.medicos.set([]);

    if (idConsultorio === null) {
      controlMedico.disable({ emitEvent: false });
      return;
    }

    // Posteriormente se reemplazará por el servicio Laravel.
    const medicosFiltrados = this.medicosMock.filter(medico => medico.id_consultorio === idConsultorio).map(medico => ({value: medico.id,label: medico.nombre }));

    this.medicos.set(medicosFiltrados);
    controlMedico.enable({ emitEvent: false });
  }

  consultar(): void {
    if (this.filtrosForm.invalid) {
      this.filtrosForm.markAllAsTouched();
      this.programaciones.set([]);
      this.consultaRealizada.set(false);
      return;
    }

    const filtros = this.filtrosForm.getRawValue();

    if (filtros.fecha_inicio! > filtros.fecha_termino!) {
      console.warn('La fecha inicio no puede superar la fecha término.');
      this.programaciones.set([]);
      this.consultaRealizada.set(false);
      return;
    }

    const resultados = this.programacionesMock.filter(programacion =>
      programacion.id_consultorio === filtros.consultorio &&
      programacion.id_medico === filtros.medico &&
      programacion.fecha >= filtros.fecha_inicio! &&
      programacion.fecha <= filtros.fecha_termino!
    );

    this.programaciones.set(resultados);
    this.consultaRealizada.set(true);
  }
  //  datos fictisios
  readonly columnasProgramacion = [
    { key: 'fecha', label: 'FECHA', align: 'center' as const },
    { key: 'turno', label: 'TURNO', align: 'center' as const },
    { key: 'actividad_medica', label: 'ACTIVIDAD MÉDICA', align: 'center' as const },
    { key: 'hora_inicio', label: 'HORA INICIO', align: 'center' as const },
    { key: 'hora_termino', label: 'HORA TÉRMINO', align: 'center' as const },
    {
      key: 'cupos',
      label: 'CUPOS',
      align: 'center' as const,
      badge: { clases: 'primary', size: 'sm' as const }
    },
    {
      key: 'reservados',
      label: 'RESERVADOS',
      align: 'center' as const,
      badge: { clases: 'warning', size: 'sm' as const }
    },
    {
      key: 'adicionales',
      label: 'ADICIONALES',
      align: 'center' as const,
      badge: { clases: 'warning', size: 'sm' as const }
    },
    {
      key: 'disponibles',
      label: 'DISPONIBLES',
      align: 'center' as const,
      badge: { clases: 'success', size: 'sm' as const }
    }
  ];
  readonly accionesProgramacion = [
    {
      id: 'eliminar',
      action: 'delete' as const,
      iconOnly: true,
      title: 'Eliminar programación',
      variant: 'outline' as const
    }
  ];
  onAccionProgramacion(event: { action: string; row: any }): void {
    const { action, row } = event;

    switch (action) {
      case 'eliminar':
        console.log('Eliminar programación:', row);
        break;
    }
  }
  private readonly programacionesMock: ProgramacionMedico[] = [
  {
      id: 1,
      id_medico: 3,
      id_consultorio: 2,
      fecha: '2026-11-05',
      turno: 'MAÑANA',
      actividad_medica: 'CONSULTA MÉDICA',
      hora_inicio: '08:40',
      hora_termino: '12:00',
      cupos: 9,
      reservados: 9,
      adicionales: 7,
      disponibles: 0
    },
    {
      id: 2,
      id_medico: 3,
      id_consultorio: 2,
      fecha: '2026-11-06',
      turno: 'MAÑANA',
      actividad_medica: 'CONSULTA MÉDICA',
      hora_inicio: '08:40',
      hora_termino: '12:00',
      cupos: 9,
      reservados: 9,
      adicionales: 9,
      disponibles: 0
    },
    {
      id: 3,
      id_medico: 3,
      id_consultorio: 2,
      fecha: '2026-11-06',
      turno: 'TARDE',
      actividad_medica: 'CONSULTA MÉDICA',
      hora_inicio: '14:40',
      hora_termino: '18:00',
      cupos: 9,
      reservados: 9,
      adicionales: 1,
      disponibles: 0
    }
  ];

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
  readonly consultorioSeleccionado = computed(() => {
    const id = this.filtrosForm.controls.consultorio.value;

    return this.consultorios().find(item => item.value === id)?.label ?? '';
  });

 obtenerNombreMedico(): string {
  const id_medico = this.filtrosForm.controls.medico.value;

  return this.medicos().find(
    medico => String(medico.value) === String(id_medico)
  )?.label ?? '';
}
  obtenerNombreConsultorio(): string {
    const id_consultorio = this.filtrosForm.controls.consultorio.value;

    return this.consultorios().find(
      consultorio => String(consultorio.value) === String(id_consultorio)
    )?.label ?? '';
  }

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

  readonly turnos = signal<SelectOption[]>([
    { value: 1, label: 'MAÑANA' },
    { value: 2, label: 'TARDE' }
  ]);

  private actualizarHorarioPorTurno(idTurno: number | null): void {
  const horarios: Record<number, { inicio: string; termino: string }> = {
    1: { inicio: '08:00', termino: '14:00' },
    2: { inicio: '14:00', termino: '19:00' }
  };

  const horario = idTurno === null ? null : horarios[idTurno];

    this.registroForm.patchValue({
      hora_inicio: horario?.inicio ?? '',
      hora_termino: horario?.termino ?? ''
    });
  }

  private calcularCupos(): void {
    const { programa, hora_inicio, hora_termino } =this.registroForm.getRawValue();
    const duracion = programa === null ? 0: this.duracionProgramas[programa] ?? 0;

    if (!duracion || !hora_inicio || !hora_termino) {
      this.registroForm.controls.cupos.setValue(0, { emitEvent: false });
      return;
    }

    const convertirMinutos = (hora: string): number => {
      const [horas, minutos] = hora.split(':').map(Number);
      return horas * 60 + minutos;
    };

    const minutosDisponibles =
    convertirMinutos(hora_termino) - convertirMinutos(hora_inicio);
    const cupos = minutosDisponibles > 0 ? Math.floor(minutosDisponibles / duracion): 0;
    this.registroForm.controls.cupos.setValue(cupos, {emitEvent: false
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
    if (!this.puedeGuardarProgramacion()) {
      this.registroForm.markAllAsTouched();
      return;
    }

    const datos = this.registroForm.getRawValue();

    console.log('Programación válida para guardar:', {
      id_consultorio: this.filtrosForm.controls.consultorio.value,
      id_medico: this.filtrosForm.controls.medico.value,
      ...datos
    });

    console.log('GUARDAR VALIDADO - ABRIENDO ALERTA');

    this.cerrarModalProgramacion();

    const alerta = this.alertaProgramacion();

    console.log('Instancia de AlertDialog:', alerta);

    if (!alerta) {
      console.error('AlertDialogComponent no está disponible en la vista');
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
      imagen: 'assets/images/icono_de_aceptacion.png',
    });
  }

}

