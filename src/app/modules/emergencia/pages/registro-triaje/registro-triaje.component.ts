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
  TriajeDetalleRequest,
} from '../../../../interfaces/emergencia/triaje.interface';
import { MESSAGE_CONFIRMATION_DEFAULT, TITLE_MODAL } from '../../../../config/constants';
import { PaletteColor } from '../../../../interfaces/util.interface';
import { CatalogoEmergenciaService } from '../../../../services/emergencia/catalogo-emergencia.service';
import { TriajeService } from '../../../../services/emergencia/triaje.service';
import { UtilService } from '../../../../services/util.service';

const EDAD_CORTE_EMERGENCIA_ADULTOS = 14;

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
  readonly esAreaConsultorioEmergencia = computed(() => {
    const areaId = this.triaje_model().destinoAreaId;
    const area = this.areas().find((item) => item.value === areaId);
    return this.normalize_option(area?.codigo ?? '') === 'CON-EMER';
  });
  readonly areasEmergenciaOptionsVisibles = computed(() =>
    this.esPacienteNn()
      ? this.areasEmergenciaOptions().filter((area) => this.es_area_trauma_shock(area))
      : this.areasEmergenciaOptions(),
  );
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
      colClass: 'col-6 col-lg-2',
    },
    {
      control: 'fc',
      label: 'FC',
      title: 'Frecuencia cardíaca',
      unit: 'lpm',
      type: 'number',
      colClass: 'col-6 col-lg-2',
    },
    {
      control: 'fr',
      label: 'FR',
      title: 'Frecuencia respiratoria',
      unit: 'rpm',
      type: 'number',
      colClass: 'col-6 col-lg-2',
    },
    {
      control: 'peso',
      label: 'Peso',
      title: 'Peso',
      unit: 'kg',
      type: 'number',
      colClass: 'col-6 col-lg-2',
    },
    {
      control: 'talla',
      label: 'Talla',
      title: 'Talla',
      unit: 'cm',
      type: 'number',
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
        this.motivoIngresoOptions.set(data.motivos_ingreso);
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
      const alertas = this.alertasCriticasSignosVitales();
      if (this.esPacienteNn()) {
        return;
      }

      untracked(() => {
        const actual = this.triaje_model();
        const destinoTraumaShock = this.areasEmergenciaOptions().find((area) =>
          this.es_area_trauma_shock(area),
        );
        const traumaShockId = destinoTraumaShock ? Number(destinoTraumaShock.value) : null;

        if (alertas.length > 0) {
          const updates: Partial<RegistroTriajeFormValue> = {};
          if (actual.prioridad !== 'I') {
            updates.prioridad = 'I';
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
          if (actual.prioridad === 'I') {
            updates.prioridad = '';
          }
          if (traumaShockId !== null && actual.destinoAreaId === traumaShockId) {
            updates.destinoAreaId = null;
            updates.destinoEspecialidadId = null;
          }
          this.auto_asignado_por_critico.set(false);
          if (Object.keys(updates).length > 0) {
            this.update_model(updates);
          }
        }
      });
    });

    effect(() => {
      const actual = this.triaje_model();
      const imc = this.calcular_imc(actual.peso, actual.talla);
      const area = this.areas().find((item) => item.value === actual.destinoAreaId);
      const esConEmer = this.normalize_option(area?.codigo ?? '') === 'CON-EMER';
      const destinoEspecialidadId = esConEmer ? actual.destinoEspecialidadId : null;

      let destinoEspecialidadFinal = null;
      if (destinoEspecialidadId !== null) {
        const opciones = untracked(() => this.destinosConsultorioOptionsVisibles());
        const destinoEspecialidadValido = opciones.some(
          (opcion) => Number(opcion.value) === Number(destinoEspecialidadId),
        );
        destinoEspecialidadFinal = destinoEspecialidadValido ? destinoEspecialidadId : null;
      }

      if (actual.imc !== imc || actual.destinoEspecialidadId !== destinoEspecialidadFinal) {
        untracked(() => {
          this.update_model({ imc, destinoEspecialidadId: destinoEspecialidadFinal });
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
  }

  actualizar_eva_desde_input(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    let valor = input.value.trim();

    if (valor === '') {
      this.triajeForm.eva().value.set('0');
      return;
    }

    let numero = parseInt(valor, 10);
    if (isNaN(numero) || numero < 0) {
      numero = 0;
      input.value = '0';
    } else if (numero > 10) {
      numero = 10;
      input.value = '10';
    }

    this.triajeForm.eva().value.set(numero.toString());
  }

  normalizar_eva_al_salir(): void {
    const valor = this.triaje_model().eva;
    if (!valor || valor.trim() === '') {
      this.triajeForm.eva().value.set('0');
    }
  }

  imc_classification(): string {
    const imc = Number(this.triaje_model().imc);

    if (!imc) return 'Sin clasificación';
    if (imc < 18.5) return 'Bajo peso';
    if (imc < 25) return 'Normal';
    if (imc < 30) return 'Sobrepeso';
    if (imc < 35) return 'Obesidad grado I';
    if (imc < 40) return 'Obesidad grado II';
    return 'Obesidad grado III';
  }

  update_priority(value: string): void {
    this.auto_asignado_por_critico.set(false);
    this.update_model({ prioridad: this.esPacienteNn() ? 'I' : value });
  }

  vital_status(control: VitalSignControl): PaletteColor {
    const values = this.triaje_model();
    const edad = this.detalle_atencion()?.paciente?.edad ?? undefined;

    switch (control) {
      case 'temperatura':
        return (
          this.estado_desde_maestro('TEMP', values.temperatura) ??
          this.utilService.temperature_status(values.temperatura, edad)
        );
      case 'saturacion':
        return (
          this.estado_desde_maestro('SATO2', values.saturacion) ??
          this.utilService.saturation_status(values.saturacion)
        );
      case 'fc':
        return (
          this.estado_desde_maestro('FC', values.fc) ??
          this.utilService.heart_rate_status(values.fc, edad)
        );
      case 'fr':
        return (
          this.estado_desde_maestro('FR', values.fr) ??
          this.utilService.respiratory_rate_status(values.fr, edad)
        );
      case 'imc':
        return this.utilService.imc_status(values.imc);
      default:
        return 'secondary';
    }
  }

  pressure_status(part: 'sistolica' | 'diastolica'): PaletteColor {
    const value =
      part === 'sistolica' ? this.triaje_model().paSistolica : this.triaje_model().paDiastolica;
    const edad = this.detalle_atencion()?.paciente?.edad ?? undefined;

    if (part === 'sistolica') {
      return (
        this.estado_desde_maestro('PA', value) ??
        this.utilService.systolic_status(value, edad)
      );
    }

    return this.utilService.diastolic_status(value, edad);
  }

  eva_status(): PaletteColor {
    const eva = Number(this.triaje_model().eva);

    if (eva <= 3) return 'success';
    if (eva <= 6) return 'warning';
    return 'danger';
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
    if (!this.validacion_solicitada()) {
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

    if (!this.triajeForm().valid()) {
      this.triajeForm().markAsTouched();
      this.utilService.mostrar_alerta('Complete los campos obligatorios.', 'warning');
      return;
    }

    const detalles = this.crear_detalles();
    if (detalles === null) return;
    if (detalles.length === 0) {
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
      .registrar(this.crear_solicitud_triaje(this.atencion_id_resuelta, detalles), true)
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

  private crear_solicitud_triaje(
    atencionId: number,
    detalles: TriajeDetalleRequest[],
  ): RegistrarTriajeRequest {
    const value = this.triaje_model();
    const destinoTraumaShock = this.areasEmergenciaOptions().find((area) =>
      this.es_area_trauma_shock(area),
    );
    const esPacienteNn = this.esPacienteNn();
    const esConEmer = this.esAreaConsultorioEmergencia();

    return {
      atencion_id: atencionId,
      triaje: {
        condicion_llegada_id: value.condicionLlegada!,
        motivo_ingreso_id: value.motivoIngreso!,
        nivel_triaje_codigo: esPacienteNn ? 'I' : value.prioridad,
        motivo_consulta: value.motivoConsulta.trim(),
        destino_area_id:
          esPacienteNn && destinoTraumaShock
            ? Number(destinoTraumaShock.value)
            : value.destinoAreaId!,
        destino_especialidad_id: !esPacienteNn && esConEmer ? value.destinoEspecialidadId : null,
        programacion_personal_id: value.programacionPersonalId ? Number(value.programacionPersonalId) : null,
        observacion: value.observaciones.trim() || null,
      },
      control_vital: {
        observaciones: null,
        detalles,
      },
    };
  }

  private crear_detalles(): TriajeDetalleRequest[] | null {
    const value = this.triaje_model();
    const detalles: TriajeDetalleRequest[] = [];
    let parametro_no_disponible: string | null = null;
    const add = (codigo: string, raw: string, componente: string | null = null): void => {
      if (raw.trim() === '') return;
      if (!this.parametro_disponible(codigo)) {
        parametro_no_disponible ??= codigo;
        return;
      }
      detalles.push({
        parametro_codigo: codigo,
        componente_codigo: componente,
        valor: Number(raw),
      });
    };

    add('TEMP', value.temperatura);
    add('FC', value.fc);
    add('FR', value.fr);
    add('SATO2', value.saturacion);
    add('PESO', value.peso);
    add('TALLA', value.talla);
    add('EVA', value.eva);

    const sistolica = value.paSistolica;
    const diastolica = value.paDiastolica;
    if (sistolica || diastolica) {
      if (!sistolica || !diastolica) {
        this.utilService.mostrar_alerta('Ingrese las presiones sistólica y diastólica.', 'warning');
        return null;
      }
      add('PA', sistolica, 'PAS');
      add('PA', diastolica, 'PAD');
    }

    if (parametro_no_disponible) {
      this.utilService.mostrar_alerta(
        `El parámetro clínico ${parametro_no_disponible} no está disponible.`,
        'warning',
      );
      return null;
    }

    return detalles;
  }

  private parametro_disponible(codigo: string): boolean {
    return this.parametrosClinicos().some((parametro) => parametro.codigo === codigo);
  }

  calcular_imc(pesoRaw: string | number, tallaRaw: string | number): string {
    const pesoLimpio = String(pesoRaw ?? '')
      .replace(',', '.')
      .trim();
    const tallaLimpia = String(tallaRaw ?? '')
      .replace(',', '.')
      .trim();

    const peso = Number(pesoLimpio);
    const talla = Number(tallaLimpia);

    if (!peso || !talla || peso <= 0 || talla <= 0) {
      return '';
    }

    const tallaEnMetros = talla > 3 ? talla / 100 : talla;
    if (tallaEnMetros <= 0.3 || tallaEnMetros > 2.5) {
      return '';
    }

    const imc = peso / (tallaEnMetros * tallaEnMetros);
    return Number.isFinite(imc) ? imc.toFixed(2) : '';
  }

  readonly alertasCriticasSignosVitales = computed(() => {
    const values = this.triaje_model();
    const alertas: { parametro: string; valor: string | number; mensaje: string }[] = [];

    const agregarSiCritico = (
      estado: PaletteColor,
      parametro: string,
      raw: string,
      unidad: string,
      mensaje: string,
    ): void => {
      if (estado === 'danger' && raw.trim() !== '') {
        alertas.push({ parametro, valor: `${raw}${unidad}`, mensaje });
      }
    };

    agregarSiCritico(
      this.vital_status('saturacion'),
      'Sat. O₂',
      values.saturacion,
      '%',
      'Saturación en rango crítico (hipoxemia severa).',
    );
    agregarSiCritico(
      this.pressure_status('sistolica'),
      'PAS',
      values.paSistolica,
      ' mmHg',
      'Presión arterial sistólica en rango crítico.',
    );
    agregarSiCritico(
      this.pressure_status('diastolica'),
      'PAD',
      values.paDiastolica,
      ' mmHg',
      'Presión arterial diastólica en rango crítico.',
    );
    agregarSiCritico(
      this.vital_status('fc'),
      'FC',
      values.fc,
      ' lpm',
      'Frecuencia cardíaca en rango crítico.',
    );
    agregarSiCritico(
      this.vital_status('fr'),
      'FR',
      values.fr,
      ' rpm',
      'Frecuencia respiratoria en rango crítico.',
    );
    agregarSiCritico(
      this.vital_status('temperatura'),
      'Temp.',
      values.temperatura,
      ' °C',
      'Temperatura en rango crítico.',
    );

    return alertas;
  });

  private aplicar_reglas_paciente_nn(): void {
    if (!this.esPacienteNn()) {
      return;
    }

    const destinoTraumaShock = this.areasEmergenciaOptions().find((area) =>
      this.es_area_trauma_shock(area),
    );
    this.update_model({
      prioridad: 'I',
      destinoEspecialidadId: null,
      ...(destinoTraumaShock ? { destinoAreaId: Number(destinoTraumaShock.value) } : {}),
    });
  }

  private es_area_trauma_shock(area: SelectOption): boolean {
    const areaConCodigo = area as SelectOption & { codigo?: string };
    const descripcion = this.normalize_option(`${areaConCodigo.codigo ?? ''} ${area.label}`);

    return descripcion.includes('TRAUMA') && descripcion.includes('SHOCK');
  }

  private update_model(patch: Partial<RegistroTriajeFormValue>): void {
    this.triaje_model.update((value) => ({ ...value, ...patch }));
  }

  actualizar_signo_vital(campo: 'peso' | 'talla', value: string | number | null | undefined): void {
    this.update_model({ [campo]: value == null ? '' : String(value) });
  }

  actualizar_seleccion_requerida(
    campo: 'condicionLlegada' | 'motivoIngreso' | 'destinoAreaId' | 'destinoEspecialidadId' | 'programacionPersonalId',
    value: SelectValue,
  ): void {
    if (campo === 'destinoAreaId') {
      this.auto_asignado_por_critico.set(false);
    }
    this.update_model({ [campo]: value === '' || value === null ? null : Number(value) });
  }

  actualizar_motivo_consulta(event: Event): void {
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
    if (!this.validacion_solicitada()) {
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
    if (!this.validacion_solicitada()) {
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
