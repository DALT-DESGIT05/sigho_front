import { Component, computed, effect, input, output, signal } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { ComponentSize, PaletteColor } from '../../interfaces/util.interface';

@Component({
  selector: 'app-alert',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss',
})
export class AlertComponent {
  readonly texto = input('');
  readonly color = input<PaletteColor>('primary');
  /** Si no se indica, se usa un icono coherente con el color de la alerta. */
  readonly icon = input('');
  readonly dismissible = input(false);
  /** Permite al padre ocultar o volver a mostrar la alerta. */
  readonly visible = input(true);
  readonly size = input<ComponentSize>('md');

  readonly dismissed = output<void>();
  private readonly descartada = signal(false);

  readonly estaVisible = computed(() => this.visible() && !this.descartada());
  readonly iconoResuelto = computed(() => this.icon() || this.iconoPorColor(this.color()));
  readonly clases = computed(() => `app-alert--${this.color()} app-alert--${this.size()}`);
  readonly titulo = input('');
  readonly iconDerecha = input('');
  readonly destacarTitulo = input(false);
  readonly subtitulo = input<string>('');
  readonly rounded = input<'sm' | 'md' | 'lg' | 'xl'>('md');

  constructor() {
    effect(() => {
      if (this.visible()) this.descartada.set(false);
    });
  }

  cerrar(): void {
    this.descartada.set(true);
    this.dismissed.emit();
  }

  private iconoPorColor(color: PaletteColor): string {
    switch (color) {
      case 'success': return 'fa-solid fa-circle-check';
      case 'warning': return 'fa-solid fa-triangle-exclamation';
      case 'danger': return 'fa-solid fa-circle-exclamation';
      case 'secondary': return 'fa-solid fa-circle-info';
      case 'purple': return 'fa-solid fa-circle-info';
      case 'fuchsia': return 'fa-solid fa-circle-info';
      case 'primary': return 'fa-solid fa-circle-info';
      default: return 'fa-solid fa-circle-info';
    }
  }
}
