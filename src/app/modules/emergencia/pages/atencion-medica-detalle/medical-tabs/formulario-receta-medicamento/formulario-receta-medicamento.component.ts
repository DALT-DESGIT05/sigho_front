import { Component, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, map, Observable } from 'rxjs';
import Swal from 'sweetalert2';
import { ModalComponent } from '../../../../../../components/modal/modal.component';
import { ButtonComponent } from '../../../../../../components/button/button.component';
import { AutoCompleteComponent } from '../../../../../../components/auto-complete/auto-complete.component';
import { InputTextComponent } from '../../../../../../components/input-text/input-text.component';
import { SelectComponent } from '../../../../../../components/select/select.component';
import { TextAreaComponent } from '../../../../../../components/text-area/text-area.component';
import { Diagnostico } from '../../../../../../interfaces/emergencia/triaje.interface';
import {
  Dosis,
  Frecuencia,
  Medicamento,
  ViaAdministracion,
} from '../../../../../../interfaces/emergencia/receta.interface';
import { RecetaEmergenciaService } from '../../../../../../services/emergencia/receta.service';

@Component({
  selector: 'app-formulario-receta-medicamento',
  standalone: true,
  imports: [
    ModalComponent,
    ButtonComponent,
    AutoCompleteComponent,
    FormsModule,
    InputTextComponent,
    SelectComponent,
    TextAreaComponent,
  ],
  templateUrl: './formulario-receta-medicamento.component.html',
  styleUrl: './formulario-receta-medicamento.component.scss',
})
export class FormularioRecetaMedicamentoComponent {
  readonly modalReceta = viewChild<ModalComponent>('modalReceta');

  readonly atencion_id = input.required<number>();
  readonly codigo_farmacia = input<string>('');
  readonly diagnosticos = input<readonly Diagnostico[]>([]);

  readonly recetaGuardada = output<void>();

  private readonly recetaService = inject(RecetaEmergenciaService);

  readonly data_frecuencia = signal<Frecuencia[]>([]);
  readonly data_dosis = signal<Dosis[]>([]);
  readonly data_via_administracion = signal<ViaAdministracion[]>([]);

  readonly modo_edicion = signal(false);
  readonly idtemrec_edicion = signal(0);
  readonly cargando_edicion = signal(false);
  readonly guardando = signal(false);

  medicamento_seleccionado = signal<Medicamento | null>(null);
  codigo_frecuencia = '';
  duracion = '';
  codigo_dosis = '';
  cantidad = '';
  codigo_via_administracion = '';
  codigo_medicamento = '';
  codigo_diagnostico = '';
  indicacion = '';

  readonly diagnosticos_opciones = computed(() => {
    return this.diagnosticos().map((d) => ({
      codigo: d.codigo,
      nombre: `${d.codigo} - ${d.descripcion}`,
    }));
  });

  abrir(): void {
    this.limpiar_formulario();
    this.modo_edicion.set(false);
    this.idtemrec_edicion.set(0);
    this.cargar_posologia();
    this.modalReceta()?.open();
  }

  abrir_edicion(idtemrec: number): void {
    this.limpiar_formulario();
    this.modo_edicion.set(true);
    this.idtemrec_edicion.set(idtemrec);
    this.cargar_posologia();
    this.modalReceta()?.open();
    this.cargar_datos_edicion(idtemrec);
  }

  cerrar(): void {
    this.modalReceta()?.close();
    this.limpiar_formulario();
  }

  readonly buscar_medicamentos = (texto: string): Observable<readonly Medicamento[]> => {
    return this.recetaService
      .list_medicamentos_by_texto(texto, Number(this.codigo_farmacia()))
      .pipe(map((res) => res.data ?? []));
  };

  seleccionar_medicamento(medicamento: Medicamento): void {
    this.codigo_medicamento = medicamento.codigo_medicamento;
    this.medicamento_seleccionado.set(medicamento);
  }

