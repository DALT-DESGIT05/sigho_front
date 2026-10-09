import { ChangeDetectionStrategy, Component, computed, effect, input, signal } from '@angular/core';
import { ImageLazyComponent, TipoImagenLazy } from '../image-lazy/image-lazy.component';

@Component({
  selector: 'app-patient-identity',
  standalone: true,
  imports: [ImageLazyComponent],
  templateUrl: './patient-identity.component.html',
  styleUrl: './patient-identity.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.app-patient-identity--vertical]': 'vertical()' },
})
export class PatientIdentityComponent {
  /** Identificador usado por ImageService para obtener y cachear la fotografía. */
  readonly identificador = input.required<string>();
  readonly nombre = input.required<string>();
  readonly historia = input<string | number | null>(null);
  readonly codigoAfiliado = input<string | null>(null);
  readonly tipoImagen = input<TipoImagenLazy>('afiliado');
  readonly etiqueta = input('Paciente');
  readonly vertical = input(false);
  readonly fotoAlt = computed(() => `Foto de ${this.nombre()}`);
  readonly fotoNoDisponible = signal(false);

  constructor() {
    effect(() => {
      this.identificador();
      this.tipoImagen();
      this.fotoNoDisponible.set(false);
    });
  }

  marcarFotoNoDisponible(): void {
    this.fotoNoDisponible.set(true);
  }
}
