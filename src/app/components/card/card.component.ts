import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-card',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
export class CardComponent {
  readonly imageSrc = input('');
  readonly altText = input('Descripci\u00f3n de la imagen');
  readonly title = input('');
  readonly routerLink = input<string | null>(null);
  readonly useClick = input(false);
  readonly clickEvent = output<void>();
  readonly variant = input<'default' | 'modalidad'>('default');
  readonly mostrarSeleccionar = input(false);
  readonly elevacion = input(false);

  onCardClick(): void {
    if (this.useClick()) this.clickEvent.emit();
  }
}
