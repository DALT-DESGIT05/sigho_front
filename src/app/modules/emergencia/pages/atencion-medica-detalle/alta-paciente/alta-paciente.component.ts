import { Component, computed, input, output } from '@angular/core';
import { ButtonComponent } from '../../../../../components/button/button.component';
import { InputDateComponent } from '../../../../../components/input-date/input-date.component';
import { InputTextComponent } from '../../../../../components/input-text/input-text.component';
import { RadioComponent } from '../../../../../components/radio/radio.component';
import { SelectComponent } from '../../../../../components/select/select.component';
import { TextAreaComponent } from '../../../../../components/text-area/text-area.component';
import {
  DetalleAtencionResponse,
  Diagnostico,
  EvaluacionMedicaData,
} from '../../../../../interfaces/emergencia/triaje.interface';

@Component({
  selector: 'app-alta-paciente',
  standalone: true,
  imports: [
    ButtonComponent,
    InputDateComponent,
    InputTextComponent,
    RadioComponent,
    SelectComponent,
    TextAreaComponent,
  ],
  templateUrl: './alta-paciente.component.html',
  styleUrl: './alta-paciente.component.scss',
})
export class AltaPacienteComponent {
  readonly detalle = input.required<DetalleAtencionResponse>();
  readonly formulario = input.required<EvaluacionMedicaData>();
  readonly diagnosticos = input<readonly Diagnostico[]>([]);
  readonly guardar = output<void>();
  readonly cerrar = output<void>();

  actividad_fisica: 'SI' | 'NO' | null = null;
  resumen_egreso = '';
  observaciones = '';

  readonly diagnostico_inicial = computed(() =>
    this.formatear_diagnosticos(
      this.diagnosticos().filter((diagnostico) => diagnostico.tipo_codigo !== 'DEF'),
    ),
  );
  readonly diagnostico_final = computed(() =>
    this.formatear_diagnosticos(
      this.diagnosticos().filter((diagnostico) => diagnostico.tipo_codigo === 'DEF'),
    ),
  );

  seleccionar_actividad_fisica(valor: 'SI' | 'NO'): void {
    this.actividad_fisica = valor;
  }

  private formatear_diagnosticos(diagnosticos: readonly Diagnostico[]): string {
    return diagnosticos
      .map((diagnostico) => `${diagnostico.codigo} - ${diagnostico.descripcion}`)
      .join('; ');
  }
}
