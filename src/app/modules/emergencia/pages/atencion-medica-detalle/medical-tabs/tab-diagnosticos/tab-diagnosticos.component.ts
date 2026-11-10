import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { Observable, map } from 'rxjs';
import { AutoCompleteComponent } from '../../../../../../components/auto-complete/auto-complete.component';
import { ButtonComponent } from '../../../../../../components/button/button.component';
import { LabelComponent } from '../../../../../../components/label/label.component';
import { ModalComponent } from '../../../../../../components/modal/modal.component';
import {
  Diagnostico,
  DiagnosticoCatalogo,
  TipoDiagnostico,
} from '../../../../../../interfaces/emergencia/triaje.interface';
import { DiagnosticoService } from '../../../../../../services/emergencia/diagnostico.service';
import { UtilService } from '../../../../../../services/util.service';

export interface DiagnosticoItemPayload {
  cie10_id: number;
  tipo_id: number;
  observacion: string;
}

interface DiagnosticoTemporalItem {
  cie10_id: number;
  codigo: string;
  descripcion: string;
  tipo_id: number;
  tipo_nombre: string;
  observacion: string;
}

@Component({
  selector: 'app-tab-diagnosticos',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    ButtonComponent,
    LabelComponent,
    AutoCompleteComponent,
  ],
  templateUrl: './tab-diagnosticos.component.html',
  styleUrl: '../medical-tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabDiagnosticosComponent {
  private readonly diagnosticoService = inject(DiagnosticoService);
  private readonly utilService = inject(UtilService);

  readonly modal = viewChild<ModalComponent>('modal');

  // Inputs reactivos
  diagnosticos = input<readonly Diagnostico[]>([]);
  tipos_diagnostico = input<readonly TipoDiagnostico[]>([]);
  habilitado = input<boolean>(false);
  cargando = input<boolean>(false);
  guardando = input<boolean>(false);

  // Outputs de eventos
  eliminar = output<number>();
  guardarDiagnosticos = output<DiagnosticoItemPayload[]>();

  // Estado interno manejado puramente con Signals
  readonly diagnostico_seleccionado = signal<DiagnosticoCatalogo | null>(null);
  readonly tipo_diagnostico_id = signal<number | null>(null);
  readonly observacion_diagnostico = signal<string>('');
  readonly diagnosticos_temporales = signal<DiagnosticoTemporalItem[]>([]);

  readonly buscar_diagnostico_datasource = (
    termino: string,
  ): Observable<readonly DiagnosticoCatalogo[]> => {
    return this.diagnosticoService
      .buscar_diagnosticos(termino)
      .pipe(map((res) => res.data ?? []));
  };

  mostrar_diagnostico = (diagnostico: DiagnosticoCatalogo): string =>
    `${diagnostico.codigo} - ${diagnostico.descripcion}`;

  seleccionar_diagnostico(diagnostico: DiagnosticoCatalogo): void {
    this.diagnostico_seleccionado.set(diagnostico);
  }

  actualizar_tipo_diagnostico(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.tipo_diagnostico_id.set(value ? Number(value) : null);
  }

  actualizar_observacion(event: Event): void {
    this.observacion_diagnostico.set((event.target as HTMLInputElement).value);
  }

  abrir_modal(): void {
    this.diagnosticos_temporales.set([]);
    this.limpiar_formulario();
    this.modal()?.open();
  }

  cerrar_modal(): void {
    this.diagnosticos_temporales.set([]);
    this.limpiar_formulario();
    this.modal()?.close();
  }

  limpiar_formulario(): void {
    this.diagnostico_seleccionado.set(null);
    this.tipo_diagnostico_id.set(null);
    this.observacion_diagnostico.set('');
  }

  agregar_temporal(): void {
    const seleccionado = this.diagnostico_seleccionado();
    const tipoId = this.tipo_diagnostico_id();

    if (!seleccionado || tipoId === null) {
      return;
    }

    const temporales = this.diagnosticos_temporales();
    const yaExiste = temporales.some((item) => item.cie10_id === seleccionado.cie10_id);

    if (yaExiste) {
      this.utilService.mostrar_error('El diagnóstico ya se encuentra agregado en la lista.');
      return;
    }

    const tipoObj = this.tipos_diagnostico().find((t) => t.tipo_id === tipoId);

    const nuevoItem: DiagnosticoTemporalItem = {
      cie10_id: seleccionado.cie10_id,
      codigo: seleccionado.codigo,
      descripcion: seleccionado.descripcion,
      tipo_id: tipoId,
      tipo_nombre: tipoObj?.nombre ?? 'Desconocido',
      observacion: this.observacion_diagnostico().trim(),
    };

    this.diagnosticos_temporales.set([...temporales, nuevoItem]);
    this.limpiar_formulario();
  }

  quitar_temporal(cie10_id: number): void {
    this.diagnosticos_temporales.set(
      this.diagnosticos_temporales().filter((item) => item.cie10_id !== cie10_id),
    );
  }

  guardar(): void {
    const temporales = this.diagnosticos_temporales();
    if (temporales.length === 0) {
      return;
    }

    this.guardarDiagnosticos.emit(
      temporales.map((d) => ({
        cie10_id: d.cie10_id,
        tipo_id: d.tipo_id,
        observacion: d.observacion,
      })),
    );

    this.diagnosticos_temporales.set([]);
    this.limpiar_formulario();
    this.modal()?.close();
  }
}
