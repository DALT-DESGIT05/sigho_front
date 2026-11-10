import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { FormField, disabled, email, form, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import Swal from 'sweetalert2/dist/sweetalert2.esm.all.js';
import { Observable, concatMap, finalize, map, of, tap } from 'rxjs';
import {
  AutoCompleteComponent,
  type AutoCompleteDataSource,
} from '../../../../components/auto-complete/auto-complete.component';
import { ButtonComponent } from '../../../../components/button/button.component';
import { CardGeneralComponent } from '../../../../components/card-general/card-general.component';
import { CheckComponent } from '../../../../components/check/check.component';
import { InputGroupComponent } from '../../../../components/input-group/input-group.component';
import { InputTextComponent } from '../../../../components/input-text/input-text.component';
import { ModalComponent } from '../../../../components/modal/modal.component';
import { PatientIdentityComponent } from '../../../../components/patient-identity/patient-identity.component';
import { SelectComponent, type SelectOption } from '../../../../components/select/select.component';
import { SummaryCardGroupComponent } from '../../../../components/summary-card-group/summary-card-group.component';
import { SummaryCardComponent } from '../../../../components/summary-card/summary-card.component';
import { MESSAGE_CONFIRMATION_DEFAULT, TITLE_MODAL } from '../../../../config/constants';
import type { CatalogoEmergenciaCodigoOption } from '../../../../interfaces/emergencia/catalogo-emergencia.interface';
import type {
  PacienteBusqueda,
  SexoCodigo,
} from '../../../../interfaces/emergencia/paciente.interface';
import type { PaletteColor } from '../../../../interfaces/util.interface';
import type {
  CrearAtencionRequest,
  CrearAtencionResponse,
} from '../../../../interfaces/emergencia/triaje.interface';
import { CatalogoEmergenciaService } from '../../../../services/emergencia/catalogo-emergencia.service';
import { PacienteService } from '../../../../services/emergencia/paciente.service';
import { TriajeService } from '../../../../services/emergencia/triaje.service';
import { UtilService } from '../../../../services/util.service';
import { AcompananteModalComponent } from '../../components/acompanante-modal/acompanante-modal.component';

interface AdmisionFormValue {
  paciente_fap: boolean;
  paciente_extrafap: boolean;
  paciente_nn: boolean;
  ind_discapacitado: boolean;
  numero_historia: string;
  apellidos_nombres: string;
  parentesco: string;
  sexo: string;
  edad: string;
  tipo_documento_id: number | null;
  numero_documento: string;
  nombres: string;
  apellido_paterno: string;
  apellido_materno: string;
  fecha_nacimiento: string;
  celular: string;
  correo_electronico: string;
  tipo_paciente_id: number | null;
  especialidad_id: number | null;
  procedencia_id: number | null;
  prioridad: string;
}

const ADMISION_INICIAL: AdmisionFormValue = {
  paciente_fap: true,
  paciente_extrafap: false,
  paciente_nn: false,
  ind_discapacitado: false,
  numero_historia: '',
  apellidos_nombres: '',
  parentesco: '',
  sexo: '',
  edad: '',
  tipo_documento_id: null,
  numero_documento: '',
  nombres: '',
  apellido_paterno: '',
  apellido_materno: '',
  fecha_nacimiento: '',
  celular: '',
  correo_electronico: '',
  tipo_paciente_id: null,
  especialidad_id: null,
  procedencia_id: null,
  prioridad: 'I',
};

@Component({
  selector: 'app-admision',
  imports: [
    FormField,
    AcompananteModalComponent,
    AutoCompleteComponent,
    ButtonComponent,
    CardGeneralComponent,
    CheckComponent,
    InputGroupComponent,
    InputTextComponent,
    ModalComponent,
    PatientIdentityComponent,
    SelectComponent,
    SummaryCardComponent,
    SummaryCardGroupComponent,
  ],
  templateUrl: './admision.components.html',
  styleUrl: './admision.components.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdmisionComponents {
  private readonly catalogo_emergencia_service = inject(CatalogoEmergenciaService);
  private readonly paciente_service = inject(PacienteService);
  private readonly triaje_service = inject(TriajeService);
  private readonly router = inject(Router);
  private readonly util_service = inject(UtilService);

  readonly admision_model = signal<AdmisionFormValue>({ ...ADMISION_INICIAL });
  readonly paciente_seleccionado_id = signal<number | null>(null);
  readonly paciente_seleccionado = signal<PacienteBusqueda | null>(null);
  readonly nombre_paciente_seleccionado = computed(() => {
    const paciente = this.paciente_seleccionado();
    if (!paciente) {
      return '';
    }

    return this.nombre_completo(paciente);
  });
  readonly admision_form = form(this.admision_model, (schema) => {
    required(schema.sexo, {
      when: () =>
        this.admision_model().paciente_nn ||
        (this.admision_model().paciente_extrafap && !this.paciente_seleccionado_id()),
    });
    required(schema.tipo_documento_id, {
      when: () => this.admision_model().paciente_extrafap && !this.paciente_seleccionado_id(),
    });
    required(schema.numero_documento, {
      when: () => this.admision_model().paciente_extrafap && !this.paciente_seleccionado_id(),
    });
    required(schema.nombres, {
      when: () => this.admision_model().paciente_extrafap && !this.paciente_seleccionado_id(),
    });
    required(schema.apellido_paterno, {
      when: () => this.admision_model().paciente_extrafap && !this.paciente_seleccionado_id(),
    });
    required(schema.apellido_materno, {
      when: () => this.admision_model().paciente_extrafap && !this.paciente_seleccionado_id(),
    });
    email(schema.correo_electronico, {
      when: () => this.admision_model().paciente_extrafap && !this.paciente_seleccionado_id(),
    });
    required(schema.tipo_paciente_id);
    required(schema.procedencia_id);
    disabled(schema.numero_historia, { when: () => true });
    disabled(schema.apellidos_nombres, { when: () => true });
    disabled(schema.parentesco, { when: () => true });
    disabled(schema.edad, { when: () => true });
    disabled(schema.sexo, { when: () => this.admision_model().paciente_fap });
  });
  readonly validacion_solicitada = signal(false);
  readonly guardando = signal(false);
  readonly registrando_acompanante = signal(false);
  readonly guardando_contacto = signal(false);
  readonly validacion_contacto_solicitada = signal(false);
  readonly contacto_campo = signal<'celular' | 'correo_electronico'>('celular');
  readonly contacto_model = signal({ valor: '' });
  readonly contacto_form = form(this.contacto_model, (schema) => {
    required(schema.valor);
    email(schema.valor, { when: () => this.contacto_campo() === 'correo_electronico' });
    disabled(schema.valor, { when: () => this.guardando_contacto() });
  });
  readonly contacto_titulo = computed(() =>
    this.contacto_campo() === 'celular' ? 'Actualizar teléfono' : 'Actualizar correo',
  );
  readonly api_errors = signal<Record<string, string[]>>({});
  readonly atencion_creada = signal<CrearAtencionResponse | null>(null);
  readonly busqueda_extrafap_realizada = signal(false);
  readonly resultados_extrafap = signal(0);
  readonly especialidad_options = signal<SelectOption[]>([]);
  readonly procedencia_options = signal<SelectOption[]>([]);
  readonly prioridades = signal<readonly { value: string; color: string; label: string }[]>([
    { value: 'I', label: 'Resucitación', color: 'red' },
    { value: 'II', label: 'Emergencia', color: 'orange' },
    { value: 'III', label: 'Urgencia', color: 'yellow' },
    { value: 'IV', label: 'Urgencia Menor', color: 'green' },
    { value: 'V', label: 'Sin Urgencia', color: 'blue' },
  ]);
  readonly prioridades_nn = computed(() =>
    this.prioridades().filter((prioridad) => prioridad.value === 'I'),
  );
  readonly prioridad_actual = computed(() => {
    const prioridad_val = this.admision_model().prioridad || 'I';
    return (
      this.prioridades().find((p) => p.value === prioridad_val) ?? {
        value: 'I',
        label: 'Resucitación',
        color: 'red',
      }
    );
  });
  readonly prioridad_options = signal<SelectOption[]>([]);
  readonly tipo_documento_options = signal<SelectOption[]>([]);
  readonly sexo_acompanante_options = signal<SelectOption[]>([]);
  readonly parentesco_options = signal<SelectOption[]>([]);
  readonly sexo_options: SelectOption[] = [
    { value: 'M', label: 'Masculino' },
    { value: 'F', label: 'Femenino' },
  ];
  private tipos_paciente: CatalogoEmergenciaCodigoOption[] = [];
  private readonly acompanante_modal =
    viewChild.required<AcompananteModalComponent>('acompanante_modal');
  private readonly contacto_modal = viewChild.required<ModalComponent>('contacto_modal');
  private readonly datos_titular_modal = viewChild<ModalComponent>('datos_titular_modal');
  private readonly contacto_api_error = signal('');
  private paciente_nn_creado: { sexo: SexoCodigo; paciente_id: number } | null = null;
  private paciente_extrafap_creado: { documento: string; paciente_id: number } | null = null;
  private afiliado_fap_seleccionado: {
    codigo_afiliado: string;
    paciente_id: number | null;
  } | null = null;

  readonly buscar_pacientes: AutoCompleteDataSource<PacienteBusqueda> = (termino) =>
    this.paciente_service.buscarPorTermino(termino, 'FAP').pipe(map(({ data }) => data));
  readonly buscar_pacientes_extrafap: AutoCompleteDataSource<PacienteBusqueda> = (termino) =>
    this.paciente_service.buscarPorTermino(termino, 'EXTRAFAP').pipe(
      map(({ data }) => {
        this.busqueda_extrafap_realizada.set(true);
        this.resultados_extrafap.set(data.length);

        return data;
      }),
    );

  readonly mostrar_paciente = (paciente: PacienteBusqueda): string => {
    const nombre = this.nombre_completo(paciente);
    const documento = [paciente.tipo_documento, paciente.numero_documento]
      .filter(Boolean)
      .join(' ');

    return documento
      ? `${nombre} - ${documento}`
      : nombre;
  };

  constructor() {
    this.catalogo_emergencia_service
      .obtenerCatalogos([
        'tipos_paciente',
        'tipos_documento',
        'sexos',
        'parentescos',
        'procedencias',
      ])
      .subscribe({
        next: ({ data }) => {
        this.tipos_paciente = data.tipos_paciente;
        this.tipo_documento_options.set(data.tipos_documento);
        this.sexo_acompanante_options.set(
          data.sexos.map((item) => ({ value: item.codigo, label: item.label })),
        );
        this.parentesco_options.set(data.parentescos);

        const procedencias_permitidas = ['ASO', 'AMB', 'EXA'];
        const procedencias_filtradas = data.procedencias
          .filter((item) => {
            const codigo = String(
              (item as SelectOption & { codigo?: string }).codigo ?? '',
            ).toUpperCase();
            const label = this.normalizar(item.label);
            return (
              procedencias_permitidas.includes(codigo) ||
              label.includes('A SOLICITUD') ||
              label.includes('AMBULATORIO') ||
              label.includes('EXAMEN')
            );
          })
          .sort((a, b) => {
            const codA = String(
              (a as SelectOption & { codigo?: string }).codigo ?? '',
            ).toUpperCase();
            const codB = String(
              (b as SelectOption & { codigo?: string }).codigo ?? '',
            ).toUpperCase();
            const ordenA = codA === 'ASO' ? 0 : codA === 'AMB' ? 1 : 2;
            const ordenB = codB === 'ASO' ? 0 : codB === 'AMB' ? 1 : 2;
            return ordenA - ordenB;
          });

        const opciones_procedencia =
          procedencias_filtradas.length > 0 ? procedencias_filtradas : data.procedencias;
        this.procedencia_options.set(opciones_procedencia);

        const niveles =
          (data.niveles_triaje ?? []).length > 0
            ? data.niveles_triaje.map((nivel) => ({
                value: nivel.value,
                label: nivel.label,
                color: this.util_service.color_prioridad(nivel.color),
              }))
            : [
                { value: 'I', label: 'Resucitación', color: 'red' },
                { value: 'II', label: 'Emergencia', color: 'orange' },
                { value: 'III', label: 'Urgencia', color: 'yellow' },
                { value: 'IV', label: 'Urgencia Menor', color: 'green' },
                { value: 'V', label: 'Sin Urgencia', color: 'blue' },
              ];
        this.prioridades.set(niveles);

        const opciones_prioridad = niveles.map((nivel) => ({
          value: nivel.value,
          label: `${nivel.value} - ${nivel.label}`,
        }));
        this.prioridad_options.set(opciones_prioridad);

        this.actualizar_modelo({
          especialidad_id: null,
          procedencia_id: null,
          prioridad: 'I',
        });
        this.actualizar_tipo_paciente();
      },
      error: (error: { message?: string }) => {
        this.util_service.mostrar_error(
          error.message ?? 'No se pudieron cargar los catálogos de Emergencia.',
        );
      },
    });
  }

  seleccionar_tipo_paciente(tipo: 'fap' | 'extrafap' | 'nn', checked: boolean): void {
    if (!checked) {
      return;
    }

    this.actualizar_modelo({
      paciente_fap: tipo === 'fap',
      paciente_extrafap: tipo === 'extrafap',
      paciente_nn: tipo === 'nn',
      ind_discapacitado: false,
      prioridad: tipo === 'nn' ? 'I' : this.admision_model().prioridad,
      sexo: '',
      tipo_documento_id: null,
      numero_documento: '',
      nombres: '',
      apellido_paterno: '',
      apellido_materno: '',
      fecha_nacimiento: '',
      celular: '',
      correo_electronico: '',
    });
    this.validacion_solicitada.set(false);
    this.api_errors.set({});
    this.busqueda_extrafap_realizada.set(false);
    this.resultados_extrafap.set(0);
    this.limpiar_paciente();
    this.actualizar_tipo_paciente();
  }

  actualizar_prioridad(value: string): void {
    this.actualizar_modelo({ prioridad: this.admision_model().paciente_nn ? 'I' : value });
  }

  actualizar_discapacidad(checked: boolean): void {
    this.actualizar_modelo({ ind_discapacitado: checked });
  }

  seleccionar_paciente(paciente: PacienteBusqueda): void {
    this.api_errors.set({});
    this.paciente_seleccionado_id.set(paciente.paciente_id);
    this.paciente_seleccionado.set(paciente);
    this.afiliado_fap_seleccionado = paciente.codigo_afiliado
      ? { codigo_afiliado: paciente.codigo_afiliado, paciente_id: paciente.paciente_id }
      : null;
    this.actualizar_modelo({
      numero_historia: paciente.nsa ?? '',
      apellidos_nombres: this.nombre_completo(paciente),
      parentesco: paciente.parentesco ?? '',
      sexo: this.resolver_sexo(paciente.sexo),
      edad: paciente.edad === null ? '' : String(paciente.edad),
      ind_discapacitado: paciente.ind_discapacitado,
    });
    this.actualizar_tipo_paciente(paciente.parentesco ?? '');
  }

  limpiar_paciente(): void {
    this.paciente_seleccionado_id.set(null);
    this.paciente_seleccionado.set(null);
    this.afiliado_fap_seleccionado = null;
    this.actualizar_modelo({
      numero_historia: '',
      apellidos_nombres: '',
      parentesco: '',
      sexo: '',
      edad: '',
      ind_discapacitado: false,
    });
  }

  abrir_modal_contacto(campo: 'celular' | 'correo_electronico'): void {
    const paciente = this.paciente_seleccionado();
    if (!paciente) {
      return;
    }

    this.contacto_campo.set(campo);
    this.contacto_model.set({ valor: paciente[campo] ?? '' });
    this.contacto_api_error.set('');
    this.validacion_contacto_solicitada.set(false);
    this.contacto_modal().open();
  }

  guardar_contacto(): void {
    const paciente = this.paciente_seleccionado();
    if (!paciente || this.guardando_contacto()) {
      return;
    }

    this.validacion_contacto_solicitada.set(true);
    this.contacto_api_error.set('');
    if (!this.contacto_form().valid()) {
      this.contacto_form.valor().markAsTouched();
      return;
    }

    const campo = this.contacto_campo();
    const valor = this.contacto_model().valor.trim();
    const request = {
      persona_id: paciente.persona_id,
      celular: campo === 'celular' ? valor : paciente.celular,
      correo_electronico: campo === 'correo_electronico' ? valor : paciente.correo_electronico,
    };

    this.guardando_contacto.set(true);
    this.paciente_service.actualizarContacto(request).subscribe({
      next: ({ data, message }) => {
        this.guardando_contacto.set(false);
        this.paciente_seleccionado.update((seleccionado) =>
          seleccionado
            ? {
                ...seleccionado,
                celular: data.celular,
                correo_electronico: data.correo_electronico,
              }
            : null,
        );
        this.contacto_modal().close();
        this.util_service.mostrar_alerta(message ?? 'Datos de contacto actualizados.');
      },
      error: (error: { message?: string; errors?: Record<string, string[]> }) => {
        this.guardando_contacto.set(false);
        this.contacto_api_error.set(
          error.errors?.[campo]?.[0] ??
            error.message ??
            'No se pudieron actualizar los datos de contacto.',
        );
      },
    });
  }

  error_contacto(): string {
    if (this.contacto_api_error()) {
      return this.contacto_api_error();
    }
    if (!this.validacion_contacto_solicitada()) {
      return '';
    }

    const errors = this.contacto_form.valor().errors();
    if (errors.some((error) => error.kind === 'required')) {
      return `Ingrese ${this.contacto_campo() === 'celular' ? 'el celular' : 'el correo electrónico'}.`;
    }

    return errors.some((error) => error.kind === 'email')
      ? 'Ingrese un correo electrónico válido.'
      : '';
  }

  limpiar_modal_contacto(): void {
    this.guardando_contacto.set(false);
    this.validacion_contacto_solicitada.set(false);
    this.contacto_api_error.set('');
  }

  color_situacion(situacion: PacienteBusqueda['situacion']): PaletteColor {
    return situacion === 'ACTIVIDAD' ? 'success' : situacion === 'RETIRO' ? 'warning' : 'primary';
  }

  cambiar_busqueda_paciente(): void {
    if (this.paciente_seleccionado_id() || this.afiliado_fap_seleccionado) {
      this.limpiar_paciente();
    }

    if (this.admision_model().paciente_extrafap) {
      this.busqueda_extrafap_realizada.set(false);
      this.resultados_extrafap.set(0);
    }
  }

  acompanante_habilitado(): boolean {
    return Boolean(
      this.paciente_seleccionado_id() ||
      (this.admision_model().paciente_fap && this.afiliado_fap_seleccionado) ||
      (this.admision_model().paciente_extrafap && this.extrafap_datos_completos()),
    );
  }

  abrir_modal_acompanante(): void {
    if (this.registrando_acompanante()) {
      return;
    }

    const paciente_id = this.paciente_seleccionado_id();
    if (paciente_id) {
      this.acompanante_modal().open();
      return;
    }

    const fap_listo = this.admision_model().paciente_fap && this.afiliado_fap_seleccionado;
    const extrafap_listo =
      this.admision_model().paciente_extrafap && this.extrafap_datos_completos();
    if (!fap_listo && !extrafap_listo) {
      this.util_service.mostrar_alerta(
        'Seleccione un paciente antes de registrar al acompañante.',
        'warning',
      );
      return;
    }

    this.registrando_acompanante.set(true);
    this.resolver_paciente_id(null)
      .pipe(finalize(() => this.registrando_acompanante.set(false)))
      .subscribe({
        next: () => this.acompanante_modal().open(),
        error: (error: { message?: string }) => {
          this.util_service.mostrar_error(
            error.message ?? 'No se pudo registrar al paciente para agregar al acompañante.',
          );
        },
      });
  }

  es_derechohabiente(parentesco: string | null | undefined): boolean {
    if (!parentesco) {
      return false;
    }
    const valor = this.normalizar(parentesco);
    return valor !== 'TITULAR' && valor !== 'T' && valor !== 'A';
  }

  abrir_modal_datos_titular(): void {
    this.datos_titular_modal()?.open();
  }

  error_paciente(): string {
    if (this.api_error('paciente_id')) {
      return this.api_error('paciente_id');
    }

    if (
      !this.validacion_solicitada() ||
      this.paciente_seleccionado_id() ||
      this.afiliado_fap_seleccionado
    ) {
      return '';
    }

    if (this.admision_model().paciente_fap) {
      return 'Seleccione un paciente registrado.';
    }

    if (this.admision_model().paciente_extrafap && !this.busqueda_extrafap_realizada()) {
      return 'Busque un paciente EXTRAFAP antes de registrar uno nuevo.';
    }

    return this.admision_model().paciente_extrafap && this.resultados_extrafap() > 0
      ? 'Seleccione un paciente EXTRAFAP de los resultados.'
      : '';
  }

  error_campo(
    campo:
      | 'sexo'
      | 'tipo_documento_id'
      | 'numero_documento'
      | 'nombres'
      | 'apellido_paterno'
      | 'apellido_materno'
      | 'fecha_nacimiento'
      | 'celular'
      | 'correo_electronico'
      | 'tipo_paciente_id'
      | 'especialidad_id'
      | 'procedencia_id',
    api_campo: string,
  ): string {
    const api_error = this.api_error(api_campo);
    if (api_error) {
      return api_error;
    }

    const control = this.admision_form[campo]();
    if (!this.validacion_solicitada() || !control.touched()) {
      return '';
    }

    if (control.errors().some((error) => error.kind === 'required')) {
      return 'Este campo es obligatorio.';
    }

    return control.errors().some((error) => error.kind === 'email')
      ? 'Ingrese un correo electrónico válido.'
      : '';
  }

  async guardar_admision(): Promise<void> {
    if (this.guardando() || this.atencion_creada()) {
      return;
    }

    this.api_errors.set({});
    this.validacion_solicitada.set(true);
    const paciente_id = this.paciente_seleccionado_id();
    if (this.admision_model().paciente_fap && !paciente_id && !this.afiliado_fap_seleccionado) {
      return;
    }

    if (!this.admision_form().valid()) {
      this.admision_form().markAsTouched();
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
    this.resolver_paciente_id(paciente_id)
      .pipe(
        concatMap((id) => this.triaje_service.crearAtencion(this.crear_solicitud(id), true)),
        finalize(() => this.guardando.set(false)),
      )
      .subscribe({
        next: ({ data, message }) => {
          this.atencion_creada.set(data);
          this.util_service.mostrar_alerta(
            message ?? `Atención ${data.codigo_episodio} creada correctamente.`,
            'success',
          );
          void this.router.navigate(['/emergencia/pacientes-triaje']);
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

          this.util_service.mostrar_error(error.message ?? 'No se pudo crear la admisión.');
        },
      });
  }

  volver_a_cola(): void {
    void this.router.navigate(['/emergencia/pacientes-triaje']);
  }

  private extrafap_datos_completos(): boolean {
    const valor = this.admision_model();
    return Boolean(
      valor.tipo_documento_id &&
      valor.numero_documento.trim() &&
      valor.nombres.trim() &&
      valor.apellido_paterno.trim() &&
      valor.apellido_materno.trim() &&
      valor.sexo.trim(),
    );
  }

  private resolver_paciente_id(paciente_id: number | null): Observable<number> {
    if (this.admision_model().paciente_fap) {
      if (paciente_id) {
        return of(paciente_id);
      }

      const afiliado = this.afiliado_fap_seleccionado!;
      if (afiliado.paciente_id) {
        return of(afiliado.paciente_id);
      }

       return this.paciente_service.registrarFap({ codigo_afiliado: afiliado.codigo_afiliado }, true).pipe(
        map(({ data }) => data.paciente_id),
        tap((id) => {
          afiliado.paciente_id = id;
          this.paciente_seleccionado_id.set(id);
          this.paciente_seleccionado.update((paciente) =>
            paciente ? { ...paciente, paciente_id: id } : null,
          );
        }),
      );
    }

    if (this.admision_model().paciente_extrafap) {
      if (paciente_id) {
        return of(paciente_id);
      }

      const valor = this.admision_model();
      const documento = `${valor.tipo_documento_id}:${valor.numero_documento.trim()}`;
      if (this.paciente_extrafap_creado?.documento === documento) {
        return of(this.paciente_extrafap_creado.paciente_id);
      }

      return this.paciente_service
        .registrarExtrafap({
          tipo_documento_id: valor.tipo_documento_id!,
          numero_documento: valor.numero_documento,
          nombres: valor.nombres,
          apellido_paterno: valor.apellido_paterno,
          apellido_materno: valor.apellido_materno.trim() || null,
          sexo_codigo: valor.sexo as SexoCodigo,
          fecha_nacimiento: valor.fecha_nacimiento || null,
          celular: valor.celular.trim() || null,
          correo_electronico: valor.correo_electronico.trim() || null,
        })
        .pipe(
          map(({ data }) => data.paciente_id),
          tap((id) => (this.paciente_extrafap_creado = { documento, paciente_id: id })),
        );
    }

    const sexo = this.admision_model().sexo as SexoCodigo;
    if (this.paciente_nn_creado?.sexo === sexo) {
      return of(this.paciente_nn_creado.paciente_id);
    }

    return this.paciente_service.registrarNn({ sexo_codigo: sexo }).pipe(
      map(({ data }) => data.paciente_id),
      tap((id) => (this.paciente_nn_creado = { sexo, paciente_id: id })),
    );
  }

  private crear_solicitud(paciente_id: number): CrearAtencionRequest {
    const valor = this.admision_model();

    return {
      paciente_id,
      ind_discapacitado: valor.ind_discapacitado,
      atencion: {
        tipo_paciente_id: valor.tipo_paciente_id!,
        especialidad_id: valor.especialidad_id ?? undefined,
        procedencia_id: valor.procedencia_id!,
        numero_historia: valor.numero_historia.trim() || null,
      },
    };
  }

  private actualizar_tipo_paciente(parentesco = ''): void {
    const codigo = !this.admision_model().paciente_fap
      ? 'E'
      : !parentesco || this.normalizar(parentesco) === 'TITULAR'
        ? 'T'
        : 'F';
    const tipo_paciente = this.tipos_paciente.find(
      (item) => this.normalizar(item.codigo) === codigo,
    );
    this.actualizar_modelo({ tipo_paciente_id: tipo_paciente?.value ?? null });
  }

  private nombre_completo(paciente: PacienteBusqueda): string {
    const grado = paciente.grado_codigo?.toUpperCase()?.trim() || null;
    const situacion = paciente.situacion?.toUpperCase()?.trim();
    const sufijoSituacion = situacion === 'RETIRO' ? '(r)' : null;
    const partesGrado = [grado, sufijoSituacion].filter(Boolean).join(' ');

    const apellidos = [paciente.apellido_paterno, paciente.apellido_materno]
      .map((value) => value?.toUpperCase()?.trim())
      .filter(Boolean)
      .join(' ');

    const nombres = (paciente.nombres || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((palabra) => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
      .join(' ');

    const nombre = [apellidos, nombres].filter(Boolean).join(' ');

    return partesGrado ? `${partesGrado} ${nombre}` : nombre;
  }

  private resolver_sexo(sexo: string): string {
    const valor = this.normalizar(sexo);
    if (valor === 'M' || valor === 'MASCULINO') {
      return 'M';
    }
    if (valor === 'F' || valor === 'FEMENINO') {
      return 'F';
    }
    return '';
  }

  private normalizar(valor: string): string {
    return valor
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim()
      .toUpperCase();
  }

  private actualizar_modelo(patch: Partial<AdmisionFormValue>): void {
    this.admision_model.update((valor) => ({ ...valor, ...patch }));
  }

  private api_error(campo: string): string {
    return this.api_errors()[campo]?.[0] ?? '';
  }
}
