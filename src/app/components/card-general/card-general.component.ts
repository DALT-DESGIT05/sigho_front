import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-card-general',
  standalone: true,
  imports: [],
  templateUrl: './card-general.component.html',
  styleUrl: './card-general.component.scss',
})
export class CardGeneralComponent {
  /** Título que se muestra en el encabezado. */
  readonly title = input('');
  /** Alias en español para el título. */
  readonly titulo = input('');
  readonly showHeader = input(true);
  readonly showFooter = input(false);
  readonly headerClass = input('');
  readonly bodyClass = input('');
  readonly footerClass = input('');
  readonly elevacion = input(false);
  readonly resolvedTitle = computed(() => this.titulo() || this.title());
}
