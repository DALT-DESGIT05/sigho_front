import { Component, computed, input } from '@angular/core';
import { ComponentSize, PaletteColor } from '../../interfaces/util.interface';

@Component({
  selector: 'app-label',
  imports: [],
  templateUrl: './label.component.html',
  styleUrl: './label.component.scss'
})
export class LabelComponent {
  readonly texto = input.required<string>();
  readonly title = input('');
  readonly forId = input('');
  readonly color = input<PaletteColor>('primary');
  readonly size = input<ComponentSize>('md');
  readonly truncate = input(false);
  readonly requerido = input(false);
  readonly required = input(false);

  readonly esRequerido = computed(() => this.requerido() || this.required());
  readonly color_css = computed(() => {
    const colores: Record<PaletteColor, string> = {
      primary: 'var(--palette-primary-fap-900)',
      danger: 'var(--palette-danger-text)',
      success: 'var(--palette-success-text)',
      warning: 'var(--palette-warning-text)',
      secondary: 'var(--palette-secondary-text)',
      info: 'var(--palette-info-text)',
      purple: 'var(--palette-purple-text)',
      fuchsia: 'var(--palette-fuchsia-text)',
    };

    return colores[this.color()];
  });

}
