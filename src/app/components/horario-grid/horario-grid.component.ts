import { Component, input, output } from '@angular/core';
import { Horario_grid_item } from '../../interfaces/citas/horario-grid.interface';
import { HorarioButtonComponent } from '../horario-button/horario-button.component';

@Component({
  selector: 'app-horario-grid',
  standalone: true,
  imports: [HorarioButtonComponent],
  templateUrl: './horario-grid.component.html',
  styleUrl: './horario-grid.component.scss',
})
export class HorarioGridComponent {
  readonly horarios = input.required<readonly Horario_grid_item[]>();
  readonly disabled = input(false);
  readonly hora_cargando = input('');

  readonly horario_seleccionado = output<Horario_grid_item>();

  seleccionar_horario(horario: Horario_grid_item): void {
    if (!horario.disponible || this.disabled()) {
      return;
    }

    this.horario_seleccionado.emit(horario);
  }
}
