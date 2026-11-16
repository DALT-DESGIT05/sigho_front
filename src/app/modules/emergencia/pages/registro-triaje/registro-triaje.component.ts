import {
  Component,
  OnInit,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  type WritableSignal,
} from '@angular/core';
import { FormField, form, maxLength, required } from '@angular/forms/signals';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2/dist/sweetalert2.esm.all.js';
import { finalize } from 'rxjs';
import { CardGeneralComponent } from '../../../../components/card-general/card-general.component';
import { ButtonComponent } from '../../../../components/button/button.component';
import { InputGroupComponent } from '../../../../components/input-group/input-group.component';
import { InputTextComponent } from '../../../../components/input-text/input-text.component';
import { LabelComponent } from '../../../../components/label/label.component';
import { ProgressBarsComponent } from '../../../../components/progress-bars/progress-bars.component';
import {
  SelectComponent,
  SelectOption,
  SelectValue,
} from '../../../../components/select/select.component';
import {
  CatalogoEmergenciaCodigoOption,
  CatalogoParametroClinico,
} from '../../../../interfaces/emergencia/catalogo-emergencia.interface';
import {
  DetalleAtencionResponse,
  RegistrarTriajeRequest,
  RegistroTriajeFormValue,
  TriajeTicket,
} from '../../../../interfaces/emergencia/triaje.interface';
import { MESSAGE_CONFIRMATION_DEFAULT, TITLE_MODAL } from '../../../../config/constants';
import { PaletteColor } from '../../../../interfaces/util.interface';
import { CatalogoEmergenciaService } from '../../../../services/emergencia/catalogo-emergencia.service';
import { TriajeService } from '../../../../services/emergencia/triaje.service';
import { UtilService } from '../../../../services/util.service';
import {
  CODIGOS_AREA_EMERGENCIA,
  CODIGOS_PARAMETRO_CLINICO,
  CODIGOS_PRIORIDAD,
  CONDICION_LLEGADA_POR_DEFECTO,
  EDAD_CORTE_EMERGENCIA_ADULTOS,
  MOTIVO_INGRESO_POR_DEFECTO,
} from './domain/triaje.constants';
import {
  DecisionTriajeClinico,
  TriajeEvaluadorClinicoService,
} from './domain/triaje-evaluador-clinico.service';
import { TriajePayloadMapper } from './mappers/triaje-payload.mapper';

const REGISTRO_TRIAJE_INICIAL: RegistroTriajeFormValue = {
  condicionLlegada: null,
  tipoIngreso: '',
  motivoIngreso: null,
  observaciones: '',
  temperatura: '',
  paSistolica: '',
  paDiastolica: '',
  saturacion: '',
  fc: '',
  fr: '',
  peso: '',
  talla: '',
  imc: '',
  eva: '0',
  prioridad: '',
  motivoConsulta: '',
  destinoAreaId: null,
  destinoEspecialidadId: null,
  programacionPersonalId: null,
};

type VitalSignControl =
  | 'temperatura'
  | 'pa'
  | 'saturacion'
  | 'fc'
  | 'fr'
  | 'peso'
  | 'talla'
  | 'imc';

interface VitalSignField {
  control: VitalSignControl;
  label: string;
  title: string;
  unit: string;
  type: 'number' | 'text';
  colClass: string;
  min?: number;
  max?: number;
  step?: number;
}

@Component({
  selector: 'app-registro-triaje',
  imports: [
    FormField,
    CardGeneralComponent,
    ButtonComponent,
    InputGroupComponent,
    InputTextComponent,
    LabelComponent,
    ProgressBarsComponent,
    SelectComponent,
  ],
  templateUrl: './registro-triaje.component.html',
  styleUrl: './registro-triaje.component.scss',
})
export class RegistroTriajeComponent implements OnInit {
  private readonly activated_route = inject(ActivatedRoute);
  private readonly catalogoEmergenciaService = inject(CatalogoEmergenciaService);
  private readonly triajeService = inject(TriajeService);
  private readonly evaluadorClinico = inject(TriajeEvaluadorClinicoService);
  readonly utilService = inject(UtilService);

  readonly atencion_id = input<number | null>(null);
  readonly embebido = input(false);
  readonly triaje_registrado = output<TriajeTicket>();
  readonly cerrado = output<void>();

