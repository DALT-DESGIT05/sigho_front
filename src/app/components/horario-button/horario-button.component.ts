import { Component, input, output } from '@angular/core';
import { Horario_grid_item } from '../../interfaces/citas/horario-grid.interface';

@Component({
  selector: 'app-horario-button',
  standalone: true,
  templateUrl: './horario-button.component.html',
  styleUrl: './horario-button.component.scss',
})
export class HorarioButtonComponent {
  readonly horario = input.required<Horario_grid_item>();
  readonly disabled = input(false);
  readonly loading = input(false);

  readonly horario_seleccionado = output<Horario_grid_item>();

  seleccionar_horario(): void {
    const horario = this.horario();
    if (!horario.disponible || this.disabled() || this.loading()) {
      return;
    }

    this.horario_seleccionado.emit(horario);
  }
}
