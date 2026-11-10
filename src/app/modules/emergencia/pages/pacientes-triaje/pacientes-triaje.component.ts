import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormField, form } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { finalize, filter, switchMap, timer } from 'rxjs';
import { ButtonComponent } from '../../../../components/button/button.component';
import { CardGeneralComponent } from '../../../../components/card-general/card-general.component';
import { InputTextComponent } from '../../../../components/input-text/input-text.component';
import { ModalComponent } from '../../../../components/modal/modal.component';
import { SelectComponent, SelectOption } from '../../../../components/select/select.component';
import { TableComponent } from '../../../../components/table/table.component';
import {
  FiltrosSeguimientoTriaje,
  PacienteSeguimientoTriaje,
  SeguimientoTriaje,
  TriajeTicket,
} from '../../../../interfaces/emergencia/triaje.interface';
import {
  TableActionEvent,
  TableColumn,
  TableRowAction,
} from '../../../../interfaces/util.interface';
import { CatalogoEmergenciaService } from '../../../../services/emergencia/catalogo-emergencia.service';
import { TriajeService } from '../../../../services/emergencia/triaje.service';
import { UtilService } from '../../../../services/util.service';
import { RegistroTriajeComponent } from '../registro-triaje/registro-triaje.component';

const FILTROS_INICIALES: FiltrosSeguimientoTriaje = {
  documento: '',
  numero_historia: '',
  motivo_consulta: '',
  estado: '',
  prioridad: '',
  personal: '',
  limite: 50,
};