  readonly validacion_solicitada = signal(false);
  readonly pasoActual = signal<1 | 2>(1);
  readonly guardando = signal(false);
  readonly registroGuardado = signal(false);
  readonly cargando_detalle = signal(true);
  readonly triaje_bloqueado = signal(false);
  readonly detalle_atencion = signal<DetalleAtencionResponse | null>(null);
  readonly api_errors = signal<Record<string, string[]>>({});
  readonly parametrosClinicos = signal<CatalogoParametroClinico[]>([]);
  readonly codigosParametrosDisponibles = computed(
    () => new Set(this.parametrosClinicos().map((p) => p.codigo)),
  );
  readonly areasEmergenciaOptions = signal<SelectOption[]>([]);
  readonly destinosConsultorioOptions = signal<SelectOption[]>([]);
  readonly destinosConsultorioOptionsVisibles = computed(() => {
    const paciente = this.detalle_atencion()?.paciente;
    const opciones = this.destinosConsultorioOptions();
    if (!paciente || opciones.length === 0) {
      return opciones;
    }

    const edad = paciente.edad;
    const sexoNormalizado = (paciente.sexo_codigo || paciente.sexo || '')
      .toUpperCase()
      .trim();
    const esMasculino = sexoNormalizado === 'M' || sexoNormalizado === 'MASCULINO';

    return opciones.filter((opcion) => {
      const labelNorm = this.normalize_option(opcion.label);

      if (labelNorm.includes('GINECOL') && esMasculino) {
        return false;
      }

      if (labelNorm.includes('PEDIATR') && edad !== null && edad !== undefined && edad >= EDAD_CORTE_EMERGENCIA_ADULTOS) {
        return false;
      }

      if (labelNorm.includes('MEDICINA INTERNA') && edad !== null && edad !== undefined && edad < EDAD_CORTE_EMERGENCIA_ADULTOS) {
        return false;
      }

      return true;
    });
  });
  readonly areas = signal<CatalogoEmergenciaCodigoOption[]>([]);
  readonly traumaShockArea = computed(() =>
    this.areas().find(
      (a) =>
        a.codigo === CODIGOS_AREA_EMERGENCIA.TRAUMA_SHOCK ||
        this.es_area_trauma_shock(a),
    ),
  );
  readonly traumaShockId = computed(() =>
    this.traumaShockArea() ? Number(this.traumaShockArea()!.value) : null,
  );
  readonly consultorioEmergenciaArea = computed(() =>
    this.areas().find(
      (a) =>
        a.codigo === CODIGOS_AREA_EMERGENCIA.CONSULTORIO_EMERGENCIA ||
        this.normalize_option(a.codigo ?? '') === CODIGOS_AREA_EMERGENCIA.CONSULTORIO_EMERGENCIA,
    ),
  );
  readonly consultorioEmergenciaId = computed(() =>
    this.consultorioEmergenciaArea() ? Number(this.consultorioEmergenciaArea()!.value) : null,
  );
  readonly esAreaConsultorioEmergencia = computed(() => {
    const areaId = this.triaje_model().destinoAreaId;
    const area = this.areas().find((item) => item.value === areaId);
    return (
      this.normalize_option(area?.codigo ?? '') ===
      CODIGOS_AREA_EMERGENCIA.CONSULTORIO_EMERGENCIA
    );
  });
  readonly areasEmergenciaOptionsVisibles = computed(() => {
    const esNn = this.esPacienteNn();
    const esPrioridadI = this.triaje_model().prioridad === CODIGOS_PRIORIDAD.I;

    if (esNn || esPrioridadI) {
      return this.areasEmergenciaOptions().filter((area) => this.es_area_trauma_shock(area));
    }

    return this.areasEmergenciaOptions().filter((area) => !this.es_area_trauma_shock(area));
  });
  readonly destinoOptionsVisibles = this.areasEmergenciaOptionsVisibles;
  readonly destinoOptions = this.areasEmergenciaOptions;
  readonly derivarOptions = signal<SelectOption[]>([]);
  readonly derivacionHabilitada = computed(() => this.esAreaConsultorioEmergencia());
  readonly medicosProgramadosOptions = signal<SelectOption[]>([]);
  readonly cargandoMedicos = signal(false);
  readonly prioridades = signal<readonly { value: string; color: string; label: string }[]>([]);
  readonly esPacienteNn = computed(() => this.detalle_atencion()?.paciente.es_nn ?? false);
  readonly prioridadesVisibles = computed(() => {
    if (!this.esPacienteNn()) {
      return this.prioridades();
    }

    const prioridadI = this.prioridades().find((prioridad) => prioridad.value === 'I');

    return prioridadI ? [prioridadI] : [{ value: 'I', label: 'Resucitación', color: 'red' }];
  });

  readonly condicionLlegadaCodigoSeleccionada = computed(() => {
    const condicionId = this.triaje_model().condicionLlegada;
    if (!condicionId) return null;
    const condicion = this.condicionLlegadaOptions().find(
      (c) => Number(c.value) === Number(condicionId),
    ) as (SelectOption & { codigo?: string }) | undefined;
    return condicion?.codigo ? String(condicion.codigo).trim().toUpperCase() : null;
  });

  readonly evaluacionClinica = computed<DecisionTriajeClinico>(() => {
    const model = this.triaje_model();
    return this.evaluadorClinico.evaluar({
      temperatura: model.temperatura,
      paSistolica: model.paSistolica,
      paDiastolica: model.paDiastolica,
      saturacion: model.saturacion,
      fc: model.fc,
      fr: model.fr,
      eva: model.eva,
      condicionLlegadaCodigo: this.condicionLlegadaCodigoSeleccionada(),
      esPacienteNn: this.esPacienteNn(),
    });
  });

  readonly alertasCriticasSignosVitales = computed(
    () => this.evaluacionClinica().alertasCriticas,
  );
  readonly prioridad1Bloqueada = computed(
    () => this.evaluacionClinica().prioridad1Bloqueada,
  );
  private ultimaEspecialidadConsultadaMedicos: number | null = null;

