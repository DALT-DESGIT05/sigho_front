import { Component, computed, input } from '@angular/core';
import { ComponentSize, PaletteColor } from '../../interfaces/util.interface';

@Component({
  selector: 'app-progress-bars',
  standalone: true,
  templateUrl: './progress-bars.component.html',
  styleUrl: './progress-bars.component.scss',
})
export class ProgressBarsComponent {
  readonly value = input<number | string | undefined>(undefined);
  readonly porcentaje = input<number | string | undefined>(undefined);

  /** Ancho del componente. Por defecto ocupa todo el espacio disponible (100%). */
  readonly width = input<string | number>('100%');
  /** Acepta los colores de la paleta o un valor dinámico; valores no definidos usan el estilo secondary. */
  readonly color = input<PaletteColor | string>('secondary');
  /** Altura visual de la barra. */
  readonly size = input<ComponentSize>('md');
  /** Clases Bootstrap o personalizadas para el contenedor. */
  readonly clases = input('');
  /** Clases Bootstrap o personalizadas para la barra interna. */
  readonly clasesBarra = input('');
  readonly ariaLabel = input('Progreso');
  readonly showValue = input(false);

  readonly progress = computed(() => {
    const numericValue = Number(this.porcentaje() ?? this.value() ?? 0);
    return Number.isFinite(numericValue) ? Math.min(100, Math.max(0, numericValue)) : 0;
  });

  readonly widthStyle = computed(() => {
    const width = String(this.width()).trim();
    return !width || width === '100%' ? null : width;
  });
}
