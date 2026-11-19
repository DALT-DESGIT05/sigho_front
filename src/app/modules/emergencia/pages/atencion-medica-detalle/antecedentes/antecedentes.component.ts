import { Component, input, output, signal, viewChild } from '@angular/core';
import { ModalComponent } from '../../../../../components/modal/modal.component';
import { AlergiaPaciente } from '../../../../../interfaces/emergencia/triaje.interface';
import { AntecedentesAlergiasComponent } from '../antecedentes-alergias/antecedentes-alergias.component';

@Component({
  selector: 'app-antecedentes',
  standalone: true,
  imports: [
    ModalComponent,
    AntecedentesAlergiasComponent,
  ],
  templateUrl: './antecedentes.component.html',
  styleUrl: './antecedentes.component.scss',
})
export class AntecedentesComponent {
  readonly atencionId = input.required<number>();
  readonly habilitado = input(false);
  readonly alergiasChange = output<AlergiaPaciente[]>();

  private readonly modal = viewChild<ModalComponent>('modal');

  readonly modalAbierto = signal(false);

  abrir(): void {
    this.modalAbierto.set(true);
    this.modal()?.open();
  }

  cerrar(): void {
    this.modalAbierto.set(false);
  }
}
