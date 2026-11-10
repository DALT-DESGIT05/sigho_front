import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { filter, finalize, switchMap, timer } from 'rxjs';
import { CardGeneralComponent } from '../../../../components/card-general/card-general.component';
import { TableComponent } from '../../../../components/table/table.component';
import {
  FiltrosSeguimientoTriaje,
  SeguimientoTriaje,
} from '../../../../interfaces/emergencia/triaje.interface';
import {
  TableActionEvent,
  TableColumn,
  TableRowAction,
} from '../../../../interfaces/util.interface';
import { CatalogoEmergenciaService } from '../../../../services/emergencia/catalogo-emergencia.service';
import { TriajeService } from '../../../../services/emergencia/triaje.service';
import { UtilService } from '../../../../services/util.service';

const COLA_MEDICA_FILTROS: FiltrosSeguimientoTriaje = {
  documento: '',
  numero_historia: '',
  motivo_consulta: '',
  estado: 'TRIADO',
  prioridad: '',
  personal: '',
  limite: 50,
};

@Component({
  selector: 'app-atencion-medica',
  imports: [CardGeneralComponent, TableComponent],
  templateUrl: './atencion-medica.component.html',
  styleUrl: './atencion-medica.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AtencionMedicaComponent {
  private readonly router = inject(Router);
  private readonly triajeService = inject(TriajeService);
  private readonly catalogoEmergenciaService = inject(CatalogoEmergenciaService);
  private readonly utilService = inject(UtilService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly colorPrioridad = new Map<string, string>();

  readonly atenciones = signal<SeguimientoTriaje[]>([]);
  readonly cargando = signal(false);

  readonly columns: TableColumn<SeguimientoTriaje>[] = [
    { key: 'codigo_episodio', label: 'Registro' },
    { key: 'fecha_hora_ingreso', label: 'Fecha y Hora' },
    { key: 'paciente.nombre_completo', label: 'Paciente' },
    { key: 'paciente.edad', label: 'Edad', align: 'center' },
    { key: 'motivo_consulta', label: 'Motivo de Consulta' },
    { key: 'area', label: 'Área' },
    {
      key: 'prioridad',
      label: 'Prioridad',
      align: 'center',
      badge: {
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
        texto: (_value, row) => row.estado_nombre || (row.fecha_hora_llamada_med ? 'En atención' : 'Triaje completado'),
        clases: (_value, row) => (row.estado_codigo === 'EATE' || row.fecha_hora_llamada_med ? 'success' : 'primary'),
        size: 'sm',
      },
    },
  ];

  readonly actions: TableRowAction<SeguimientoTriaje>[] = [
    {
      id: 'atender',
      label: 'Atender',
      title: 'Iniciar atención médica',
      icon: 'fa-solid fa-play',
      color: 'primary',
      variant: 'solid',
      iconOnly: true,
      visible: (row) => !row.fecha_hora_llamada_med,
    },
    {
      id: 'continuar',
      label: 'Continuar',
      title: 'Continuar atención médica',
      icon: 'fa-solid fa-arrow-right',
      color: 'primary',
      variant: 'solid',
      iconOnly: true,
      visible: (row) => !!row.fecha_hora_llamada_med,
    },
  ];

  constructor() {
    this.catalogoEmergenciaService.obtenerCatalogos(['niveles_triaje']).subscribe({
      next: ({ data }) => {
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
    this.iniciar_cola_en_tiempo_real();
  }

  private iniciar_cola_en_tiempo_real(): void {
    timer(0, 10000)
      .pipe(
        filter(() => !document.hidden),
        switchMap(() => this.triajeService.cola_medica(COLA_MEDICA_FILTROS)),
        takeUntilDestroyed(),
      )
      .subscribe({
        next: ({ data }) => {
          this.actualizar_atenciones_diferencial(data);
          this.cdr.markForCheck();
        },
        error: () => {},
      });
  }

  private actualizar_atenciones_diferencial(nuevas: SeguimientoTriaje[]): void {
    const actuales = this.atenciones();

    if (actuales.length !== nuevas.length) {
      this.atenciones.set(nuevas);
      return;
    }

    const mapaActuales = new Map(actuales.map((item) => [item.atencion_id, item]));
    let huboCambios = false;

    const actualizadas = nuevas.map((nueva) => {
      const anterior = mapaActuales.get(nueva.atencion_id);
      if (!anterior) {
        huboCambios = true;
        return nueva;
      }

      const cambioEstado =
        anterior.estado_nombre !== nueva.estado_nombre ||
        anterior.estado_codigo !== nueva.estado_codigo;
      const cambioMedico =
        anterior.medico !== nueva.medico ||
        anterior.fecha_hora_llamada_med !== nueva.fecha_hora_llamada_med;
      const cambioPrioridad = anterior.prioridad !== nueva.prioridad;

      if (cambioEstado || cambioMedico || cambioPrioridad) {
        huboCambios = true;
        return nueva;
      }

      return anterior;
    });

    if (huboCambios) {
      this.atenciones.set(actualizadas);
    }
  }

  ejecutar_accion(event: TableActionEvent<SeguimientoTriaje>): void {
    if (event.action === 'continuar') {
      void this.router.navigate(['/emergencia/atencion-medica', event.row.atencion_id]);
      return;
    }

    if (event.action !== 'atender') return;

    void this.router.navigate(['/emergencia/atencion-medica', event.row.atencion_id], {
      state: { iniciar_atencion: true },
    });
  }

  cargar_cola_medica(): void {
    if (this.cargando()) return;

    this.cargando.set(true);
    this.triajeService
      .cola_medica(COLA_MEDICA_FILTROS)
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: ({ data }) => this.atenciones.set(data),
        error: (error: { message?: string }) =>
          this.utilService.mostrar_error(
            error.message ?? 'No se pudo consultar la cola de Atención Médica.',
          ),
      });
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
}
