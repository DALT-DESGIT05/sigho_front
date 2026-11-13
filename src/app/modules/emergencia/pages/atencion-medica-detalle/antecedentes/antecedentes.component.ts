import { Component, input, output, signal, viewChild } from '@angular/core';
import { ModalComponent } from '../../../../../components/modal/modal.component';
import {
  AlergiaPaciente,
  AntecedenteFamiliarPaciente,
  HabitoPaciente,
  RepSexPerfil,
} from '../../../../../interfaces/emergencia/triaje.interface';
import { AntecedentesAlergiasComponent } from '../antecedentes-alergias/antecedentes-alergias.component';
import { AntecedentesFamiliaresComponent } from '../antecedentes-familiares/antecedentes-familiares.component';
import { AntecedentesHabitosComponent } from '../antecedentes-habitos/antecedentes-habitos.component';
import { AntecedentesRepSexComponent } from '../antecedentes-rep-sex/antecedentes-rep-sex.component';

type PestanaAntecedente = 'familiares' | 'habitos' | 'rep_sex' | 'alergicos';

@Component({
  selector: 'app-antecedentes',
  standalone: true,
  imports: [
    ModalComponent,
    AntecedentesAlergiasComponent,
    AntecedentesFamiliaresComponent,
    AntecedentesHabitosComponent,
    AntecedentesRepSexComponent,
  ],
  templateUrl: './antecedentes.component.html',
  styleUrl: './antecedentes.component.scss',
})
export class AntecedentesComponent {
  readonly atencionId = input.required<number>();
  readonly habilitado = input(false);
  readonly alergiasChange = output<AlergiaPaciente[]>();
  readonly familiaresChange = output<AntecedenteFamiliarPaciente[]>();
  readonly habitosChange = output<HabitoPaciente[]>();
  readonly repSexChange = output<RepSexPerfil | null>();

  private readonly modal = viewChild<ModalComponent>('modal');

  readonly pestanas: ReadonlyArray<readonly [PestanaAntecedente, string]> = [
    ['familiares', 'Familiares'],
    ['habitos', 'Hábitos'],
    ['rep_sex', 'Gineco-obstétricos y sexuales'],
    ['alergicos', 'Alérgicos'],
  ];

  readonly pestanaActiva = signal<PestanaAntecedente>('familiares');
  readonly modalAbierto = signal(false);

  abrir(): void {
    this.modalAbierto.set(true);
    this.modal()?.open();
  }

  cerrar(): void {
    this.modalAbierto.set(false);
  }

  seleccionarPestana(pestana: PestanaAntecedente): void {
    this.pestanaActiva.set(pestana);
  }
}
