import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { ButtonComponent } from '../../../../../../components/button/button.component';
import { SelectComponent, SelectOption, SelectValue } from '../../../../../../components/select/select.component';
import { TableComponent } from '../../../../../../components/table/table.component';
import { TextAreaComponent } from '../../../../../../components/text-area/text-area.component';
import { TableCellContext, TableColumn } from '../../../../../../interfaces/util.interface';
import {
  Farmacia,
  RecetaMedica,
} from '../../../../../../interfaces/emergencia/receta.interface';
import {
  DetalleAtencionResponse,
  Diagnostico,
} from '../../../../../../interfaces/emergencia/triaje.interface';
import { RecetaEmergenciaService } from '../../../../../../services/emergencia/receta.service';
import { UtilService } from '../../../../../../services/util.service';
import { FormularioRecetaMedicamentoComponent } from '../formulario-receta-medicamento/formulario-receta-medicamento.component';
import { HistorialRecetasModalComponent } from '../historial-recetas-modal/historial-recetas-modal.component';

@Component({
  selector: 'app-tab-receta',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    SelectComponent,
    TableComponent,
    TextAreaComponent,
    FormularioRecetaMedicamentoComponent,
    HistorialRecetasModalComponent,
  ],
  templateUrl: './tab-receta.component.html',
  styleUrl: '../medical-tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabRecetaComponent {
  private readonly utilService = inject(UtilService);
  private readonly recetaService = inject(RecetaEmergenciaService);

  readonly formularioReceta =
    viewChild<FormularioRecetaMedicamentoComponent>('formularioReceta');
  readonly modalHistorialRecetas =
    viewChild<HistorialRecetasModalComponent>('modalHistorialRecetas');

  readonly detalle = input.required<DetalleAtencionResponse>();
  readonly diagnosticos = input<readonly Diagnostico[]>([]);

  readonly farmacias = signal<Farmacia[]>([]);
  readonly data_receta = signal<RecetaMedica[]>([]);
  readonly cargando_farmacias = signal(false);
  readonly cargando_receta = signal(false);
  readonly guardando_indicacion = signal(false);
  readonly generando_receta = signal(false);
  readonly imprimiendo_receta = signal(false);

  codigo_farmacia = signal('');
  indicaciones_generales = signal('');
  existe_receta_imprimir = signal(false);

  actualizar_indicaciones_generales(valor: string | number | null | undefined): void {
    this.indicaciones_generales.set(valor == null ? '' : String(valor));
  }

  readonly farmaciasOptions = computed<SelectOption[]>(() => {
    return this.farmacias().map((item) => ({
      value: item.idfarm,
      label: item.nomfarm,
    }));
  });

  private readonly accionesTpl =
    viewChild<TemplateRef<TableCellContext<RecetaMedica>>>('accionesTpl');

  readonly plantillasCelda = computed<
    Record<string, TemplateRef<TableCellContext<RecetaMedica>>>
  >(() => {
    const plantillas: Record<string, TemplateRef<TableCellContext<RecetaMedica>>> = {};
    const acc = this.accionesTpl();
    if (acc) plantillas['acciones'] = acc;
    return plantillas;
  });

  readonly columnasReceta: TableColumn<RecetaMedica>[] = [
    {
      key: 'codcie10',
      label: 'CIE-10',
      formatter: (_val, fila) => fila.codcie10 || '-',
    },
    {
      key: 'item',
      label: 'ITEM',
      formatter: (_val, fila) => fila.item || '-',
    },
    {
      key: 'via',
      label: 'VÍA',
      formatter: (_val, fila) => fila.via || '-',
    },
    {
      key: 'frecuencia',
      label: 'FRECUENCIA',
      formatter: (_val, fila) => fila.frecuencia || '-',
    },
    {
      key: 'cantidad',
      label: 'CANTIDAD',
      formatter: (_val, fila) => String(fila.cantidad ?? '-'),
    },
    {
      key: 'dosis',
      label: 'DOSIS',
      formatter: (_val, fila) => fila.dosis || '-',
    },
    {
      key: 'duracion',
      label: 'DURACIÓN (DÍAS)',
      formatter: (_val, fila) => String(fila.duracion ?? '-'),
    },
    {
      key: 'indicacion',
      label: 'INDICACIÓN',
      formatter: (_val, fila) => fila.indicacion || '-',
    },
    {
      key: 'ult_disp',
      label: 'ULT. DISP.',
      formatter: (_val, fila) => fila.ult_disp || '-',
    },
    {
      key: 'acciones',
      label: 'ACCIONES',
      align: 'center',
    },
  ];

  constructor() {
    this.cargar_farmacias();
  }

  cargar_farmacias(): void {
    this.cargando_farmacias.set(true);
    this.recetaService
      .list_farmacias()
      .pipe(finalize(() => this.cargando_farmacias.set(false)))
      .subscribe({
        next: (res: { data?: Farmacia[] }) => this.farmacias.set(res.data ?? []),
        error: () => this.farmacias.set([]),
      });
  }

  actualizar_farmacia_valor(value: SelectValue): void {
    this.codigo_farmacia.set(value ? String(value) : '');
    this.listar_receta();
  }

  listar_receta(): void {
    const cod = this.codigo_farmacia();
    if (!cod) {
      this.data_receta.set([]);
      this.indicaciones_generales.set('');
      this.existe_receta_imprimir.set(false);
      return;
    }

    this.cargando_receta.set(true);
    const fecha = this.detalle().fecha_hora_ingreso
      ? this.detalle().fecha_hora_ingreso.split(' ')[0]
      : null;

    this.recetaService
      .list_receta(this.detalle().atencion_id, Number(cod), fecha)
      .pipe(finalize(() => this.cargando_receta.set(false)))
      .subscribe({
        next: (res: { data?: any }) => {
          this.data_receta.set(res.data?.data ?? []);
          this.indicaciones_generales.set(res.data?.indicaciones_generales ?? '');
          this.verificar_receta();
        },
        error: () => {
          this.data_receta.set([]);
        },
      });
  }

  verificar_receta(): void {
    const cod = this.codigo_farmacia();
    if (!cod) return;

    const fecha = this.detalle().fecha_hora_ingreso
      ? this.detalle().fecha_hora_ingreso.split(' ')[0]
      : null;

    this.recetaService
      .verificar_receta(this.detalle().atencion_id, Number(cod), fecha)
      .subscribe({
        next: (res: { data?: any }) => {
          this.existe_receta_imprimir.set(res.data?.status === 'ok');
        },
        error: () => {
          this.existe_receta_imprimir.set(false);
        },
      });
  }

  abrir_nueva_receta(): void {
    this.formularioReceta()?.abrir();
  }

  abrir_edicion_receta(idtemrec: number, event: Event): void {
    event.preventDefault();
    this.formularioReceta()?.abrir_edicion(idtemrec);
  }

  abrir_modal_historial_recetas(): void {
    this.modalHistorialRecetas()?.abrir();
  }

  eliminar_medicamento_receta(idtemrec: number, event: Event): void {
    event.preventDefault();
    Swal.fire({
      title: 'Eliminar medicamento',
      text: '¿Está seguro de eliminar este medicamento de la receta?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.recetaService.eliminar_medicamento(idtemrec).subscribe({
          next: () => {
            this.utilService.mostrar_alerta(
              'Medicamento eliminado correctamente.',
              'success',
            );
            this.listar_receta();
          },
          error: (err: any) => {
            this.utilService.mostrar_error(
              err?.message ?? 'No se pudo eliminar el medicamento.',
            );
          },
        });
      }
    });
  }

  guardar_indicacion_general(): void {
    const cod = this.codigo_farmacia();
    if (!cod || this.existe_receta_imprimir()) return;

    const fecha = this.detalle().fecha_hora_ingreso
      ? this.detalle().fecha_hora_ingreso.split(' ')[0]
      : null;

    this.guardando_indicacion.set(true);
    this.recetaService
      .add_indicacion_general(
        this.detalle().atencion_id,
        Number(cod),
        this.indicaciones_generales(),
        fecha,
      )
      .pipe(finalize(() => this.guardando_indicacion.set(false)))
      .subscribe({
        next: () => {
          this.utilService.mostrar_alerta(
            'Indicaciones generales actualizadas.',
            'success',
          );
        },
        error: (err: any) => {
          this.utilService.mostrar_error(
            err?.message ?? 'No se pudo actualizar las indicaciones generales.',
          );
        },
      });
  }

  generar_receta(): void {
    if (this.data_receta().length === 0 || this.generando_receta()) return;

    Swal.fire({
      title: 'Generar Receta',
      text: '¿Está seguro de generar la receta médica? Una vez generada no podrá editarse salvo habilitar edición.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, generar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.generando_receta.set(true);
        this.recetaService
          .insertar_receta(this.detalle().atencion_id)
          .pipe(finalize(() => this.generando_receta.set(false)))
          .subscribe({
            next: () => {
              this.utilService.mostrar_alerta(
                'Receta médica generada exitosamente.',
                'success',
              );
              this.listar_receta();
            },
            error: (err: any) => {
              this.utilService.mostrar_error(
                err?.message ?? 'No se pudo generar la receta médica.',
              );
            },
          });
      }
    });
  }

  habilitar_edicion_receta(): void {
    const cod = this.codigo_farmacia();
    if (!cod) return;

    const fecha = this.detalle().fecha_hora_ingreso
      ? this.detalle().fecha_hora_ingreso.split(' ')[0]
      : null;

    this.recetaService
      .enable_editing_receta(
        this.detalle().atencion_id,
        Number(cod),
        fecha,
      )
      .subscribe({
        next: () => {
          this.existe_receta_imprimir.set(false);
          this.utilService.mostrar_alerta(
            'Edición de receta habilitada.',
            'success',
          );
          this.listar_receta();
        },
        error: (err: any) => {
          this.utilService.mostrar_error(
            err?.message ?? 'No se pudo habilitar la edición de la receta.',
          );
        },
      });
  }

  imprimir_receta_medica(): void {
    const cod = this.codigo_farmacia();
    if (this.imprimiendo_receta() || !cod) return;

    const fecha = this.detalle().fecha_hora_ingreso
      ? this.detalle().fecha_hora_ingreso.split(' ')[0]
      : null;

    this.imprimiendo_receta.set(true);
    this.recetaService
      .imprimir_receta(this.detalle().atencion_id, Number(cod), fecha)
      .pipe(finalize(() => this.imprimiendo_receta.set(false)))
      .subscribe({
        next: (blob: Blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.download = `Receta_${this.detalle().atencion_id}.pdf`;
          a.href = url;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: () => {
          this.utilService.mostrar_error('No se pudo descargar el PDF de la receta.');
        },
      });
  }
}
