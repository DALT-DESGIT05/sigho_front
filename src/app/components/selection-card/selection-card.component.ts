import { ImagenPipe } from '../../pipes/imagen.pipe';
import { Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-selection-card',
  standalone: true,
  imports: [ImagenPipe],
  templateUrl: './selection-card.component.html',
  styleUrl: './selection-card.component.scss',
})
export class SelectionCardComponent {
  readonly title = input('');
  readonly icon = input('');
  readonly imageSrc = input('');
  readonly altText = input('');
  readonly selected = input(false);
  readonly disabled = input(false);

  readonly selectedChange = output<void>();

  readonly hasImage = computed(() => this.imageSrc().trim().length > 0);
  readonly hasIcon = computed(() => !this.hasImage() && this.icon().trim().length > 0);
  readonly imageAlt = computed(() => this.altText().trim() || this.title().trim());
  readonly ariaLabel = computed(() => this.title().trim() || 'Seleccionar opción');

  select(): void {
    if (!this.disabled()) {
      this.selectedChange.emit();
    }
  }
}