  private cargar_medicos_programados_segun_seleccion(): void {
    const actual = this.triaje_model();
    const esConEmer = this.esAreaConsultorioEmergencia();

    let especialidadId: number | null = null;

    if (esConEmer) {
      especialidadId = actual.destinoEspecialidadId;
    } else if (actual.destinoAreaId) {
      especialidadId = 64;
    }

    if (!especialidadId) {
      this.medicosProgramadosOptions.set([]);
      this.ultimaEspecialidadConsultadaMedicos = null;
      if (actual.programacionPersonalId !== null) {
        this.update_model({ programacionPersonalId: null });
      }
      return;
    }

    if (this.ultimaEspecialidadConsultadaMedicos === especialidadId) {
      return;
    }

    this.ultimaEspecialidadConsultadaMedicos = especialidadId;
    this.cargandoMedicos.set(true);

    this.triajeService
      .medicos_programados_triaje(especialidadId)
      .pipe(finalize(() => this.cargandoMedicos.set(false)))
      .subscribe({
        next: ({ data }) => {
          const opciones: SelectOption[] = (data ?? []).map((m) => {
            return {
              value: m.programacion_personal_id,
              label: m.nombre_completo,
            };
          });

          this.medicosProgramadosOptions.set(opciones);

          if (opciones.length === 1) {
            this.update_model({ programacionPersonalId: Number(opciones[0].value) });
          } else if (
            actual.programacionPersonalId &&
            !opciones.some((o) => Number(o.value) === actual.programacionPersonalId)
          ) {
            this.update_model({ programacionPersonalId: null });
          }
        },
        error: () => {
          this.medicosProgramadosOptions.set([]);
        },
      });
  }

  private atencion_id_resuelta = 0;

  readonly triaje_model = signal<RegistroTriajeFormValue>({ ...REGISTRO_TRIAJE_INICIAL });
  readonly triajeForm = form(this.triaje_model, (schema) => {
    required(schema.condicionLlegada);
    required(schema.motivoIngreso);
    required(schema.prioridad);
    required(schema.motivoConsulta);
    required(schema.temperatura);
    required(schema.paSistolica);
    required(schema.paDiastolica);
    required(schema.saturacion);
    required(schema.fc);
    required(schema.fr);
    required(schema.peso);
    required(schema.talla);
    required(schema.eva);
    maxLength(schema.observaciones, 200);
    maxLength(schema.motivoConsulta, 500);
    required(schema.destinoAreaId);
    required(schema.destinoEspecialidadId, {
      when: () => this.esAreaConsultorioEmergencia() && !this.esPacienteNn(),
    });
    required(schema.programacionPersonalId);
  });

  readonly condicionLlegadaOptions = signal<SelectOption[]>([]);

  readonly tipoIngresoOptions: SelectOption[] = [
    { value: 'Emergencia', label: 'Emergencia' },
    { value: 'Referencia', label: 'Referencia' },
    { value: 'Traslado', label: 'Traslado' },
  ];

  readonly motivoIngresoOptions = signal<SelectOption[]>([]);

  readonly vitalSignFields: readonly VitalSignField[] = [
    {
      control: 'temperatura',
      label: 'Temp.',
      title: 'Temperatura',
      unit: '°C',
      type: 'number',
      min: 36.0,
      max: 40.0,
      step: 0.1,
      colClass: 'col-6 col-lg-2',
    },
    {
      control: 'pa',
      label: 'Presión Arterial',
      title: 'Presión Arterial',
      unit: 'mmHg',
      type: 'text',
      colClass: 'col-12 col-lg-4',
    },
    {
      control: 'saturacion',
      label: 'Sat. O₂',
      title: 'Saturación de oxígeno',
      unit: '%',
      type: 'number',
      min: 60,
      max: 100,
      step: 1,
      colClass: 'col-6 col-lg-2',
    },
    {
      control: 'fc',
      label: 'FC',
      title: 'Frecuencia cardíaca',
      unit: 'lpm',
      type: 'number',
      min: 30,
      max: 220,
      step: 1,
      colClass: 'col-6 col-lg-2',
    },
    {
      control: 'fr',
      label: 'FR',
      title: 'Frecuencia respiratoria',
      unit: 'rpm',
      type: 'number',
      min: 10,
      max: 40,
      step: 1,
      colClass: 'col-6 col-lg-2',
    },
    {
      control: 'peso',
      label: 'Peso',
      title: 'Peso',
      unit: 'kg',
      type: 'number',
      min: 0.5,
      max: 300.0,
      step: 0.1,
      colClass: 'col-6 col-lg-2',
    },
    {
      control: 'talla',
      label: 'Talla',
      title: 'Talla',
      unit: 'cm',
      type: 'number',
      min: 25.0,
      max: 250.0,
      step: 0.5,
      colClass: 'col-6 col-lg-2',
    },
    {
      control: 'imc',
      label: 'Índice de Masa Corporal (IMC)',
      title: 'Índice de Masa Corporal (IMC)',
      unit: 'kg/m²',
      type: 'number',
      colClass: 'col-12 col-lg-6',
    },
  ];

  readonly auto_asignado_por_critico = signal(false);

