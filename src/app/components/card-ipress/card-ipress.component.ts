import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-card-ipress',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './card-ipress.component.html',
  styleUrl: './card-ipress.component.scss',
})
export class CardIpressComponent {
  readonly imageSrc = input('');
  readonly altText = input('Descripci\u00f3n de la imagen');
  readonly title = input('');
  readonly routerLink = input<string | null>(null);
  readonly useClick = input(false);
  readonly clickEvent = output<void>();

  onCardClick(): void {
    if (this.useClick()) this.clickEvent.emit();
  }
}
