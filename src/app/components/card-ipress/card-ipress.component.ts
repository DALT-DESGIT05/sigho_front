import { ImagenPipe } from '../../pipes/imagen.pipe';

import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-card-ipress',
  standalone: true,
  imports: [ImagenPipe, RouterLink, RouterLinkActive],
  templateUrl: './card-ipress.component.html',
  styleUrl: './card-ipress.component.scss',
})
export class CardIpressComponent {

  readonly imageSrc = input('');
  readonly altText = input('Descripción de la imagen');
  readonly title = input('');

  readonly routerLink = input<string | null>(null);
  readonly useClick = input(false);
  readonly clickEvent = output<void>();

  // Propiedades opcionales
  readonly mostrarSeleccionar = input(false);
  readonly elevacion = input(false);
  readonly variant = input<'default' | 'reserva'>('default');

  onCardClick(): void {
    if (this.useClick()) {
      this.clickEvent.emit();
    }
  }
}