  constructor() {
    this.catalogoEmergenciaService
      .obtenerCatalogos([
        'condiciones_llegada',
        'motivos_ingreso',
        'areas_emergencia',
        'destinos_consultorio',
        'niveles_triaje',
      ])
      .subscribe({
        next: ({ data }) => {
        this.condicionLlegadaOptions.set(data.condiciones_llegada);
        this.aplicar_condicion_llegada_por_defecto(data.condiciones_llegada);
        this.motivoIngresoOptions.set(data.motivos_ingreso);
        this.aplicar_motivo_ingreso_por_defecto(data.motivos_ingreso);
        const areas = data.areas_emergencia ?? data.areas ?? [];
        this.areas.set(areas);
        this.areasEmergenciaOptions.set(areas);
        this.destinosConsultorioOptions.set(data.destinos_consultorio ?? []);
        this.prioridades.set(
          data.niveles_triaje.map((nivel) => ({
            value: nivel.value,
            label: nivel.label,
            color: this.utilService.color_prioridad(nivel.color),
          })),
        );
        this.aplicar_reglas_paciente_nn();
      },
      error: (error: { message?: string }) => {
        this.utilService.mostrar_error(
          error.message ?? 'No se pudieron cargar los catálogos de Emergencia.',
        );
      },
    });

    this.catalogoEmergenciaService.obtenerSignosVitales().subscribe({
      next: ({ data }) => this.parametrosClinicos.set(data.parametros),
      error: (error: { message?: string }) => {
        this.utilService.mostrar_error(
          error.message ?? 'No se pudieron cargar los parámetros clínicos.',
        );
      },
    });

    effect(() => {
      const decision = this.evaluacionClinica();
      if (this.esPacienteNn()) {
        return;
      }

      untracked(() => {
        const actual = this.triaje_model();
        const traumaShockId = this.traumaShockId();
        const conEmerId = this.consultorioEmergenciaId();

        if (decision.tieneCritico) {
          const updates: Partial<RegistroTriajeFormValue> = {};
          if (actual.prioridad !== CODIGOS_PRIORIDAD.I) {
            updates.prioridad = CODIGOS_PRIORIDAD.I;
          }
          if (traumaShockId !== null && actual.destinoAreaId !== traumaShockId) {
            updates.destinoAreaId = traumaShockId;
            updates.destinoEspecialidadId = null;
          }
          if (Object.keys(updates).length > 0) {
            this.auto_asignado_por_critico.set(true);
            this.update_model(updates);
          }
        } else if (this.auto_asignado_por_critico()) {
          const updates: Partial<RegistroTriajeFormValue> = {};
          if (actual.prioridad === CODIGOS_PRIORIDAD.I) {
            updates.prioridad = decision.prioridadSugerida ?? '';
          }
          if (traumaShockId !== null && actual.destinoAreaId === traumaShockId) {
            updates.destinoAreaId = conEmerId;
            updates.destinoEspecialidadId = null;
          }
          this.auto_asignado_por_critico.set(false);
          if (Object.keys(updates).length > 0) {
            this.update_model(updates);
          }
        } else if (decision.prioridad1Bloqueada && actual.prioridad === CODIGOS_PRIORIDAD.I) {
          const updates: Partial<RegistroTriajeFormValue> = {
            prioridad: decision.prioridadSugerida ?? '',
          };
          if (traumaShockId !== null && actual.destinoAreaId === traumaShockId) {
            updates.destinoAreaId = conEmerId;
            updates.destinoEspecialidadId = null;
          }
          this.update_model(updates);
        }
      });
    });

    effect(() => {
      const actual = this.triaje_model();
      const esConEmer = this.esAreaConsultorioEmergencia();
      const destinoEspecialidadId = esConEmer ? actual.destinoEspecialidadId : null;

      let destinoEspecialidadFinal = null;
      if (destinoEspecialidadId !== null) {
        const opciones = untracked(() => this.destinosConsultorioOptionsVisibles());
        const destinoEspecialidadValido = opciones.some(
          (opcion) => Number(opcion.value) === Number(destinoEspecialidadId),
        );
        destinoEspecialidadFinal = destinoEspecialidadValido ? destinoEspecialidadId : null;
      }

      if (actual.destinoEspecialidadId !== destinoEspecialidadFinal) {
        untracked(() => {
          this.update_model({ destinoEspecialidadId: destinoEspecialidadFinal });
        });
      }

      untracked(() => {
        this.cargar_medicos_programados_segun_seleccion();
      });
    });
  }

  ngOnInit(): void {
    this.validacion_solicitada.set(false);
    this.cargar_detalle_atencion();
  }

