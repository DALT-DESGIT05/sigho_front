import { Component, computed, input,output,viewChild} from '@angular/core';
import { ModalComponent } from '../../../../../components/modal/modal.component';
import { HorarioGridComponent } from '../../../../../components/horario-grid/horario-grid.component';
import { ButtonComponent } from '../../../../../components/button/button.component';
import { Horario_grid_item } from '../../../../../interfaces/citas/horario-grid.interface';

@Component({
  selector: 'app-modal-horarios-adicional',
  standalone: true,
  imports:[
            ModalComponent,HorarioGridComponent,ButtonComponent
          ],
  templateUrl: './modal-horarios-adicional.component.html',
  styleUrl: './modal-horarios-adicional.component.scss'
})
export class ModalHorariosAdicionalComponent {

  readonly modal = viewChild<ModalComponent>('modalHorarios');
  readonly horarios = input<readonly Horario_grid_item[]>([]);
  readonly disabled = input(false);
  readonly hora_cargando = input('');
  readonly horario_seleccionado = output<Horario_grid_item>();
  readonly totalDisponibles = computed(() => this.horarios().filter(horario => horario.disponible).length);

  abrir(): void {
    this.modal()?.open();
  }

  cerrar(): void {
    this.modal()?.close();
  }

  seleccionar_horario(horario: Horario_grid_item): void {
    if (!horario.disponible || this.disabled()) {
      return;
    }

    this.horario_seleccionado.emit(horario);
  }
}
