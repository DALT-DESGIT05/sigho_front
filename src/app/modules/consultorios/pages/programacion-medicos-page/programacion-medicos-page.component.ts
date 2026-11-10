
import { Component, computed, inject, OnInit, signal, viewChild } from '@angular/core';
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
import { EspecialidadService } from '../../../../services/consultorios/especialidad.service';
import { PersonalService } from '../../../../services/consultorios/personal.service';
import { TurnoService } from '../../../../services/consultorios/turno.service';
import { Turno } from '../../../../interfaces/consultorios/turno.interface';




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
export class ProgramacionMedicosPage implements OnInit{

  constructor() {
    this.filtrosForm.controls.especialidad.valueChanges.subscribe(
      codigo_especialidad => this.cambiarEspecialidad(codigo_especialidad)
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
  private readonly especialidadService = inject(EspecialidadService);
  private readonly personalService = inject(PersonalService);
  private readonly turnoService = inject(TurnoService);

  ngOnInit(): void {
    this.cargarEspecialidades();
    this.cargarTurnos();
  }
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

  readonly especialidades = signal<SelectOption[]>([]);
  readonly cargandoEspecialidades = signal(false);
  private solicitudMedicos = 0;
  readonly medicos = signal<SelectOption[]>([]);
  readonly cargandoMedicos = signal(false);
  readonly turnos = signal<SelectOption[]>([]);
  readonly dataTurnos = signal<Turno[]>([]);
  readonly cargandoTurnos = signal(false);
  readonly alertaProgramacion =viewChild<AlertDialogComponent>('alertaProgramacion');  readonly filtrosForm = this.fb.group({
    especialidad: [null as number | null, Validators.required],
    medico: [{ value: null as number | null, disabled: true }, Validators.required],  fecha_inicio: ['', Validators.required],fecha_termino: ['', Validators.required]
  });




  cambiarEspecialidad(codigo_especialidad: number | null): void {
    const solicitud_actual = ++this.solicitudMedicos;
    const controlMedico = this.filtrosForm.controls.medico;

    controlMedico.reset(null, { emitEvent: false });
    controlMedico.disable({ emitEvent: false });

    this.medicos.set([]);
    this.cargandoMedicos.set(false);

    if (codigo_especialidad === null) {
      return;
    }

    this.cargandoMedicos.set(true);

    this.personalService.find_medico_by_especialidad(codigo_especialidad).subscribe({
      next: ({ data }) => {
        if (solicitud_actual !== this.solicitudMedicos) return;

        this.medicos.set(
          data.map(medico => ({
            value: medico.codigo_persona,
            label: [
              medico.prefijo,
              medico.nombres,
              medico.apellido_paterno,
              medico.apellido_materno
            ].filter(Boolean).join(' ')
          }))
        );

        if (data.length > 0) {
          controlMedico.enable({ emitEvent: false });
        }

        this.cargandoMedicos.set(false);
      },
      error: (error) => {
        if (solicitud_actual !== this.solicitudMedicos) return;

        console.error('Error al cargar médicos:', error);
        this.medicos.set([]);
        this.cargandoMedicos.set(false);
      }
    });
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
      programacion.id_consultorio === filtros.especialidad &&
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
  readonly especialidadSeleccionada = computed(() => {
    const codigo_especialidad = this.filtrosForm.controls.especialidad.value;

    return this.especialidades().find(
      especialidad => String(especialidad.value) === String(codigo_especialidad))?.label ?? '';
  });;

  obtenerNombreMedico(): string {
    const id_medico = this.filtrosForm.controls.medico.value;

    return this.medicos().find(
      medico => String(medico.value) === String(id_medico)
    )?.label ?? '';
  }

  obtenerNombreEspecialidad(): string {
    const codigo_especialidad = this.filtrosForm.controls.especialidad.value;

    return this.especialidades().find(
      especialidad => String(especialidad.value) === String(codigo_especialidad)
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
      codigo_especialidad: this.filtrosForm.controls.especialidad.value,
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
  cargarEspecialidades(): void {
    this.cargandoEspecialidades.set(true);
    this.especialidadService.list_especialidad_by_enfermera().subscribe({
      next: ({ data }) => {
        this.especialidades.set(
          data.map(especialidad => ({
            value: especialidad.codigo_especialidad,
            label: especialidad.nombre_especialidad
          }))
        );

        this.cargandoEspecialidades.set(false);
      },
      error: (error) => {
        console.error('Error al cargar especialidades:', error);
        this.especialidades.set([]);
        this.cargandoEspecialidades.set(false);
      }
    });
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


}