  private cargar_detalle_atencion(): void {
    const atencion_id =
      this.atencion_id() ?? Number(this.activated_route.snapshot.paramMap.get('atencion_id'));
    if (!Number.isInteger(atencion_id) || atencion_id <= 0) {
      this.cargando_detalle.set(false);
      this.triaje_bloqueado.set(true);
      this.utilService.mostrar_error('La atención indicada no es válida.');
      return;
    }

    this.atencion_id_resuelta = atencion_id;
    this.triajeService
      .obtener_contexto_medico(atencion_id)
      .pipe(finalize(() => this.cargando_detalle.set(false)))
      .subscribe({
        next: ({ data }) => {
          this.detalle_atencion.set(data);
          this.aplicar_reglas_paciente_nn();
          if (data.triaje_registrado || data.estado_seguimiento === 'TRIADO') {
            this.triaje_bloqueado.set(true);
            this.utilService.mostrar_error(
              'La atención seleccionada ya tiene un triaje registrado.',
            );
          }
        },
        error: (error: { message?: string }) => {
          this.triaje_bloqueado.set(true);
          this.utilService.mostrar_error(
            error.message ?? 'No se pudo cargar el detalle de la atención.',
          );
        },
      });
  }

  eva_description(): string {
    const eva = Number(this.triaje_model().eva);

    if (eva === 0) return 'Sin dolor';
    if (eva <= 3) return 'Leve';
    if (eva <= 6) return 'Moderado';
    if (eva <= 9) return 'Severo';
    return 'Insoportable';
  }

  actualizar_eva(evento: Event): void {
    const valor = (evento.target as HTMLInputElement).value;
    this.triajeForm.eva().value.set(valor);
    this.update_model({ eva: valor });
  }

  actualizar_eva_desde_input(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    let valor = input.value.trim();

    if (valor === '') {
      this.triajeForm.eva().value.set('0');
      this.update_model({ eva: '0' });
      return;
    }

    let numero = parseInt(valor, 10);
    if (isNaN(numero) || numero < 0 || numero > 10) {
      if (!Swal.isVisible()) {
        this.utilService.mostrar_alerta('Escala de Dolor (EVA) debe estar entre 0 y 10.', 'warning');
      }
      numero = Math.min(Math.max(isNaN(numero) ? 0 : numero, 0), 10);
      input.value = numero.toString();
    }

    this.triajeForm.eva().value.set(numero.toString());
    this.update_model({ eva: numero.toString() });
  }

  normalizar_eva_al_salir(): void {
    const valor = this.triaje_model().eva;
    if (!valor || valor.trim() === '') {
      this.triajeForm.eva().value.set('0');
      this.update_model({ eva: '0' });
    }
  }

  imc_classification(): string {
    const actual = this.triaje_model();
    if (!actual.imc) {
      return '';
    }
    return this.utilService.imc_descripcion(actual.imc);
  }

  update_priority(value: string): void {
    if (value === CODIGOS_PRIORIDAD.I && this.prioridad1Bloqueada() && !this.esPacienteNn()) {
      return;
    }

    this.auto_asignado_por_critico.set(false);
    this.triajeForm.prioridad().markAsTouched();

    const actual = this.triaje_model();
    const traumaShockId = this.traumaShockId();
    const conEmerId = this.consultorioEmergenciaId();
    const updates: Partial<RegistroTriajeFormValue> = {
      prioridad: this.esPacienteNn() ? CODIGOS_PRIORIDAD.I : value,
    };

    if (value === CODIGOS_PRIORIDAD.I) {
      if (traumaShockId !== null && actual.destinoAreaId !== traumaShockId) {
        updates.destinoAreaId = traumaShockId;
        updates.destinoEspecialidadId = null;
      }
    } else if (traumaShockId !== null && actual.destinoAreaId === traumaShockId) {
      updates.destinoAreaId = conEmerId;
      updates.destinoEspecialidadId = null;
    }

    this.update_model(updates);
  }

  vital_status(control: VitalSignControl): PaletteColor {
    const values = this.triaje_model();
    const evalSignos = this.evaluacionClinica().signos;

    switch (control) {
      case 'temperatura':
        return (
          this.estado_desde_maestro(CODIGOS_PARAMETRO_CLINICO.TEMP, values.temperatura) ??
          this.evaluadorClinico.nivel_a_color(evalSignos.temperatura)
        );
      case 'saturacion':
        return (
          this.estado_desde_maestro(CODIGOS_PARAMETRO_CLINICO.SATO2, values.saturacion) ??
          this.evaluadorClinico.nivel_a_color(evalSignos.saturacion)
        );
      case 'fc':
        return (
          this.estado_desde_maestro(CODIGOS_PARAMETRO_CLINICO.FC, values.fc) ??
          this.evaluadorClinico.nivel_a_color(evalSignos.fc)
        );
      case 'fr':
        return (
          this.estado_desde_maestro(CODIGOS_PARAMETRO_CLINICO.FR, values.fr) ??
          this.evaluadorClinico.nivel_a_color(evalSignos.fr)
        );
      case 'imc':
        return this.triaje_model().imc
          ? this.utilService.imc_status(this.triaje_model().imc)
          : 'secondary';
      default:
        return 'secondary';
    }
  }

  pressure_status(part: 'sistolica' | 'diastolica'): PaletteColor {
    const values = this.triaje_model();
    const evalSignos = this.evaluacionClinica().signos;
    const value =
      part === 'sistolica' ? values.paSistolica : values.paDiastolica;

    if (part === 'sistolica') {
      return (
        this.estado_desde_maestro(CODIGOS_PARAMETRO_CLINICO.PA, value) ??
        this.evaluadorClinico.nivel_a_color(evalSignos.paSistolica)
      );
    }

    return this.evaluadorClinico.nivel_a_color(evalSignos.paDiastolica);
  }

