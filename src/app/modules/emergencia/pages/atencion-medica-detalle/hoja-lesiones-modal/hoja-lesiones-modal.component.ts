import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import {
  AutoCompleteComponent,
  AutoCompleteDataSource,
} from '../../../../../components/auto-complete/auto-complete.component';
import { ButtonComponent } from '../../../../../components/button/button.component';
import { CardGeneralComponent } from '../../../../../components/card-general/card-general.component';
import { CheckComponent } from '../../../../../components/check/check.component';
import { InputGroupComponent } from '../../../../../components/input-group/input-group.component';
import { InputTextComponent } from '../../../../../components/input-text/input-text.component';
import { LabelComponent } from '../../../../../components/label/label.component';
import { LoadingApiComponent } from '../../../../../components/loading-api/loading-api.component';
import { ModalComponent } from '../../../../../components/modal/modal.component';
import { RadioComponent } from '../../../../../components/radio/radio.component';
import {
  SelectComponent,
  SelectOption,
  SelectValue,
} from '../../../../../components/select/select.component';
import {
  AgresorDetalleItem,
  AgresorPersonaDatos,
  AtencionLesionPayload,
  CatalogosLesionesResponse,
  LesionDetalleItem,
} from '../../../../../interfaces/emergencia/lesion.interface';
import {
  CatalogoEmergenciaCodigoOption,
  TipoDocumentoEmergenciaOption,
} from '../../../../../interfaces/emergencia/catalogo-emergencia.interface';
import {
  AcompananteBusquedaService,
  AcompananteOpcion,
} from '../../../../../services/admision/acompanante-busqueda.service';
import { CatalogoEmergenciaService } from '../../../../../services/emergencia/catalogo-emergencia.service';
import { LesionService } from '../../../../../services/emergencia/lesion.service';
import { UtilService } from '../../../../../services/util.service';

