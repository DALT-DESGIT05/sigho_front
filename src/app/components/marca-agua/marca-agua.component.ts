import { Component, input } from '@angular/core';

@Component({
  selector: 'app-marca-agua',
  standalone: true,
  imports: [],
  templateUrl: './marca-agua.component.html',
  styleUrl: './marca-agua.component.scss'
})
export class MarcaAguaComponent {
  /** Mensaje principal visible sobre el contenido protegido. */
  readonly texto = input('PROHIBIDA SU IMPRESIÓN');
  /** Información contextual opcional, proporcionada por el componente padre. */
  readonly detalle = input('');
}
