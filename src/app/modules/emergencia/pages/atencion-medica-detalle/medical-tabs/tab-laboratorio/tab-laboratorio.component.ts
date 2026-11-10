import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { ButtonComponent } from '../../../../../../components/button/button.component';

import {
  DetalleAtencionResponse,
  Diagnostico,
  OrdenHistorialLaboratorio,
  OrdenLaboratorio,
  OrdenResultadoLaboratorio,
  PrioridadOrdenMedica,
  ServicioLaboratorio,
} from '../../../../../../interfaces/emergencia/triaje.interface';
import { UtilService } from '../../../../../../services/util.service';

export interface GuardarLaboratorioPayload {
  prioridad_id: number;
  diagnostico_id: number;
  servicios: string[];
}

@Component({
  selector: 'app-tab-laboratorio',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
  ],
  templateUrl: './tab-laboratorio.component.html',
  styleUrl: '../medical-tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabLaboratorioComponent {
  private readonly utilService = inject(UtilService);
  private readonly orden_impresion = viewChild<ElementRef<HTMLElement>>('orden_impresion');

  // Inputs
  readonly detalle = input.required<DetalleAtencionResponse>();
  readonly ordenes_laboratorio = input<readonly OrdenLaboratorio[]>([]);
  readonly catalogo_laboratorio = input<readonly ServicioLaboratorio[]>([]);
  readonly prioridades_orden = input<readonly PrioridadOrdenMedica[]>([]);
  readonly diagnosticos = input<readonly Diagnostico[]>([]);
  readonly cargando_laboratorio = input(false);
  readonly guardando_laboratorio = input(false);
  readonly historial_laboratorio = input<readonly OrdenHistorialLaboratorio[]>([]);
  readonly resultados_laboratorio = input<readonly OrdenResultadoLaboratorio[]>([]);
  readonly cargando_historial_laboratorio = input(false);
  readonly cargando_resultados_laboratorio = input(false);

  // Outputs
  readonly guardarLaboratorio = output<GuardarLaboratorioPayload>();
  readonly eliminarLaboratorio = output<number>();
  readonly cargarHistorialLaboratorio = output<void>();
  readonly cargarResultadosLaboratorio = output<void>();

  // Estados locales con Signals
  readonly laboratorio_modal_abierto = signal(false);
  readonly laboratorio_area_activa = signal<string | null>(null);
  readonly laboratorio_filtro = signal('');
  readonly laboratorio_vista = signal<'solicitudes' | 'historial' | 'resultados'>('solicitudes');
  readonly prioridad_laboratorio_id = signal<number | null>(null);
  readonly diagnostico_laboratorio_id = signal<number | null>(null);
  readonly servicios_laboratorio_seleccionados = signal<Set<string>>(new Set());

  // Computed
  readonly areas_laboratorio = computed(() => {
    const areas = new Map<
      string,
      { codigo: string; nombre: string; servicios: ServicioLaboratorio[] }
    >();

    for (const servicio of this.catalogo_laboratorio()) {
      const area = areas.get(servicio.area_codigo) ?? {
        codigo: servicio.area_codigo,
        nombre: servicio.area_nombre,
        servicios: [],
      };
      area.servicios.push(servicio);
      areas.set(servicio.area_codigo, area);
    }

    return Array.from(areas.values());
  });

  readonly servicios_laboratorio_filtrados = computed(() => {
    const filtro = this.laboratorio_filtro().trim().toLowerCase();
    return this.catalogo_laboratorio().filter((servicio) => {
      const perteneceAlArea =
        this.laboratorio_area_activa() === null ||
        servicio.area_codigo === this.laboratorio_area_activa();
      const coincide =
        !filtro ||
        servicio.codigo.toLowerCase().includes(filtro) ||
        servicio.nombre.toLowerCase().includes(filtro);
      return perteneceAlArea && coincide;
    });
  });

  readonly columnas_laboratorio = computed(() => {
    const servicios = this.servicios_laboratorio_filtrados();
    const mitad = Math.ceil(servicios.length / 2);
    return [servicios.slice(0, mitad), servicios.slice(mitad)];
  });

  readonly total_servicios_laboratorio = computed(() => this.catalogo_laboratorio().length);

  readonly areas_orden_laboratorio = computed(() => {
    const areas = new Map<string, { nombre: string; ordenes: OrdenLaboratorio[] }>();

    for (const orden of this.ordenes_laboratorio()) {
      const nombre = orden.area_nombre || 'Sin área';
      const area = areas.get(nombre) ?? { nombre, ordenes: [] };
      area.ordenes.push(orden);
      areas.set(nombre, area);
    }

    return Array.from(areas.values());
  });

  // Métodos de interacción
  abrir_modal_laboratorio(): void {
    const preseleccionados = new Set(
      this.catalogo_laboratorio()
        .filter((servicio) => Number(servicio.en_uso) === 1)
        .map((servicio) => servicio.codigo),
    );
    this.servicios_laboratorio_seleccionados.set(preseleccionados);
    this.laboratorio_area_activa.set(null);
    this.laboratorio_filtro.set('');
    this.prioridad_laboratorio_id.set(null);
    this.diagnostico_laboratorio_id.set(null);
    this.laboratorio_modal_abierto.set(true);
  }

  cerrar_modal_laboratorio(): void {
    this.laboratorio_modal_abierto.set(false);
    this.prioridad_laboratorio_id.set(null);
    this.diagnostico_laboratorio_id.set(null);
  }

  seleccionar_area_laboratorio(area_codigo: string | null): void {
    this.laboratorio_area_activa.set(area_codigo);
    this.laboratorio_filtro.set('');
  }

  actualizar_filtro_laboratorio(event: Event): void {
    this.laboratorio_filtro.set((event.target as HTMLInputElement).value);
  }

  alternar_servicio_laboratorio(event: Event, codigo: string): void {
    const seleccionado = (event.target as HTMLInputElement).checked;
    const servicios = new Set(this.servicios_laboratorio_seleccionados());

    if (seleccionado) {
      servicios.add(codigo);
    } else {
      servicios.delete(codigo);
    }

    this.servicios_laboratorio_seleccionados.set(servicios);
  }

  servicio_laboratorio_marcado(codigo: string): boolean {
    return this.servicios_laboratorio_seleccionados().has(codigo);
  }

  indice_laboratorio(columna: number, indice: number): number {
    return columna === 0 ? indice : this.columnas_laboratorio()[0].length + indice;
  }

  seleccionar_vista_laboratorio(vista: 'solicitudes' | 'historial' | 'resultados'): void {
    this.laboratorio_vista.set(vista);

    if (vista === 'historial') this.cargarHistorialLaboratorio.emit();
    if (vista === 'resultados') this.cargarResultadosLaboratorio.emit();
  }

  actualizar_prioridad_laboratorio(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.prioridad_laboratorio_id.set(value ? Number(value) : null);
  }

  actualizar_diagnostico_laboratorio(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.diagnostico_laboratorio_id.set(value ? Number(value) : null);
  }

  guardar_laboratorio(): void {
    const servicios = this.servicios_laboratorio_seleccionados();
    const prioridad_id = this.prioridad_laboratorio_id();
    const diagnostico_id = this.diagnostico_laboratorio_id();

    if (servicios.size === 0 || prioridad_id === null || diagnostico_id === null) {
      return;
    }

    this.guardarLaboratorio.emit({
      prioridad_id,
      diagnostico_id,
      servicios: Array.from(servicios),
    });
  }

  imprimir_orden_laboratorio(): void {
    const orden = this.orden_impresion()?.nativeElement;
    if (!orden) return;

    this.imprimir_elemento(orden, 'Orden de laboratorio');
  }

  private imprimir_elemento(elemento: HTMLElement, titulo: string): void {
    const ventana = window.open('', '_blank', 'height=850,width=700');
    if (!ventana) {
      this.utilService.mostrar_alerta(
        'Permita las ventanas emergentes para imprimir la orden.',
        'warning',
      );
      return;
    }

    const estilos = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((item) => item.outerHTML)
      .join('');
    let impresion_iniciada = false;
    const imprimir = (): void => {
      if (impresion_iniciada) return;

      impresion_iniciada = true;
      ventana.focus();
      ventana.print();
    };
    ventana.addEventListener('load', imprimir, { once: true });
    ventana.document.write(
      `<!doctype html><html><head><base href="${document.baseURI}"><title>${titulo}</title>${estilos}<style>@page{size:A5 portrait;margin:10mm}body{margin:0;padding:1rem}.laboratory-print-area{display:block!important}table{width:100%;border-collapse:collapse}th,td{border:1px solid #adb5bd;padding:4px 6px;font-size:12px;text-align:left}h4,h5{margin:0 0 6px}</style></head><body>${elemento.outerHTML}</body></html>`,
    );
    ventana.document.close();
    if (ventana.document.readyState === 'complete') {
      ventana.setTimeout(imprimir);
    }
  }
}
