import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { ButtonComponent } from '../../../../../../components/button/button.component';
import { CheckToggleComponent } from '../../../../../../components/check-toggle/check-toggle.component';
import { RadioComponent } from '../../../../../../components/radio/radio.component';
import { TextAreaComponent } from '../../../../../../components/text-area/text-area.component';
import {
  DetalleAtencionResponse,
  EstadoExamenRegional,
  EvaluacionMedicaData,
  ExamenRegional,
} from '../../../../../../interfaces/emergencia/triaje.interface';

@Component({
  selector: 'app-tab-evaluacion',
  standalone: true,
  imports: [CommonModule, ButtonComponent, CheckToggleComponent, RadioComponent, TextAreaComponent],
  templateUrl: './tab-evaluacion.component.html',
  styleUrl: '../medical-tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabEvaluacionComponent {
  readonly detalle = input.required<DetalleAtencionResponse>();
  readonly formulario = input.required<EvaluacionMedicaData>();
  readonly examenes_regionales = input<readonly ExamenRegional[]>([]);
  readonly estados_examen_regional = input<readonly EstadoExamenRegional[]>([]);
  readonly cargando_examenes_regionales = input(false);
  readonly guardando = input(false);
  readonly validacion_solicitada = input(false);
  readonly evaluacion_registrada = input(false);

  readonly actualizarCampo = output<{ campo: keyof EvaluacionMedicaData; event: Event }>();
  readonly tipoRegionalActualizado = output<1 | 2>();
  readonly solicitarGuardado = output<Event>();

  seleccionar_tipo_regional(tipo: 1 | 2): void {
    if (this.evaluacion_registrada()) return;
    this.tipoRegionalActualizado.emit(tipo);
  }

  seleccionar_estado_regional(
    examen: ExamenRegional,
    tipo: 'CONSERVADO' | 'PATOLOGICO' | 'NO_EVALUADO',
    event: Event,
  ): void {
    const seleccionado = (event.target as HTMLInputElement).checked;

    if (!seleccionado) {
      if (examen.estado_tipo === tipo) {
        examen.estado_id = null;
        examen.estado_codigo = null;
        examen.estado_nombre = null;
        examen.estado_tipo = null;
      }
      return;
    }

    const estado = this.estados_examen_regional().find((item) => item.estado_tipo === tipo);
    examen.estado_id = estado?.estado_id ?? null;
    examen.estado_codigo = estado?.estado_codigo ?? null;
    examen.estado_nombre = estado?.estado_nombre ?? null;
    examen.estado_tipo = tipo;

    if (tipo === 'NO_EVALUADO') {
      examen.observacion = null;
    }
  }

  actualizar_observacion_regional(examen: ExamenRegional, event: Event): void {
    examen.observacion = (event.target as HTMLInputElement).value;
  }

  alternar_todos_regional(tipo: 'CONSERVADO' | 'PATOLOGICO' | 'NO_EVALUADO'): void {
    const todosMarcados = this.examenes_regionales().every(
      (examen) => examen.estado_tipo === tipo,
    );

    const estado = this.estados_examen_regional().find((item) => item.estado_tipo === tipo);

    for (const examen of this.examenes_regionales()) {
      if (!todosMarcados) {
        examen.estado_id = estado?.estado_id ?? null;
        examen.estado_codigo = estado?.estado_codigo ?? null;
        examen.estado_nombre = estado?.estado_nombre ?? null;
        examen.estado_tipo = tipo;
        if (tipo === 'NO_EVALUADO') {
          examen.observacion = null;
        }
      } else if (examen.estado_tipo === tipo) {
        examen.estado_id = null;
        examen.estado_codigo = null;
        examen.estado_nombre = null;
        examen.estado_tipo = null;
      }
    }
  }

  actualizar(campo: keyof EvaluacionMedicaData, event: Event): void {
    this.actualizarCampo.emit({ campo, event });
  }

  actualizar_valor_campo(campo: keyof EvaluacionMedicaData, valor: string | number | null | undefined): void {
    const fakeEvent = {
      target: { value: valor == null ? '' : String(valor) } as HTMLInputElement,
    } as unknown as Event;
    this.actualizarCampo.emit({ campo, event: fakeEvent });
  }

  campo_invalido(campo: keyof EvaluacionMedicaData): boolean {
    if (!this.validacion_solicitada()) return false;
    return !String(this.formulario()[campo] ?? '').trim();
  }

  clasificacion_regional_invalida(examen: ExamenRegional): boolean {
    return this.validacion_solicitada() && examen.estado_id === null;
  }

  observacion_regional_invalida(examen: ExamenRegional): boolean {
    return (
      this.validacion_solicitada() &&
      examen.estado_tipo === 'PATOLOGICO' &&
      !examen.observacion?.trim()
    );
  }

  texto_observacion_regional(examen: ExamenRegional): string {
    return examen.estado_tipo === 'NO_EVALUADO'
      ? 'No aplica observación'
      : 'Observación (requerido si es patológico)';
  }
}
