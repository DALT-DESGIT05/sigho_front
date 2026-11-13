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
  readonly parentesco = input<string | null>(null);
  readonly situacion = input<string | null>(null);
  readonly codSitu = input<number | null>(null);
  readonly tipoImagen = input<TipoImagenLazy>('afiliado');
  readonly etiqueta = input('Paciente');
  readonly vertical = input(false);
  readonly fotoAlt = computed(() => `Foto de ${this.nombre()}`);
  readonly fotoNoDisponible = signal(false);

  readonly esAfiliado = computed(() => {
    const situ = this.codSitu();
    if (situ !== null && situ !== undefined) {
      return [1, 11, 12].includes(Number(situ));
    }
    return Boolean(this.codigoAfiliado());
  });

  readonly etiquetaAfiliado = computed(() => {
    const paren = this.parentesco()?.toUpperCase()?.trim();
    const esTitular = !paren || paren === 'TITULAR' || paren === 'T' || paren === 'A';
    return esTitular ? 'AFILIADO IAFAS - FOSFAP (TITULAR)' : 'AFILIADO IAFAS - FOSFAP (DEPENDIENTE)';
  });

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
