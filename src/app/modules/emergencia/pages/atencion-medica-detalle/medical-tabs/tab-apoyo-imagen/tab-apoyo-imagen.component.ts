import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  TemplateRef,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Observable, map } from 'rxjs';
import { AutoCompleteComponent } from '../../../../../../components/auto-complete/auto-complete.component';
import { BadgeComponent } from '../../../../../../components/badge/badge.component';
import { ButtonComponent } from '../../../../../../components/button/button.component';
import { CheckComponent } from '../../../../../../components/check/check.component';
import { InputTextComponent } from '../../../../../../components/input-text/input-text.component';
import { LabelComponent } from '../../../../../../components/label/label.component';
import { ModalComponent } from '../../../../../../components/modal/modal.component';
import { SelectComponent, SelectOption, SelectValue } from '../../../../../../components/select/select.component';
import { TableComponent } from '../../../../../../components/table/table.component';
import {
  TableCellContext,
  TableColumn,
} from '../../../../../../interfaces/util.interface';
import {
  CategoriaApoyoImagen,
  DetalleAtencionResponse,
  Diagnostico,
  OrdenImagen,
  PrioridadOrdenMedica,
  ServicioImagen,
} from '../../../../../../interfaces/emergencia/triaje.interface';
import { ImagenService } from '../../../../../../services/emergencia/imagen.service';
import { UtilService } from '../../../../../../services/util.service';

export interface GuardarApoyoImagenPayload {
  prioridad_id: number;
  diagnostico_id: number;
  servicio_codigo: string;
  requiere_contraste: boolean;
  datos_clinicos: string;
  observacion: string;
}