  cargar_posologia(): void {
    if (this.data_frecuencia().length === 0) {
      this.recetaService.list_frecuencia().subscribe({
        next: (res) => this.data_frecuencia.set(res.data ?? []),
      });
    }

    if (this.data_dosis().length === 0) {
      this.recetaService.list_dosis().subscribe({
        next: (res) => this.data_dosis.set(res.data ?? []),
      });
    }

    if (this.data_via_administracion().length === 0) {
      this.recetaService.list_via_administracion().subscribe({
        next: (res) => this.data_via_administracion.set(res.data ?? []),
      });
    }
  }

  cargar_datos_edicion(idtemrec: number): void {
    this.cargando_edicion.set(true);
    this.recetaService
      .get_receta_medicamento(idtemrec)
      .pipe(finalize(() => this.cargando_edicion.set(false)))
      .subscribe({
        next: (res) => {
          const item = res.data;
          if (!item) return;

          this.codigo_diagnostico = item.codcie10 ?? '';
          this.codigo_medicamento = item.iditem ? item.iditem.toString() : '';
          this.duracion = item.durtrat ? item.durtrat.toString() : '';
          this.codigo_dosis = item.durdosis ? item.durdosis.toString() : '';
          this.codigo_frecuencia = item.durfrec ? item.durfrec.toString() : '';
          this.cantidad = item.cant ? item.cant.toString() : '';
          this.indicacion = item.desindic ?? '';
          this.codigo_via_administracion = item.tipoadmi ? item.tipoadmi.toString() : '';

          if (item.iditem) {
            this.medicamento_seleccionado.set({
              codigo_medicamento: item.iditem.toString(),
              nombre_medicamento: `Item #${item.iditem}`,
              stock: 0,
              petit: '',
              unidad_medida: '',
              color_celda: '',
              codigo_farmacia: Number(this.codigo_farmacia()),
              nombre_farmacia: '',
            });
          }
        },
        error: (err) => {
          Swal.fire({
            title: 'Receta médica',
            text: err?.message ?? 'No se pudo cargar la prescripción para edición.',
            icon: 'error',
          });
          this.cerrar();
        },
      });
  }

  formulario_valido(): boolean {
    return !!(
      this.atencion_id() &&
      this.codigo_farmacia() &&
      this.codigo_medicamento &&
      this.codigo_diagnostico &&
      this.duracion &&
      this.codigo_dosis &&
      this.codigo_frecuencia &&
      this.cantidad &&
      this.codigo_via_administracion &&
      this.indicacion.trim()
    );
  }

  guardar_medicamento(): void {
    if (!this.formulario_valido() || this.guardando()) return;

    this.guardando.set(true);

    const payload = {
      atencion_id: this.atencion_id(),
      codigo_diagnostico: this.codigo_diagnostico,
      codigo_medicamento: this.codigo_medicamento,
      duracion: Number(this.duracion),
      dosis: this.codigo_dosis,
      frecuencia: this.codigo_frecuencia,
      cantidad: Number(this.cantidad),
      indicacion: this.indicacion.trim(),
      via_administracion: this.codigo_via_administracion,
      codigo_farmacia: Number(this.codigo_farmacia()),
    };

    const peticion = this.modo_edicion()
      ? this.recetaService.update_medicamento(this.idtemrec_edicion(), payload)
      : this.recetaService.store_medicamento(payload);

    peticion.pipe(finalize(() => this.guardando.set(false))).subscribe({
      next: () => {
        Swal.fire({
          title: 'Prescripción médica',
          text: this.modo_edicion()
            ? 'Medicamento actualizado con éxito.'
            : 'Medicamento agregado a la receta.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
        this.cerrar();
        this.recetaGuardada.emit();
      },
      error: (err) => {
        Swal.fire({
          title: 'Error al guardar prescripción',
          text: err?.message ?? 'Ocurrió un error al guardar el medicamento.',
          icon: 'error',
        });
      },
    });
  }

  limpiar_formulario(): void {
    this.codigo_medicamento = '';
    this.medicamento_seleccionado.set(null);
    this.codigo_frecuencia = '';
    this.duracion = '';
    this.codigo_dosis = '';
    this.cantidad = '';
    this.codigo_via_administracion = '';
    this.codigo_diagnostico = '';
    this.indicacion = '';
    this.guardando.set(false);
  }
}
