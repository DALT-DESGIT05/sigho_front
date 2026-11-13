
import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardGeneralComponent } from '../../../../components/card-general/card-general.component';
import { SelectComponent, SelectOption } from '../../../../components/select/select.component';
import { InputDateComponent } from '../../../../components/input-date/input-date.component';
import { ButtonComponent } from '../../../../components/button/button.component';
import { TableComponent } from '../../../../components/table/table.component';
import { EspecialidadService } from '../../../../services/consultorios/especialidad.service';
import { PersonalService } from '../../../../services/consultorios/personal.service';
import { ModalProgramacionComponent } from '../../components/programacion-medicos-page/modal-programacion/modal-programacion.component';

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
  imports:[
            ReactiveFormsModule,CardGeneralComponent, SelectComponent,InputDateComponent,ButtonComponent, TableComponent, ModalProgramacionComponent
          ],
  templateUrl: './programacion-medicos-page.component.html',
  styleUrl: './programacion-medicos-page.component.scss'
})
export class ProgramacionMedicosPage implements OnInit {

  private readonly fb = inject(FormBuilder);
  private readonly especialidadService = inject(EspecialidadService);
  private readonly personalService = inject(PersonalService);
  readonly modalProgramacionHijo = viewChild<ModalProgramacionComponent>('modalProgramacionHijo');
  readonly programaciones = signal<ProgramacionMedico[]>([]);
  readonly consultaRealizada = signal(false);
  readonly especialidades = signal<SelectOption[]>([]);
  readonly cargandoEspecialidades = signal(false);
  readonly medicos = signal<SelectOption[]>([]);
  readonly cargandoMedicos = signal(false);
  private solicitudMedicos = 0;

  readonly filtrosForm = this.fb.group({
    especialidad: [null as number | null, Validators.required],
    medico: [{ value: null as number | null, disabled: true },Validators.required],
    fecha_inicio: ['', Validators.required],
    fecha_termino: ['', Validators.required]
  });

  constructor() {
    this.filtrosForm.controls.especialidad.valueChanges.subscribe(codigo_especialidad => this.cambiarEspecialidad(codigo_especialidad) );
    this.filtrosForm.valueChanges.subscribe(() => {this.consultaRealizada.set(false);this.programaciones.set([]);});
  }

  ngOnInit(): void {
    this.cargarEspecialidades();
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

  cambiarEspecialidad(codigo_especialidad: number | null): void {
    const solicitud_actual = ++this.solicitudMedicos;
    const controlMedico = this.filtrosForm.controls.medico;

    controlMedico.reset(null, { emitEvent: false });
    controlMedico.disable({ emitEvent: false });

    this.medicos.set([]);
    this.cargandoMedicos.set(false);

    if (codigo_especialidad === null) return;

    this.cargandoMedicos.set(true);

    this.personalService.find_medico_by_especialidad( codigo_especialidad)
    .subscribe({
      next: ({ data }) => {
        if (solicitud_actual !== this.solicitudMedicos) return;

        this.medicos.set(
          data.map(medico => ({
            value: medico.codigo_persona,
            label: [medico.prefijo,medico.nombres, medico.apellido_paterno, medico.apellido_materno].filter(Boolean).join(' ')
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

  obtenerNombreMedico(): string {
    const codigo_medico = this.filtrosForm.controls.medico.value;

    return this.medicos().find(medico => String(medico.value) === String(codigo_medico))?.label ?? '';
  }

  obtenerNombreEspecialidad(): string {
    const codigo_especialidad =this.filtrosForm.controls.especialidad.value;

    return this.especialidades().find( especialidad => String(especialidad.value) === String(codigo_especialidad))?.label ?? '';
  }

  abrirModalProgramacion(): void {
    if (!this.consultaRealizada()) return;

    const filtros = this.filtrosForm.getRawValue();

    if (
      filtros.especialidad === null ||
      filtros.medico === null ||
      !filtros.fecha_inicio ||
      !filtros.fecha_termino
    ) return;

    this.modalProgramacionHijo()?.abrir({
      codigo_especialidad: filtros.especialidad,
      nombre_especialidad: this.obtenerNombreEspecialidad(),
      codigo_medico: filtros.medico,
      nombre_medico: this.obtenerNombreMedico(),
      fecha_inicio: filtros.fecha_inicio,
      fecha_termino: filtros.fecha_termino
    });
  }

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

  // Datos ficticios hasta integrar el endpoint de programación.
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
}
