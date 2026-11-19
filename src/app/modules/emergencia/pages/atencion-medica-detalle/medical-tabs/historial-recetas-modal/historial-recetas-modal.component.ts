import { Component, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { finalize } from 'rxjs';
import { UtilService } from '../../../../../../services/util.service';
import { ModalComponent } from '../../../../../../components/modal/modal.component';
import { ButtonComponent } from '../../../../../../components/button/button.component';
import { SelectComponent, SelectValue } from '../../../../../../components/select/select.component';
import { TableComponent } from '../../../../../../components/table/table.component';
import { TableColumn } from '../../../../../../interfaces/util.interface';
import { SelectOption } from '../../../../../../components/select/select.component';
import {
  HistorialReceta,
  HistorialRecetaDetalle,
} from '../../../../../../interfaces/farmacia/medicamento.interface';
import { MedicamentoService } from '../../../../../../services/farmacia/medicamento.service';

@Component({
  selector: 'app-historial-recetas-modal',
  standalone: true,
  imports: [ModalComponent, ButtonComponent, SelectComponent, TableComponent],
  templateUrl: './historial-recetas-modal.component.html',
  styleUrl: './historial-recetas-modal.component.scss',
})
export class HistorialRecetasModalComponent {
  readonly modalHistorial = viewChild<ModalComponent>('modalHistorial');

  readonly atencion_id = input.required<number>();
  readonly codigo_farmacia = input.required<number>();

  readonly recetaImportada = output<void>();

  private readonly recetaService = inject(MedicamentoService);
  private readonly utilService = inject(UtilService);
  private readonly datePipe = new DatePipe('en-US');

  readonly data_historial_receta = signal<HistorialReceta[]>([]);
  readonly data_historial_receta_detalle = signal<HistorialRecetaDetalle[]>([]);
  readonly cargando = signal(false);

  codigo_receta_seleccionada = 0;

  readonly recetasOptions = computed<SelectOption[]>(() => {
    return this.data_historial_receta().map((item) => {
      const fecha = this.datePipe.transform(item.fecaten, 'dd/MM/yyyy') || item.fecaten;
      return {
        value: item.idrec,
        label: `${fecha} (Reg: ${item.numregis})`,
      };
    });
  });

  readonly columnasDetalle: TableColumn<HistorialRecetaDetalle>[] = [
    {
      key: 'item',
      label: 'ITEM',
      formatter: (_val, fila) => fila.item || '-',
    },
    {
      key: 'indicaciones',
      label: 'INDICACIONES',
      formatter: (_val, fila) => fila.indicaciones || '-',
    },
    {
      key: 'forma',
      label: 'FORMA',
      formatter: (_val, fila) => fila.forma || '-',
    },
    {
      key: 'cantidad',
      label: 'CANT.',
      formatter: (_val, fila) => String(fila.cantidad ?? '-'),
    },
    {
      key: 'dosis',
      label: 'DOSIS',
      formatter: (_val, fila) => fila.dosis || '-',
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
      key: 'duracion',
      label: 'DURACIÓN',
      formatter: (_val, fila) => String(fila.duracion ?? '-'),
    },
  ];

  abrir(): void {
    this.codigo_receta_seleccionada = 0;
    this.data_historial_receta_detalle.set([]);
    this.modalHistorial()?.open();
    this.cargar_historial();
  }

  cerrar(): void {
    this.modalHistorial()?.close();
  }

  cargar_historial(): void {
    this.cargando.set(true);
    this.recetaService
      .list_prescriptions_previous(this.atencion_id(), this.codigo_farmacia())
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (res) => this.data_historial_receta.set(res.data ?? []),
        error: () => this.data_historial_receta.set([]),
      });
  }

  seleccionar_receta_valor(value: SelectValue): void {
    this.codigo_receta_seleccionada = value ? Number(value) : 0;

    if (!this.codigo_receta_seleccionada) {
      this.data_historial_receta_detalle.set([]);
      return;
    }

    const item = this.data_historial_receta().find(
      (r) => r.idrec === this.codigo_receta_seleccionada,
    );
    if (!item) return;

    const fecha = item.fecaten ? new Date(item.fecaten).toISOString().split('T')[0] : null;

    this.recetaService
      .get_prescriptions_info(item.numregis?.toString() ?? '', this.codigo_farmacia(), fecha)
      .subscribe({
        next: (res) => this.data_historial_receta_detalle.set(res.data ?? []),
        error: () => this.data_historial_receta_detalle.set([]),
      });
  }

  async importar_receta(): Promise<void> {
    if (this.codigo_receta_seleccionada === 0 || this.cargando()) return;

    const confirmado = await this.utilService.confirmar_accion({
      title: '¿Importar medicamentos?',
      text: '¿Está seguro de importar los medicamentos de esta receta?',
      icon: 'question',
      confirmButtonText: 'Sí, importar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#6c757d',
    });
    if (!confirmado) return;

    this.cargando.set(true);
    this.recetaService
      .store_receta_from_previous(
        this.codigo_receta_seleccionada,
        this.atencion_id(),
        this.codigo_farmacia(),
      )
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: (res) => {
          this.utilService.mostrar_alerta(res?.message ?? 'Receta importada exitosamente.', 'success');
          this.cerrar();
          this.recetaImportada.emit();
        },
        error: (err) => {
          this.utilService.mostrar_error(err?.message ?? 'No se pudo importar la receta previa.');
        },
      });
  }
}