  eva_status(): PaletteColor {
    return this.evaluadorClinico.nivel_a_color(this.evaluacionClinica().signos.eva);
  }

  progress_bar_classes(color: PaletteColor): string {
    return this.utilService.progress_bar_classes(color);
  }

  avanzar_a_signos_vitales(): void {
    this.triajeForm.condicionLlegada().markAsTouched();
    this.triajeForm.motivoIngreso().markAsTouched();

    const pasoInvalido =
      !this.triajeForm.condicionLlegada().valid() || !this.triajeForm.motivoIngreso().valid();

    if (pasoInvalido) {
      this.validacion_solicitada.set(true);
      this.utilService.mostrar_alerta('Complete los campos obligatorios.', 'warning');
      return;
    }

    this.pasoActual.set(2);
  }

  error_de_campo(campo: 'condicionLlegada' | 'motivoIngreso'): string {
    const api_campo =
      campo === 'condicionLlegada'
        ? 'triaje.condicion_llegada_id'
        : campo === 'motivoIngreso'
          ? 'triaje.motivo_ingreso_id'
          : '';
    const api_error = this.api_error(api_campo);
    if (api_error) {
      return api_error;
    }

    const control = this.triajeForm[campo]();
    if (!control.touched()) {
      return '';
    }

    return control.errors().some((error) => error.kind === 'required')
      ? 'Este campo es obligatorio.'
      : '';
  }

  volver_a_valorizacion(): void {
    this.pasoActual.set(1);
  }

  cerrar(): void {
    this.cerrado.emit();
  }

