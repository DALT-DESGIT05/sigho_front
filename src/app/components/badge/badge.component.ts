import { Component, computed, input } from '@angular/core';
import { ComponentSize } from '../../interfaces/util.interface';

@Component({
  selector: 'app-badge',
  standalone: true,
  templateUrl: './badge.component.html',
  styleUrl: './badge.component.scss'
})
export class BadgeComponent {
  readonly texto = input.required<string | null | undefined>();
  readonly clases = input.required<string | null | undefined>();
  readonly title = input('');
  readonly size = input<ComponentSize>('md');
  readonly icon = input<string>('');
  readonly shouldRender = computed(() => {
    const texto = String(this.texto() ?? '').trim();
    const clases = String(this.clases() ?? '').trim();

    return !!texto && !!clases;
  });

}
