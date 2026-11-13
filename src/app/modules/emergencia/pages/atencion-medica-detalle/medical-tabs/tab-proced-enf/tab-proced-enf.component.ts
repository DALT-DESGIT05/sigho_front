import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import Swal from 'sweetalert2';
import { ButtonComponent } from '../../../../../../components/button/button.component';
import { BadgeComponent } from '../../../../../../components/badge/badge.component';
import { SelectComponent, SelectOption, SelectValue } from '../../../../../../components/select/select.component';
import { TableComponent } from '../../../../../../components/table/table.component';
import {
  TableCellContext,
  TableColumn,
} from '../../../../../../interfaces/util.interface';
import { UtilService } from '../../../../../../services/util.service';
import {
  DetalleAtencionResponse,
  OrdenProcedEnf,
  PrioridadOrdenMedica,
  ServicioProcedEnf,
} from '../../../../../../interfaces/emergencia/triaje.interface';

export interface GuardarProcedEnfPayload {
  prioridad_id: number;
  servicios: Array<{ codigo: string; indicaciones: string | null }>;
}

@Component({
  selector: 'app-tab-proced-enf',
  standalone: true,
  imports: [CommonModule, ButtonComponent, BadgeComponent, TableComponent, SelectComponent],
  templateUrl: './tab-proced-enf.component.html',
  styleUrl: '../medical-tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabProcedEnfComponent {
  private readonly utilService = inject(UtilService);

  readonly detalle = input.required<DetalleAtencionResponse>();
  readonly ordenes_proced_enf = input<readonly OrdenProcedEnf[]>([]);
  readonly catalogo_proced_enf = input<readonly ServicioProcedEnf[]>([]);
  readonly prioridades_orden = input<readonly PrioridadOrdenMedica[]>([]);
  readonly cargando_proced_enf = input(false);
  readonly guardando_proced_enf = input(false);

  readonly guardarProcedEnf = output<GuardarProcedEnfPayload>();
  readonly eliminarProcedEnf = output<number>();

  private readonly estadoTpl =
    viewChild<TemplateRef<TableCellContext<OrdenProcedEnf>>>('estadoTpl');
  private readonly accionesTpl =
    viewChild<TemplateRef<TableCellContext<OrdenProcedEnf>>>('accionesTpl');

  readonly plantillasCelda = computed<
    Record<string, TemplateRef<TableCellContext<OrdenProcedEnf>>>
  >(() => {
    const plantillas: Record<string, TemplateRef<TableCellContext<OrdenProcedEnf>>> = {};
    const est = this.estadoTpl();
    const acc = this.accionesTpl();
    if (est) plantillas['estado'] = est;
    if (acc) plantillas['acciones'] = acc;
    return plantillas;
  });

  readonly columnasOrdenes: TableColumn<OrdenProcedEnf>[] = [
    {
      key: 'servicio_codigo',
      label: 'CÓDIGO',
      formatter: (_val, fila) => fila.servicio_codigo || '-',
    },
    {
      key: 'servicio_nombre',
      label: 'INDICACIÓN / ACTIVIDAD',
      formatter: (_val, fila) => fila.servicio_nombre || fila.servicio_codigo || '-',
    },
    {
      key: 'prioridad_nombre',
      label: 'PRIORIDAD',
      formatter: (_val, fila) => fila.prioridad_nombre || '-',
    },
    {
      key: 'indicaciones',
      label: 'INDICACIONES',
      formatter: (_val, fila) => fila.indicaciones || '-',
    },
    {
      key: 'estado',
      label: 'ESTADO',
    },
    {
      key: 'fecha_hora_orden',
      label: 'FECHA',
      formatter: (_val, fila) => fila.fecha_hora_orden || '-',
    },
    {
      key: 'acciones',
      label: 'ACCIÓN',
      align: 'center',
    },
  ];

  readonly proced_enf_modal_abierto = signal(false);
  readonly proced_enf_area_activa = signal<string | null>(null);
  readonly proced_enf_filtro = signal('');
  readonly prioridad_proced_enf_id = signal<number | null>(null);
  readonly servicios_proced_enf_seleccionados = signal<Set<string>>(new Set());
  readonly indicaciones_por_servicio = signal<Map<string, string>>(new Map());

  readonly areas_proced_enf = computed(() => {
    const areasMap = new Map<
      string,
      { codigo: string; nombre: string; servicios: ServicioProcedEnf[] }
    >();
    for (const servicio of this.catalogo_proced_enf()) {
      const codigo = servicio.area_codigo ?? '005';
      const nombre = servicio.area_nombre ?? 'Enfermería';
      if (!areasMap.has(codigo)) {
        areasMap.set(codigo, { codigo, nombre, servicios: [] });
      }
      areasMap.get(codigo)!.servicios.push(servicio);
    }
    return Array.from(areasMap.values());
  });

  readonly total_servicios_proced_enf = computed(() => this.catalogo_proced_enf().length);

  readonly servicios_proced_enf_filtrados = computed(() => {
    const filtro = this.proced_enf_filtro().trim().toLowerCase();
    return this.catalogo_proced_enf().filter((servicio) => {
      const coincideArea =
        this.proced_enf_area_activa() === null ||
        (servicio.area_codigo ?? '005') === this.proced_enf_area_activa();
      const coincideFiltro =
        filtro.length === 0 ||
        servicio.nombre.toLowerCase().includes(filtro) ||
        servicio.codigo.toLowerCase().includes(filtro);
      return coincideArea && coincideFiltro;
    });
  });

  readonly columnas_proced_enf = computed(() => {
    const servicios = this.servicios_proced_enf_filtrados();
    const mitad = Math.ceil(servicios.length / 2);
    return [servicios.slice(0, mitad), servicios.slice(mitad)];
  });

  estado_badge_class(estado: string | null | undefined): string {
    return this.utilService.situacion_examen_badge_class(estado ?? '');
  }

  abrir_modal_proced_enf(): void {
    const iniciales = new Set(
      this.catalogo_proced_enf()
        .filter((servicio) => Number(servicio.en_uso) === 1)
        .map((servicio) => servicio.codigo),
    );
    this.servicios_proced_enf_seleccionados.set(iniciales);
    this.proced_enf_area_activa.set(null);
    this.proced_enf_filtro.set('');
    this.prioridad_proced_enf_id.set(null);
    this.proced_enf_modal_abierto.set(true);
  }

  cerrar_modal_proced_enf(): void {
    this.proced_enf_modal_abierto.set(false);
    this.prioridad_proced_enf_id.set(null);
  }

  seleccionar_area_proced_enf(area_codigo: string | null): void {
    this.proced_enf_area_activa.set(area_codigo);
    this.proced_enf_filtro.set('');
  }

  icono_area_proced_enf(area_codigo: string): string {
    switch (area_codigo) {
      case '005':
        return 'fa-solid fa-user-nurse';
      case '036':
        return 'fa-solid fa-truck-medical';
      case '041':
        return 'fa-solid fa-bed-pulse';
      default:
        return 'fa-solid fa-notes-medical';
    }
  }

  etiqueta_area_proced_enf(area_codigo: string, area_nombre: string): string {
    switch (area_codigo) {
      case '005':
        return 'Enfermería';
      case '036':
        return 'Emergencia / Tópico';
      case '041':
        return 'Hospitalización / Cuidados';
      default:
        return area_nombre;
    }
  }

  actualizar_filtro_proced_enf(event: Event): void {
    this.proced_enf_filtro.set((event.target as HTMLInputElement).value);
  }

  alternar_servicio_proced_enf(event: Event, codigo: string, nombre?: string): void {
    const checkbox = event.target as HTMLInputElement;
    const marcado = checkbox.checked;
    const servicios = new Set(this.servicios_proced_enf_seleccionados());
    const indicaciones = new Map(this.indicaciones_por_servicio());

    if (marcado) {
      servicios.add(codigo);
      this.servicios_proced_enf_seleccionados.set(servicios);
      this.abrir_modal_indicacion_servicio(codigo, nombre || codigo);
    } else {
      servicios.delete(codigo);
      indicaciones.delete(codigo);
      this.servicios_proced_enf_seleccionados.set(servicios);
      this.indicaciones_por_servicio.set(indicaciones);
    }
  }

  abrir_modal_indicacion_servicio(codigo: string, nombre: string): void {
    const indicacionActual = this.indicaciones_por_servicio().get(codigo) ?? '';

    Swal.fire({
      title: 'Indicación médica',
      html: `
        <div style="text-align: left; margin-bottom: 8px;">
          <p style="font-size: 13px; color: #4b5563; margin-bottom: 4px;"><strong>Servicio:</strong> ${codigo} - ${nombre}</p>
        </div>
      `,
      input: 'textarea',
      inputValue: indicacionActual,
      inputPlaceholder: 'Ingrese las indicaciones o especificaciones (opcional)...',
      inputAttributes: {
        maxlength: '500',
        rows: '4',
        style: 'font-size: 13px; resize: vertical;',
      },
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Omitir',
      confirmButtonColor: '#002060',
      cancelButtonColor: '#6c757d',
    }).then((result) => {
      if (result.isConfirmed && typeof result.value === 'string') {
        const texto = result.value.trim();
        const mapa = new Map(this.indicaciones_por_servicio());
        if (texto) {
          mapa.set(codigo, texto);
        } else {
          mapa.delete(codigo);
        }
        this.indicaciones_por_servicio.set(mapa);
      }
    });
  }

  obtener_indicacion_servicio(codigo: string): string {
    return this.indicaciones_por_servicio().get(codigo) ?? '';
  }

  servicio_proced_enf_marcado(codigo: string): boolean {
    return this.servicios_proced_enf_seleccionados().has(codigo);
  }

  indice_proced_enf(columna: number, indice: number): number {
    return columna === 0 ? indice : this.columnas_proced_enf()[0].length + indice;
  }

  readonly prioridadesOptions = computed<SelectOption[]>(() => {
    return this.prioridades_orden().map((p) => ({
      value: p.prioridad_id,
      label: p.nombre,
    }));
  });

  actualizar_prioridad_proced_enf(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.prioridad_proced_enf_id.set(value ? Number(value) : null);
  }

  actualizar_prioridad_proced_enf_valor(value: SelectValue): void {
    this.prioridad_proced_enf_id.set(value ? Number(value) : null);
  }

  guardar_proced_enf(): void {
    const seleccionados = this.servicios_proced_enf_seleccionados();
    const prioridad = this.prioridad_proced_enf_id();

    if (seleccionados.size === 0 || prioridad === null) {
      return;
    }

    const indicaciones = this.indicaciones_por_servicio();
    this.guardarProcedEnf.emit({
      prioridad_id: prioridad,
      servicios: Array.from(seleccionados).map((codigo) => ({
        codigo,
        indicaciones: indicaciones.get(codigo) ?? null,
      })),
    });
    this.cerrar_modal_proced_enf();
  }
}
