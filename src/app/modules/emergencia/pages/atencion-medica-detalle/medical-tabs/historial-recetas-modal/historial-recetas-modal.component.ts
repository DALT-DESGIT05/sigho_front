import { Component, inject, input, output, signal, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { finalize } from 'rxjs';
import Swal from 'sweetalert2';
import { ModalComponent } from '../../../../../../components/modal/modal.component';
import { ButtonComponent } from '../../../../../../components/button/button.component';
import {
  HistorialReceta,
  HistorialRecetaDetalle,
} from '../../../../../../interfaces/emergencia/receta.interface';
import { RecetaEmergenciaService } from '../../../../../../services/emergencia/receta.service';

@Component({
  selector: 'app-historial-recetas-modal',
  standalone: true,
  imports: [ModalComponent, ButtonComponent, DatePipe],
  templateUrl: './historial-recetas-modal.component.html',
  styleUrl: './historial-recetas-modal.component.scss',
})
export class HistorialRecetasModalComponent {
  readonly modalHistorial = viewChild<ModalComponent>('modalHistorial');

  readonly atencion_id = input.required<number>();
  readonly codigo_farmacia = input.required<number>();

  readonly recetaImportada = output<void>();

  private readonly recetaService = inject(RecetaEmergenciaService);

  readonly data_historial_receta = signal<HistorialReceta[]>([]);
  readonly data_historial_receta_detalle = signal<HistorialRecetaDetalle[]>([]);
  readonly cargando = signal(false);

  codigo_receta_seleccionada = 0;

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

  seleccionar_receta(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
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
      .get_prescriptions_info(
        item.numregis?.toString() ?? '',
        this.codigo_farmacia(),
        fecha,
      )
      .subscribe({
        next: (res) => this.data_historial_receta_detalle.set(res.data ?? []),
        error: () => this.data_historial_receta_detalle.set([]),
      });
  }

  importar_receta(): void {
    if (this.codigo_receta_seleccionada === 0 || this.cargando()) return;

    Swal.fire({
      title: 'Historial de recetas',
      text: '¿Está seguro de importar los medicamentos de esta receta?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, importar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
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
              Swal.fire({
                title: 'Receta médica',
                text: res?.message ?? 'Receta importada exitosamente.',
                icon: 'success',
              });
              this.cerrar();
              this.recetaImportada.emit();
            },
            error: (err) => {
              Swal.fire({
                title: 'Error al importar',
                text: err?.message ?? 'No se pudo importar la receta previa.',
                icon: 'error',
              });
            },
          });
      }
    });
  }
}
