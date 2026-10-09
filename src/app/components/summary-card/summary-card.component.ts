import { Component, computed, input, output } from '@angular/core';
import { IconLinkComponent } from '../icon-link/icon-link.component';
import { PaletteColor } from '../../interfaces/util.interface';

/** Tarjeta compacta para presentar un dato de resumen dentro de una grilla Bootstrap. */
@Component({
  selector: 'app-summary-card',
  standalone: true,
  imports: [IconLinkComponent],
  templateUrl: './summary-card.component.html',
  styleUrl: './summary-card.component.scss',
  host: { '[class.app-summary-card--wide]': 'wide()' },
})
export class SummaryCardComponent {
  readonly label = input('');
  readonly etiqueta = input('');
  readonly value = input('');
  readonly valor = input('');
  readonly icon = input('fa-solid fa-circle-info');
  readonly color = input<PaletteColor>('primary');
  readonly iconColor = input<PaletteColor | null>(null);
  readonly contentColor = input<PaletteColor | null>(null);
  readonly actionIcon = input('');
  readonly actionText = input('');
  readonly actionColor = input<PaletteColor>('primary');
  readonly actionHref = input('#');
  readonly actionAriaLabel = input('Acción');
  readonly wide = input(false);
  readonly title = input('');
  readonly valueTitle = input('');

  readonly resolvedLabel = computed(() => this.etiqueta() || this.label());
  readonly resolvedValue = computed(() => this.valor() || this.value());
  readonly resolvedValueTitle = computed(() => this.valueTitle() || this.resolvedValue());
  readonly resolvedIconColor = computed(() => this.iconColor() ?? this.color());
  readonly resolvedContentColor = computed(() => this.contentColor() ?? 'default');
  readonly cardClasses = computed(() => [
    'card', 'app-summary-card', `app-summary-card--${this.color()}`,
    `app-summary-card--icon-${this.resolvedIconColor()}`,
    `app-summary-card--content-${this.resolvedContentColor()}`,
  ]);
  readonly actionClicked = output<MouseEvent>();
}
