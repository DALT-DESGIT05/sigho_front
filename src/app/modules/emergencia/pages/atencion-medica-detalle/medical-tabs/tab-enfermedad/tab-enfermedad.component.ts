import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { ButtonComponent } from '../../../../../../components/button/button.component';
import { CheckToggleComponent } from '../../../../../../components/check-toggle/check-toggle.component';
import {
  DetalleAtencionResponse,
  EvaluacionMedicaData,
  FuncionBiologica,
} from '../../../../../../interfaces/emergencia/triaje.interface';

@Component({
  selector: 'app-tab-enfermedad',
  standalone: true,
  imports: [CommonModule, ButtonComponent, CheckToggleComponent],
  templateUrl: './tab-enfermedad.component.html',
  styleUrl: '../medical-tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabEnfermedadComponent {
  // Inputs
  readonly detalle = input.required<DetalleAtencionResponse>();
  readonly formulario = input.required<EvaluacionMedicaData>();
  readonly funciones_biologicas = input<readonly FuncionBiologica[]>([]);
  readonly cargando_funciones_biologicas = input(false);
  readonly guardando = input(false);
  readonly validacion_solicitada = input(false);

  // Outputs
  readonly actualizarCampo = output<{ campo: keyof EvaluacionMedicaData; event: Event }>();
  readonly solicitarGuardado = output<Event>();

  alternar_todos_funcion(estado: 'CONSER' | 'AUMEN' | 'DISMIN'): void {
    const todosMarcados = this.funciones_biologicas().every(
      (funcion) => funcion.estado_codigo === estado,
    );

    for (const funcion of this.funciones_biologicas()) {
      if (!todosMarcados) {
        funcion.estado_codigo = estado;
        funcion.estado_id = null;
        funcion.estado_nombre = null;
      } else if (funcion.estado_codigo === estado) {
        funcion.estado_codigo = null;
        funcion.estado_id = null;
        funcion.estado_nombre = null;
      }
    }
  }

  seleccionar_estado(
    funcion: FuncionBiologica,
    estado: 'CONSER' | 'AUMEN' | 'DISMIN',
    event: Event,
  ): void {
    const seleccionado = (event.target as HTMLInputElement).checked;

    if (!seleccionado) {
      if (funcion.estado_codigo === estado) {
        funcion.estado_codigo = null;
        funcion.estado_id = null;
        funcion.estado_nombre = null;
      }
      return;
    }

    funcion.estado_codigo = estado;
    funcion.estado_id = null;
    funcion.estado_nombre = null;
  }

  actualizar_observacion(funcion: FuncionBiologica, event: Event): void {
    funcion.observacion = (event.target as HTMLInputElement).value;
  }

  actualizar(campo: keyof EvaluacionMedicaData, event: Event): void {
    this.actualizarCampo.emit({ campo, event });
  }

  campo_invalido(campo: keyof EvaluacionMedicaData): boolean {
    if (!this.validacion_solicitada()) return false;
    return !String(this.formulario()[campo] ?? '').trim();
  }
}
