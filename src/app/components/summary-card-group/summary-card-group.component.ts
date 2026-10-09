import { Component, input } from '@angular/core';

/** Contenedor responsive para una colección de app-summary-card. */
@Component({
  selector: 'app-summary-card-group',
  standalone: true,
  imports: [],
  templateUrl: './summary-card-group.component.html',
  styleUrl: './summary-card-group.component.scss',
  host: { '[style.--app-summary-card-group-min-width]': 'minWidth()' },
})
export class SummaryCardGroupComponent {
  /** Ancho mínimo de una tarjeta antes de pasar a la siguiente fila. */
  readonly minWidth = input('10rem');
}
