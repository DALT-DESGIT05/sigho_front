
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
import { ProgramacionMedicosService } from '../../../../services/consultorios/programacion-medicos.service';
import { ProgramacionMedicoMes, StoreProgramacionMedico,FiltrosProgramacionMedicoMes,ProgramacionMedico, } from '../../../../interfaces/consultorios/programacion-medicos.interface';
import { forkJoin } from 'rxjs';
import { HttpClient, HttpContext, HttpParams } from '@angular/common/http';
import { catchError, map, throwError } from 'rxjs';



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
  private readonly programacionMedicosService = inject(ProgramacionMedicosService);


  readonly cargandoProgramaciones = signal(false);
  private solicitudProgramaciones = 0;
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

    if (
      filtros.medico == null ||
      !filtros.fecha_inicio ||
      !filtros.fecha_termino ||
      filtros.fecha_inicio > filtros.fecha_termino
    ) {
      this.programaciones.set([]);
      this.consultaRealizada.set(false);
      return;
    }

    const solicitudActual = ++this.solicitudProgramaciones;
    const fechaInicio = filtros.fecha_inicio;
    const fechaFin = filtros.fecha_termino;
    const medico = filtros.medico;
    const [anioInicio, mesInicio] = fechaInicio.split('-').map(Number);
    const [anioFin, mesFin] = fechaFin.split('-').map(Number);
    const consultas = []; let anio = anioInicio;let mes = mesInicio;

    while (anio < anioFin || (anio === anioFin && mes <= mesFin)) {
      consultas.push(this.programacionMedicosService.list_prog_medico_by_mes({persona: medico, mes, anio}));mes++;

      if (mes > 12) { mes = 1; anio++;}
    }

    this.cargandoProgramaciones.set(true);
    this.consultaRealizada.set(false);
    this.programaciones.set([]);

    forkJoin(consultas).subscribe({
      next: (respuestas) => {
        if (solicitudActual !== this.solicitudProgramaciones) return;

        const registros = respuestas
          .flatMap(respuesta => respuesta.data)
          .filter(item =>
            item.fecha >= fechaInicio &&
            item.fecha <= fechaFin
          );

        this.programaciones.set(
          registros.map(item => this.adaptarProgramacion(item))
        );

        this.consultaRealizada.set(true);
        this.cargandoProgramaciones.set(false);
      },
      error: (error) => {
        if (solicitudActual !== this.solicitudProgramaciones) return;

        console.error('Error al consultar programaciones:', error);
        this.programaciones.set([]);
        this.consultaRealizada.set(false);
        this.cargandoProgramaciones.set(false);
      }
    });
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



  private adaptarProgramacion(
    item: ProgramacionMedicoMes
  ): ProgramacionMedico {
    return {
      id: item.codigo_programacion_medico,
      fecha: item.fecha,
      turno: String(item.turno),
      actividad_medica: String(item.actividad_medica_ipress),
      hora_inicio: item.hora_inicio ?? '',
      hora_termino: item.hora_fin ?? '',
      cupos: item.cant_cupos,
      reservados: '—',
      adicionales: '—',
      disponibles: '—'
    };
  }
}