@Component({
  selector: 'app-pacientes-triaje',
  imports: [
    FormField,
    ButtonComponent,
    CardGeneralComponent,
    InputTextComponent,
    ModalComponent,
    RegistroTriajeComponent,
    SelectComponent,
    TableComponent,
  ],
  templateUrl: './pacientes-triaje.component.html',
  styleUrl: './pacientes-triaje.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PacientesTriajeComponent {
  private readonly router = inject(Router);
  private readonly triajeService = inject(TriajeService);
  private readonly catalogoEmergenciaService = inject(CatalogoEmergenciaService);
  private readonly utilService = inject(UtilService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly modal_triaje = viewChild<ModalComponent>('modal_triaje');
  private readonly modal_ticket = viewChild<ModalComponent>('modal_ticket');
  private readonly registro_triaje = viewChild<RegistroTriajeComponent>('registro_triaje');
  private readonly ticket_impresion = viewChild<ElementRef<HTMLElement>>('ticket_impresion');
  private readonly colorPrioridad = new Map<string, string>();

  readonly filtros_model = signal({ ...FILTROS_INICIALES });
  readonly filtros_form = form(this.filtros_model);
  readonly seguimientos = signal<SeguimientoTriaje[]>([]);
  readonly cargando = signal(false);
  readonly buscando = signal(false);
  readonly prioridadOptions = signal<SelectOption[]>([]);
  readonly personalOptions = signal<SelectOption[]>([]);
  readonly mostrar_modal_triaje = signal(false);
  readonly mostrar_modal_ticket = signal(false);
  readonly atencion_en_triaje = signal<SeguimientoTriaje | null>(null);
  readonly ticket_triaje = signal<TriajeTicket | null>(null);
  readonly paciente_ticket = signal('');
  readonly cargando_ticket_atencion_id = signal<number | null>(null);
  readonly registro_triaje_guardando = computed(() => this.registro_triaje()?.guardando() ?? false);
  readonly puede_buscar = computed(() => {
    const filtros = this.filtros_model();
    return Boolean(
      filtros.estado?.trim() ||
      filtros.prioridad?.trim() ||
      filtros.documento?.trim() ||
      filtros.personal?.trim() ||
      filtros.numero_historia?.trim() ||
      filtros.motivo_consulta?.trim(),
    );
  });

  readonly estadoOptions: SelectOption[] = [
    { value: '', label: 'Todos' },
    { value: 'PENDIENTE_TRIAJE', label: 'Pendiente de triaje' },
    { value: 'TRIADO', label: 'Triado' },
  ];

  readonly columns: TableColumn<SeguimientoTriaje>[] = [
    { key: 'codigo_episodio', label: 'Registro' },
    { key: 'fecha_hora_ingreso', label: 'Fecha y Hora' },
    { key: 'paciente.nombre_completo', label: 'Paciente' },
    { key: 'paciente.edad', label: 'Edad', align: 'center' },
    { key: 'motivo_ingreso', label: 'Motivo de Ingreso' },
    { key: 'destino', label: 'Destino' },
    {
      key: 'prioridad',
      label: 'Prioridad',
      align: 'center',
      badge: {
        texto: (_value, row) => row.prioridad ?? '-',
        clases: (_value, row) => this.priority_badge(row.prioridad),
        size: 'sm',
      },
    },
    {
      key: 'medico',
      label: 'Médico responsable',
      badge: {
        texto: (_value, row) => row.medico?.trim() || 'Sin médico asignado',
        clases: (_value, row) => (row.medico ? 'info' : 'secondary'),
        size: 'sm',
      },
    },
    {
      key: 'estado_nombre',
      label: 'Estado',
      align: 'center',
      badge: {
        texto: (value) => String(value ?? '-'),
        clases: (_value, row) => (row.estado_seguimiento === 'TRIADO' ? 'success' : 'secondary'),
        size: 'sm',
      },
    },
  ];

  readonly actions: TableRowAction<SeguimientoTriaje>[] = [
    {
      id: 'triar',
      label: 'Triar',
      title: 'Triar',
      icon: 'fa-solid fa-stethoscope',
      color: 'primary',
      iconOnly: true,
      visible: (seguimiento) => seguimiento.estado_seguimiento === 'PENDIENTE_TRIAJE',
    },
    {
      id: 'ver_ticket',
      label: 'Ver ticket',
      title: 'Ver ticket',
      icon: 'fa-solid fa-ticket',
      color: 'secondary',
      iconOnly: true,
      visible: (seguimiento) => seguimiento.estado_seguimiento === 'TRIADO',
      disabled: () => this.cargando_ticket_atencion_id() !== null,
    },
  ];

  constructor() {
    this.catalogoEmergenciaService.obtenerCatalogos(['niveles_triaje']).subscribe({
      next: ({ data }) => {
        this.prioridadOptions.set([
          { value: '', label: 'Todas' },
          ...data.niveles_triaje.map((nivel) => ({
            value: nivel.value,
            label: `${nivel.value} - ${nivel.label}`,
          })),
        ]);
        data.niveles_triaje.forEach((nivel) =>
          this.colorPrioridad.set(
            nivel.value,
            this.color_nivel_triaje(nivel.value, nivel.color),
          ),
        );
      },
      error: (error: { message?: string }) =>
        this.utilService.mostrar_error(
          error.message ?? 'No se pudieron cargar las prioridades de triaje.',
        ),
    });
    this.iniciar_seguimiento_en_tiempo_real();
  }

  private iniciar_seguimiento_en_tiempo_real(): void {
    timer(0, 10000)
      .pipe(
        filter(() => !document.hidden && !this.buscando() && !this.mostrar_modal_triaje() && !this.mostrar_modal_ticket()),
        switchMap(() => this.triajeService.seguimiento(this.filtros_model(), false)),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: ({ data }) => {
          this.actualizar_seguimientos_diferencial(data);
          this.actualizar_opciones_personal(data);
          this.cdr.markForCheck();
        },
        error: () => {},
      });
  }

  private actualizar_seguimientos_diferencial(nuevos: SeguimientoTriaje[]): void {
    const actuales = this.seguimientos();

    if (actuales.length !== nuevos.length) {
      this.seguimientos.set(nuevos);
      return;
    }

    const mapaActuales = new Map(actuales.map((item) => [item.atencion_id, item]));
    let huboCambios = false;

    const actualizados = nuevos.map((nuevo) => {
      const anterior = mapaActuales.get(nuevo.atencion_id);
      if (!anterior) {
        huboCambios = true;
        return nuevo;
      }

      const cambioEstado =
        anterior.estado_nombre !== nuevo.estado_nombre ||
        anterior.estado_seguimiento !== nuevo.estado_seguimiento ||
        anterior.estado_codigo !== nuevo.estado_codigo;
      const cambioMedico =
        anterior.medico !== nuevo.medico ||
        anterior.programacion_personal_id !== nuevo.programacion_personal_id ||
        anterior.fecha_hora_llamada_med !== nuevo.fecha_hora_llamada_med;
      const cambioPrioridad =
        anterior.prioridad !== nuevo.prioridad ||
        anterior.prioridad_nombre !== nuevo.prioridad_nombre;
      const cambioDestino = anterior.destino !== nuevo.destino || anterior.area !== nuevo.area;

      if (cambioEstado || cambioMedico || cambioPrioridad || cambioDestino) {
        huboCambios = true;
        return nuevo;
      }

      return anterior;
    });

    if (huboCambios) {
      this.seguimientos.set(actualizados);
    }
  }

  nueva_admision(): void {
    void this.router.navigate(['/emergencia/admision']);
  }

  ejecutar_accion(event: TableActionEvent<SeguimientoTriaje>): void {
    if (event.action === 'triar' && event.row.estado_seguimiento === 'PENDIENTE_TRIAJE') {
      this.abrir_modal_triaje(event.row);
      return;
    }

    if (event.action === 'ver_ticket' && event.row.estado_seguimiento === 'TRIADO') {
      this.abrir_ticket(event.row);
    }
  }

  formatear_nombre_paciente(paciente: PacienteSeguimientoTriaje | null | undefined): string {
    if (!paciente) return 'Paciente';

    const grado = paciente.grado_codigo?.toUpperCase()?.trim() || null;
    const situacion = paciente.situacion?.toUpperCase()?.trim();
    const sufijoSituacion = situacion === 'RETIRO' ? '(r)' : null;
    const partesGrado = [grado, sufijoSituacion].filter(Boolean).join(' ');

    let nombre = '';
    if (paciente.apellido_paterno || paciente.apellido_materno || paciente.nombres) {
      const apellidos = [paciente.apellido_paterno, paciente.apellido_materno]
        .map((value: string | null | undefined) => value?.toUpperCase()?.trim())
        .filter(Boolean)
        .join(' ');
      const nombres = (paciente.nombres || '')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
        .map((palabra: string) => palabra.charAt(0).toUpperCase() + palabra.slice(1).toLowerCase())
        .join(' ');
      nombre = [apellidos, nombres].filter(Boolean).join(' ');
    } else {
      nombre = (paciente.nombre_completo?.trim() || 'Paciente');
    }

    return partesGrado ? `${partesGrado} ${nombre}` : nombre;
  }

  titulo_modal_triaje(atencion: SeguimientoTriaje): string {
    const paciente = atencion.paciente;
    const nombre = this.formatear_nombre_paciente(paciente);
    const edad =
      paciente?.edad !== null && paciente?.edad !== undefined
        ? ` (${paciente.edad} ${paciente.edad === 1 ? 'año' : 'años'})`
        : '';

    return `Registro de Triaje - ${nombre}${edad}`;
  }

  abrir_modal_triaje(atencion: SeguimientoTriaje): void {
    this.atencion_en_triaje.set(atencion);
    this.mostrar_modal_triaje.set(true);
    setTimeout(() => this.modal_triaje()?.open());
  }

  cerrar_modal_triaje(): void {
    this.mostrar_modal_triaje.set(false);
    this.atencion_en_triaje.set(null);

    if (this.ticket_triaje()) {
      this.mostrar_modal_ticket.set(true);
      setTimeout(() => this.modal_ticket()?.open());
    }
  }

  completar_triaje(ticket: TriajeTicket): void {
    this.ticket_triaje.set(ticket);
    const atencion = this.atencion_en_triaje();
    this.paciente_ticket.set(
      atencion ? this.formatear_nombre_paciente(atencion.paciente) : '',
    );
    this.modal_triaje()?.close();
    void this.consultar();
  }

  abrir_ticket(atencion: SeguimientoTriaje): void {
    if (this.cargando_ticket_atencion_id() !== null) {
      return;
    }

    const atencion_id = atencion.atencion_id;
    this.cargando_ticket_atencion_id.set(atencion_id);
    this.triajeService
      .obtener_ticket(atencion_id, true)
      .pipe(finalize(() => this.cargando_ticket_atencion_id.set(null)))
      .subscribe({
        next: ({ data }) => {
          this.ticket_triaje.set(data);
          this.paciente_ticket.set(this.formatear_nombre_paciente(atencion.paciente));
          this.mostrar_modal_ticket.set(true);
          setTimeout(() => this.modal_ticket()?.open());
        },
        error: (error: { message?: string }) =>
          this.utilService.mostrar_error(
            error.message ?? 'No se pudo consultar el ticket de triaje.',
          ),
      });
  }

  cerrar_modal_ticket(): void {
    this.mostrar_modal_ticket.set(false);
    this.ticket_triaje.set(null);
    this.paciente_ticket.set('');
  }

  prioridad_ticket(codigo: string | null | undefined, nombre?: string | null): string {
    if (!codigo) return '-';
    const codigoRomano = codigo.trim().toUpperCase();
    const mapaSignificados: Record<string, string> = {
      I: 'Resucitación',
      II: 'Emergencia',
      III: 'Urgencia',
      IV: 'Urgencia Menor',
      V: 'No Urgente',
      '1': 'Resucitación',
      '2': 'Emergencia',
      '3': 'Urgencia',
      '4': 'Urgencia Menor',
      '5': 'No Urgente',
    };
    const romanoNormalizado =
      codigoRomano === '1'
        ? 'I'
        : codigoRomano === '2'
          ? 'II'
          : codigoRomano === '3'
            ? 'III'
            : codigoRomano === '4'
              ? 'IV'
              : codigoRomano === '5'
                ? 'V'
                : codigoRomano;

    const significado = nombre || mapaSignificados[codigoRomano] || '';
    return significado ? `${romanoNormalizado} - ${significado}` : romanoNormalizado;
  }

  valor_ticket(codigo: string, componente: string | null = null): string {
    const detalle = this.ticket_triaje()?.signos_vitales.find(
      (signo) => signo.parametro_codigo === codigo && signo.componente_codigo === componente,
    );

    return detalle?.valor ?? '-';
  }

  fecha_ticket(fecha_hora: string): string {
    return fecha_hora.split(' ')[0] ?? fecha_hora;
  }

  hora_ticket(fecha_hora: string): string {
    return fecha_hora.split(' ')[1] ?? '';
  }

  imprimir_ticket(): void {
    const ticket = this.ticket_impresion()?.nativeElement;
    if (!ticket) {
      return;
    }

    const ventana = window.open('', '_blank', 'height=850,width=700');
    if (!ventana) {
      this.utilService.mostrar_alerta(
        'Permita las ventanas emergentes para imprimir el ticket.',
        'warning',
      );
      return;
    }

    const estilos = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((elemento) => elemento.outerHTML)
      .join('');
    let impresion_iniciada = false;
    const imprimir = (): void => {
      if (impresion_iniciada) {
        return;
      }
      impresion_iniciada = true;
      ventana.focus();
      ventana.print();
    };
    ventana.addEventListener('load', imprimir, { once: true });
    ventana.document.write(
      `<!doctype html><html><head><base href="${document.baseURI}"><title>Ticket de triaje</title>${estilos}<style>@page{size:A5 portrait;margin:10mm}body{margin:0;padding:1rem}.triage-ticket{max-width:none!important}</style></head><body>${ticket.outerHTML}</body></html>`,
    );
    ventana.document.close();
    if (ventana.document.readyState === 'complete') {
      ventana.setTimeout(imprimir);
    }
  }

  consultar(event?: Event): void {
    event?.preventDefault();
    if (this.cargando() || this.buscando()) return;
    if (event && !this.puede_buscar()) return;

    const esAccionUsuario = Boolean(event);
    if (esAccionUsuario) {
      this.buscando.set(true);
    }
    this.cargando.set(true);

    this.triajeService
      .seguimiento(this.filtros_model(), esAccionUsuario)
      .pipe(
        finalize(() => {
          this.cargando.set(false);
          if (esAccionUsuario) {
            this.buscando.set(false);
          }
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: ({ data }) => {
          this.actualizar_seguimientos_diferencial(data);
          this.actualizar_opciones_personal(data);
          this.cdr.markForCheck();
        },
        error: (error: { message?: string }) =>
          this.utilService.mostrar_error(
            error.message ?? 'No se pudo consultar el seguimiento de Emergencia.',
          ),
      });
  }

  limpiar_consulta(): void {
    if (this.cargando()) return;

    this.filtros_model.set({ ...FILTROS_INICIALES });
    this.filtros_form().reset({ ...FILTROS_INICIALES });
    this.consultar();
  }

  private priority_badge(priority: string | null): string {
    const color = priority
      ? (this.colorPrioridad.get(priority) ?? this.color_nivel_triaje(priority))
      : 'secondary';

    return `${color} priority-badge-solid`;
  }

  private color_nivel_triaje(codigoPrioridad: string, colorCatalogo?: string | null): string {
    const normalizado = codigoPrioridad.trim().toUpperCase();
    if (normalizado === 'I' || normalizado === '1') return 'danger';
    if (normalizado === 'II' || normalizado === '2') return 'orange';
    if (normalizado === 'III' || normalizado === '3') return 'warning';
    if (normalizado === 'IV' || normalizado === '4') return 'success';
    if (normalizado === 'V' || normalizado === '5') return 'primary';

    const colorNombre = (colorCatalogo ?? '').trim().toUpperCase();
    if (colorNombre === 'ROJO') return 'danger';
    if (colorNombre === 'NARANJA') return 'orange';
    if (colorNombre === 'AMARILLO') return 'warning';
    if (colorNombre === 'VERDE') return 'success';
    if (colorNombre === 'AZUL') return 'primary';

    return 'secondary';
  }

  private actualizar_opciones_personal(seguimientos: SeguimientoTriaje[]): void {
    const personales = Array.from(
      new Set(
        seguimientos
          .map((seguimiento) => seguimiento.medico?.trim())
          .filter((personal): personal is string => Boolean(personal)),
      ),
    ).sort((a, b) => a.localeCompare(b, 'es')) as string[];

    this.personalOptions.set([
      { value: '', label: 'Todos' },
      ...personales.map((personal) => ({ value: personal, label: personal })),
    ]);
  }
}