@Component({
  selector: 'app-hoja-lesiones-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalComponent,
    AutoCompleteComponent,
    ButtonComponent,
    CardGeneralComponent,
    CheckComponent,
    InputGroupComponent,
    RadioComponent,
    InputTextComponent,
    SelectComponent,
    LabelComponent,
    LoadingApiComponent,
  ],
  templateUrl: './hoja-lesiones-modal.component.html',
  styleUrl: './hoja-lesiones-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HojaLesionesModalComponent {
  private readonly lesionService = inject(LesionService);
  private readonly catalogoEmergenciaService = inject(CatalogoEmergenciaService);
  private readonly personaBusquedaService = inject(AcompananteBusquedaService);
  private readonly utilService = inject(UtilService);

  readonly atencionId = input.required<number>();
  readonly habilitado = input(true);
  readonly guardado = output<void>();

  private readonly modal = viewChild<ModalComponent>('modal');

  // Estados
  readonly cargando_catalogos = signal(false);
  readonly cargando_catalogos_persona = signal(false);
  readonly cargando_datos = signal(false);
  readonly guardando = signal(false);

  // Catálogos
  readonly catalogos = signal<CatalogosLesionesResponse>({
    agentes_lesion: [],
    moviles_agresion: [],
    regiones_corporales: [],
    tipos_sitio: [],
    sitios_ocurrencia: [],
    tipos_evento: [],
    tipos_lesion: [],
    parentescos: [],
  });

  // Catálogos generales de persona, los mismos que usa el registro de acompañante
  readonly sexos = signal<CatalogoEmergenciaCodigoOption[]>([]);
  readonly tipos_documento = signal<TipoDocumentoEmergenciaOption[]>([]);

  // Sección 1: Evento
  readonly ind_alcohol_6h = signal<boolean>(false);
  readonly tipo_evento_id = signal<number | null>(2); // Agresión por defecto
  readonly tipo_sitio_id = signal<number | null>(null);
  readonly sitio_ocurrencia_id = signal<number | null>(null);
  readonly fecha_ocurrencia = signal<string>('');
  readonly hora_ocurrencia = signal<string>('');

  // Sección 2: Datos del agresor
  readonly agresor_movil_id = signal<number | null>(null);
  readonly agresor_parentesco_id = signal<number | null>(null);
  /** Persona ya registrada; si es null se registra una nueva con los datos del formulario. */
  readonly agresor_persona_id = signal<number | null>(null);
  readonly agresor_fap = signal<boolean>(true);
  /** NN: agresor desconocido, sin nombres ni documento. */
  readonly agresor_nn = signal<boolean>(false);
  readonly agresor_tipo = computed<'FAP' | 'EXTRAFAP' | 'NN'>(() =>
    this.agresor_nn() ? 'NN' : this.agresor_fap() ? 'FAP' : 'EXTRAFAP',
  );
  readonly lista_agresores = signal<AgresorDetalleItem[]>([]);
  readonly agresor_tipo_documento_id = signal<number | null>(null);
  readonly agresor_numero_documento = signal<string>('');
  readonly agresor_apellido_paterno = signal<string>('');
  readonly agresor_apellido_materno = signal<string>('');
  readonly agresor_nombres = signal<string>('');
  readonly agresor_sexo_id = signal<number | null>(null);
  readonly agresor_fecha_nacimiento = signal<string>('');
  readonly agresor_celular = signal<string>('');
  readonly agresor_correo = signal<string>('');
  readonly agresor_registrado = computed(() => this.agresor_persona_id() !== null);

  // Sección 3: Tipo de lesión y área corporal
  readonly lista_lesiones = signal<LesionDetalleItem[]>([]);
  readonly nueva_region_id = signal<number | null>(null);
  readonly nuevo_tipo_lesion_id = signal<number | null>(null);
  readonly nuevo_agente_id = signal<number | null>(null);
  readonly nueva_descripcion = signal<string>('');

  // Sección 4: Notificación legal y Observaciones
  readonly ind_notif_minpub = signal<boolean>(false);
  readonly fecha_notificacion = signal<string>('');
  readonly observacion = signal<string>('');

  // Computed options
  readonly tiposSitioOptions = computed<SelectOption[]>(() =>
    this.catalogos().tipos_sitio.map((s) => ({ value: s.id, label: s.nombre })),
  );

  readonly sitiosOcurrenciaOptions = computed<SelectOption[]>(() => {
    const tipId = this.tipo_sitio_id();
    const lista =
      tipId !== null && tipId !== undefined
        ? this.catalogos().sitios_ocurrencia.filter(
            (s) => Number(s.tipo_sitio_id) === Number(tipId),
          )
        : this.catalogos().sitios_ocurrencia;
    return lista.map((s) => ({ value: s.id, label: s.nombre }));
  });

  readonly movilesAgresionOptions = computed<SelectOption[]>(() =>
    this.catalogos().moviles_agresion.map((m) => ({ value: m.id, label: m.nombre })),
  );

  readonly parentescosOptions = computed<SelectOption[]>(() =>
    this.catalogos().parentescos.map((p) => ({ value: p.id, label: p.nombre })),
  );

  readonly sexosOptions = computed<SelectOption[]>(() =>
    this.sexos().map((s) => ({ value: s.value, label: s.label })),
  );

  readonly tiposDocumentoOptions = computed<SelectOption[]>(() =>
    this.tipos_documento().map((t) => ({ value: t.value, label: t.label })),
  );

  readonly agentesLesionOptions = computed<SelectOption[]>(() =>
    this.catalogos().agentes_lesion.map((a) => ({ value: a.id, label: a.nombre })),
  );

  readonly regionesCorporalesOptions = computed<SelectOption[]>(() =>
    this.catalogos().regiones_corporales.map((r) => ({ value: r.id, label: r.nombre })),
  );

  readonly tiposLesionOptions = computed<SelectOption[]>(() =>
    this.catalogos().tipos_lesion.map((t) => ({ value: t.id, label: t.nombre })),
  );

  abrir(): void {
    if (!this.habilitado()) return;

    this.modal()?.open();
    const id = this.atencionId();

    requestAnimationFrame(() => {
      this.cargar_catalogos();
      if (id) this.cargar_datos(id);
    });
  }

  cerrar(): void {
    this.modal()?.close();
  }

  /** Búsqueda de personas ya registradas (misma fuente que el registro de acompañante). */
  readonly buscar_agresores: AutoCompleteDataSource<AcompananteOpcion> = (term) =>
    this.personaBusquedaService.buscar(term, this.agresor_fap() ? 1 : 0, null);

  seleccionar_agresor(opcion: AcompananteOpcion): void {
    const persona = opcion.persona;
    if (!persona) return;

    // Los afiliados que aún no son persona llegan sin id: se registran al guardar.
    this.agresor_persona_id.set(persona.persona_id > 0 ? persona.persona_id : null);
    this.cargar_persona_agresor({
      nombres: persona.nombres,
      apellido_paterno: persona.apellido_paterno,
      apellido_materno: persona.apellido_materno,
      sexo_id: this.sexos().find((s) => s.codigo === persona.sexo_codigo)?.value ?? 0,
      tipo_documento_id: persona.tipo_documento_id,
      numero_documento: persona.numero_documento,
      fecha_nacimiento: persona.fecha_nacimiento,
      celular: persona.celular,
      correo_electronico: persona.correo_electronico,
      fap: persona.tipo_persona_fap === 1,
      nn: false,
    });
  }

  cambiar_agresor_tipo(tipo: 'FAP' | 'EXTRAFAP' | 'NN', checked: boolean): void {
    if (!checked) return;
    this.limpiar_persona_agresor();
    this.agresor_nn.set(tipo === 'NN');
    this.agresor_fap.set(tipo === 'FAP');
  }

  nombre_agresor(agresor: AgresorDetalleItem): string {
    if (agresor.persona?.nn) return 'NN (desconocido)';
    return agresor.nombre_agresor || 'Agresor sin nombre';
  }

  /** Valida el borrador y lo pasa a la tabla. Devuelve false si falta algun dato. */
  agregar_agresor(): boolean {
    const falta = this.validar_agresor();
    if (falta) {
      this.utilService.mostrar_alerta(falta, 'warning');
      return false;
    }

    const persona_id = this.agresor_persona_id();
    if (persona_id !== null && this.lista_agresores().some((a) => a.persona_id === persona_id)) {
      this.utilService.mostrar_alerta('Esa persona ya figura en la lista de agresores.', 'warning');
      return false;
    }

    const nn = this.agresor_nn();
    const movil_id = this.agresor_movil_id();
    const parentesco_id = this.agresor_parentesco_id();
    const persona: AgresorPersonaDatos = {
      nombres: nn ? 'NN' : this.agresor_nombres().trim(),
      apellido_paterno: nn ? 'NN' : this.agresor_apellido_paterno().trim(),
      apellido_materno: nn ? null : this.agresor_apellido_materno().trim() || null,
      sexo_id: Number(this.agresor_sexo_id()),
      tipo_documento_id: nn ? 0 : Number(this.agresor_tipo_documento_id()),
      numero_documento: nn ? null : this.agresor_numero_documento().trim() || null,
      fecha_nacimiento: nn ? null : this.agresor_fecha_nacimiento() || null,
      celular: nn ? null : this.agresor_celular().trim() || null,
      correo_electronico: nn ? null : this.agresor_correo().trim() || null,
      fap: !nn && this.agresor_fap(),
      nn,
    };

    this.lista_agresores.update((lista) => [
      ...lista,
      {
        persona_id,
        nombre_agresor: [persona.apellido_paterno, persona.apellido_materno, persona.nombres]
          .filter(Boolean)
          .join(' ')
          .toUpperCase(),
        persona,
        movil_agresion_id: movil_id,
        movil_agresion_nombre:
          this.catalogos().moviles_agresion.find((m) => m.id === movil_id)?.nombre ?? null,
        parentesco_id,
        parentesco_nombre:
          this.catalogos().parentescos.find((p) => p.id === parentesco_id)?.nombre ?? null,
      },
    ]);

    this.agresor_movil_id.set(null);
    this.agresor_parentesco_id.set(null);
    this.limpiar_persona_agresor();
    return true;
  }

  eliminar_agresor(index: number): void {
    this.lista_agresores.update((lista) => lista.filter((_, i) => i !== index));
  }

  private cargar_catalogos_persona(): void {
    if (this.cargando_catalogos_persona()) return;

    this.cargando_catalogos_persona.set(true);
    this.catalogoEmergenciaService
      .obtenerCatalogos(['tipos_documento', 'sexos'])
      .pipe(finalize(() => this.cargando_catalogos_persona.set(false)))
      .subscribe({
        next: ({ data }) => {
          this.tipos_documento.set(data.tipos_documento ?? []);
          this.sexos.set(data.sexos ?? []);
        },
        error: () => {
          this.utilService.mostrar_error('No se pudieron cargar los catálogos de persona.');
        },
      });
  }

  cargar_catalogos(): void {
    if (this.sexos().length === 0) this.cargar_catalogos_persona();
    if (this.catalogos().agentes_lesion.length > 0 || this.cargando_catalogos()) return;
    this.cargando_catalogos.set(true);
    this.lesionService
      .obtener_catalogos()
      .pipe(finalize(() => this.cargando_catalogos.set(false)))
      .subscribe({
        next: (res) => {
          if (res.data) {
            this.catalogos.set(res.data);
          }
        },
        error: () => {
          this.utilService.mostrar_error('No se pudieron cargar los catálogos de lesiones.');
        },
      });
  }

  cargar_datos(atencionId: number): void {
    this.cargando_datos.set(true);
    this.lesionService
      .obtener_lesiones(atencionId)
      .pipe(finalize(() => this.cargando_datos.set(false)))
      .subscribe({
        next: (res) => {
          const reg = res.data;
          if (reg) {
            this.sitio_ocurrencia_id.set(reg.sitio_ocurrencia_id);
            this.tipo_sitio_id.set(reg.tipo_sitio_id);
            this.tipo_evento_id.set(reg.tipo_evento_id ?? 2);

            if (reg.fecha_ocurrencia) {
              const parts = reg.fecha_ocurrencia.split(/[T ]/);
              this.fecha_ocurrencia.set(parts[0] ?? '');
              this.hora_ocurrencia.set(parts[1] ? parts[1].substring(0, 5) : '');
            } else {
              this.fecha_ocurrencia.set('');
              this.hora_ocurrencia.set('');
            }

            this.ind_alcohol_6h.set(Boolean(reg.ind_alcohol_6h));
            this.ind_notif_minpub.set(Boolean(reg.ind_notif_minpub));

            if (reg.fecha_notificacion) {
              const notifParts = reg.fecha_notificacion.split(/[T ]/);
              this.fecha_notificacion.set(notifParts[0] ?? '');
            } else {
              this.fecha_notificacion.set('');
            }

            this.observacion.set(reg.observacion ?? '');
            this.lista_lesiones.set(reg.lesiones ?? []);

            this.lista_agresores.set(reg.agresores ?? []);
            this.agresor_parentesco_id.set(null);
            this.agresor_movil_id.set(null);
            this.limpiar_persona_agresor();
          }
        },
        error: () => {
          // Sin datos previos registrados
        },
      });
  }

  // Setters tipados
  set_fecha_ocurrencia(val: string | number | null | undefined): void {
    this.fecha_ocurrencia.set(val != null ? String(val) : '');
  }

  set_hora_ocurrencia(val: string | number | null | undefined): void {
    this.hora_ocurrencia.set(val != null ? String(val) : '');
  }

  set_tipo_sitio_id(val: SelectValue): void {
    const num = val != null && val !== '' ? Number(val) : null;
    this.tipo_sitio_id.set(num);
    if (num !== null) {
      const sitioActual = this.catalogos().sitios_ocurrencia.find(
        (s) => s.id === this.sitio_ocurrencia_id(),
      );
      if (sitioActual && Number(sitioActual.tipo_sitio_id) !== num) {
        this.sitio_ocurrencia_id.set(null);
      }
    }
  }

  set_sitio_ocurrencia_id(val: SelectValue): void {
    const num = val != null && val !== '' ? Number(val) : null;
    this.sitio_ocurrencia_id.set(num);
    if (num !== null) {
      const sitio = this.catalogos().sitios_ocurrencia.find((s) => s.id === num);
      if (sitio && !this.tipo_sitio_id()) {
        this.tipo_sitio_id.set(sitio.tipo_sitio_id);
      }
    }
  }

  set_agresor_movil_id(val: SelectValue): void {
    this.agresor_movil_id.set(val != null && val !== '' ? Number(val) : null);
  }

  set_agresor_parentesco_id(val: SelectValue): void {
    this.agresor_parentesco_id.set(val != null && val !== '' ? Number(val) : null);
  }

  set_agresor_tipo_documento_id(val: SelectValue): void {
    this.agresor_tipo_documento_id.set(val != null && val !== '' ? Number(val) : null);
  }

  set_agresor_sexo_id(val: SelectValue): void {
    this.agresor_sexo_id.set(val != null && val !== '' ? Number(val) : null);
  }

  texto(val: string | number | null | undefined): string {
    return val != null ? String(val) : '';
  }

  /** Permite reemplazar al agresor ya registrado por otra persona. */
  cambiar_agresor(): void {
    this.limpiar_persona_agresor();
  }

  private cargar_persona_agresor(persona: AgresorPersonaDatos | null): void {
    this.agresor_tipo_documento_id.set(persona?.tipo_documento_id || null);
    this.agresor_numero_documento.set(persona?.numero_documento ?? '');
    this.agresor_apellido_paterno.set(persona?.apellido_paterno ?? '');
    this.agresor_apellido_materno.set(persona?.apellido_materno ?? '');
    this.agresor_nombres.set(persona?.nombres ?? '');
    this.agresor_sexo_id.set(persona?.sexo_id || null);
    this.agresor_fecha_nacimiento.set(persona?.fecha_nacimiento ?? '');
    this.agresor_celular.set(persona?.celular ?? '');
    this.agresor_correo.set(persona?.correo_electronico ?? '');
    if (persona) this.agresor_fap.set(persona.fap);
  }

  private persona_para_envio(persona: AgresorPersonaDatos | null): Partial<AgresorPersonaDatos> | null {
    if (!persona) return null;
    return persona.nn ? { nn: true, sexo_id: persona.sexo_id } : persona;
  }

  private limpiar_persona_agresor(): void {
    this.agresor_persona_id.set(null);
    this.cargar_persona_agresor(null);
  }

  private hay_datos_agresor(): boolean {
    return Boolean(
      this.agresor_movil_id() ||
        this.agresor_parentesco_id() ||
        this.agresor_persona_id() ||
        this.agresor_tipo_documento_id() ||
        this.agresor_sexo_id() ||
        this.agresor_numero_documento().trim() ||
        this.agresor_apellido_paterno().trim() ||
        this.agresor_apellido_materno().trim() ||
        this.agresor_nombres().trim() ||
        this.agresor_fecha_nacimiento() ||
        this.agresor_celular().trim() ||
        this.agresor_correo().trim(),
    );
  }

  /** Devuelve el primer dato obligatorio que falta, o null si el agresor está completo. */
  private validar_agresor(): string | null {
    if (!this.agresor_movil_id()) return 'Debe seleccionar el móvil de la agresión (*).';
    if (!this.agresor_parentesco_id()) return 'Debe seleccionar el parentesco con la víctima (*).';
    if (this.agresor_registrado()) return null;
    if (this.agresor_nn()) {
      return this.agresor_sexo_id() ? null : 'Debe seleccionar el sexo del agresor (*).';
    }
    if (!this.agresor_tipo_documento_id()) {
      return 'Debe seleccionar el tipo de documento del agresor (*).';
    }
    if (!this.agresor_apellido_paterno().trim()) {
      return 'Debe ingresar el apellido paterno del agresor (*).';
    }
    if (!this.agresor_nombres().trim()) return 'Debe ingresar los nombres del agresor (*).';
    if (!this.agresor_sexo_id()) return 'Debe seleccionar el sexo del agresor (*).';
    return null;
  }

  set_nueva_region_id(val: SelectValue): void {
    this.nueva_region_id.set(val != null && val !== '' ? Number(val) : null);
  }

  set_nuevo_tipo_lesion_id(val: SelectValue): void {
    this.nuevo_tipo_lesion_id.set(val != null && val !== '' ? Number(val) : null);
  }

  set_nuevo_agente_id(val: SelectValue): void {
    this.nuevo_agente_id.set(val != null && val !== '' ? Number(val) : null);
  }

  set_nueva_descripcion(val: string | number | null | undefined): void {
    this.nueva_descripcion.set(val != null ? String(val) : '');
  }

  set_fecha_notificacion(val: string | number | null | undefined): void {
    this.fecha_notificacion.set(val != null ? String(val) : '');
  }

  set_observacion(val: string | number | null | undefined): void {
    this.observacion.set(val != null ? String(val) : '');
  }

  agregar_lesion(): void {
    const regId = this.nueva_region_id();
    const tipId = this.nuevo_tipo_lesion_id();
    const ageId = this.nuevo_agente_id();
    const desc = this.nueva_descripcion().trim();

    if (!regId || !tipId) {
      this.utilService.mostrar_alerta(
        'Debe seleccionar al menos el área corporal (*) y el tipo de lesión (*).',
        'warning',
      );
      return;
    }

    const regNombre =
      this.catalogos().regiones_corporales.find((r) => r.id === regId)?.nombre ?? null;
    const tipNombre = this.catalogos().tipos_lesion.find((t) => t.id === tipId)?.nombre ?? null;
    const ageNombre = this.catalogos().agentes_lesion.find((a) => a.id === ageId)?.nombre ?? null;

    const nueva: LesionDetalleItem = {
      region_corporal_id: regId,
      region_corporal_nombre: regNombre,
      tipo_lesion_id: tipId,
      tipo_lesion_nombre: tipNombre,
      agente_lesion_id: ageId,
      agente_lesion_nombre: ageNombre,
      descripcion: desc,
    };

    this.lista_lesiones.update((lista) => [...lista, nueva]);

    // Limpiar fila borrador
    this.nueva_region_id.set(null);
    this.nuevo_tipo_lesion_id.set(null);
    this.nuevo_agente_id.set(null);
    this.nueva_descripcion.set('');
  }

  eliminar_lesion(index: number): void {
    this.lista_lesiones.update((lista) => lista.filter((_, i) => i !== index));
  }

  limpiar_formulario(): void {
    this.ind_alcohol_6h.set(false);
    this.tipo_sitio_id.set(null);
    this.sitio_ocurrencia_id.set(null);
    this.fecha_ocurrencia.set('');
    this.hora_ocurrencia.set('');

    this.agresor_movil_id.set(null);
    this.agresor_parentesco_id.set(null);
    this.limpiar_persona_agresor();
    this.lista_agresores.set([]);

    this.lista_lesiones.set([]);
    this.nueva_region_id.set(null);
    this.nuevo_tipo_lesion_id.set(null);
    this.nuevo_agente_id.set(null);
    this.nueva_descripcion.set('');

    this.ind_notif_minpub.set(false);
    this.fecha_notificacion.set('');
    this.observacion.set('');
  }

  guardar(): void {
    if (this.guardando()) return;
    const atencionId = this.atencionId();
    if (!atencionId) return;

    if (!this.sitio_ocurrencia_id()) {
      this.utilService.mostrar_alerta('Debe seleccionar el sitio de ocurrencia (*).', 'warning');
      return;
    }

    if (!this.fecha_ocurrencia()) {
      this.utilService.mostrar_alerta('Debe ingresar la fecha en que ocurrió (*).', 'warning');
      return;
    }

    // Un agresor a medio llenar se agrega a la tabla antes de guardar.
    if (this.hay_datos_agresor() && !this.agregar_agresor()) return;

    if (this.lista_lesiones().length === 0) {
      this.utilService.mostrar_alerta(
        'Debe registrar al menos una lesión en la tabla de lesiones (*).',
        'warning',
      );
      return;
    }

    const agresoresPayload: AtencionLesionPayload['agresores'] = this.lista_agresores().map(
      (item) => ({
        persona_id: item.persona_id,
        persona: item.persona_id !== null ? null : this.persona_para_envio(item.persona),
        movil_agresion_id: item.movil_agresion_id,
        parentesco_id: item.parentesco_id,
      }),
    );

    const lesionesPayload: AtencionLesionPayload['lesiones'] = this.lista_lesiones().map(
      (item) => ({
        agente_lesion_id: item.agente_lesion_id,
        region_corporal_id: item.region_corporal_id,
        tipo_lesion_id: item.tipo_lesion_id,
        descripcion: item.descripcion || null,
      }),
    );

    // Fecha con hora
    let fechaHoraOcurr = this.fecha_ocurrencia() || null;
    if (fechaHoraOcurr && this.hora_ocurrencia()) {
      fechaHoraOcurr = `${fechaHoraOcurr} ${this.hora_ocurrencia()}:00`;
    }

    let fechaNotif = this.fecha_notificacion() || null;
    if (fechaNotif && this.ind_notif_minpub()) {
      fechaNotif = `${fechaNotif} 00:00:00`;
    } else if (!this.ind_notif_minpub()) {
      fechaNotif = null;
    }

    const payload: AtencionLesionPayload = {
      sitio_ocurrencia_id: this.sitio_ocurrencia_id(),
      tipo_evento_id: this.tipo_evento_id() ?? 2,
      fecha_ocurrencia: fechaHoraOcurr,
      ind_alcohol_6h: this.ind_alcohol_6h(),
      ind_notif_minpub: this.ind_notif_minpub(),
      fecha_notificacion: fechaNotif,
      observacion: this.observacion().trim() || null,
      lesiones: lesionesPayload,
      agresores: agresoresPayload,
    };

    this.guardando.set(true);
    this.lesionService
      .guardar_lesiones(atencionId, payload, true)
      .pipe(finalize(() => this.guardando.set(false)))
      .subscribe({
        next: () => {
          this.utilService.mostrar_alerta(
            'Hoja de registro de lesiones guardada correctamente.',
            'success',
          );
          this.guardado.emit();
          this.cerrar();
        },
        error: (err: any) => {
          this.utilService.mostrar_error(err?.message ?? 'No se pudo guardar la hoja de lesiones.');
        },
      });
  }
}