  async guardar_triaje(): Promise<void> {
    if (
      this.guardando() ||
      this.registroGuardado() ||
      this.cargando_detalle() ||
      this.triaje_bloqueado() ||
      !this.detalle_atencion()
    ) {
      return;
    }

    this.api_errors.set({});
    this.validacion_solicitada.set(true);

    if (!this.formulario_completo_y_valido()) {
      this.triajeForm().markAsTouched();
      this.utilService.mostrar_alerta('Complete los campos obligatorios.', 'warning');
      return;
    }

    const { request, error } = TriajePayloadMapper.aRequest(this.triaje_model(), {
      atencionId: this.atencion_id_resuelta,
      esPacienteNn: this.esPacienteNn(),
      esConsultorioEmergencia: this.esAreaConsultorioEmergencia(),
      destinoTraumaShockId: this.traumaShockId(),
      codigosParametrosDisponibles: this.codigosParametrosDisponibles(),
    });

    if (error || !request) {
      this.utilService.mostrar_alerta(error ?? 'Error en los datos del triaje.', 'warning');
      return;
    }

    if (request.control_vital.detalles.length === 0) {
      this.utilService.mostrar_alerta('Registre al menos un signo vital.', 'warning');
      return;
    }

    const confirmacion = await Swal.fire({
      title: TITLE_MODAL,
      text: MESSAGE_CONFIRMATION_DEFAULT,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'No',
    });
    if (!confirmacion.isConfirmed) {
      return;
    }

    this.guardando.set(true);
    this.triajeService
      .registrar(request, true)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: ({ data, message }) => {
          this.registroGuardado.set(true);
          this.utilService.mostrar_alerta(
            message ?? `Triaje ${data.triaje_id} registrado correctamente.`,
          );
          this.triaje_registrado.emit(data.ticket);
        },
        error: (error: {
          statusCode?: number;
          message?: string;
          errors?: Record<string, string[]>;
        }) => {
          if (error.statusCode === 422 && error.errors) {
            this.api_errors.set(error.errors);
            return;
          }

          this.utilService.mostrar_error(error.message ?? 'No se pudo registrar el triaje.');
        },
      });
  }

  private normalize_option(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toUpperCase();
  }

  calcular_imc(pesoRaw: string | number, tallaRaw: string | number): string {
    return this.evaluadorClinico.calcular_imc(pesoRaw, tallaRaw).imc;
  }

  private aplicar_reglas_paciente_nn(): void {
    if (!this.esPacienteNn()) {
      return;
    }

    const traumaShockId = this.traumaShockId();
    this.update_model({
      prioridad: CODIGOS_PRIORIDAD.I,
      destinoEspecialidadId: null,
      ...(traumaShockId !== null ? { destinoAreaId: traumaShockId } : {}),
    });
  }

  private es_area_trauma_shock(area: SelectOption): boolean {
    const areaConCodigo = area as SelectOption & { codigo?: string };
    const descripcion = this.normalize_option(`${areaConCodigo.codigo ?? ''} ${area.label}`);

    return descripcion.includes('TRAUMA') && descripcion.includes('SHOCK');
  }

  /** Preselects "Caminando" (sighoweb.m_condi_llegada.cod_condi_llegada = 'PIE') when no condition is chosen yet. */
  aplicar_condicion_llegada_por_defecto(condiciones: SelectOption[]): void {
    if (this.triaje_model().condicionLlegada !== null) return;

    const caminando = condiciones.find(
      (condicion) =>
        String((condicion as SelectOption & { codigo?: string }).codigo ?? '')
          .trim()
          .toUpperCase() === CONDICION_LLEGADA_POR_DEFECTO ||
        String(condicion.label ?? '')
          .trim()
          .toLowerCase() === 'caminando',
    );
    if (caminando) {
      this.update_model({ condicionLlegada: Number(caminando.value) });
    }
  }

  /** Preselects "Evaluación Médica" (sighoweb.m_motivo_ingreso.cod_mot_ing = 'EVME') when no reason is chosen yet. */
  aplicar_motivo_ingreso_por_defecto(motivos: SelectOption[]): void {
    if (this.triaje_model().motivoIngreso !== null) return;

    const evaluacion_medica = motivos.find(
      (motivo) =>
        String((motivo as SelectOption & { codigo?: string }).codigo ?? '').trim().toUpperCase() ===
        MOTIVO_INGRESO_POR_DEFECTO,
    );
    if (evaluacion_medica) {
      this.update_model({ motivoIngreso: Number(evaluacion_medica.value) });
    }
  }

  private update_model(patch: Partial<RegistroTriajeFormValue>): void {
    this.triaje_model.update((value) => ({ ...value, ...patch }));
  }

  actualizar_signo_vital(
    campo:
      | 'temperatura'
      | 'paSistolica'
      | 'paDiastolica'
      | 'saturacion'
      | 'fc'
      | 'fr'
      | 'peso'
      | 'talla',
    value: string | number | null | undefined,
  ): void {
    const patch: Partial<RegistroTriajeFormValue> = { [campo]: value == null ? '' : String(value) };
    if (campo === 'peso' || campo === 'talla') {
      patch.imc = '';
    }
    this.update_model(patch);
  }

  recalcular_imc_al_salir(): void {
    const actual = this.triaje_model();
    const imc = this.calcular_imc(actual.peso, actual.talla);
    if (actual.imc !== imc) {
      this.update_model({ imc });
    }
  }

  error_signo_vital(
    control:
      | 'temperatura'
      | 'paSistolica'
      | 'paDiastolica'
      | 'saturacion'
      | 'fc'
      | 'fr'
      | 'peso'
      | 'talla',
  ): string {
    const model = this.triaje_model();
    const valorRaw = model[control];
    if (valorRaw === null || valorRaw === undefined || String(valorRaw).trim() === '') return '';

    const num = Number(String(valorRaw).replace(',', '.'));
    if (isNaN(num)) return 'Debe ser un número válido.';

    const paramMap: Record<string, { min: number; max: number; unit: string; name: string }> = {
      temperatura: { min: 36.0, max: 40.0, unit: '°C', name: 'Temperatura' },
      paSistolica: { min: 50, max: 240, unit: 'mmHg', name: 'PAS' },
      paDiastolica: { min: 0, max: 100, unit: 'mmHg', name: 'PAD' },
      saturacion: { min: 60, max: 100, unit: '%', name: 'Sat. O₂' },
      fc: { min: 30, max: 220, unit: 'lpm', name: 'FC' },
      fr: { min: 10, max: 40, unit: 'rpm', name: 'FR' },
      peso: { min: 0.5, max: 300.0, unit: 'kg', name: 'Peso' },
      talla: { min: 25.0, max: 250.0, unit: 'cm', name: 'Talla' },
    };

    const cfg = paramMap[control];
    if (!cfg) return '';

    let min = cfg.min;
    let max = cfg.max;
    if (control === 'temperatura') {
      const p = this.parametrosClinicos().find((x) => x.codigo === 'TEMP');
      if (p?.valor_minimo_admisible != null) min = p.valor_minimo_admisible;
      if (p?.valor_maximo_admisible != null) max = p.valor_maximo_admisible;
    } else if (control === 'paSistolica' || control === 'paDiastolica') {
      const p = this.parametrosClinicos().find((x) => x.codigo === 'PA');
      const compCode = control === 'paSistolica' ? 'PAS' : 'PAD';
      const c = p?.componentes?.find((x) => x.codigo === compCode);
      const cMin = c?.puntaje_minimo != null ? Number(c.puntaje_minimo) : null;
      const cMax = c?.puntaje_maximo != null ? Number(c.puntaje_maximo) : null;
      if (cMin !== null && (cMin > 0 || (cMax !== null && cMax > 0))) {
        min = cMin;
      }
      if (cMax !== null && ((cMin !== null && cMin > 0) || cMax > 0)) {
        max = cMax;
      }
    } else if (control === 'saturacion') {
      const p = this.parametrosClinicos().find((x) => x.codigo === 'SATO2');
      if (p?.valor_minimo_admisible != null) min = p.valor_minimo_admisible;
      if (p?.valor_maximo_admisible != null) max = p.valor_maximo_admisible;
    } else if (control === 'fc') {
      const p = this.parametrosClinicos().find((x) => x.codigo === 'FC');
      if (p?.valor_minimo_admisible != null) min = p.valor_minimo_admisible;
      if (p?.valor_maximo_admisible != null) max = p.valor_maximo_admisible;
    } else if (control === 'fr') {
      const p = this.parametrosClinicos().find((x) => x.codigo === 'FR');
      if (p?.valor_minimo_admisible != null) min = p.valor_minimo_admisible;
      if (p?.valor_maximo_admisible != null) max = p.valor_maximo_admisible;
    } else if (control === 'peso') {
      const p = this.parametrosClinicos().find((x) => x.codigo === 'PESO');
      if (p?.valor_minimo_admisible != null) min = p.valor_minimo_admisible;
      if (p?.valor_maximo_admisible != null) max = p.valor_maximo_admisible;
    } else if (control === 'talla') {
      const p = this.parametrosClinicos().find((x) => x.codigo === 'TALLA');
      if (p?.valor_minimo_admisible != null) min = p.valor_minimo_admisible;
      if (p?.valor_maximo_admisible != null) max = p.valor_maximo_admisible;
    }

    if (num < min || num > max) {
      const minText = control === 'temperatura' || control === 'peso' || control === 'talla' ? min.toFixed(1) : String(min);
      const maxText = control === 'temperatura' || control === 'peso' || control === 'talla' ? max.toFixed(1) : String(max);
      return `${cfg.name} debe estar entre ${minText} y ${maxText} ${cfg.unit}.`;
    }

    if (control === 'paDiastolica' || control === 'paSistolica') {
      const pas = Number(model.paSistolica);
      const pad = Number(model.paDiastolica);
      if (model.paSistolica && model.paDiastolica && pas <= pad) {
        return 'PAS debe ser mayor que PAD.';
      }
    }

    return '';
  }

  readonly signos_vitales_invalidos = computed(() => {
    const camposVitales = [
      'temperatura',
      'paSistolica',
      'paDiastolica',
      'saturacion',
      'fc',
      'fr',
      'peso',
      'talla',
    ] as const;

    return camposVitales.some((campo) => !!this.error_signo_vital(campo));
  });

  readonly formulario_completo_y_valido = computed(() => {
    return this.triajeForm().valid() && !this.signos_vitales_invalidos();
  });

  validar_extremo_al_salir(
    campo:
      | 'temperatura'
      | 'paSistolica'
      | 'paDiastolica'
      | 'saturacion'
      | 'fc'
      | 'fr'
      | 'peso'
      | 'talla',
  ): void {
    if (Swal.isVisible()) {
      return;
    }
    const error = this.error_signo_vital(campo);
    if (error) {
      this.utilService.mostrar_alerta(error, 'warning');
      this.update_model({ [campo]: '' });
      try {
        if (this.triajeForm[campo]) {
          this.triajeForm[campo]().value.set('');
        }
      } catch {
        // Safe fallback
      }
      if (campo === 'peso' || campo === 'talla') {
        this.recalcular_imc_al_salir();
      }
    } else {
      if (campo === 'peso' || campo === 'talla') {
        this.recalcular_imc_al_salir();
      }
    }
  }

  actualizar_seleccion_requerida(
    campo: 'condicionLlegada' | 'motivoIngreso' | 'destinoAreaId' | 'destinoEspecialidadId' | 'programacionPersonalId',
    value: SelectValue,
  ): void {
    if (campo === 'destinoAreaId') {
      this.auto_asignado_por_critico.set(false);
    }
    this.triajeForm[campo]().markAsTouched();
    this.update_model({ [campo]: value === '' || value === null ? null : Number(value) });
  }

  actualizar_motivo_consulta(event: Event): void {
    this.triajeForm.motivoConsulta().markAsTouched();
    this.update_model({ motivoConsulta: (event.target as HTMLInputElement).value });
  }

  error_api(campo: string): string {
    return this.api_error(campo);
  }

  error_atencion(
    campo:
      | 'prioridad'
      | 'motivoConsulta'
      | 'destinoAreaId'
      | 'destinoEspecialidadId'
      | 'programacionPersonalId',
    api_campo: string,
  ): string {
    const api_error = this.api_error(api_campo);
    if (api_error) {
      return api_error;
    }

    const control = this.triajeForm[campo]();
    if (!control.touched()) {
      return '';
    }

    if (control.errors().some((error) => error.kind === 'required')) {
      return 'Este campo es obligatorio.';
    }
    if (control.errors().some((error) => error.kind === 'maxLength')) {
      return 'El campo excede la longitud permitida.';
    }

    return '';
  }

  error_observacion(): string {
    const api_error = this.api_error('triaje.observacion');
    if (api_error) {
      return api_error;
    }

    const control = this.triajeForm.observaciones();
    if (!control.touched()) {
      return '';
    }

    return control.errors().some((error) => error.kind === 'maxLength')
      ? 'La observación no debe superar los 200 caracteres.'
      : '';
  }

  error_signos_vitales(): string {
    const entry = Object.entries(this.api_errors()).find(([campo]) =>
      campo.startsWith('control_vital'),
    );

    return entry?.[1]?.[0] ?? '';
  }

  private api_error(campo: string): string {
    return campo ? (this.api_errors()[campo]?.[0] ?? '') : '';
  }

  private estado_desde_maestro(codigo: string, rawValue: string): PaletteColor | null {
    const edad = this.detalle_atencion()?.paciente?.edad ?? 30;

    return this.utilService.estado_desde_maestro(codigo, rawValue, edad, this.parametrosClinicos());
  }
}
