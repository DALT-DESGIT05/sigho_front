import { Component, computed, input, output } from '@angular/core';
import { ComponentSize, PaletteColor } from '../../interfaces/util.interface';

export type IconLinkPosition = 'start' | 'end';
export type IconLinkAnimation = 'none' | 'up' | 'down' | 'left' | 'right' | 'scale' | 'rotate';

@Component({
  selector: 'app-icon-link',
  standalone: true,
  templateUrl: './icon-link.component.html',
  styleUrl: './icon-link.component.scss',
})
export class IconLinkComponent {
  readonly texto = input('');
  readonly text = input('');
  readonly href = input('#');
  readonly icon = input('');
  readonly iconPosition = input<IconLinkPosition>('start');
  readonly color = input<PaletteColor>('primary');
  readonly size = input<ComponentSize>('md');
  readonly animation = input<IconLinkAnimation>('up');
  readonly target = input<'_self' | '_blank' | '_parent' | '_top'>('_self');
  readonly rel = input('');
  readonly title = input('');
  readonly ariaLabel = input('');
  /** Renderiza un botón para ejecutar una acción en lugar de un enlace. */
  readonly asButton = input(false);
  readonly buttonType = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false);
  readonly clases = input('');
  readonly clicked = output<MouseEvent>();

  readonly resolvedText = computed(() => this.texto() || this.text());
  readonly resolvedTitle = computed(() => this.title() || this.resolvedText() || this.ariaLabel() || 'Enlace');
  readonly resolvedRel = computed(() => this.rel() || (this.target() === '_blank' ? 'noopener noreferrer' : null));
  readonly linkClasses = computed(() => ['app-icon-link', `app-icon-link--${this.color()}`, `app-icon-link--${this.size()}`, `app-icon-link--${this.animation()}`, this.clases()]);

  onClick(event: MouseEvent): void {
    if (this.disabled()) { event.preventDefault(); event.stopImmediatePropagation(); return; }
    this.clicked.emit(event);
  }
}
