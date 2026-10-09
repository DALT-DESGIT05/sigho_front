import { Component, effect, inject, input, output, signal,viewChild } from '@angular/core';
import { AfiliadoService } from '../../services/citas/afiliado.service';
import { Ficha_afiliado } from '../../interfaces/citas/afiliado.interface';
import { PatientIdentityComponent } from '../patient-identity/patient-identity.component';
import { SummaryCardComponent } from '../summary-card/summary-card.component';
import { SummaryCardGroupComponent } from '../summary-card-group/summary-card-group.component';
import { PaletteColor } from '../../interfaces/util.interface';
import { ButtonComponent } from '../button/button.component';
import { ModalComponent } from '../modal/modal.component';


@Component({
  selector: 'app-ficha-afiliado',
  standalone: true,
  imports: [PatientIdentityComponent, SummaryCardComponent, SummaryCardGroupComponent, ButtonComponent, ModalComponent],
  templateUrl: './ficha-afiliado.component.html',
  styleUrl: './ficha-afiliado.component.scss'
})
export class FichaAfiliadoComponent {

  private readonly afiliadoService = inject(AfiliadoService);
  readonly modalFicha = viewChild.required<ModalComponent>('modalFicha');

  cod_afiliado = input.required<string>();

  // Evento para avisar al componente padre que debe cerrar la ventana
  cerrar = output<void>();

  // Estado interno del componente
  readonly ficha = signal<Ficha_afiliado | null>(null);
  readonly cargando = signal(false);
  readonly error = signal('');

  constructor() {
    effect(() => {
      const codigo = this.cod_afiliado();

      if (codigo) {
        this.obtenerFicha(codigo);
      }
    });
  }

  obtenerFicha(codigo: string): void {
    this.cargando.set(true);
    this.error.set('');
    this.ficha.set(null);
    this.afiliadoService
      .ficha_afiliado(codigo)
      .subscribe({
        next: (response) => {
          this.ficha.set(response.data);
          this.cargando.set(false);
          this.modalFicha().open();

        },
        error: (error) => {

          this.error.set(
            'No se pudo obtener la ficha del paciente.'
          );

          this.cargando.set(false);
        }
      });
  }

  cerrarFicha(): void {
    this.cerrar.emit();
  }

  colorSituacion(situacion: string): PaletteColor {
    const estado = situacion.trim().toUpperCase();
    if (['ACTIVO', 'VIGENTE'].includes(estado)) return 'success';
    if (['INACTIVO', 'DESAFILIADO', 'SUSPENDIDO'].includes(estado)) return 'danger';
    return 'warning';
  }
}