@Component({
  selector: 'app-tab-apoyo-imagen',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    ButtonComponent,
    BadgeComponent,
    LabelComponent,
    AutoCompleteComponent,
    TableComponent,
    CheckComponent,
    SelectComponent,
    InputTextComponent,
  ],
  templateUrl: './tab-apoyo-imagen.component.html',
  styleUrl: '../medical-tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabApoyoImagenComponent {
  private readonly imagenService = inject(ImagenService);
  private readonly utilService = inject(UtilService);

  readonly modal = viewChild<ModalComponent>('modal');
  readonly orden_impresion_apoyo = viewChild<ElementRef<HTMLElement>>('orden_impresion_apoyo');

  detalle = input<DetalleAtencionResponse | null>(null);
  ordenes_imagen = input<readonly OrdenImagen[]>([]);
  diagnosticos = input<readonly Diagnostico[]>([]);
  prioridades_orden = input<readonly PrioridadOrdenMedica[]>([]);
  habilitado = input<boolean>(false);
  cargando = input<boolean>(false);
  guardando = input<boolean>(false);
  pacienteNombre = input<string>('');
  pacienteHistoria = input<string>('');

  guardarSolicitud = output<GuardarApoyoImagenPayload>();

  private readonly estadoTpl = viewChild<TemplateRef<TableCellContext<OrdenImagen>>>('estadoTpl');
  private readonly accionesTpl = viewChild<TemplateRef<TableCellContext<OrdenImagen>>>('accionesTpl');

  readonly plantillasCelda = computed<
    Record<string, TemplateRef<TableCellContext<OrdenImagen>>>
  >(() => {
    const plantillas: Record<string, TemplateRef<TableCellContext<OrdenImagen>>> = {};
    const estado = this.estadoTpl();
    const acciones = this.accionesTpl();
    if (estado) plantillas['estado'] = estado;
    if (acciones) plantillas['acciones'] = acciones;
    return plantillas;
  });

  readonly columnasOrdenes: TableColumn<OrdenImagen>[] = [
    {
      key: 'area_nombre',
      label: 'ÁREA',
      formatter: (_val, fila) => fila.area_nombre || '-',
    },
    {
      key: 'servicio_nombre',
      label: 'ESTUDIO',
      formatter: (_val, fila) => fila.servicio_nombre || fila.servicio_codigo || '-',
    },
    {
      key: 'diagnostico_codigo',
      label: 'DIAGNÓSTICO',
      formatter: (_val, fila) => fila.diagnostico_codigo || '-',
    },
    {
      key: 'prioridad_nombre',
      label: 'PRIORIDAD',
      formatter: (_val, fila) => fila.prioridad_nombre || '-',
    },
    {
      key: 'estado',
      label: 'ESTADO',
    },
    {
      key: 'requiere_contraste',
      label: 'CONTRASTE',
      formatter: (_val, fila) => (fila.requiere_contraste ? 'Sí' : 'No'),
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

  readonly categoria_apoyo_imagen = signal<CategoriaApoyoImagen | null>(null);
  readonly servicio_imagen_seleccionado = signal<ServicioImagen | null>(null);
  readonly prioridad_apoyo_id = signal<number | null>(null);
  readonly diagnostico_apoyo_id = signal<number | null>(null);
  readonly datos_clinicos_apoyo = signal<string>('');
  readonly observacion_apoyo = signal<string>('');
  readonly requiere_contraste = signal<boolean>(false);

  readonly categorias_apoyo_imagen: {
    id: CategoriaApoyoImagen;
    nombre: string;
    icono: string;
    area_codigo: string;
  }[] = [
    { id: 'radiografias', nombre: 'Radiografías', icono: 'fa-solid fa-lungs', area_codigo: '012' },
    { id: 'ecografias', nombre: 'Ecografías', icono: 'fa-solid fa-wave-square', area_codigo: '004' },
    { id: 'tomografias', nombre: 'Tomografías', icono: 'fa-solid fa-brain', area_codigo: '014' },
    { id: 'resonancias', nombre: 'Resonancias', icono: 'fa-solid fa-magnet', area_codigo: '013' },
    { id: 'mamografias', nombre: 'Mamografías', icono: 'fa-solid fa-ribbon', area_codigo: '008' },
  ];

  readonly categoria_apoyo_imagen_actual = computed(
    () =>
      this.categorias_apoyo_imagen.find((item) => item.id === this.categoria_apoyo_imagen()) ??
      null,
  );

  readonly permite_contraste = computed(() => {
    const cat = this.categoria_apoyo_imagen();
    return cat === 'tomografias' || cat === 'resonancias';
  });

  seleccionar_categoria_apoyo_imagen(categoria: CategoriaApoyoImagen): void {
    this.categoria_apoyo_imagen.set(
      this.categoria_apoyo_imagen() === categoria ? null : categoria,
    );
    this.limpiar_formulario();
  }

  readonly buscar_servicio_imagen_datasource = (
    termino: string,
  ): Observable<readonly ServicioImagen[]> => {
    const categoria = this.categoria_apoyo_imagen_actual();

    return this.imagenService.buscar_servicios_imagen(termino).pipe(
      map((res: { data?: ServicioImagen[] }) => {
        const servicios = res.data ?? [];
        return categoria
          ? servicios.filter((servicio: ServicioImagen) => servicio.area_codigo === categoria.area_codigo)
          : servicios;
      }),
    );
  };

  mostrar_servicio_imagen = (servicio: ServicioImagen): string =>
    `${servicio.codigo} - ${servicio.nombre}`;

  seleccionar_servicio_imagen(servicio: ServicioImagen): void {
    this.servicio_imagen_seleccionado.set(servicio);
  }

  readonly prioridadesOptions = computed<SelectOption[]>(() => {
    return this.prioridades_orden().map((p) => ({
      value: p.prioridad_id,
      label: p.nombre,
    }));
  });

  readonly diagnosticosOptions = computed<SelectOption[]>(() => {
    return this.diagnosticos().map((d) => ({
      value: d.diagnostico_id,
      label: `${d.codigo} - ${d.descripcion}`,
    }));
  });

  actualizar_prioridad_valor(value: SelectValue): void {
    this.prioridad_apoyo_id.set(value ? Number(value) : null);
  }

  actualizar_diagnostico_valor(value: SelectValue): void {
    this.diagnostico_apoyo_id.set(value ? Number(value) : null);
  }

  actualizar_datos_clinicos_texto(value: string | number | null | undefined): void {
    this.datos_clinicos_apoyo.set(value !== null && value !== undefined ? String(value) : '');
  }

  actualizar_observacion_texto(value: string | number | null | undefined): void {
    this.observacion_apoyo.set(value !== null && value !== undefined ? String(value) : '');
  }

  actualizar_diagnostico(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.diagnostico_apoyo_id.set(value ? Number(value) : null);
  }

  actualizar_contraste(event: Event): void {
    this.requiere_contraste.set((event.target as HTMLInputElement).checked);
  }

  actualizar_contraste_check(checked: boolean): void {
    this.requiere_contraste.set(checked);
  }

  actualizar_datos_clinicos(event: Event): void {
    this.datos_clinicos_apoyo.set((event.target as HTMLInputElement).value);
  }

  actualizar_observacion(event: Event): void {
    this.observacion_apoyo.set((event.target as HTMLInputElement).value);
  }

  abrir_modal(): void {
    this.limpiar_formulario();
    this.modal()?.open();
  }

  cerrar_modal(): void {
    this.limpiar_formulario();
    this.modal()?.close();
  }

  limpiar_formulario(): void {
    this.servicio_imagen_seleccionado.set(null);
    this.prioridad_apoyo_id.set(null);
    this.diagnostico_apoyo_id.set(null);
    this.datos_clinicos_apoyo.set('');
    this.observacion_apoyo.set('');
    this.requiere_contraste.set(false);
  }

  guardar(): void {
    const servicio = this.servicio_imagen_seleccionado();
    const prioridadId = this.prioridad_apoyo_id();
    const diagnosticoId = this.diagnostico_apoyo_id();

    if (!servicio || prioridadId === null || diagnosticoId === null) {
      return;
    }

    this.guardarSolicitud.emit({
      prioridad_id: prioridadId,
      diagnostico_id: diagnosticoId,
      servicio_codigo: servicio.codigo,
      requiere_contraste: this.permite_contraste() ? this.requiere_contraste() : false,
      datos_clinicos: this.datos_clinicos_apoyo().trim(),
      observacion: this.observacion_apoyo().trim(),
    });

    this.limpiar_formulario();
    this.modal()?.close();
  }

  estado_badge_class(estado: string | null | undefined): string {
    return this.utilService.situacion_examen_badge_class(estado ?? '');
  }

  imprimir_orden(imagen_id?: number | null): void {
    const atencionId = this.detalle()?.atencion_id;
    if (!atencionId) {
      this.utilService.mostrar_alerta('No se identificó la atención médica para generar el PDF.', 'warning');
      return;
    }

    this.imagenService.descargar_reporte_pdf(atencionId, imagen_id, true).subscribe({
      next: (pdf: Blob) => {
        const url = window.URL.createObjectURL(pdf);
        window.open(url, '_blank');
      },
      error: () => {
        this.utilService.mostrar_error('No se pudo generar la orden de imágenes.');
      },
    });
  }
}
